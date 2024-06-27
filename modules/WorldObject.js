"use strict";

import Grid from "./Grid.js"
import Vector2 from "./Vector2.js"
import Render from "./Render.js"



class WorldObject {
  //Figure out the distinction between world position and screen position
  constructor(position, length, tableSize, defaultValue) {
    this.grid = new Grid(tableSize, defaultValue);
    this.gridLength = length.clone();
    this.blockLength = this.gridLength.divide(this.grid.dimensions);
    this.position = position.clone();
    this.velocity = new Vector2(0, 0);
    this.draw = 'mesh';
  }

  //Figure out why html canvas sucks at drawing adjacent squares
  Render() {
    for (let i = 0; i < this.grid.shapes.length; i++) {
      let boxes = this.grid.shapes[i];
      if (boxes == undefined || boxes.length == 0) { continue }
      boxes.forEach((box) => {
        let point = box[0], length = box[1].add(new Vector2(1, 1)).subtract(point);
        Render.drawBox(this.position.add(point.multiply(this.blockLength)),
          length.multiply(this.blockLength), Blocks.get(i));
        if (this.draw == 'mesh') {
          Render.outlineBox(this.position.add(point.multiply(this.blockLength)),
            length.multiply(this.blockLength), 'black');
        }
      })
    }
    if (this.draw == 'grid') {
      for (let x = 0; x < this.grid.dimensions.x; x++) {
        for (let y = 0; y < this.grid.dimensions.y; y++) {
          let point = new Vector2(x, y);
          Render.outlineBox(point.multiply(this.blockLength), this.blockLength, 'black')
        }
      }
    }
  }

  //Eventually redo this so it only generates keys velocity matches
  //instead of generating all keys then culling them
  pointToKey(point) {
    let translatedPoint = point.subtract(this.position);
    let offset = new Vector2(.01, .01), keys = [];
    for (let xShift = 0; xShift < 2; xShift++) {
      for (let yShift = 0; yShift < 2; yShift++) {
        let scaledX, scaledY;
        if (translatedPoint.x == 0 && xShift == 0) { scaledX = -1 }
        else {
          let limit = offset.x - xShift * offset.x * 2
          scaledX = Math.floor((translatedPoint.x + limit) / this.blockLength.x)
        }
        if (translatedPoint.y == 0 && yShift == 0) { scaledY = -1 }
        else {
          let limit = offset.y - yShift * offset.y * 2
          scaledY = Math.floor((translatedPoint.y + limit) / this.blockLength.y)
        }
        try { keys.push(this.grid.encode(scaledX, scaledY)) }
        catch (error) { keys.push(undefined) }
      }
    }
    return keys
  }

  identifyCorners() {

  }

}

export default WorldObject

const Blocks = new Map();
Blocks.set(0, 'red')
Blocks.set(1, 'blue')