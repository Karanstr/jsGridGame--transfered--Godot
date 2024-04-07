
import Quadtree from "./Quadtree.js";
import Vector from "./Vector2.js"
import * as Render from "./Render.js";
export { Region, blockMap }
//Helper Classes

function xOr(data1, data2) {
  if ((data1 && !data2) || (!data1 && data2)) { return true } else { return false }
}
function round(number) {
  return Number(number.toFixed(3))
}
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
  constructor(point, wall) {
    this.point = point;
    this.wall = wall; // Rename to direction?
    this.keyData;
    this.distance;
  }
}
class keyStuff {
  constructor(keys, velocity, parent) {
    if (keys == undefined) {keys = []}
    this.key; this.keys = keys;
    this.hitKeys = []; this.hitCount = 0;
    this.keyMap = new Map();
    this.fillMap(parent);
    this.keyCull(velocity, parent.debugToggle)
  }

  fillMap(parent) {
    this.keys.forEach((key) => {
      if (!this.keyMap.has(key)) {
        if (key == undefined) { this.keyMap.set(undefined, 0) }
        else {
          let colType = parent.blockMap.getBlock(parent.getNode(key).data).collisionType;
          this.keyMap.set(key, colType);
          if (colType != 0) { this.hitCount += 1; this.hitKeys.push(key)}
        }
      }
    })
  }

  keyCull(velocity, toggle) {
    let keyList = new Set([0, 1, 2, 3]);
    if (velocity.x < 0) { keyList.delete(2); keyList.delete(3); }
    else if (velocity.x > 0) { keyList.delete(0); keyList.delete(1); }
    if (velocity.y < 0) { keyList.delete(1); keyList.delete(3); }
    else if (velocity.y > 0) { keyList.delete(0); keyList.delete(2); }
    let keyOptions = [];
    keyList.forEach((index) => { keyOptions.push(this.keys[index]) })
    for (let i = 0; i < keyOptions.length; i++) {
      this.key = keyOptions[i];
      let data = this.keyMap.get(this.key);
      if (data == toggle) { return }
    }
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

  getKeys(vector) {
    let originVector = vector.subtract(this.position)
    let keys = []; let badcount = 0; let offset = .001;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        for (let layer = 0; layer < this.depth; layer++) {
          let scaledX = Math.floor(originVector.x / ((this.length.x + offset - i * offset) / 2 ** layer));
          let scaledY = Math.floor(originVector.y / ((this.length.y + offset - j * offset) / 2 ** layer));
          if (originVector.x == 0 && i == 0) { scaledX = -1 }
          if (originVector.y == 0 && j == 0) { scaledY = -1 }
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

  stepSquare(start, velocity, debugColor) {
    let sign = velocity.sign(), flip = 1;
    let keys = this.getKeys(start);
    let keyData = new keyStuff(keys, velocity, this);
    if (keyData.key == undefined) { keyData.key = 1; flip = -1 }
    else { let node = this.getNode(keyData.key); if (node.data != 0) {flip = -1} }
    let box = this.getBoxDimensions(keyData.key);
    let halfLength = box.length.divideScalar(2);
    let cornerPoint = box.center.add(halfLength.multiply(sign).multiplyScalar(flip))
    let wallDistance = cornerPoint.subtract(start); wallDistance.type = 1
    let hitPoint = start.clone(); let hitWall = sign;
    let slope = velocity.slope(); let slopeToCorner = wallDistance.slope();
    if (Math.abs(slopeToCorner) == Math.abs(slope)) { hitPoint.add(wallDistance, true) }
    else if (Math.abs(slopeToCorner) > Math.abs(slope)) {
      hitPoint.add(new Vector(wallDistance.x, slope * wallDistance.x, 0), true); hitWall.y = 0;
    }
    else if (Math.abs(slopeToCorner) < Math.abs(slope)) {
      hitPoint.add(new Vector(1 / slope * wallDistance.y, wallDistance.y, 0), true); hitWall.x = 0;
    }
    Render.drawPoint(hitPoint, debugColor); Render.drawLine(start, wallDistance, 'orange');
    return new hitData(hitPoint, hitWall)
  }

  calcHit(start, velocity, debugColor) {
    let distance = velocity.length(); if (distance == 0) { return }
    let traveled = 0, point = start, keys = this.getKeys(point), hit, end = false;
    while (traveled < distance && end == false) {
      hit = this.stepSquare(point, velocity, debugColor);
      keys = this.getKeys(hit.point);
      hit.keyData = new keyStuff(keys, velocity, this)
      if (hit.keyData.key == undefined) { traveled = distance } //Hitting Edge of Region
      else {
        let node = this.getNode(hit.keyData.key);
        let collisionType = this.blockMap.getBlock(node.data).collisionType;
        if (collisionType != 0) { end = true } //Hitting Wall
        else { traveled += hit.point.subtract(point).length(); point = hit.point; }
      }
    }
    return hit
  }

  //Returns solution velocity
  checkCollision(start, velocity, target, debugColor) {
    let velFinal = velocity.clone();
    let breakout = false;
    let cullSet = this.pointCull(velFinal);
    let culledCorners = []; //List of all valid corners.
    this.cornerList.forEach((corner) => { if (cullSet.has(corner.direction)) { culledCorners.push(corner) } })
    for (let i = 0; i < culledCorners.length; i++) {
      let corner = culledCorners[i];
      let cornerPoint = corner.point.add(start)
      let hit = target.calcHit(cornerPoint, velFinal, debugColor);
      if (hit != undefined) {
        if (hit.keyData.key != undefined) {
          let node = target.getNode(hit.keyData.key);
          if (node.data != target.nullVal) { //If not hitting an empty space
            let option = cornerPoint.subtract(hit.point).abs().multiply(hit.wall)
            let thisBox = this.getBoxDimensions(corner.key);
            let hitBox = target.getBoxDimensions(hit.keyData.key);
            let boxOffset = thisBox.center.subtract(hitBox.center).abs();
            Render.outlineBox(hitBox.position, hitBox.length, 'red');
            Render.outlineBox(thisBox.position, thisBox.length, 'purple')
            let xUpdate = false, xBool = hit.wall.x != 0 && boxOffset.x >= boxOffset.y && Math.abs(option.x) <= Math.abs(velFinal.x);
            let yUpdate = false, yBool = hit.wall.y != 0 && boxOffset.x <= boxOffset.y && Math.abs(option.y) <= Math.abs(velFinal.y);
            
              if (xBool) {
                let sideCheck = target.getSide(hit.keyData.key, hit.wall.x*-1, 0);
                if (sideCheck != undefined) {
                  let node, boxData;
                  if (hit.wall.x == -1) { node = target.getNode(sideCheck[0])}
                  else if (hit.wall.x == 1) { node = target.getNode(sideCheck[sideCheck.length - 1]) }
                  let colType = target.blockMap.getBlock(node.data).collisionType;
                  if (colType == 0) { xUpdate = true}
                } else { xUpdate = true }
              }
              if (yBool) {
                let sideCheck = target.getSide(hit.keyData.key, 0, hit.wall.y*-1);
                if (sideCheck != undefined) {
                  let node;
                  if (hit.wall.y == -1) { node = target.getNode(sideCheck[0]) }
                  else if (hit.wall.y == 1) { node = target.getNode(sideCheck[sideCheck.length - 1]) }
                  let colType = target.blockMap.getBlock(node.data).collisionType;
                  if (colType == 0) { yUpdate = true}
                } else { yUpdate = true }
              }

            if (xUpdate) { velFinal.x = option.x; breakout = true }
            if (yUpdate) { velFinal.y = option.y; breakout = true }
            if (breakout) {
              hit.distance = velFinal;
              return hit
            }
          }
        }
      }
    }
  }

  checkAllCollisions(start, velocity, target) {
    let correctedVelocity = velocity.clone();
    let firstHit = this.checkCollision(start, correctedVelocity, target, 'red')
    if (firstHit != undefined) { 
      correctedVelocity.x = firstHit.distance.x;
      correctedVelocity.y = firstHit.distance.y;
      let secondHit = this.checkCollision(start, correctedVelocity, target, 'blue');
      if (secondHit != undefined) {
        correctedVelocity.x = secondHit.distance.x;
        correctedVelocity.y = secondHit.distance.y;
      }
    }
    if (firstHit != undefined) {
      //console.log(correctedVelocity)
    }
    // Update Velocity
    velocity.subtract(velocity.subtract(correctedVelocity), true)
  }

  //REMEMBER boxOFFSET IS BASED ON start position, NOT hitPosition
  solve(target, cornerKey, hitKey) {
    let solution = new Vector(0, 0, 2)
    
    //If allowed to hit vertical wall
    if (boxOffset.x >= boxOffset.y) {
      solution.x = 1;
    }
    //If allowed to hit horizontal wall
    if (boxOffset.x <= boxOffset.y) {
      solution.y = 1;
    }
    return solution
  }

  updatePos(force) {
    this.position.add(force, true)
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
