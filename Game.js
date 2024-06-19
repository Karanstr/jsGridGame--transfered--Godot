//import { Region, blockMap } from './modules/Region.js';
import Render from './modules/Render.js';
import Vector2 from './modules/Vector2.js';
import WorldObject from './modules/WorldObject.js';
const canvas = document.getElementById("canvas");
let canData = canvas.getBoundingClientRect();
window.canData = canData
window.Render = Render;
window.Vector2 = Vector2;
window.WorldObject = WorldObject;
const a = new WorldObject(125, 125, 250, 250, 8, 8)
window.a = a;
const p = new WorldObject(5, 5, 20, 20, 1, 1);
window.p = p;

var renderList = [p, a]
window.currentMove = p;
window.currentEdit = a;
let currentEdit = window.currentEdit;
let currentMove = window.currentMove;

onmousedown = (mouse) => {
  if (mouse.pageY > canData.top &&
    mouse.pageY < canData.bottom &&
    mouse.pageX > canData.left &&
    mouse.pageX < canData.right) {
    let key = Math.max(...currentEdit.pointToKey(new Vector2(mouse.offsetX, mouse.offsetY)));
    let color = Number(document.getElementById('colorField').value);
    currentEdit.grid.modify(key, color);
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
      currentMove.position.add(frameMove.multiplyScalar(window.speed), true);
    }
  }
  keyRemove.forEach((key) => { keyMove.delete(key) })
  keyRemove.clear();

  //Clear canvas then redraw
  Render.drawBox(new Vector2(0, 0), new Vector2(500, 500), 'white')
  renderList.forEach((object) => { object.Render() })

}
window.gameSpeed = function (fps) {
  clearInterval(gameID);
  if (fps != 0) { gameID = setInterval(window.gameStep, 1000 / fps) }
}
window.gameSpeed(60);