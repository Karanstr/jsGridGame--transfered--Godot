
import Vector2 from "./Vector2.js";
export { PhysicsObject as default }


class PhysicsObject {
  constructor(x, y, drag) {
    this.position = new Vector2(x, y, 0);
    this.rotation = 0;
    this.velocity = new Vector2(0, 0, 1)
    this.acceleration = new Vector2(0, 0, 1)
    this.dragMultiplier = drag;

  }

  applyForce(acceleration) {
    this.acceleration.add(acceleration, true);
  }

  updateVelocity() {
    this.velocity.add(this.acceleration, true);
    this.velocity.multiplyScalar(this.dragMultiplier, true);
    if (Math.abs(this.velocity.x) < .001) { this.velocity.x = 0 }
    if (Math.abs(this.velocity.y) < .001) { this.velocity.y = 0 }
    this.acceleration.assign(0, 0);
  }

  applyPartialVelocity(velocity) {
    this.position.add(velocity, true);
    this.velocity.subtract(velocity, true);
  }

  applyMovement(velocity) {
    this.position.add(velocity, true);
  }

  updatePosition() {
    this.position.add(this.velocity, true);
  }

}