//import { Region, blockMap } from './modules/Region.js';
import Render from './modules/Render.js';
import Vector from "./modules/Vector2.js";
const canvas = document.getElementById("canvas");
let canData = canvas.getBoundingClientRect();
window.Render = Render;
window.Vector = Vector;

window.a = new Region(80, 80, 320, 320, new blockMap());
window.a.blockMap.addBlock(0, '#ADD8E6', 0);
window.a.blockMap.addBlock(1, '#777777', 1);
window.a.Load('8010 8041 8420 8130 84f1 8141 8571 8071 81c0 8740 81f0 9081 8430 8460 8470 8490 84b0 93c0 8520 8530 8541 95c0 85d1 9791 85f1 8061 9c51 8721 8731 9d11 9d90 9db0 8790 9f21 9f31 9f61 87e1 87f1');
window.a.findCorners();

window.p = new Region(145, 185, 20, 20, new blockMap());
window.p.blockMap.addBlock(0, '#ffffff', 0);
window.p.blockMap.addBlock(1, '#dd7777', 1);
window.p.Load('8011');
window.p.findCorners();

//Order rendering should be done in
let list = [window.a, window.p];
window.currentMove = window.p;
window.currentEdit = window.a;
currentEdit = window.currentEdit;
currentMove = window.currentMove;
let curMode = 0;

window.assignDebug = function (boolean) {
  list.forEach((object) => { object.debug = boolean })
}

document.getElementById('tools').addEventListener("change", (event) => {
  curMode = Number(event.target.selectedOptions[0].getAttribute("value"))
})

onmousedown = (mouse) => {
  if (mouse.pageY > canData.top &&
    mouse.pageY < canData.bottom &&
    mouse.pageX > canData.left &&
    mouse.pageX < canData.right) {
    let mousePos = new Vector(mouse.offsetX, mouse.offsetY);
    mousePos.subtract(currentEdit.physics.position, true);
    if (mousePos.x > 0 && mousePos.y > 0 &&
      mousePos.x < currentEdit.length.x &&
      mousePos.y < currentEdit.length.y) {
      let key = Math.max(...currentEdit.getKeys(mousePos.add(currentEdit.physics.position)));
      let color = Number(document.getElementById('colorField').value);
      switch (curMode) {
        case 0:
          currentEdit.Replace(key, color, true);
          break
        case 1:
          currentEdit.Split(key);
          break
        case 2:
          let node = currentEdit.readNode(key);
          let info = key + ' ' + node.data + ' ' + currentEdit.blockMap.getBlock(node.data).color;
          document.getElementById('Data').innerHTML = info;
          break
      }
      currentEdit.Render();
      currentEdit.findCorners();
    }
  }
}

window.keyMove = new Set();
let keyMove = window.keyMove;
let keyRemove = new Set();
onkeydown = (event) => { keyMove.add(event.key) }
onkeyup = (event) => { keyRemove.add(event.key) }
window.speed = new Vector(.25, .5, 1);
window.gravity = new Vector(0, .3, 1);
var gameID;

window.gameStep = function () {
  let debugCheck = document.getElementById("debug").checked;
  if (debugCheck == 0) { window.assignDebug(false) } else { window.assignDebug(true) }
  Render.drawBox(new Vector(0, 0, 0), new Vector(canData.right, canData.bottom, 1), 'white');
  if (keyMove.length != 0) {
    if (keyMove.has('w')) { currentMove.physics.applyForce(new Vector(0, -window.speed.y)) }
    if (keyMove.has('a') && keyMove.has('d')) { }
    else if (keyMove.has('a')) { currentMove.physics.applyForce(new Vector(-window.speed.x, 0)) }
    else if (keyMove.has('d')) { currentMove.physics.applyForce(new Vector(window.speed.x, 0)) }
  }
  currentMove.physics.applyForce(window.gravity);
  keyRemove.forEach((key) => { keyMove.delete(key) })
  keyRemove.clear();
  list.forEach((object) => {
    object.Render();
    object.drawCorners();
  })
  p.physics.updateVelocity();
  p.moveWithCollisions(a);
}

window.gameSpeed = function (fps) {
  if (typeof fps != 'number') { throw " That's not a number" }
  clearInterval(gameID);
  if (fps != 0) { gameID = setInterval(window.gameStep, 1000 / fps) }
}
window.gameSpeed(60);