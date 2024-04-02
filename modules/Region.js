import Quadtree from "./Quadtree.js";
import Vector from "./Vector2.js"
import * as Render from "./Render.js";
export { Region, blockMap }

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
class Region extends Quadtree {
  constructor(x, y, width, height, blockMap) {
    super(5, 0);
    this.position = new Vector(x, y, 0);
    this.velocity = new Vector(0, 0, 1);
    this.length = new Vector(width, height, 1);
    this.blockMap = blockMap;
    this.cornerList = [];
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
  keyCull(velocity, keys, sign) {
    if (keys == undefined) { return }
    let keyList = new Set([0, 1, 2, 3]), newVelocity = velocity.multiplyScalar(sign);
    if (newVelocity.x < 0) { keyList.delete(2); keyList.delete(3); }
    else if (newVelocity.x > 0) { keyList.delete(0); keyList.delete(1); }
    if (newVelocity.y < 0) { keyList.delete(1); keyList.delete(3); }
    else if (newVelocity.y > 0) { keyList.delete(0); keyList.delete(2); }
    let keyOptions = [];
    keyList.forEach((index) => { keyOptions.push(keys[index]) })
    for (let i = 0; i < keyOptions.length; i++) {
      let key = keyOptions[i];
      if (key == undefined) { return undefined }
      else {
        let node = this.getNode(key);
        if (this.blockMap.getBlock(node.data).collisionType == 0) { return key }
      }
    }
    return keyOptions[0]
  }

  pointCull(velocity) {
    let cullSet = new Set([0, 1, 2, 3]);
    if (velocity.x == 0 && this.velocity.y != 0) {
      if (velocity.y < 0) { cullSet.delete(1); cullSet.delete(3) }
      else { cullSet.delete(0); cullSet.delete(2) }
    }
    else if (velocity.x != 0 && velocity.y == 0) {
      if (velocity.x < 0) { cullSet.delete(2); cullSet.delete(3) }
      else { cullSet.delete(0); cullSet.delete(1) }
    }
    else if (velocity.x < 0 && velocity.y < 0) { cullSet.delete(3) }
    else if (velocity.x < 0 && velocity.y > 0) { cullSet.delete(2) }
    else if (velocity.x > 0 && velocity.y < 0) { cullSet.delete(1) }
    else if (velocity.x > 0 && velocity.y > 0) { cullSet.delete(0) }
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

  stepArea(start, delta, key) {
    let sign = delta.sign(), flip = 1;
    if (key == undefined) { key = 1; flip = -1 }
    let box = this.getBoxDimensions(key);
    let halfLength = box.length.divideScalar(2);
    let cornerPoint = box.center.add(halfLength.multiply(sign).multiplyScalar(flip))
    let wallDistance = cornerPoint.subtract(start); wallDistance.type = 1
    let hitPoint = start.clone(); let wallHit = sign;
    let slope = delta.slope(); let slopeToCorner = wallDistance.slope();
    if (Math.abs(slopeToCorner) == Math.abs(slope)) { hitPoint.add(wallDistance, true) }
    else if (Math.abs(slopeToCorner) > Math.abs(slope)) {
      hitPoint.add(new Vector(wallDistance.x, slope * wallDistance.x, 0), true); wallHit.y = 0;
    }
    else if (Math.abs(slopeToCorner) < Math.abs(slope)) {
      hitPoint.add(new Vector(1 / slope * wallDistance.y, wallDistance.y, 0), true); wallHit.x = 0;
    }
    Render.drawPoint(hitPoint, 'red'); Render.drawLine(start, wallDistance, 'orange');
    return [hitPoint, wallHit]
  }

  checkCollis(target, velocity) {
    let solution = velocity.clone();
    let cullSet = this.pointCull(velocity);
    let culledCorners = []; //List of all valid corners.
    this.cornerList.forEach((corner) => { if (cullSet.has(corner.direction)) { culledCorners.push(corner) } })
    for (let i = 0; i < culledCorners.length; i++) {
      let corner = culledCorners[i];
      let info = target.getHit(corner.point.add(this.position), velocity);
    }
  }
  //Start Hate
  getHit(start, delta) {
    let distance = delta.length(); if (distance == 0) { return }
    let traveled = 0, point = start, keys = this.getKeys(point), result, hit = false;
    let key = this.keyCull(delta, keys, -1);
    while (traveled < delta && hit == false) {
      result = this.stepArea(point, delta, key);
      let nextPoint = result[0];
      keys = this.getKeys(nextPoint);
      key = this.keyCull(delta, keys, 1);
      if (key == undefined) { traveled = delta } //Hitting Edge of Region
      else {
        let node = this.getNode(key);
        let collisionType = this.blockMap.getBlock(node.data).collisionType;
        if (collisionType != 0) { hit = true } //Hitting Wall
        else {
          traveled += nextPoint.subtract(point).length(); point = nextPoint;
        }
      }
    }
    if (hit) { return [key, result[0], result[1]] }
  }

  checkCollision(start, end) {
    let delta; if (end.type == 1) { delta = end.clone() } else if (end.type == 0) { delta = end.subtract(start); delta.type = 1; }
    let distance = delta.length(); if (distance == 0) { return }
    let traveled = 0, point = start, keys = this.getKeys(point);
    let key = this.keyCull(delta, keys, -1);
    let result, hit = false;
    while (traveled < distance && hit == false) {
      result = this.stepArea(point, delta, key)
      let nextPoint = result[0]; keys = this.getKeys(nextPoint);
      key = this.keyCull(delta, keys, 1);
      if (key == undefined) { traveled = distance } //Hitting void
      else {
        let node = this.getNode(key);
        if (this.blockMap.getBlock(node.data).collisionType != 0) { hit = true } //Hitting target node
        else {
          traveled += nextPoint.subtract(point).length();
          point = nextPoint;
        }
      }
    }
    if (hit) {
      return [key, result[1], result[0]]
    }
  }

  solveCollision(target) {
    let solution = this.velocity.clone()
    let cullSet = this.pointCull(this.velocity)
    this.cornerList.forEach((corner) => {
      if (cullSet.has(corner.direction)) {
        let start = corner.point.add(this.position);
        let info = target.checkCollision(start, this.velocity, 1);
        if (info != undefined) {
          let key = info[0], hitWall = info[1], hitPoint = info[2];
          if (key != undefined) {
            let node = target.getNode(key);
            if (node.data != target.nullVal) {
              let thisBox = this.getBoxDimensions(corner.key);
              let hitBox = target.getBoxDimensions(key);
              let boxOffset = thisBox.center.subtract(hitBox.center).abs();
              let distanceFromCollision = start.subtract(hitPoint).abs();
              let answer = distanceFromCollision.multiply(hitWall);
              Render.outlineBox(hitBox.position, hitBox.length, 'red');
              //If Hitting Vertical Wall
              if (hitWall.x != 0 && Math.abs(answer.x) < Math.abs(solution.x) && boxOffset.x >= boxOffset.y) {
                solution.x = answer.x;
              }
              //If Hitting Horizontal Wall
              else if (hitWall.y != 0 && Math.abs(answer.y) < Math.abs(solution.y) && boxOffset.x <= boxOffset.y) {
                solution.y = answer.y;
              }
            }
          }
        }
      }
    })
    solution.type = 1;
    this.velocity.subtract(this.velocity.subtract(solution), true)
  }
  //End Hate
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