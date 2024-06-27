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
    this.binaryGrids = [];
    //Fills each block with defaultValue
    let keys = this.genKeys(0, 0, this.dimensions.x, this.dimensions.y);
    keys.forEach((key) => { this.modify(key, defaultValue) })
  }

  meshGreedily(binaryGrid) {
    if (binaryGrid == undefined) { return [] }
    let gridData = Array.from(binaryGrid), shapeList = [];
    //Until all shapes have been accounted for
    while (Math.max(...gridData) != 0) {
      //Create a new, empty shape mask
      let currentShapeMask = 0;
      let steps = 0, maskLength = 0;
      let startHeight, endHeight;
      for (let y = 0; y < gridData.length; y++) {
        //If the current shape is empty, fill it
        if (currentShapeMask == 0) {
          //Can't grab a shape if the layer is empty
          if (gridData[y] == 0) { continue }
          startHeight = y;
          let line = gridData[y];
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
        let newShapeMask = currentShapeMask & gridData[y];
        //If the current line contains the mask completely, remove that data
        if (newShapeMask == currentShapeMask) { gridData[y] &= ~currentShapeMask; }
        else { endHeight = y - 1; break }
        //And if we've reached the final height and are about to terminate, stop looking
        if (y + 1 == gridData.length) { endHeight = y; break }
      }
      let startPos = new Vector2(steps, startHeight)
      let endPos = new Vector2(maskLength + steps - 1, endHeight)
      shapeList.push([startPos, endPos])
    }
    return shapeList
  }

  //Recieves a Set()
  convertToBinary(setData) {
    let binaryGrid = [];
    for (let y = 0; y < this.dimensions.y; y++) {
      binaryGrid[y] = 0
      for (let x = this.dimensions.x - 1; x >= 0; x--) {
        binaryGrid[y] <<= 1;
        if (setData.has(this.read(this.hash(x, y)))) { binaryGrid[y] += 1 }
      }
    }
    return binaryGrid
  }

  hash(x, y) {
    if (x >= this.dimensions.x || y >= this.dimensions.y || Math.min(x, y) < 0) {
      throw RangeError("Value isn't within table boundary");
    }
    return (x << this.xOffset) + y
  }

  //Shut up, I know hashes are supposed to be one way
  dehash(key) {
    if (key < 0 || key > (2 ** (this.maxBits * 2)) - 1) {
      throw RangeError("Value isn't within table boundary");
    }
    return new Vector2(key >> this.xOffset, key % 2 ** this.xOffset)
  }

  modify(key, value) {
    let oldValue = this.data[key];
    this.data[key] = value;
    this.binaryGrids[value] = this.convertToBinary(new Set([value]));
    if (oldValue != undefined) {
      this.binaryGrids[oldValue] = this.convertToBinary(new Set([oldValue]));
    }
  }

  read(key) { return this.data[key] }

  genKeys(initialX, initialY, endX, endY) {
    let keys = [];
    for (let x = initialX; x < endX; x++) {
      for (let y = initialY; y < endY; y++) {
        keys.push(this.hash(x, y))
      }
    }
    return keys
  }

  resizeTable(rows, columns) {
    //Not my problem, this is another me's job
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

  //Assumes only a single hexadecimal character is used for block types
  //Not a problem right now, but problem when I add more than 16 block types..
  load(data) {
    let blocks = data.split(' '); blocks.pop();
    if (blocks.length > this.dimensions.x * this.dimensions.y) { throw "Too many blocks" }
    blocks.forEach((block) => {
      let key = parseInt(block.substring(0, block.length - 1), 16)
      let data = parseInt(block[block.length - 1], 16);
      this.modify(key, data);
    })
    return true
  }

}

export default Grid
