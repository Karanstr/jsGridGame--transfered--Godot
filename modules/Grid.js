"use strict";

import Vector2 from "./Vector2.js";
//Most space efficient when rows == columns and rows/columns are a power of 2.
//After that most efficient when columns > rows 
//If we go above 31 in either, bad things start happening bc we're using signed 32 bit ints

class Grid {
  constructor(dimensions, defaultValue) {
    this.dimensions = dimensions.clone()
    this.xOffset = (this.dimensions.y - 1).toString(2).length;
    this.data = [];
    this.shapes = [];
    this.keyInShape = []
    //Fills each block with defaultValue
    let keys = this.genKeys(0, 0, this.dimensions.x, this.dimensions.y);
    keys.forEach((key) => { this.modify(key, defaultValue) })
    this.shapes[defaultValue] = this.greedyMesh(defaultValue);
  }

  //Maybe store all this also in this.data instead of making another array?
  assignBlocks(shapeList) {
    for (let i = 0; i < shapeList.length; i++) {
      let shape = shapeList[i]
      let keys = this.genKeys(shape[0].x, shape[0].y, shape[1].x + 1, shape[1].y + 1);
      keys.forEach((key) => {
        this.keyInShape[key] = i
      })
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
    //For each column
    for (let x = 0; x < this.dimensions.x; x++) {
      binaryGrid[x] = 0
      //For each box in the column
      for (let y = this.dimensions.y - 1; y >= 0; y--) {
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
    return (x << this.xOffset) + y
  }

  decode(key) {
    if (key < 0 || key > this.encode(this.dimensions.x - 1, this.dimensions.y - 1)) {
      throw RangeError("Value isn't within table boundary");
    }
    return new Vector2(key >> this.xOffset, key % (2 ** this.xOffset))
  }

  modify(key, value, updateMesh) {
    let oldValue = this.data[key];
    this.data[key] = value;
    if (updateMesh) {
      this.shapes[value] = this.greedyMesh(value);
      this.shapes[oldValue] = this.greedyMesh(oldValue);
    }
  }

  read(key) { return this.data[key] }

  genKeys(initialX, initialY, endX, endY) {
    let keys = [];
    for (let x = initialX; x < endX; x++) {
      for (let y = initialY; y < endY; y++) {
        keys.push(this.encode(x, y))
      }
    }
    return keys
  }

  //This'll get kinda big eventually, one day compression'll exist tho
  save() {
    let saveData = "";
    let keys = this.genKeys(0, 0, this.dimensions.x, this.dimensions.y);
    keys.forEach((key) => {
      let data = this.read(key);
      saveData += key.toString(16) + data.toString(16) + ' ';
    })
    return saveData
  }

  //Only allows loading of an entire grid, partial loading will lead to issues
  //Assumes only a single hexadecimal character is used for block types
  //Not a problem right now, but problem when I add more than 16 block types..
  load(data) {
    let seenData = new Set();
    let blocks = data.split(' '); blocks.pop();
    if (blocks.length > this.dimensions.x * this.dimensions.y) { throw "Too many blocks" }
    blocks.forEach((block) => {
      let key = parseInt(block.substring(0, block.length - 1), 16)
      let data = parseInt(block[block.length - 1], 16);
      this.modify(key, data);
      seenData.add(data);
    })
    this.shapes = []; this.keyInShape = [];
    seenData.forEach((data) => { this.shapes[data] = this.greedyMesh(data) })
    return true
  }

}

export default Grid
