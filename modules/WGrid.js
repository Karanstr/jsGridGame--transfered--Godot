"use strict";

import Vector2 from "./Vector2.js";

//If we go above 31 in either dimension
//bad things start happening bc we're using signed 32 bit ints for meshing

class Grid {
  constructor(dimensions, blockMap) {
    this.dimensions = dimensions.clone()
    this.area = dimensions.x * dimensions.y;
    this.data = [];
    this.keyInShape = [];
    this.shapes = []; //Shapes of this block generated using greedymeshing
    this.blockMap = blockMap; //Points to the blockmap, doesn't copy it
    this.blockCount = []; //Count of each type of block in grid
    //Fill grid with initial value
    for (let i = 0; i < this.blockMap.blocks.length; i++) { this.blockCount[i] = 0; }
    for (let i = 0; i < this.area; i++) { this.data[i] = 0 }
    this.shapes[0] = this.greedyMesh(0);
  }

  assignBlocks(shapeList) {
    for (let i = 0; i < shapeList.length; i++) {
      let shape = shapeList[i]
      let keys = this.genKeys(shape[0].x, shape[0].y, shape[1].x, shape[1].y);
      keys.forEach((key) => { this.keyInShape[key] = i })
    }
  }

  greedyMesh(data) {
    //Generate a binary representation of grid
    let gridData = this.convertToBinary(data), shapeList = [];
    //Until all shapes have been accounted for
    while (Math.max(...gridData) != 0) {
      //Create a new, empty shape mask
      let currentShapeMask = 0;
      let steps = 0, maskLength = 0;
      let startHeight, endHeight;
      for (let x = 0; x < gridData.length; x++) {
        //If the current shape is empty, fill it
        if (currentShapeMask == 0) {
          //Can't grab a shape if the layer is empty
          if (gridData[x] == 0) { continue }
          startHeight = x;
          let line = gridData[x];
          //Remember how many steps to the left we've taken before finding a shape
          while (line % 2 == 0) { steps += 1; line >>= 1 }
          //Extend the mask for each adjacent set bit
          while (line % 2 == 1) {
            currentShapeMask <<= 1; currentShapeMask += 1;
            line >>= 1; maskLength += 1;
          }
          //Shift the mask however many steps we had to take
          currentShapeMask <<= steps;
        }
        //Determine the overlap between the current mask and the current line
        let newShapeMask = currentShapeMask & gridData[x];
        //If the current line contains the mask completely, remove that data
        if (newShapeMask == currentShapeMask) { gridData[x] &= ~currentShapeMask; }
        else { endHeight = x - 1; break }
        //And if we've reached the final column and are about to terminate, stop looking
        if (x + 1 == gridData.length) { endHeight = x; break }
      }
      let startPos = new Vector2(startHeight, steps)
      let endPos = new Vector2(endHeight, maskLength + steps - 1)
      shapeList.push([startPos, endPos])
    }
    this.assignBlocks(shapeList);
    return shapeList
  }

  convertToBinary(data) {
    let binaryGrid = [];
    for (let x = 0; x < this.dimensions.x; x++) {//For each column
      binaryGrid[x] = 0
      for (let y = this.dimensions.y - 1; y >= 0; y--) {//For each box in the column
        binaryGrid[x] <<= 1;
        if (this.read(this.encode(x, y)) == data) { binaryGrid[x] += 1 }
      }
    }
    return binaryGrid
  }

  encode(x, y) {
    if (x >= this.dimensions.x || y >= this.dimensions.y || Math.min(x, y) < 0) {
      throw RangeError("Value isn't within table boundary");
    }
    return (x * this.dimensions.y) + y
  }

  decode(key) {
    if (key < 0 || key >= this.area) {
      throw RangeError("Value isn't within table boundary");
    }
    return new Vector2(Math.floor(key / this.dimensions.y), key % this.dimensions.y)
  }

  modify(key, value, remesh) {
    let oldValue = this.data[key];
    if (oldValue != value) {
      this.data[key] = value;
      if (oldValue != undefined) {
        this.blockCount[oldValue] -= 1;
        if (remesh) { this.shapes[oldValue] = this.greedyMesh(oldValue) }
      }
      this.blockCount[value] += 1;
      if (remesh) { this.shapes[value] = this.greedyMesh(value) }
    }
    return oldValue
  }

  modifyRect(start, end, value) {
    let keys = this.genKeys(start.x, start.y, end.x, end.y);
    let seenValues = new Set([value]);
    keys.forEach((key) => { seenValues.add(this.modify(key, value)) })
    seenValues.forEach((oldValue) => { this.shapes[oldValue] = this.greedyMesh(oldValue) })
  }

  read(key) { return this.data[key] }

  genKeys(initialX, initialY, endX, endY) {
    let firstKey = this.encode(initialX, initialY);
    let lastKey = this.encode(endX, endY);
    let keys = [firstKey];
    let currentKey = firstKey;
    for (currentKey; currentKey < lastKey; currentKey += this.dimensions.y) {
      for (currentKey; currentKey < lastKey; currentKey++) {
        keys.push(currentKey)
      }
    }
    return keys
  }

  //This'll get kinda big eventually, one day compression'll exist tho
  save() {
    let saveData = "";
    for (let key = 0; key < this.area; key++) {
      saveData += key.toString(16) + this.read(key).toString(16) + ' ';
    }
    return saveData
  }

  //Assumes only a single hexadecimal character is used for block types
  //Not a problem right now, but problem when I add more than 16 block types
  load(data) {
    let seenData = new Set();
    let blocks = data.split(' '); blocks.pop();
    if (blocks.length > this.dimensions.x * this.dimensions.y) { throw "Too many blocks" }
    blocks.forEach((block) => {
      let key = parseInt(block.substring(0, block.length - 1), 16)
      let data = parseInt(block[block.length - 1], 16);
      seenData.add(this.read(key));
      this.modify(key, data);
      seenData.add(data);
    })
    this.shapes = []; this.keyInShape = [];
    seenData.forEach((data) => { this.shapes[data] = this.greedyMesh(data) })
    return true
  }

}

export default Grid
