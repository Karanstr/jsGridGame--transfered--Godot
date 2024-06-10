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



}

export default WorldObject