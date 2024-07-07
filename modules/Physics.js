"use strict";

import Vector2 from "./Vector2.js"
import Render from "./Render.js"

class colData {
  constructor(point, hitWall, time) {
    this.point = point;
    this.hitWall = hitWall;
    this.time = time;
  }
}

class Ray {
  constructor(position, velocity) {
    this.position = position;
    this.velocity = velocity;
    this.velSign = velocity.sign();
    this.direction = velocity.normalize();
  }

}

const Physics = {

  getAngleTo(origin, point) {
    let delta = point.subtract(origin);
    let angle = delta.applyAll(Math.atan2) * 180 / Math.PI;
    if (angle < 0) { angle += 360 }
    return angle
  },

  //Ew, have to cast rays from all four ..
  findHitPoints(point, velocity, object) {
    if (velocity.length() == 0) { return false }
    let ray = new Ray(point, velocity);
    let keys = new Set([...object.pointToKey(ray.position)])
    let hitPoints = [];
    keys.forEach((key) => {
      let boundaryPoint = this.findBoundaryPoint(ray, key, object);
      if (boundaryPoint != undefined) {
        let data = this.timeToBoundary(ray, boundaryPoint);
        if (data != false) {
          hitPoints.push(data);
          Render.drawLine(point, boundaryPoint, 'green');
          Render.drawLine(point, data.point, 'green');
        }
      }
    })
    let currentTime = Infinity; let currentData = undefined;
    hitPoints.forEach((hit) => {
      if (hit.time < currentTime && hit.time >= 0) { currentTime = hit.time; currentData = hit }
    })
    if (currentData != undefined) { Render.drawPoint(currentData.point, 'yellow') }
    if (currentTime < 1) { console.log('hit'); console.log(currentTime) }

  },

  //I don't like that I'm passing key here
  findBoundaryPoint(ray, key, object) {
    let shift = ray.velSign.divideScalar(2).applyEach(Math.ceil);
    let boundaryPoint;
    //If within object
    if (key != undefined) {
      let boxData = object.grid.shapes[object.grid.read(key)][object.grid.keyInShape[key]];
      let gridPoint = new Vector2(boxData[shift.x].x + shift.x, boxData[shift.y].y + shift.y)
      boundaryPoint = gridPoint.multiply(object.blockLength).add(object.position);
    } //If outside object
    else {
      let inverseShift = shift.subtract(new Vector2(1, 1)).applyEach(Math.abs);
      let aCorner = object.position.add(object.gridLength.multiply(shift));
      let iCorner = object.position.add(object.gridLength.multiply(inverseShift));
      if (this.externalCheck(ray, aCorner, iCorner)) { boundaryPoint = iCorner }
    }
    return boundaryPoint
  },

  externalCheck(ray, aCorner, iCorner) {
    let bounds = [new Vector2(aCorner.x, iCorner.y), new Vector2(iCorner.x, aCorner.y)];
    let angles = [this.getAngleTo(ray.position, bounds[0]), this.getAngleTo(ray.position, bounds[1])]
    Render.drawLine(ray.position, bounds[0], 'black');
    Render.drawLine(ray.position, bounds[1], 'black');
    let angle1 = Math.max(...angles), angle2 = Math.min(...angles) - angle1;
    let dirAngle = this.getAngleTo(ray.position, ray.position.add(ray.direction)) - angle1;
    dirAngle = dirAngle >= 0 ? dirAngle : dirAngle + 360
    angle2 = angle2 >= 0 ? angle2 : angle2 + 360;
    if (angle1 - Math.min(...angles) < 180) {
      if (dirAngle >= angle2) { return true }
    }
    else if (dirAngle <= angle2) { return true }
  },

  timeToBoundary(ray, boundaryPoint) {
    let time = boundaryPoint.subtract(ray.position).divide(ray.velocity);
    let compareTime = time.clone()
    if (time.x < 0 && time.y < 0) { return false }
    if (time.x < 0) { compareTime.x = Infinity } if (time.y < 0) { compareTime.y = Infinity }
    let hitPoint, hitWall;
    if (compareTime.x < compareTime.y) { //Hitting wall to the left or right
      hitPoint = new Vector2(boundaryPoint.x, ray.position.y + ray.velocity.y * time.x);
      hitWall = new Vector2(ray.velSign.x, 0); time = time.x;
    }
    else if (compareTime.y < compareTime.x) { //Hitting wall above or below
      hitPoint = new Vector2(ray.position.x + ray.velocity.x * time.y, boundaryPoint.y);
      hitWall = new Vector2(0, ray.velSign.y); time = time.y;
    }
    else { hitPoint = boundaryPoint; hitWall = ray.velSign; time = time.x } //Hitting corner
    return new colData(hitPoint, hitWall, time)
  },

}

export default Physics