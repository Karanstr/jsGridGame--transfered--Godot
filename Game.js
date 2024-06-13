//import { Region, blockMap } from './modules/Region.js';
import Render from './modules/Render.js';
import Vector from "./modules/Vector2.js";
import WorldObject from './modules/WorldObject.js';
const canvas = document.getElementById("canvas");
let canData = canvas.getBoundingClientRect();
window.canData = canData
window.Render = Render;
window.Vector = Vector;
window.WorldObject = WorldObject;

const a = new WorldObject(0, 0, 500, 500)
window.a = a;
//Order rendering should be done in
let list = [window.a, window.p];
window.currentMove = window.p;
window.currentEdit = window.a;
currentEdit = window.currentEdit;
currentMove = window.currentMove;
let curMode = 0;

document.getElementById('tools').addEventListener("change", (event) => {
  curMode = Number(event.target.selectedOptions[0].getAttribute("value"))
})

window.keyMove = new Set();
let keyMove = window.keyMove;
let keyRemove = new Set();
onkeydown = (event) => { keyMove.add(event.key) }
onkeyup = (event) => { keyRemove.add(event.key) }
var gameID;

window.gameStep = function () {
  if (keyMove.length != 0) {
    if (keyMove.has('w')) { }
    if (keyMove.has('a') && keyMove.has('d')) { }
    else if (keyMove.has('a')) { }
    else if (keyMove.has('d')) { }
  }
  keyRemove.forEach((key) => { keyMove.delete(key) })
  keyRemove.clear();
  a.Render();

}

window.gameSpeed = function (fps) {
  clearInterval(gameID);
  if (fps != 0) { gameID = setInterval(window.gameStep, 1000 / fps) }
}
window.gameSpeed(60);