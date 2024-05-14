
import Vector2 from "./Vector2.js";
export { PhysicsObject as default }


class PhysicsObject {
  constructor(x, y, drag) {
    this.position = new Vector2(x, y, 0);
    this.rotation = 0;
    this.velocity = new Vector2(0, 0, 1)
    this.acceleration = new Vector2(0, 0, 1)
    this.decay = drag;
    this.mass;
  }

  applyForce(acceleration) {
    this.acceleration.add(acceleration, true);
  }

  updateVelocity() {
    this.velocity.add(this.acceleration, true);
    //Easy drag until I think of a better solution
    this.velocity.multiplyScalar(this.decay, true);
    //Bring axis to rest after it's moving by less than .001 (units?)
    if (Math.abs(this.velocity.x) < .001) { this.velocity.x = 0 }
    if (Math.abs(this.velocity.y) < .001) { this.velocity.y = 0 }
    //Acceleration has been applied, now it's set back to 0
    this.acceleration.assign(0, 0);
  }

  applyPartialVelocity(velocity) {
    //Assumes this is being used to step through collisions and as such
    //Expects velocity to end up at 0 (Probably a bad way to do it)
    //Velocity must be set back to original at some point or else
    //Sad things happen
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