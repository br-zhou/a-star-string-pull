import { CanvasTools } from "./canvasTools.js";
import { Vector2 } from "./vector2.js";
import { TILE_SIZE, MAP_OFFSET } from "./tileMap.js";

export class PathRenderer {
  constructor() {
    this.tools = new CanvasTools();
    this.nodes = [];
    this.pathColor = "#FFFF00";
  }

  drawCircleAtNode(node) {
    const SIZE = TILE_SIZE * 0.1;
    this.tools.drawCircle(
      {
        x: node.x * TILE_SIZE + MAP_OFFSET.x,
        y: node.y * TILE_SIZE + MAP_OFFSET.y,
      },
      SIZE,
      this.pathColor
    );
  }

  addNode = (node) => {
    this.nodes.push(node);
  }

  clear = () => {
    this.nodes = [];
  }

  render() {
    if (this.nodes.length === 0) return;

    const WIDTH = TILE_SIZE * 0.05;

    for (let i = 0; i < this.nodes.length - 1; i++) {
      const startPoint = new Vector2(
        this.nodes[i].x * TILE_SIZE + MAP_OFFSET.x,
        this.nodes[i].y * TILE_SIZE + MAP_OFFSET.y
      );

      const endPoint = new Vector2(
        this.nodes[i + 1].x * TILE_SIZE + MAP_OFFSET.x,
        this.nodes[i + 1].y * TILE_SIZE + MAP_OFFSET.y
      );

      this.tools.drawLine(startPoint, endPoint, this.pathColor, WIDTH);
    }

    for (let node of this.nodes) {
      this.drawCircleAtNode(node);
    }
  }
}