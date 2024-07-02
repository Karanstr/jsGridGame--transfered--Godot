"use strict";

import Vector2 from "./Vector2.js"
import Render from "./Render.js"


const Physics = {

  velocityToOffset(velocity) {
    return velocity.sign().divideScalar(2).applyEach(Math.ceil);
  },

  getAngle(origin, point) {
    let delta = point.subtract(origin);
    let angle = delta.applyAll(Math.atan2) * 180 / Math.PI;
    if (angle < 0) { angle += 360 }
    return angle
  },

  physFunction(point, velocity, object) {
    if (velocity.length() == 0) { return }
    let key = object.pointToKey(point)[0];
    let direction = velocity.normalize();
    let shift = this.velocityToOffset(direction);
    let checkPoint;
    //If within object
    if (key != undefined) {
      let boxData = object.grid.shapes[object.grid.read(key)][object.grid.keyInShape[key]];
      let gridPoint = new Vector2(boxData[shift.x].x + shift.x, boxData[shift.y].y + shift.y)
      checkPoint = gridPoint.multiply(object.blockLength).add(object.position);
    } //If outside object
    else {
      let inverseShift = shift.subtract(new Vector2(1, 1)).applyEach(Math.abs);
      let targetPoint = object.position.add(object.gridLength.multiply(shift));
      let inversePoint = object.position.add(object.gridLength.multiply(inverseShift));
      let bounds = [
        new Vector2(targetPoint.x, inversePoint.y),
        new Vector2(inversePoint.x, targetPoint.y)
      ]
      if (this.externalCheck(point, direction, bounds)) { checkPoint = inversePoint }
      Render.drawLine(point, bounds[0], 'black');
      Render.drawLine(point, bounds[1], 'black');
    }
    if (checkPoint != undefined) {
      let hitPoint = this.pointPassCheck(point, velocity, checkPoint);
      if (hitPoint != false) {
        Render.drawLine(point, checkPoint, 'black');
        Render.drawLine(point, hitPoint[0], 'green');
        Render.drawPoint(hitPoint[0], 'yellow');
      }
      if (hitPoint[2]) { console.log(hitPoint[2]) }
    }
  },

  externalCheck(origin, direction, bounds) {
    let angles = [
      this.getAngle(origin, bounds[0]),
      this.getAngle(origin, bounds[1])
    ]
    let angle1 = Math.max(...angles), angle2 = Math.min(...angles) - angle1;
    let dirAngle = this.getAngle(origin, origin.add(direction)) - angle1;
    dirAngle = dirAngle >= 0 ? dirAngle : dirAngle + 360
    angle2 = angle2 >= 0 ? angle2 : angle2 + 360;
    if (angle1 - Math.min(...angles) < 180) {
      if (dirAngle >= angle2) { return true }
    }
    else if (dirAngle <= angle2) { return true }
  },

  pointPassCheck(point, velocity, targetPoint) {
    let didItPass = false;
    let offset = targetPoint.subtract(point), offsetSign = offset.sign();
    let slopeToTarget = Math.abs(offset.slope());
    let velSlope = velocity.slope(), velSign = velocity.sign(), absVel = velocity.abs();
    let hitPoint, direction = new Vector2(0, 0);
    if (slopeToTarget > Math.abs(velSlope) && offsetSign.x == velSign.x) { //Hitting wall to the left or right
      hitPoint = new Vector2(targetPoint.x, point.y + offset.x * velSlope);
      direction.assign(velSign.x, 0);
    }
    else if (slopeToTarget < Math.abs(velSlope) && offsetSign.y != velSign.y) {
      hitPoint = new Vector2(targetPoint.x, point.y + offset.x * velSlope);
      direction.assign(velSign.x, 0);
    }
    else if (slopeToTarget < Math.abs(velSlope) && offsetSign.y == velSign.y) { //Hitting wall to the up or down
      hitPoint = new Vector2(point.x + offset.y / velSlope, targetPoint.y);
      direction.assign(0, velSign.y);
    }
    else if (slopeToTarget > Math.abs(velSlope) && offsetSign.x != velSign.x) {
      hitPoint = new Vector2(point.x + offset.y / velSlope, targetPoint.y);
      direction.assign(0, velSign.y);
    }//Else hitting corner
    else { hitPoint = new Vector2(targetPoint.x, targetPoint.y); direction = velSign }
    //If we will cross over targetPoint
    if (((Math.abs(offset.x) <= absVel.x) && offsetSign.x == velSign.x && velocity.x != 0)
      || ((Math.abs(offset.y) <= absVel.y) && offsetSign.y == velSign.y && velocity.y != 0)) {
      didItPass = true
    }
    return [hitPoint, direction, didItPass];
  },

}

export default Physics