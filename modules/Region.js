
import Quadtree from "./Quadtree.js";
import Vector from "./Vector2.js"
//import PhysObject from "./Physics.js";
import * as Render from "./Render.js";
export { Region, blockMap }

//Helper Classes
class box {
  constructor(x, y, width, height) {
    this.position = new Vector(x, y, 0)
    this.length = new Vector(width, height, 1)
    this.center = this.position.add(this.length.divideScalar(2))
  }
}
class corner {
  constructor(point, key, direction) {
    this.point = point;
    this.key = key;
    this.direction = direction;
  }
}
class hitData {
  constructor(point, wall, key) {
    this.point = point;
    this.wall = wall; // Rename to direction?
    this.key = key;
    this.distance;
  }
}

//Important Bit
class Region extends Quadtree {
  constructor(x, y, width, height, blockMap) {
    super(5, 0);
    this.position = new Vector(x, y, 0);
    this.velocity = new Vector(0, 0, 1);
    this.length = new Vector(width, height, 1);
    this.blockMap = blockMap;
    this.cornerList = [];
    this.debugToggle = 0;
    //this.physics = new PhysObject();
  }

  getBoxDimensions(key) {
    let coords = this.Decode(key);
    let scale = 2 ** coords[2];
    let width = this.length.x / scale, height = this.length.y / scale;
    let x = coords[0] * width + this.position.x;
    let y = coords[1] * height + this.position.y;
    return new box(x, y, width, height)
  }

  Render() {
    let keys = this.getKids(1);
    Render.outlineBox(this.position, this.length, 'black')
    keys[0].forEach((leaf) => {
      let node = this.getNode(leaf);
      if (node.data != 0) {
        let box = this.getBoxDimensions(leaf);
        let color = this.blockMap.getBlock(node.data).color;
        Render.drawBox(box.position, box.length, color);
      }
    })
    keys[1].forEach((branch) => {
      let box = this.getBoxDimensions(branch);
      Render.drawLine(new Vector(box.position.x, box.center.y, 0), new Vector(box.length.x, 0, 1), 'black')
      Render.drawLine(new Vector(box.center.x, box.position.y, 0), new Vector(0, box.length.y, 1), 'black')
    })
  }

  Draw(func, key, color) {
    let boxDim = this.getBoxDimensions(key);
    func(boxDim.position, boxDim.length, color)
  }

  //Corner Start
  getCorners(key) {
    let top = this.getSide(key, 0, -1);
    let bottom = this.getSide(key, 0, 1);
    let left = this.getSide(key, -1, 0);
    let right = this.getSide(key, 1, 0);
    let result = new Set();
    //Do stuff with this, currently triggers if statement if point is a corner.
    //top left 0
    if ((top == undefined || this.getNode(top[0]).data == this.nullVal) &&
      (left == undefined || this.getNode(left[0]).data == this.nullVal)) {
      result.add(0)
    }
    //bottom left 1
    if ((bottom == undefined || this.getNode(bottom[0]).data == this.nullVal) &&
      (left == undefined || this.getNode(left[left.length - 1]).data == this.nullVal)) {
      result.add(1)
    }
    //top right 2
    if ((top == undefined || this.getNode(top[top.length - 1]).data == this.nullVal) &&
      (right == undefined || this.getNode(right[0]).data == this.nullVal)) {
      result.add(2)
    }
    //bottom right 3
    if ((bottom == undefined || this.getNode(bottom[bottom.length - 1]).data == this.nullVal) &&
      (right == undefined || this.getNode(right[right.length - 1]).data == this.nullVal)) {
      result.add(3)
    }
    return result
  }

  findCorners() {
    let kids = this.getKids(1)[0];
    this.cornerList = [];
    kids.forEach((key) => {
      let node = this.getNode(key);
      if (node.data != this.nullVal) {
        let box = this.getBoxDimensions(key);
        box.position.subtract(this.position, true)
        let corners = this.getCorners(key);
        if (corners.has(0)) {
          this.cornerList.push(new corner(box.position, key, 0))
        }
        if (corners.has(1)) {
          this.cornerList.push(new corner(new Vector(box.position.x, box.position.y + box.length.y, 0), key, 1))
        }
        if (corners.has(2)) {
          this.cornerList.push(new corner(new Vector(box.position.x + box.length.x, box.position.y, 0), key, 2))
        }
        if (corners.has(3)) {
          this.cornerList.push(new corner(box.position.add(box.length), key, 3))
        }
      }
    })
  }

  drawCorners() {
    this.cornerList.forEach((corner) => { Render.drawPoint(corner.point.add(this.position), 'yellow') })
  }
  //Corner End
  //Collision/Physics Start
  getKeys(point) {
    let originPoint = point.subtract(this.position)
    let keys = []; let badcount = 0; let offset = .001;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        for (let layer = 0; layer < this.depth; layer++) {
          let scaledX = Math.floor(originPoint.x / ((this.length.x + offset - i * offset) / 2 ** layer));
          let scaledY = Math.floor(originPoint.y / ((this.length.y + offset - j * offset) / 2 ** layer));
          if (originPoint.x == 0 && i == 0) { scaledX = -1 }
          if (originPoint.y == 0 && j == 0) { scaledY = -1 }
          try {
            let key = this.Encode(scaledX, scaledY, layer);
            let node = this.getNode(key);
            if (node.type == 0) {
              keys.push(key)
              break
            }
          } catch (error) { keys.push(undefined); badcount += 1; break }
        }
      }
    }
    if (badcount == 4) { return undefined }
    return keys
  }
  
  pointCull(velocity) {
    let cullSet = new Set();
    if (velocity.x == 0 && velocity.y != 0) {
      if (velocity.y < 0) { cullSet.add(0); cullSet.add(2) }
      else if (velocity.y > 0) { cullSet.add(1); cullSet.add(3) }
    }
    else if (velocity.x != 0 && velocity.y == 0) {
      if (velocity.x < 0) { cullSet.add(0); cullSet.add(1) }
      else if (velocity.x > 0 ) { cullSet.add(2); cullSet.add(3) }
    }
    else if (velocity.x < 0 && velocity.y < 0) { cullSet.add(0); cullSet.add(1); cullSet.add(2); }
    else if (velocity.x < 0 && velocity.y > 0) { cullSet.add(0); cullSet.add(1); cullSet.add(3); }
    else if (velocity.x > 0 && velocity.y < 0) { cullSet.add(0); cullSet.add(2); cullSet.add(3); }
    else if (velocity.x > 0 && velocity.y > 0) { cullSet.add(1); cullSet.add(2); cullSet.add(3); }
    return cullSet
  }

  keyCull(keys, direction, velocity) {
    let velDirection = velocity.sign();
    if (keys == undefined) {keys = []}
    let keyList = new Set([0, 1, 2, 3]), key;
    if (velocity.x < 0) { keyList.delete(2); keyList.delete(3); }
    else if (velocity.x > 0) { keyList.delete(0); keyList.delete(1); }
    if (velocity.y < 0) { keyList.delete(1); keyList.delete(3); }
    else if (velocity.y > 0) { keyList.delete(0); keyList.delete(2); }
    let keyOptions = [];
    keyList.forEach((index) => { keyOptions.push(keys[index]) })
    if (keyOptions.length == 2) {
      if (velDirection.x != 0) {
        //Chose between Y keys
        if (direction == 0 || direction == 2) { key = keyOptions[1] }
        if (direction == 1 || direction == 3) { key = keyOptions[0] }
      }
      else if (velDirection.y != 0) {
        //Choose between X keys
        if (direction == 0 || direction == 1) { key = keyOptions[1] }
        if (direction == 2 || direction == 3) { key = keyOptions[0] }
      }
    }
    else { key = keyOptions[0] }
    //console.log(key)
    return key
  }

  

  stepSquare(startPoint, velocity, key) {
    let sign = velocity.sign(), flip = 1; if (key == undefined) { key = 1; flip = -1; }
    else {let node = this.getNode(key); if (this.blockMap.getBlock(node.data).collisionType != 0) {flip = -1} }
    let box = this.getBoxDimensions(key);
    let halfLength = box.length.divideScalar(2);
    let cornerPoint = box.center.add(halfLength.multiply(sign).multiplyScalar(flip))
    let wallDistance = cornerPoint.subtract(startPoint); wallDistance.type = 1
    let hitPoint = startPoint.clone(); let hitWall = sign;
    let slope = velocity.slope(); let slopeToCorner = wallDistance.slope();
    if (Math.abs(slopeToCorner) == Math.abs(slope)) { hitPoint.add(wallDistance, true) }
    else if (Math.abs(slopeToCorner) > Math.abs(slope)) {
      hitPoint.add(new Vector(wallDistance.x, slope * wallDistance.x, 0), true); hitWall.y = 0;
    }
    else if (Math.abs(slopeToCorner) < Math.abs(slope)) {
      hitPoint.add(new Vector(1 / slope * wallDistance.y, wallDistance.y, 0), true); hitWall.x = 0;
    }
    Render.drawPoint(hitPoint, 'red'); Render.drawLine(startPoint, wallDistance, 'orange');
    return new hitData(hitPoint, hitWall)
  }

  calcHit(cornerPos, direction, velocity) {
    let distance = velocity.length(); if (distance == 0) { return }
    let traveled = 0, point = cornerPos, hit = new hitData(), end = false;
    let keys = this.getKeys(point);
    hit.key = this.keyCull(keys, direction, velocity);
    while (traveled < distance && end == false) {
      hit = this.stepSquare(point, velocity, hit.key);
      keys = this.getKeys(hit.point);
      hit.key = this.keyCull(keys, direction, velocity)
      if (hit.key == undefined) { traveled = distance } //Hitting Edge of Region
      else {
        let node = this.getNode(hit.key);
        let collisionType = this.blockMap.getBlock(node.data).collisionType;
        if (collisionType != 0) { end = true } //Hitting Wall
        else {
          traveled += hit.point.subtract(point).length();
          point = hit.point; 
        }
      }
    }
    return hit
  }

  //Collision Safety Checks
  slideCheck(key, x, y) {
    let update = false;
    let sideCheck = this.getSide(key, x*-1, y*-1);
    if (sideCheck != undefined) {
      let node;
      if (x == 1 || y == 1) { node = this.getNode(sideCheck[0])}
      else if (x == -1 || y == -1) { node = this.getNode(sideCheck[sideCheck.length - 1]) }
      let colType = this.blockMap.getBlock(node.data).collisionType;
      if (colType == 0) { update = true}
    } else { update = true }
    return update
  }

  peekCheck(cornerKey, cornerRegion, hitKey, hitRegion, velocity) {
    let truth = new Vector(false, false, 3);
    let cornerBox = cornerRegion.getBoxDimensions(cornerKey);
    let hitBox = hitRegion.getBoxDimensions(hitKey);
    let boxOffset = cornerBox.center.subtract(hitBox.center).abs();
    Render.outlineBox(hitBox.position, hitBox.length, 'red');
    Render.outlineBox(cornerBox.position, cornerBox.length, 'purple')
    if (boxOffset.x >= boxOffset.y) { truth.assign(true) }
    if (boxOffset.x <= boxOffset.y) { truth.assign(null, true) }
    if (truth.x == true && truth.y == true) {
      if (Math.abs(velocity.x) > Math.abs(velocity.y)) { truth.x = false }
      else if (Math.abs(velocity.x) < Math.abs(velocity.y)) { truth.y = false }
    }
    return truth
  }

  //Returns solution velocity
  checkCollision(start, velocity, target) {
    let finalHit, breakout = false;
    let currentVelocity = velocity.clone();
    let cullSet = this.pointCull(velocity), culledCorners = [];
    this.cornerList.forEach((corner) => { if (cullSet.has(corner.direction)) { culledCorners.push(corner) } })

    for (let i = 0; i < culledCorners.length; i++) {
      let corner = culledCorners[i];
      let cornerPoint = corner.point.add(start)
      let hit = target.calcHit(cornerPoint, corner.direction, currentVelocity);

      if (hit != undefined && hit.key != undefined) {
        let node = target.getNode(hit.key);
        if (node.data != target.nullVal) { //If not hitting an empty space
          let updateX = false, updateY = false;
          let peekCheck = this.peekCheck(corner.key, this, hit.key, target, currentVelocity)
          let option = hit.point.subtract(cornerPoint)

          //If (Wall is hit and not peeking) {Check if wall passes the slide test}
          if (hit.wall.x != 0 && peekCheck.x) { updateX = target.slideCheck(hit.key, hit.wall.x, 0) }
          if (hit.wall.y != 0 && peekCheck.y) { updateY = target.slideCheck(hit.key, 0, hit.wall.y) }

          if (!updateX) { hit.wall.x = 0 }
          if (!updateY) { hit.wall.y = 0 }
          //If collision is valid, check if it's shorter than current best alternative
          if ((updateX || updateY) && option.length() < currentVelocity.length()) {
            finalHit = hit;
            finalHit.distance = option;
            if (option.length() == 0) { return finalHit }
          }
        }
      }
    }
    return finalHit
  }
  
  moveWithCollisions(target) {
    let foundWalls = new Vector(false, false, 3), done = false;
    while ((!foundWalls.x || !foundWalls.y) && !done) {
      let hit = this.checkCollision(this.position, this.velocity, target);
      if (hit == undefined) {
        this.position.add(this.velocity, true);
        done = true;
      } 
      else {
        this.position.add(hit.distance, true);
        this.velocity.subtract(hit.distance, true);
        if (hit.wall.x != 0) { foundWalls.x = true; this.velocity.x = 0}
        if (hit.wall.y != 0) { foundWalls.y = true; this.velocity.y = 0} 
      }
    }
  }

  //Collision/Physics End
}

class Block {
  constructor(color, collisionType) {
    this.color = color;
    this.collisionType = collisionType;
  }
}
class blockMap {
  constructor(nullVal) {
    this.blockList = new Map();
    this.addBlock(0, nullVal, 0);
  }

  getBlock(id) { return this.blockList.get(id) }

  addBlock(id, color, collisionType) { this.blockList.set(id, new Block(color, collisionType)) }

  import() {

  }

  export() {

  }
}
