
export { drawPoint, drawBox, outlineBox, drawLine }

const canvas = document.getElementById("canvas");
const can = canvas.getContext("2d");

function drawPoint(pos, color) {
  can.fillStyle = color;
  can.fillRect(pos.x - 2, pos.y - 2, 4, 4)
}

function drawBox(pos, length, color) {
  can.fillStyle = color;
  can.fillRect(pos.x, pos.y, length.x, length.y);
}

function outlineBox(pos, length, color) {
  can.strokeStyle = color;
  can.strokeRect(pos.x, pos.y, length.x, length.y);
}

function drawLine(start, end, color) {
  if (end.type == 1) { end = end.add(start) }
  can.strokeStyle = color;
  can.beginPath();
  can.moveTo(start.x, start.y);
  can.lineTo(end.x, end.y);
  can.stroke();
}
