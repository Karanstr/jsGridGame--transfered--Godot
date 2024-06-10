
import Vector2 from "../modules/Vector2.js";
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

  applyMovement(velocity) {
    this.position.add(velocity, true);
  }
  // Math here: https://www.desmos.com/calculator/gq6lxj78mm
  // Derived from equations found https://physicscourses.colorado.edu/phys2210/phys2210_fa20/lecture/lec08-linear-drag/ 
  calcMovementWithDrag(velocity, dragFactor, time) {
    return velocity.divideScalar(dragFactor).multiplyScalar(1 - 1 / (Math.E ** (dragFactor * time)))
  }

  calcTimeToGetTo1DDistance(velocity1D, dragFactor, distance1D) {
    return Math.log(1 / (1 - distance1D * dragFactor / velocity1D)) / dragFactor;
  }

  getDraggedVelocity(dragFactor, velocity, time) {
    return velocity.divideScalar(Math.E ** (time * dragFactor))
  }

}