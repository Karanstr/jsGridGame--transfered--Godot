"use strict";

import Grid from "./WGrid.js"
import Vector2 from "./Vector2.js"
import Render from "./Render.js"

class WorldObject {
  constructor(position, length, tableSize, blockMap) {
    this.grid = new Grid(tableSize, blockMap);
    this.gridLength = length.clone();
    this.blockLength = this.gridLength.divide(this.grid.dimensions);
    this.position = position.clone();
    this.velocity = new Vector2(0, 0);
    this.draw = 'mesh';
  }

  Render() {
    for (let i = 0; i < this.grid.shapes.length; i++) {
      let boxes = this.grid.shapes[i];
      if (boxes == undefined || boxes.length == 0) { continue }
      boxes.forEach((box) => {
        let point = box[0], length = box[1].add(new Vector2(1, 1)).subtract(point);
        Render.drawBox(this.position.add(point.multiply(this.blockLength)),
          length.multiply(this.blockLength), this.grid.blockMap.getBlockData(i).color);
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
          Render.outlineBox(point.multiply(this.blockLength).add(this.position), this.blockLength, 'black')
        }
      }
    }
  }

  pointToKey(point) {
    let translatedPoint = point.subtract(this.position);
    let offset = this.blockLength.divideScalar(100), keys = [];
    for (let xShift = -1; xShift < 2; xShift += 2) {
      for (let yShift = -1; yShift < 2; yShift += 2) {
        //Stupid edgecase
        if ((translatedPoint.x <= 0 && xShift == -1) || (translatedPoint.y <= 0 && yShift == -1)) {
          keys.push(undefined); continue
        }
        try {
          keys.push(this.grid.encode(
            Math.floor((translatedPoint.x + xShift * offset.x) / this.blockLength.x),
            Math.floor((translatedPoint.y + yShift * offset.y) / this.blockLength.y)
          ))
        } catch (error) { keys.push(undefined) }
      }
    }
    return keys
  }

  cullKeys(keys, velocity) {
    let velSign = velocity.sign();
    let checkX, checkY;
    let result = [];
    if (velSign.x == 0) { checkX = [0, 1] }
    else { checkX = [Math.ceil(velSign.x / 2)] }
    if (velSign.y == 0) { checkY = [0, 1] }
    else { checkY = [Math.ceil(velSign.y / 2)] }
    for (let x = 0; x < checkX.length; x++) {
      for (let y = 0; y < checkY.length; y++) {
        result.push(keys[(checkX[x] << 1) + checkY[y]])
      }
    }
    return result
  }

  identifyCorners() {

  }

}

export default WorldObject
