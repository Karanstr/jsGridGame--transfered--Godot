
import Quadtree from "./Quadtree.js";
import Vector from "./Vector2.js"
import PhysObject from "./Physics.js";
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
  constructor(point, wall, key, keys) {
    this.point = point;
    this.wall = wall; // Rename to direction?
    this.key = key;
    this.keys = keys;
    this.distance;
  }
}
class Region extends Quadtree {
  constructor(x, y, width, height, blockMap) {
    super(5, 0);
    this.physics = new PhysObject(x, y, .9);
    this.length = new Vector(width, height, 1);
    this.blockMap = blockMap;
    this.cornerList = [];
    this.debug = true;
  }

  getBoxDimensions(key) {
    let coords = this.decodeKey(key);
    let scale = 2 ** coords[2];
    let width = this.length.x / scale, height = this.length.y / scale;
    let x = coords[0] * width + this.physics.position.x;
    let y = coords[1] * height + this.physics.position.y;
    return new box(x, y, width, height)
  }

  Render() {
    let keys = this.getKids(1);
    keys[0].forEach((leaf) => {
      let node = this.readNode(leaf);
      if (node.data != 0) {
        let box = this.getBoxDimensions(leaf);
        let color = this.blockMap.getBlock(node.data).color;
        Render.drawBox(box.position, box.length, color);
      }
    })
    //if (this.debug) {
    Render.outlineBox(this.physics.position, this.length, 'black');
    keys[1].forEach((branch) => {
      let box = this.getBoxDimensions(branch);
      Render.drawLine(new Vector(box.position.x, box.center.y, 0), new Vector(box.length.x, 0, 1), 'black');
      Render.drawLine(new Vector(box.center.x, box.position.y, 0), new Vector(0, box.length.y, 1), 'black');
    })
    //}
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
    //top left 0
    if ((top == undefined || this.readNode(top[0]).data == this.nullVal) &&
      (left == undefined || this.readNode(left[0]).data == this.nullVal)) {
      result.add(0);
    }
    //bottom left 1
    if ((bottom == undefined || this.readNode(bottom[0]).data == this.nullVal) &&
      (left == undefined || this.readNode(left[left.length - 1]).data == this.nullVal)) {
      result.add(1);
    }
    //top right 2
    if ((top == undefined || this.readNode(top[top.length - 1]).data == this.nullVal) &&
      (right == undefined || this.readNode(right[0]).data == this.nullVal)) {
      result.add(2);
    }
    //bottom right 3
    if ((bottom == undefined || this.readNode(bottom[bottom.length - 1]).data == this.nullVal) &&
      (right == undefined || this.readNode(right[right.length - 1]).data == this.nullVal)) {
      result.add(3);
    }
    return result
  }

  findCorners() {
    let kids = this.getKids(1)[0];
    this.cornerList = [];
    kids.forEach((key) => {
      let node = this.readNode(key);
      if (node.data != this.nullVal) {
        let box = this.getBoxDimensions(key), corners = this.getCorners(key);
        box.position.subtract(this.physics.position, true);
        if (corners.has(0)) { this.cornerList.push(new corner(box.position, key, 0)) }
        if (corners.has(1)) { this.cornerList.push(new corner(new Vector(box.position.x, box.position.y + box.length.y, 0), key, 1)) }
        if (corners.has(2)) { this.cornerList.push(new corner(new Vector(box.position.x + box.length.x, box.position.y, 0), key, 2)) }
        if (corners.has(3)) { this.cornerList.push(new corner(box.position.add(box.length), key, 3)) }
      }
    })
  }

  drawCorners() {
    if (this.debug) { this.cornerList.forEach((corner) => { Render.drawPoint(corner.point.add(this.physics.position), 'yellow') }) }
  }
  //Corner End
  //Collision/Physics Start
  readColType(key) {
    return this.blockMap.getBlock(this.readNode(key).data).collisionType
  }

  getKeys(point) {
    let originPoint = point.subtract(this.physics.position);
    let keys = []; let badcount = 0; let offset = .001;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        for (let layer = 0; layer < this.depth; layer++) {
          let scaledX = Math.floor(originPoint.x / ((this.length.x + offset - i * offset) / 2 ** layer));
          let scaledY = Math.floor(originPoint.y / ((this.length.y + offset - j * offset) / 2 ** layer));
          if (originPoint.x == 0 && i == 0) { scaledX = -1 }
          if (originPoint.y == 0 && j == 0) { scaledY = -1 }
          try {
            let key = this.encodeKey(scaledX, scaledY, layer);
            let node = this.readNode(key);
            if (node.type == 0) { keys.push(key); break }
          } catch (error) { keys.push(undefined); badcount += 1; break }
        }
      }
    }
    if (badcount == 4) { return undefined }
    return keys
  }

  pointCull(velocity) {
    let cullSet = new Set([0, 1, 2, 3]);
    if (velocity.x == 0 && velocity.y != 0) {
      if (velocity.y < 0) { cullSet.delete(1); cullSet.delete(3) }
      else if (velocity.y > 0) { cullSet.delete(0); cullSet.delete(2) }
    }
    else if (velocity.x != 0 && velocity.y == 0) {
      if (velocity.x < 0) { cullSet.delete(2); cullSet.delete(3) }
      else if (velocity.x > 0) { cullSet.delete(0); cullSet.delete(1) }
    }
    else if (velocity.x < 0 && velocity.y < 0) { cullSet.delete(3) }
    else if (velocity.x < 0 && velocity.y > 0) { cullSet.delete(2) }
    else if (velocity.x > 0 && velocity.y < 0) { cullSet.delete(1) }
    else if (velocity.x > 0 && velocity.y > 0) { cullSet.delete(0) }
    return cullSet
  }

  keyCull(keys, direction, velocity) {
    let velDirection = velocity.sign();
    if (keys == undefined) { keys = [] }
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
    return key
  }

  stepSquare(startPoint, velocity, key) {
    let flip = 1, hit = new hitData(startPoint.clone(), velocity.sign());
    if (key == undefined) { key = 1; flip = -1; } else if (this.readColType(key) != 0) { flip = -1 }
    let box = this.getBoxDimensions(key);
    let directionPoint = box.center.add(box.length.divideScalar(2).multiply(hit.wall).multiplyScalar(flip))
    let wallDistance = directionPoint.subtract(startPoint); wallDistance.type = 1
    let slope = velocity.slope(); let slopeToCorner = Math.abs(wallDistance.slope());
    if (slopeToCorner == Math.abs(slope)) { hit.point.add(wallDistance, true) }
    else if (slopeToCorner > Math.abs(slope)) {
      hit.point.add(new Vector(wallDistance.x, slope * wallDistance.x, 0), true); hit.wall.y = 0;
    }
    else if (slopeToCorner < Math.abs(slope)) {
      hit.point.add(new Vector(1 / slope * wallDistance.y, wallDistance.y, 0), true); hit.wall.x = 0;
    }
    if (this.debug) { Render.drawPoint(hit.point, 'red'); Render.drawLine(startPoint, wallDistance, 'orange'); }
    return hit
  }

  calcHit(cornerPos, direction, velocity) {
    let distance = velocity.length(); if (distance == 0) { return }
    let traveled = 0, point = cornerPos, hit = new hitData();
    hit.keys = this.getKeys(point);
    hit.key = this.keyCull(hit.keys, direction, velocity);
    while (distance > traveled) {
      hit = this.stepSquare(point, velocity, hit.key);
      hit.keys = this.getKeys(hit.point);
      hit.key = this.keyCull(hit.keys, direction, velocity);
      if (hit.key == undefined) { traveled = distance } //Hitting Edge of Region
      else {
        if (this.readColType(hit.key) != 0) { break } //Hitting Wall
        else {
          traveled += hit.point.subtract(point).length();
          point = hit.point;
        }
      }
    }
    return hit
  }

  //Collision Safety Checks
  slideCheck(hitData) {
    let xKey, yKey; let result = new Vector(true, true, 3)
    if (hitData.wall.x == 1 && hitData.wall.y == 1) { xKey = hitData.keys[1]; yKey = hitData.keys[2]; }
    else if (hitData.wall.x == -1 && hitData.wall.y == 1) { xKey = hitData.keys[3]; yKey = hitData.keys[0]; }
    else if (hitData.wall.x == 1 && hitData.wall.y == -1) { xKey = hitData.keys[0]; yKey = hitData.keys[3]; }
    else if (hitData.wall.x == -1 && hitData.wall.y == -1) { xKey = hitData.keys[2]; yKey = hitData.keys[1]; }

    if (xKey != undefined && this.readColType(xKey) != 0) { result.x = false }
    if (yKey != undefined && this.readColType(yKey) != 0) { result.y = false }
    return result
  }

  wallHangCheck(cornerKey, cornerRegion, hitKey, hitRegion) {
    let truth = new Vector(false, false, 3);
    let cornerBox = cornerRegion.getBoxDimensions(cornerKey);
    let hitBox = hitRegion.getBoxDimensions(hitKey);
    let boxOffset = cornerBox.center.subtract(hitBox.center).abs();
    if (this.debug) {
      Render.outlineBox(hitBox.position, hitBox.length, 'red');
      Render.outlineBox(cornerBox.position, cornerBox.length, 'purple');
    }
    if (boxOffset.x >= boxOffset.y) { truth.assign(true) }
    if (boxOffset.x <= boxOffset.y) { truth.assign(null, true) }
    return truth
  }

  //Returns solution velocity
  checkCollision(start, velocity, target) {
    let finalHit;
    let currentVelocity = velocity.clone();
    let cullSet = this.pointCull(velocity), culledCorners = [];
    this.cornerList.forEach((corner) => { if (cullSet.has(corner.direction)) { culledCorners.push(corner) } })
    for (let i = 0; i < culledCorners.length; i++) {
      let corner = culledCorners[i];
      let cornerPoint = corner.point.add(start);
      let hit = target.calcHit(cornerPoint, corner.direction, currentVelocity);
      //If hitting something I need to collide with
      if (hit != undefined && hit.key != undefined && target.readColType(hit.key) != 0) {
        hit.distance = hit.point.subtract(cornerPoint);
        let slide, updateX = false, updateY = false;
        let wallHangCheck = this.wallHangCheck(corner.key, this, hit.key, target);
        if (hit.wall.x != 0 && hit.wall.y != 0) { slide = target.slideCheck(hit) } else { slide = new Vector(true, true, 3) }
        if (wallHangCheck.x && slide.x) { updateX = true } else { hit.wall.x = 0 }
        if (wallHangCheck.y && slide.y) { updateY = true } else { hit.wall.y = 0 }
        //If collision is valid, check if it's shorter than current best alternative
        if ((updateX || updateY) && hit.distance.length() < currentVelocity.length()) {
          currentVelocity = hit.distance
          if (hit.distance.length() == 0) { return hit } else { finalHit = hit }
        }
      }
    }
    return finalHit
  }

  moveWithCollisions(target) {
    let foundWalls = new Vector(false, false, 3);
    while ((!foundWalls.x || !foundWalls.y)) {
      let hit = this.checkCollision(this.physics.position, this.physics.velocity, target);
      if (hit == undefined || (hit.wall.x == 0 && hit.wall.y == 0)) { this.physics.updatePosition(); break } //Move normally
      else {
        this.physics.applyPartialVelocity(hit.distance);
        if (hit.wall.x != 0) { foundWalls.x = true; this.physics.velocity.x = 0 }
        if (hit.wall.y != 0) { foundWalls.y = true; this.physics.velocity.y = 0 }
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
