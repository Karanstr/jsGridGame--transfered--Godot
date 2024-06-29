"use strict";

import Vector2 from "./Vector2.js"
import Render from "./Render.js"


const Physics = {

  velocityToOffset(velocity) {
    return velocity.sign().divideScalar(2).applyEach(Math.ceil);
  },

  physFunction(point, velocity, object) {
    if (velocity.length() == 0) { return }
    let key = object.pointToKey(point)[0];
    let shift = this.velocityToOffset(velocity);
    //If within object
    if (key != undefined) {
      let boxData = object.grid.shapes[object.grid.read(key)][object.grid.keyInShape[key]];
      let gridPoint = new Vector2(boxData[shift.x].x + shift.x, boxData[shift.y].y + shift.y)
      let targetPoint = gridPoint.multiply(object.blockLength).add(object.position);
      let hitPoint = this.pointPassCheck(point, velocity, targetPoint);
      if (hitPoint != false && velocity.length() != 0) {
        Render.drawLine(point, targetPoint, 'black');
        Render.drawLine(point, hitPoint[0], 'green');
        Render.drawPoint(hitPoint[0], 'yellow');
      }
      if (hitPoint[2]) { console.log(hitPoint[2]) }
    } //If outside object
    else {
      let inverseShift = shift.clone().subtract(new Vector2(1, 1)).applyEach(Math.abs);
      let targetPoint = object.position.add(object.gridLength.multiply(shift));
      let inversePoint = object.position.add(object.gridLength.multiply(inverseShift));
      let first = new Vector2(targetPoint.x, inversePoint.y);
      let second = new Vector2(inversePoint.x, targetPoint.y);
      let firstHit = this.pointPassCheck(point, velocity, first);
      let secondHit = this.pointPassCheck(point, velocity, second);
      Render.drawLine(point, firstHit[0], 'black');
      Render.drawLine(point, secondHit[0], 'black');
      Render.drawPoint(firstHit[0], 'yellow');
      Render.drawPoint(secondHit[0], 'yellow');
      if (firstHit[2] || secondHit[2]) { console.log(firstHit[2] || secondHit[2]) }
    }
  },

  pointPassCheck(point, velocity, targetPoint) {
    let didItPass = false
    let offset = targetPoint.subtract(point);
    let slopeToTarget = Math.abs(offset.slope());
    let velocitySlope = velocity.slope();
    let hitPoint = new Vector2(), direction = new Vector2(0, 0);
    if (slopeToTarget > Math.abs(velocitySlope)) { //Hitting wall to the left or right
      hitPoint.assign(targetPoint.x, point.y + offset.x * velocitySlope);
      direction.x = velocity.sign().x;
    }
    else if (slopeToTarget < Math.abs(velocitySlope)) { //Hitting wall to the up or down
      hitPoint.assign(point.x + offset.y / velocitySlope, targetPoint.y);
      direction.y = velocity.sign().y;
    } //Else hitting corner
    else { hitPoint.assign(targetPoint.x, targetPoint.y); direction.add(velocity.sign) }


    //If we will cross over targetPoint
    let distance = hitPoint.subtract(point); let absVel = velocity.abs();
    let distanceSign = distance.sign(); let velSign = velocity.sign();
    if (((Math.abs(distance.x) <= absVel.x) && distanceSign.x == velSign.x && velocity.x != 0)
      || ((Math.abs(distance.y) <= absVel.y) && distanceSign.y == velSign.y && velocity.y != 0)) { didItPass = true }
    return [hitPoint, direction, didItPass];
  },

}

export default Physics