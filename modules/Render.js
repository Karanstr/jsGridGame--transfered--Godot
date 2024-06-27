"use strict";

const canvas = document.getElementById("canvas");
const can = canvas.getContext("2d");

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
    can.strokeStyle = color;
    can.beginPath();
    can.moveTo(start.x, start.y);
    can.lineTo(end.x, end.y);
    can.stroke();
  },

}

export default RenderFunctions