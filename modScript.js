import { Region, blockMap } from './modules/Region.js';
import * as Render from './modules/Render.js';
import Vector from "./modules/Vector2.js";
const canvas = document.getElementById("canvas");
let canData = canvas.getBoundingClientRect();
window.Render = Render;
window.Vector = Vector;

window.a = new Region(125, 125, 250, 250, new blockMap('#ffffff'));
window.a.blockMap.addBlock(1, '#777777', 1);
window.a.Load('8401 8411 8421 8441 8451 8481 84a1 8501 8511 8541 8571 85d1 85f1 8601 8621 8661 8671 8681 86a1 86b1 86e1 86f1 8721 8731 8751 8761 8771 87a1 87b1')
window.a.findCorners()

window.p = new Region(250, 175, 20, 20, new blockMap('#ffffff'));
window.p.blockMap.addBlock(1, '#dd7777', 1);
window.p.Load('8011')
window.p.findCorners()


let list = [window.a, window.p];

window.current = window.p;
current = window.current
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
    mousePos.subtract(current.position, true)
    if (mousePos.x > 0 && mousePos.y > 0 &&
      mousePos.x < current.length.x &&
      mousePos.y < current.length.y) {
      let key = Math.max(...current.getKeys(mousePos.add(current.position)));
      let color = Number(document.getElementById('colorField').value);
      switch (curMode) {
        case 0:
          current.Replace(key, color, true);
          break;
        case 1:
          current.Split(key);
          break;
        case 2:
          let node = current.getNode(key);
          let info = key + ' ' + node.data + ' ' + current.blockMap.getBlock(node.data).color;
          document.getElementById('Data').innerHTML = info;
          break;
      }
      current.Render();
      current.findCorners();
    }
  }
}

let up, down, left, right;
onkeydown = (event) => {
  switch (event.key) {
    case 'a' || 'ArrowLeft':
      left = true; break
    case 'd' || 'ArrowRight':
      right = true; break
    case 'w' || 'ArrowUp':
      up = true; break
    case 's' || 'ArrowDown':
      down = true; break
  }
}
onkeyup = (event) => {
  switch (event.key) {
    case 'a' || 'ArrowLeft':
      left = false; break
    case 'd' || 'ArrowRight':
      right = false; break
    case 'w' || 'ArrowUp':
      up = false; break
    case 's' || 'ArrowDown':
      down = false; break
  }
}

window.speed = 1;
window.gravity = new Vector(0, 0, 1)
const game = setInterval(() => {
  Render.drawBox(new Vector(0, 0, 0), new Vector(canData.right, canData.bottom, 1), 'white')
  if (up && down) { }
  else if (up) { current.velocity.add(new Vector(0, -window.speed), true) }
  else if (down) { current.velocity.add(new Vector(0, window.speed), true) }
  if (left && right) { }
  else if (left) { current.velocity.add(new Vector(-window.speed, 0), true) }
  else if (right) { current.velocity.add(new Vector(window.speed, 0), true) }
  current.velocity.add(window.gravity, true);

  list.forEach((object) => {
    object.Render();
    object.drawCorners();
  })
  p.checkAllCollisions(p.position, p.velocity, a);
  p.updatePos(p.velocity);
  p.velocity = new Vector(0, 0, 1)
  a.updatePos(a.velocity);
  a.velocity = new Vector(0, 0, 1)

}, 1000 / 60);
