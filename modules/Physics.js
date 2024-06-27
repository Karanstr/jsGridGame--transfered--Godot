"use strict";

import Vector2 from "./Vector2.js"
import Render from "./Render.js"


const Physics = {

  velocityToOffset(velocity) {
    return velocity.sign().divideScalar(2).applyEach(Math.ceil);
  },

  physFunction(point, velocity, object) {
    let key = object.pointToKey(point)[0];
    if (key == undefined) {
      return false
    }
    let boxData = object.grid.shapes[object.grid.read(key)][object.grid.keyInShape[key]];
    if (key != undefined) {
      let shift = this.velocityToOffset(velocity)
      let gridPoint = new Vector2(boxData[shift.x].x + shift.x, boxData[shift.y].y + shift.y)
      let targetPoint = gridPoint.multiply(object.blockLength);
      let hitPoint = this.pointPassCheck(point, velocity, targetPoint);
      if (hitPoint != false) {
        Render.drawLine(point, hitPoint[0], 'green');
        Render.drawLine(point, targetPoint, 'black')
        Render.drawPoint(hitPoint[0], 'yellow')
      }
    }
  },

  pointPassCheck(point, velocity, targetPoint) {
    let offset = targetPoint.subtract(point);
    //If we have enough velocity to reach targetPoint
    //if (offset.abs().subtract(velocity.abs()).applyAll(Math.min) <= 0) {
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
    return [hitPoint, direction];
    // }
    return false //Point doesn't pass targetPoint
  },

}

export default Physics