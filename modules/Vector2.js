
export { Vector2 as default }

//Position(Absolute) Vectors are type 0;
//Displacement(Relative) Vectors are type 1;
//Scaling Vectors are type 2
//Boolean Vectors are type 3

class Vector2 {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  assign(x, y, type) {
    if (x != null) { this.x = x }
    if (y != null) { this.y = y }
    if (type != null) { this.type = type }
  }

  add(vector, mutate) {
    let newVect = new Vector2(this.x + vector.x, this.y + vector.y, this.type)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  subtract(vector, mutate) {
    let newVect = new Vector2(this.x - vector.x, this.y - vector.y, this.type)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  multiply(vector, mutate) {
    let newVect = new Vector2(this.x * vector.x, this.y * vector.y, this.type)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  multiplyScalar(scalar, mutate) {
    let newVect = new Vector2(this.x * scalar, this.y * scalar, this.type)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  divide(vector, mutate) {
    let newVect = new Vector2(this.x / vector.x, this.y / vector.y, this.type)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  divideScalar(scalar, mutate) {
    let newVect = new Vector2(this.x / scalar, this.y / scalar, this.type)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  raise(degree, mutate) {
    let newVect = new Vector2(this.x ** degree, this.y ** degree, this.type)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }
  raise(degree, mutate) {
    let newVect = new Vector2(this.x**degree, this.y**degree, this.type)
    if (mutate) {this.assign(newVect.x, newVect.y)} else {return newVect}
  }
  invert(mutate) {
    if (mutate) { this.multiplyScalar(-1, true) } else { return this.multiplyScalar(-1) }
  }
  abs(mutate) {
    let newVect = new Vector2(Math.abs(this.x), Math.abs(this.y), this.type)
    if (mutate) { this.assign(newVect.x, newVect.y) } else { return newVect }
  }

  length() { return Math.sqrt(this.x ** 2 + this.y ** 2) }
  slope() { return this.y / this.x }
  clone() { return new Vector2(this.x, this.y, this.type) }
  sign() {
    let xSign, ySign;
    if (this.x != 0) { xSign = this.x / Math.abs(this.x) } else { xSign = 0 }
    if (this.y != 0) { ySign = this.y / Math.abs(this.y) } else { ySign = 0 }
    return new Vector2(xSign, ySign, 2)
  }
  rotate(angle) {
    throw "Does not exist"
  }

}
