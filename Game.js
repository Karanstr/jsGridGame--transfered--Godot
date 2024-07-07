"use strict";

import Render from './modules/Render.js';
window.Render = Render;
import Vector2 from './modules/Vector2.js';
window.Vector2 = Vector2;
import WorldObject from './modules/WorldObject.js';
window.WorldObject = WorldObject;
import Physics from './modules/Physics.js'
window.Physics = Physics
import BlockMap from './modules/WBlockMap.js';
window.BlockMap = BlockMap;

const canvas = document.getElementById("canvas");
let canData = canvas.getBoundingClientRect();
window.canData = canData

const WorldBlockMap = new BlockMap();
window.WorldBlockMap = WorldBlockMap;
WorldBlockMap.addBlock('blue', 0, 'Air');
WorldBlockMap.addBlock('red', 1, 'Ground');

const a = new WorldObject(
  new Vector2(125, 125),
  new Vector2(250, 250),
  new Vector2(24, 24),
  WorldBlockMap);
window.a = a;
a.grid.load('00 10 20 30 40 50 60 70 80 90 a0 b0 c0 d0 e0 f0 100 110 120 130 140 150 160 170 200 210 220 230 240 250 260 270 280 290 2a0 2b0 2c0 2d0 2e0 2f0 300 310 320 330 340 350 360 370 400 410 420 430 440 450 460 470 480 490 4a0 4b0 4c0 4d0 4e0 4f0 500 510 520 530 540 550 560 570 600 610 620 630 640 650 660 670 680 690 6a0 6b0 6c0 6d0 6e0 6f0 700 710 720 730 740 750 760 770 800 810 820 830 840 850 860 870 880 890 8a0 8b0 8c0 8d0 8e0 8f0 900 910 920 930 940 950 960 970 a00 a10 a20 a30 a40 a50 a60 a70 a80 a90 aa0 ab0 ac0 ad0 ae0 af0 b00 b10 b20 b30 b40 b50 b60 b70 c00 c10 c20 c30 c40 c50 c60 c70 c80 c90 ca0 cb0 cc0 cd0 ce0 cf0 d00 d10 d20 d30 d40 d50 d60 d70 e00 e10 e20 e30 e40 e50 e60 e70 e80 e91 ea1 eb1 ec1 ed1 ee1 ef0 f00 f10 f20 f30 f40 f50 f60 f70 1000 1010 1020 1030 1040 1050 1060 1070 1080 1090 10a1 10b1 10c1 10d1 10e0 10f0 1100 1110 1120 1130 1140 1150 1160 1170 1200 1210 1220 1230 1240 1250 1260 1271 1280 1290 12a0 12b0 12c0 12d0 12e0 12f0 1301 1310 1320 1330 1340 1350 1360 1370 1400 1410 1420 1430 1440 1450 1460 1471 1481 1490 14a0 14b0 14c0 14d0 14e0 14f1 1501 1510 1520 1530 1540 1550 1560 1570 1600 1610 1620 1630 1640 1650 1660 1671 1681 1690 16a0 16b0 16c0 16d0 16e0 16f1 1701 1710 1720 1730 1740 1750 1760 1770 1800 1810 1820 1830 1840 1850 1860 1871 1881 1890 18a0 18b0 18c0 18d0 18e0 18f1 1901 1910 1920 1930 1940 1950 1960 1970 1a00 1a10 1a20 1a30 1a40 1a50 1a60 1a71 1a81 1a90 1aa0 1ab0 1ac0 1ad0 1ae0 1af1 1b01 1b10 1b20 1b30 1b40 1b50 1b60 1b70 1c00 1c10 1c20 1c30 1c40 1c50 1c60 1c71 1c80 1c90 1ca0 1cb0 1cc0 1cd0 1ce0 1cf0 1d01 1d10 1d20 1d30 1d40 1d50 1d60 1d70 1e00 1e10 1e20 1e30 1e40 1e50 1e60 1e70 1e80 1e90 1ea1 1eb1 1ec1 1ed1 1ee0 1ef0 1f00 1f10 1f20 1f30 1f40 1f50 1f60 1f70 2000 2010 2020 2030 2040 2050 2060 2070 2080 2091 20a1 20b1 20c1 20d1 20e1 20f0 2100 2110 2120 2130 2140 2150 2160 2170 2200 2210 2220 2230 2240 2250 2260 2270 2280 2290 22a0 22b0 22c0 22d0 22e0 22f0 2300 2310 2320 2330 2340 2350 2360 2370 2400 2410 2420 2430 2440 2450 2460 2470 2480 2490 24a0 24b0 24c0 24d0 24e0 24f0 2500 2510 2520 2530 2540 2550 2560 2570 2600 2610 2620 2630 2640 2650 2660 2670 2680 2690 26a0 26b0 26c0 26d0 26e0 26f0 2700 2710 2720 2730 2740 2750 2760 2770 2800 2810 2820 2830 2840 2850 2860 2870 2880 2890 28a0 28b0 28c0 28d0 28e0 28f0 2900 2910 2920 2930 2940 2950 2960 2970 2a00 2a10 2a20 2a30 2a40 2a50 2a60 2a70 2a80 2a90 2aa0 2ab0 2ac0 2ad0 2ae0 2af0 2b00 2b10 2b20 2b30 2b40 2b50 2b60 2b70 2c00 2c10 2c20 2c30 2c40 2c50 2c60 2c70 2c80 2c90 2ca0 2cb0 2cc0 2cd0 2ce0 2cf0 2d00 2d10 2d20 2d30 2d40 2d50 2d60 2d70 2e00 2e10 2e20 2e30 2e40 2e50 2e60 2e70 2e80 2e90 2ea0 2eb0 2ec0 2ed0 2ee0 2ef0 2f00 2f10 2f20 2f30 2f40 2f50 2f60 2f70 ')
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
    if (color >= 1) { color = 1 }
    else { color = 0 }
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
  Physics.findHitPoints(p.position, p.velocity, a)

  window.currentMove.position.add(window.currentMove.velocity, true);
  window.currentMove.velocity.assign(0, 0)
}
window.gameSpeed = function (fps) {
  clearInterval(gameID);
  if (fps != 0) { gameID = setInterval(window.gameStep, 1000 / fps) }
}
window.gameSpeed(60);