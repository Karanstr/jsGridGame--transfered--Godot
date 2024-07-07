"use strict";

class Block {
  constructor(color, collisionType, name) {
    this.name = name;
    this.color = color;
    this.collisionType = collisionType; //0 Non-Solid; 1 Solid
  }
}

class BlockMap {
  constructor() {
    this.blocks = []; //Array of Block()s
  }

  getBlockData(id) { return this.blocks[id] }

  addBlock(color, collisionType, name) {
    let id = this.blocks.length;
    this.blocks[id] = new Block(color, collisionType, name);
    return id
  }

}

export default BlockMap