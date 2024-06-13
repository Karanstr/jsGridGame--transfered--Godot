import Grid from "./Grid.js"
import Vector2 from "./Vector2.js"
import Render from "./Render.js"

class WorldObject {
  constructor(x, y, width, height) {
    this.grid = new Grid(8, 8, 0);
    this.position = new Vector2(x, y);
    this.length = new Vector2(width, height);
    this.velocity = new Vector2(0, 0);
  }

  Render() {
    //Really stupid, running genKeys just to convert them back to (x, y)
    //Either make genKeys smarter or replace with a 2d loop
    let keys = this.grid.genKeys(0, 0, this.grid.dimensions.x, this.grid.dimensions.y);
    keys.forEach((key) => {
      let point = this.grid.dehash(key);
      let color;
      switch (this.grid.read(key)) {
        case 0: color = 'red'; break
        case 1: color = 'blue'; break
      }
      let boxSize = this.length.divide(this.grid.dimensions)
      Render.drawBox(this.position.add(point.multiply(boxSize)), boxSize, color);
    })
  }

  pointToKey(x, y, velocity) {
    //Use getHole or whatever it's called in the old system
    //If velocity == 0/undefined return all four
    //Otherwise decide which key to use.
  }

}

export default WorldObject