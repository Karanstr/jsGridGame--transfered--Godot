"use strict";

class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  assign(x, y) {
    if (x != undefined) { this.x = x }
    if (y != undefined) { this.y = y }
  }
  add(vector, mutate) {
    let newVect = new Vector2(this.x + vector.x, this.y + vector.y)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  subtract(vector, mutate) {
    let newVect = new Vector2(this.x - vector.x, this.y - vector.y)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  multiply(vector, mutate) {
    let newVect = new Vector2(this.x * vector.x, this.y * vector.y)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  multiplyScalar(scalar, mutate) {
    let newVect = new Vector2(this.x * scalar, this.y * scalar)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  divide(vector, mutate) {
    let newVect = new Vector2(this.x / vector.x, this.y / vector.y)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  divideScalar(scalar, mutate) {
    let newVect = new Vector2(this.x / scalar, this.y / scalar)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  raise(degree, mutate) {
    let newVect = new Vector2(this.x ** degree, this.y ** degree)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  abs(mutate) {
    let newVect = new Vector2(Math.abs(this.x), Math.abs(this.y))
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  normalize(mutate) { //Should totally be called directionize. Would make so much more sense
    if (mutate) { this.divideScalar(Math.sqrt(this.x ** 2 + this.y ** 2), true) }
    else { return this.divideScalar(Math.sqrt(this.x ** 2 + this.y ** 2)) }
  }

  applyEach(mathFunction, mutate) {
    let newVect = new Vector2(mathFunction(this.x), mathFunction(this.y))
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  applyAll(mathFunction) { return mathFunction(this.x, this.y) }

  length() { return Math.sqrt(this.x ** 2 + this.y ** 2) }
  slope() { return this.y / this.x }
  clone() { return new Vector2(this.x, this.y) }
  sign() {
    let xSign, ySign;
    if (this.x != 0) { xSign = this.x / Math.abs(this.x) } else { xSign = 0 }
    if (this.y != 0) { ySign = this.y / Math.abs(this.y) } else { ySign = 0 }
    return new Vector2(xSign, ySign)
  }

}

export default Vector2