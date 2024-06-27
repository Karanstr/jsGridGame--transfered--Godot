"use strict";

import Render from './modules/Render.js';
window.Render = Render;
import Vector2 from './modules/Vector2.js';
window.Vector2 = Vector2;
import WorldObject from './modules/WorldObject.js';
window.WorldObject = WorldObject;
import Physics from './modules/Physics.js'
window.Physics = Physics

const canvas = document.getElementById("canvas");
let canData = canvas.getBoundingClientRect();
window.canData = canData
const a = new WorldObject(
  new Vector2(0, 0),
  new Vector2(500, 500),
  new Vector2(24, 24),
  1);
window.a = a;
const p = {
  position: new Vector2(250, 250),
  velocity: new Vector2(0, 0)
}
window.p = p;

//Order objects should be rendered
var renderList = [a]
window.currentMove = p;
window.currentEdit = a;

onmousedown = (mouse) => {
  if (mouse.pageY > canData.top &&
    mouse.pageY < canData.bottom &&
    mouse.pageX > canData.left &&
    mouse.pageX < canData.right) {
    let key = Math.max(...window.currentEdit.pointToKey(new Vector2(mouse.offsetX, mouse.offsetY)));
    let color = Number(document.getElementById('colorField').value);
    if (color > 1) { color = 1 }
    window.currentEdit.grid.modify(key, color, true);
  }
}

window.keyMove = new Set();
let keyMove = window.keyMove;
let keyRemove = new Set();
onkeydown = (event) => { keyMove.add(event.key) }
onkeyup = (event) => { keyRemove.add(event.key) }

var gameID;
window.speed = 1
window.gameStep = function () {
  if (keyMove.length != 0) {
    let frameMove = new Vector2(0, 0)
    if (keyMove.has('w') && keyMove.has('s')) { }
    else if (keyMove.has('w')) { frameMove.y = -1 }
    else if (keyMove.has('s')) { frameMove.y = 1 }
    if (keyMove.has('a') && keyMove.has('d')) { }
    else if (keyMove.has('a')) { frameMove.x = -1 }
    else if (keyMove.has('d')) { frameMove.x = 1 }
    if (frameMove.length() != 0) {
      frameMove.normalize(true);
      window.currentMove.velocity = frameMove.multiplyScalar(window.speed);
    }
  }
  keyRemove.forEach((key) => { keyMove.delete(key) })
  keyRemove.clear();

  //Clear canvas then redraw
  Render.drawBox(new Vector2(0, 0), new Vector2(500, 500), 'white')
  renderList.forEach((object) => { object.Render() })
  Render.drawPoint(p.position, 'cyan');
  Physics.physFunction(p.position, p.velocity, a)

  window.currentMove.position.add(window.currentMove.velocity, true);
  window.currentMove.velocity.assign(0, 0)
}
window.gameSpeed = function (fps) {
  clearInterval(gameID);
  if (fps != 0) { gameID = setInterval(window.gameStep, 1000 / fps) }
}
window.gameSpeed(60);
