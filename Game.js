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
  new Vector2(125, 125),
  new Vector2(250, 250),
  new Vector2(24, 24),
  1);
window.a = a;
a.grid.load('01 11 21 31 41 51 61 71 81 91 a1 b1 c1 d1 e1 f1 101 111 121 131 141 151 161 171 201 211 221 231 241 251 261 271 281 291 2a1 2b1 2c1 2d1 2e1 2f1 301 311 321 331 341 351 361 371 401 411 421 431 441 451 461 471 481 491 4a1 4b1 4c1 4d1 4e1 4f1 501 511 521 531 541 551 561 571 601 611 621 631 641 651 661 671 681 691 6a1 6b1 6c1 6d1 6e1 6f1 701 711 721 731 741 751 761 771 801 811 821 831 841 851 861 871 881 891 8a1 8b1 8c1 8d1 8e1 8f1 901 911 921 931 941 951 961 971 a01 a11 a21 a31 a41 a51 a61 a71 a81 a91 aa1 ab1 ac1 ad1 ae1 af1 b01 b11 b21 b31 b41 b51 b61 b71 c01 c11 c21 c31 c41 c51 c61 c71 c81 c91 ca1 cb1 cc1 cd1 ce1 cf1 d01 d11 d21 d31 d41 d51 d61 d71 e01 e11 e21 e31 e41 e51 e61 e71 e81 e90 ea0 eb0 ec0 ed0 ee0 ef1 f01 f11 f21 f31 f41 f51 f61 f71 1001 1011 1021 1031 1041 1051 1061 1071 1081 1091 10a0 10b0 10c0 10d0 10e1 10f1 1101 1111 1121 1131 1141 1151 1161 1171 1201 1211 1221 1231 1241 1251 1261 1270 1281 1291 12a1 12b1 12c1 12d1 12e1 12f1 1300 1311 1321 1331 1341 1351 1361 1371 1401 1411 1421 1431 1441 1451 1461 1470 1480 1491 14a1 14b1 14c1 14d1 14e1 14f0 1500 1511 1521 1531 1541 1551 1561 1571 1601 1611 1621 1631 1641 1651 1661 1670 1680 1691 16a1 16b1 16c1 16d1 16e1 16f0 1700 1711 1721 1731 1741 1751 1761 1771 1801 1811 1821 1831 1841 1851 1861 1870 1880 1891 18a1 18b1 18c1 18d1 18e1 18f0 1900 1911 1921 1931 1941 1951 1961 1971 1a01 1a11 1a21 1a31 1a41 1a51 1a61 1a70 1a80 1a91 1aa1 1ab1 1ac1 1ad1 1ae1 1af0 1b00 1b11 1b21 1b31 1b41 1b51 1b61 1b71 1c01 1c11 1c21 1c31 1c41 1c51 1c61 1c70 1c81 1c91 1ca1 1cb1 1cc1 1cd1 1ce1 1cf1 1d00 1d11 1d21 1d31 1d41 1d51 1d61 1d71 1e01 1e11 1e21 1e31 1e41 1e51 1e61 1e71 1e81 1e91 1ea0 1eb0 1ec0 1ed0 1ee1 1ef1 1f01 1f11 1f21 1f31 1f41 1f51 1f61 1f71 2001 2011 2021 2031 2041 2051 2061 2071 2081 2090 20a0 20b0 20c0 20d0 20e0 20f1 2101 2111 2121 2131 2141 2151 2161 2171 2201 2211 2221 2231 2241 2251 2261 2271 2281 2291 22a1 22b1 22c1 22d1 22e1 22f1 2301 2311 2321 2331 2341 2351 2361 2371 2401 2411 2421 2431 2441 2451 2461 2471 2481 2491 24a1 24b1 24c1 24d1 24e1 24f1 2501 2511 2521 2531 2541 2551 2561 2571 2601 2611 2621 2631 2641 2651 2661 2671 2681 2691 26a1 26b1 26c1 26d1 26e1 26f1 2701 2711 2721 2731 2741 2751 2761 2771 2801 2811 2821 2831 2841 2851 2861 2871 2881 2891 28a1 28b1 28c1 28d1 28e1 28f1 2901 2911 2921 2931 2941 2951 2961 2971 2a01 2a11 2a21 2a31 2a41 2a51 2a61 2a71 2a81 2a91 2aa1 2ab1 2ac1 2ad1 2ae1 2af1 2b01 2b11 2b21 2b31 2b41 2b51 2b61 2b71 2c01 2c11 2c21 2c31 2c41 2c51 2c61 2c71 2c81 2c91 2ca1 2cb1 2cc1 2cd1 2ce1 2cf1 2d01 2d11 2d21 2d31 2d41 2d51 2d61 2d71 2e01 2e11 2e21 2e31 2e41 2e51 2e61 2e71 2e81 2e91 2ea1 2eb1 2ec1 2ed1 2ee1 2ef1 2f01 2f11 2f21 2f31 2f41 2f51 2f61 2f71 ')
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
  Physics.physFunction(p.position, p.velocity, a)

  window.currentMove.position.add(window.currentMove.velocity, true);
  window.currentMove.velocity.assign(0, 0)
}
window.gameSpeed = function (fps) {
  clearInterval(gameID);
  if (fps != 0) { gameID = setInterval(window.gameStep, 1000 / fps) }
}
window.gameSpeed(60);
