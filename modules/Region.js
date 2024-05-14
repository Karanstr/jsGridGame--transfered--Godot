
import Quadtree from "./Quadtree.js";
import Vector from "./Vector2.js"
import PhysObject from "./Physics.js";
import * as Render from "./Render.js";
export { Region, blockMap }

//Data Classes
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
    this.key;
    this.keys;
    this.colType;
    this.distance = 0;
  }
}
//Real Deal
class Region extends Quadtree {
  constructor(x, y, width, height, blockMap) {
    //Figure out how to assign a default value better?
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
    //Draws each square
    let allNodes = this.getKids(1), nodes = [...allNodes[1], ...allNodes[0]];
    nodes.forEach((key) => {
      let node = this.readNode(key);
      if (key == 1 || node.data != this.readNode(key >> 2).data) {
        let box = this.getBoxDimensions(key);
        let color = this.blockMap.getBlock(node.data).color;
        Render.drawBox(box.position, box.length, color);
      }
    })
    if (this.debug) {
      //Draw all grids
      Render.outlineBox(this.physics.position, this.length, 'black');
      allNodes[1].forEach((branch) => {
        let box = this.getBoxDimensions(branch);
        Render.drawLine(new Vector(box.position.x, box.center.y, 0), new Vector(box.length.x, 0, 1), 'black');
        Render.drawLine(new Vector(box.center.x, box.position.y, 0), new Vector(0, box.length.y, 1), 'black');
      })
    }
  }

  Draw(func, key, color) {
    //Simplifies calls to certain render functions
    let boxDim = this.getBoxDimensions(key);
    func(boxDim.position, boxDim.length, color)
  }

  //Corner Start
  getCorners(key) {
    //Returns all exposed corners (both sides not covered)
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
    //Finds the corners of all leaves and stores them in cornerList
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
    //Reads the blockmap for the data stored in node of key
    //Returns collisiontype of that node
    if (key == undefined) { return }
    return this.blockMap.getBlock(this.readNode(key).data).collisionType
  }

  getKeys(point) {
    //Takes an x, y coordiate-pair
    //Returns four possible keys that pair might fall into
    let originPoint = point.subtract(this.physics.position);
    let keys = [], badcount = 0;
    let offset = new Vector(.01, .01, 1);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        for (let layer = 0; layer < this.depth; layer++) {
          let scaledX = Math.floor(originPoint.x / ((this.length.x + offset.x - i * offset.x * 2) / 2 ** layer));
          let scaledY = Math.floor(originPoint.y / ((this.length.y + offset.y - j * offset.y * 2) / 2 ** layer));
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

  //Utility/Culling
  pointCull(velocity) {
    //Culls obviously useless points using velocity
    //Used to simplify collision checks
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
    //Decides which of the four keys generated by getKeys()
    //should be used to determine collisions
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

  fillHit(hit, direction, velocity) {
    hit.keys = this.getKeys(hit.point);
    hit.key = this.keyCull(hit.keys, direction, velocity);
    hit.colType = this.readColType(hit.key);
  }
  //Utility/Culling End
  //Collision Safety Checks
  slideCheck(hitData) {
    //Checks if a corner should be collided with or if it should be slid past
    let xKey, yKey; let result = new Vector(true, true, 3)
    if (hitData.wall.x == 1 && hitData.wall.y == 1) { xKey = hitData.keys[1]; yKey = hitData.keys[2]; }
    else if (hitData.wall.x == -1 && hitData.wall.y == 1) { xKey = hitData.keys[3]; yKey = hitData.keys[0]; }
    else if (hitData.wall.x == 1 && hitData.wall.y == -1) { xKey = hitData.keys[0]; yKey = hitData.keys[3]; }
    else if (hitData.wall.x == -1 && hitData.wall.y == -1) { xKey = hitData.keys[2]; yKey = hitData.keys[1]; }
    if (xKey != undefined && this.readColType(xKey) == 1) { result.x = false }
    if (yKey != undefined && this.readColType(yKey) == 1) { result.y = false }
    return result
  }

  wallHangCheck(cornerKey, cornerRegion, hitKey, hitRegion) {
    //Checks if a face should be collided with
    let truth = new Vector(false, false, 3);
    let cornerBox = cornerRegion.getBoxDimensions(cornerKey);
    let hitBox = hitRegion.getBoxDimensions(hitKey);
    let boxOffset = cornerBox.center.subtract(hitBox.center).abs();
    if (this.debug) {
      Render.outlineBox(hitBox.position, hitBox.length, 'red');
      Render.outlineBox(cornerBox.position, cornerBox.length, 'purple');
    }
    if (boxOffset.x >= boxOffset.y) { truth.assign(true) }
    if (boxOffset.x <= boxOffset.y) { truth.assign(undefined, true) }
    return truth
  }
  //Col Safety Checks End

  findNextIntersection(startPoint, velocity, key) {
    //Finds the point a velocity will cause the startingPoint to collide to within a key
    //Math all figured out here: https://www.desmos.com/calculator/gkqzdh2vbk
    let flip = 1, hit = new hitData(startPoint.clone(), velocity.sign());
    if (key == undefined) { key = 1; flip = -1; }
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

  findNextHit(point, direction, velocity) {
    //Steps through each square in a line until a solid square or boundary wall is hit
    let traveled = 0, hit = new hitData(point, velocity.sign());
    let distance = velocity.length(), searching = true; if (velocity.length() == 0) { return hit }
    this.fillHit(hit, direction, velocity);
    //While not hitting a solid block, region boundary, and haven't check full path
    while (searching) {
      if (traveled >= distance || hit.colType == 1) { break }
      hit = this.findNextIntersection(hit.point, velocity, hit.key);
      this.fillHit(hit, direction, velocity);
      switch (hit.colType) {
        case undefined: searching = false; break //Hitting region boundary
        default: //Step to the next block
          traveled += hit.point.subtract(point).length();
          point = hit.point.clone();
      }
    }
    return hit
  }

  //Collision Again
  checkCollision(start, velocity, target) {
    let finalHit;
    let currentVelocity = velocity.clone();
    let cullSet = this.pointCull(velocity), culledCorners = [];
    this.cornerList.forEach((corner) => { if (cullSet.has(corner.direction)) { culledCorners.push(corner) } })
    for (let i = 0; i < culledCorners.length; i++) {
      let corner = culledCorners[i];
      let cornerPoint = corner.point.add(start);
      let hit = target.findNextHit(cornerPoint, corner.direction, currentVelocity);
      if (hit.colType == 1) {
        hit.distance = hit.point.subtract(cornerPoint);
        let slide, update = false;
        let wallHangCheck = this.wallHangCheck(corner.key, this, hit.key, target);
        if (hit.wall.x != 0 && hit.wall.y != 0) { slide = target.slideCheck(hit) }
        else { slide = new Vector(true, true, 3) }
        if (wallHangCheck.x && slide.x) { update = true } else { hit.wall.x = 0 }
        if (wallHangCheck.y && slide.y) { update = true } else { hit.wall.y = 0 }
        if (update && hit.distance.length() < currentVelocity.length()) {
          currentVelocity = hit.distance; finalHit = hit;
          if (hit.distance.length() == 0) { break }
        }
      }
    }
    return finalHit
  }

  moveWithCollisions(target) {
    if (this.physics.velocity.length() == 0) { return }
    //Checks collisions in the xy direction, then in either the x or y direction depending on velocity
    let foundWalls = new Vector(false, false, 3);
    while ((!foundWalls.x || !foundWalls.y)) {
      let hit = this.checkCollision(this.physics.position, this.physics.velocity, target);
      if (hit == undefined || (hit.wall.x == 0 && hit.wall.y == 0)) { this.physics.updatePosition(); break } //Move normally
      else {
        this.physics.applyPartialVelocity(hit.distance);
        if (hit.wall.x != 0) { foundWalls.x = true; this.physics.velocity.x = 0; }
        if (hit.wall.y != 0) { foundWalls.y = true; this.physics.velocity.y = 0; }
      }
    }
  }
  //Collision/Physics End
}

class Block {
  constructor(color, collisionType) {
    this.color = color;
    this.collisionType = collisionType;
    this.resistanceFactor;
  }
}
class blockMap {
  constructor() {
    this.blockList = new Map();
  }

  getBlock(id) { return this.blockList.get(id) }

  addBlock(id, color, collisionType) {
    this.blockList.set(id, new Block(color, collisionType))
  }

  import() {

  }

  export() {

  }
}
