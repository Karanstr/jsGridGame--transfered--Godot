import { Region, blockMap } from './modules/Region.js';
import * as Render from './modules/Render.js';
import Vector from "./modules/Vector2.js";
const canvas = document.getElementById("canvas");
let canData = canvas.getBoundingClientRect();
window.Render = Render;
window.Vector = Vector;

window.a = new Region(125, 125, 160, 160, new blockMap('#ffffff'));
window.a.blockMap.addBlock(1, '#777777', 1);
window.a.Load('8401 8411 8421 8441 8451 8481 84a1 8501 8511 8541 8571 85d1 85f1 8601 8621 8661 8671 8681 86a1 86b1 86e1 86f1 8721 8731 8751 8761 8771 87a1 87b1')
window.a.findCorners()

window.p = new Region(150, 240, 20, 20, new blockMap('#ffffff'));
window.p.blockMap.addBlock(1, '#dd7777', 1);
window.p.Load('8011')
window.p.findCorners()

//Order rendering should be done in
let list = [window.a, window.p];

window.currentMove = window.p;
window.currentEdit = window.a;
currentEdit = window.currentEdit
currentMove = window.currentMove
let curMode = 0;

document.getElementById('tools').addEventListener("change", (event) => {
  curMode = Number(event.target.selectedOptions[0].getAttribute("value"))
})

onmousedown = (mouse) => {
  if (mouse.pageY > canData.top &&
    mouse.pageY < canData.bottom &&
    mouse.pageX > canData.left &&
    mouse.pageX < canData.right) {
    let mousePos = new Vector(mouse.offsetX, mouse.offsetY)
    mousePos.subtract(currentEdit.position, true)
    if (mousePos.x > 0 && mousePos.y > 0 &&
      mousePos.x < currentEdit.length.x &&
      mousePos.y < currentEdit.length.y) {
      let key = Math.max(...currentEdit.getKeys(mousePos.add(currentEdit.position)));
      let color = Number(document.getElementById('colorField').value);
      switch (curMode) {
        case 0:
          currentEdit.Replace(key, color, true);
          break;
        case 1:
          currentEdit.Split(key);
          break;
        case 2:
        let node = currentEdit.getNode(key);
        let info = key + ' ' + node.data + ' ' + currentEdit.blockMap.getBlock(node.data).color;
          document.getElementById('Data').innerHTML = info;
          break;
      }
      currentEdit.Render();
      currentEdit.findCorners();
    }
  }
}
let keyMove = new Set();
let keyRemove = new Set()
onkeydown = (event) => { keyMove.add(event.key) }
onkeyup = (event) => { keyRemove.add(event.key) }

window.speed = 1;
window.gravity = new Vector(0, 0, 1)
const game = setInterval(() => {
  let debugCheck = document.getElementById("debug").checked
  if (debugCheck == true) {a.debugToggle = 1} else {a.debugToggle = 0}
  Render.drawBox(new Vector(0, 0, 0), new Vector(canData.right, canData.bottom, 1), 'white')
  if (keyMove.has('w') && keyMove.has('s')) { }
  else if (keyMove.has('w')) { currentMove.velocity.add(new Vector(0, -window.speed), true) }
  else if (keyMove.has('s')) { currentMove.velocity.add(new Vector(0, window.speed), true) }
  if (keyMove.has('a') && keyMove.has('d')) { }
  else if (keyMove.has('a')) { currentMove.velocity.add(new Vector(-window.speed, 0), true) }
  else if (keyMove.has('d')) { currentMove.velocity.add(new Vector(window.speed, 0), true) }
  currentMove.velocity.add(window.gravity, true);
  keyRemove.forEach((key) => {keyMove.delete(key)})
  keyRemove.clear();
  
  list.forEach((object) => {
    object.Render();
    object.drawCorners();
  })
  p.checkAllCollisions(p.position, p.velocity, a);
  p.updatePos(p.velocity);
  p.velocity = new Vector(0, 0, 1)
  a.updatePos(a.velocity);
  a.velocity = new Vector(0, 0, 1)

}, 1000 / 1);
