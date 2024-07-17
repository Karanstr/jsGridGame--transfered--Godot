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
a.grid.load('00 10 20 30 40 50 60 70 80 90 a0 b0 c0 d0 e0 f0 100 110 120 130 140 150 160 170 180 190 1a0 1b0 1c0 1d0 1e0 1f0 200 210 220 230 240 250 260 270 280 290 2a0 2b0 2c0 2d0 2e0 2f0 300 310 320 330 340 350 360 370 380 390 3a0 3b0 3c0 3d0 3e0 3f0 400 410 420 430 440 450 460 470 480 490 4a0 4b0 4c0 4d0 4e0 4f0 500 510 520 530 540 550 560 570 580 590 5a0 5b0 5c0 5d0 5e0 5f0 600 610 620 630 640 650 660 670 680 690 6a0 6b0 6c0 6d0 6e0 6f0 700 710 720 730 740 750 760 770 780 790 7a0 7b0 7c0 7d0 7e0 7f0 800 810 820 830 840 850 860 870 880 890 8a0 8b0 8c0 8d0 8e0 8f0 900 910 920 930 940 950 960 970 980 990 9a0 9b0 9c0 9d0 9e0 9f0 a00 a10 a20 a30 a40 a50 a60 a70 a80 a90 aa0 ab0 ac0 ad0 ae0 af0 b00 b10 b20 b30 b40 b50 b60 b70 b80 b90 ba0 bb0 bc0 bd0 be0 bf0 c00 c10 c20 c30 c40 c50 c60 c70 c80 c90 ca1 cb1 cc1 cd1 ce0 cf0 d00 d10 d20 d30 d40 d50 d60 d70 d80 d90 da0 db0 dc0 dd0 de0 df0 e00 e10 e20 e30 e40 e50 e60 e70 e80 e90 ea0 eb0 ec0 ed0 ee0 ef0 f00 f10 f20 f30 f40 f50 f60 f70 f81 f90 fa0 fb0 fc0 fd0 fe0 ff1 1000 1010 1020 1030 1040 1050 1060 1070 1080 1090 10a0 10b0 10c0 10d0 10e0 10f0 1101 1110 1120 1131 1141 1150 1160 1171 1180 1190 11a0 11b0 11c0 11d0 11e0 11f0 1200 1210 1220 1230 1240 1250 1260 1270 1281 1290 12a0 12b1 12c1 12d0 12e0 12f1 1300 1310 1320 1330 1340 1350 1360 1370 1380 1390 13a0 13b0 13c0 13d0 13e0 13f0 1401 1410 1420 1430 1440 1450 1460 1471 1480 1490 14a0 14b0 14c0 14d0 14e0 14f0 1500 1510 1520 1530 1540 1550 1560 1570 1580 1590 15a0 15b0 15c0 15d0 15e0 15f0 1600 1610 1620 1630 1640 1650 1660 1670 1680 1690 16a0 16b0 16c0 16d0 16e0 16f0 1700 1710 1721 1731 1741 1751 1760 1770 1780 1790 17a0 17b0 17c0 17d0 17e0 17f0 1800 1810 1820 1830 1840 1850 1860 1870 1880 1890 18a0 18b0 18c0 18d0 18e0 18f0 1900 1910 1920 1930 1940 1950 1960 1970 1980 1990 19a0 19b0 19c0 19d0 19e0 19f0 1a00 1a10 1a20 1a30 1a40 1a50 1a60 1a70 1a80 1a90 1aa0 1ab0 1ac0 1ad0 1ae0 1af0 1b00 1b10 1b20 1b30 1b40 1b50 1b60 1b70 1b80 1b90 1ba0 1bb0 1bc0 1bd0 1be0 1bf0 1c00 1c10 1c20 1c30 1c40 1c50 1c60 1c70 1c80 1c90 1ca0 1cb0 1cc0 1cd0 1ce0 1cf0 1d00 1d10 1d20 1d30 1d40 1d50 1d60 1d70 1d80 1d90 1da0 1db0 1dc0 1dd0 1de0 1df0 1e00 1e10 1e20 1e30 1e40 1e50 1e60 1e70 1e80 1e90 1ea0 1eb0 1ec0 1ed0 1ee0 1ef0 1f00 1f10 1f20 1f30 1f40 1f50 1f60 1f70 1f80 1f90 1fa0 1fb0 1fc0 1fd0 1fe0 1ff0 2000 2010 2020 2030 2040 2050 2060 2070 2080 2090 20a0 20b0 20c0 20d0 20e0 20f0 2100 2110 2120 2130 2140 2150 2160 2170 2180 2190 21a0 21b0 21c0 21d0 21e0 21f0 2200 2210 2220 2230 2240 2250 2260 2270 2280 2290 22a0 22b0 22c0 22d0 22e0 22f0 2300 2310 2320 2330 2340 2350 2360 2370 2380 2390 23a0 23b0 23c0 23d0 23e0 23f0 ')
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