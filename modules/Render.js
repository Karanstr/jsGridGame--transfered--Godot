"use strict";

import Vector2 from "./Vector2.js"
const canvas = document.getElementById("canvas");
const can = canvas.getContext("2d");

class box {
  constructor(startX, startY, width, height) {

  }
}

const RenderFunctions = {
  drawPoint(pos, color) {
    can.fillStyle = color;
    can.fillRect(pos.x - 2, pos.y - 2, 4, 4)
  },

  drawBox(pos, length, color) {
    can.fillStyle = color;
    can.fillRect(pos.x, pos.y, length.x, length.y);
  },

  outlineBox(pos, length, color) {
    can.strokeStyle = color;
    can.strokeRect(pos.x, pos.y, length.x, length.y);
  },

  drawLine(start, end, color) {
    if (end.type == 1) { end = end.add(start) }
    can.strokeStyle = color;
    can.beginPath();
    can.moveTo(start.x, start.y);
    can.lineTo(end.x, end.y);
    can.stroke();
  },

  greedyMesh(binaryGrid) {
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

}

export default RenderFunctions