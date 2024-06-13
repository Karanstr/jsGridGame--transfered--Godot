"use strict";
import Vector2 from "./Vector2.js";
//Most space efficient when rows == columns and rows/columns are a power of 2
//Todo:
// Exposed corner detection, bitmasks?

class Grid {
  constructor(rows, columns) {
    this.dimensions = new Vector2(rows, columns);
    this.keyOffset = (Math.min(rows, columns) - 1).toString(2).length;
    this.maxBits = (Math.max(rows, columns) - 1).toString(2).length
    this.data = [];
    //Fills each block with defaultValue
    let keys = this.genKeys(0, 0, this.dimensions.x, this.dimensions.y);
    let i = 0;
    keys.forEach((key) => {
      this.modify(key, i % 2); i++
    })
  }

  hash(x, y) {
    if (Math.max(x, y) > (2 ** this.maxBits) - 1 || Math.min(x, y) < 0) {
      throw RangeError("Value isn't within table boundary");
    }
    let key;
    if (this.dimensions.x < this.dimensions.y) { key = (y << this.keyOffset) + x }
    else { key = (x << this.keyOffset) + y }
    return key
  }

  //Shut up, I know hashes are supposed to be one way
  dehash(key) {
    if (key < 0 || key > (2 ** (this.maxBits * 2)) - 1) {
      throw RangeError("Value isn't within table boundary");
    }
    let x, y;
    if (this.dimensions.x < this.dimensions.y) {
      x = key % 2 ** this.keyOffset; y = key >> this.keyOffset;
    }
    else { y = key % 2 ** this.keyOffset; x = key >> this.keyOffset; }
    return new Vector2(x, y)
  }

  modify(key, value) { this.data[key] = value }

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

  //This'll get kinda big eventually, one day compression'll exist
  //Not today though
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
