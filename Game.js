import { Region, blockMap } from './modules/Region.js';
import * as Render from './modules/Render.js';
import Vector from "./modules/Vector2.js";
const canvas = document.getElementById("canvas");
let canData = canvas.getBoundingClientRect();
window.Render = Render;
window.Vector = Vector;

window.a = new Region(80, 80, 320, 320, new blockMap());
window.a.blockMap.addBlock(0, '#ffffff', 0);
window.a.blockMap.addBlock(1, '#777777', 1);
window.a.Load('8401 8411 9081 8441 8451 8481 84a1 93d1 93e1 93f1 8501 8511 8541 95d1 95e1 95f1 85d1 9791 85f1 8601 8621 9911 9921 9931 9941 8661 8671 86e1 86f1 9c51 8721 8731 9d11 8751 9d81 9da1 8771 87a1 87b1 9f21 9f31 9f61 87e1 87f1');
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

let keyMove = new Set();
let keyRemove = new Set();
onkeydown = (event) => { keyMove.add(event.key) }
onkeyup = (event) => { keyRemove.add(event.key) }
window.speed = .25;
window.gravity = new Vector(0, .3, 1);

const game = setInterval(() => {
  let debugCheck = document.getElementById("debug").checked;
  if (debugCheck == 0) { window.assignDebug(false) } else { window.assignDebug(true) }
  Render.drawBox(new Vector(0, 0, 0), new Vector(canData.right, canData.bottom, 1), 'white');
  //if (keyMove.has('w') && keyMove.has('s')) { }
  if (keyMove.has('w')) { currentMove.physics.applyForce(new Vector(0, 2 * -window.speed)) }
  //else if (keyMove.has('s')) { currentMove.physics.applyForce(new Vector(0, window.speed)) }
  if (keyMove.has('a') && keyMove.has('d')) { }
  else if (keyMove.has('a')) { currentMove.physics.applyForce(new Vector(-window.speed, 0)) }
  else if (keyMove.has('d')) { currentMove.physics.applyForce(new Vector(window.speed, 0)) }
  currentMove.physics.applyForce(window.gravity);
  keyRemove.forEach((key) => { keyMove.delete(key) })
  keyRemove.clear();
  list.forEach((object) => {
    object.Render();
    object.drawCorners();
  })
  p.physics.updateVelocity();
  p.moveWithCollisions(a);
}, 1000 / 60);
