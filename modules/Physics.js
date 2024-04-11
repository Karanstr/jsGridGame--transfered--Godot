
import Vector2 from "./Vector2.js";
export { PhysicsObject as default }


class PhysicsObject {
  constructor(position) {
    this.position = position;
    this.velocity = new Vector2(0,0,1)
    this.acceleration = new Vector2(0,0,1)
  }

  applyForce(acceleration) {
    
  }
  
}