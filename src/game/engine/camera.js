import { Canvas } from "./canvas.js";
import { CanvasTools } from "./canvasTools.js";
import { Vector2 } from "./vector2.js";

/**
 * Represents the in-game camera
 */
export class Camera {
  constructor() {
    this.canvas_ = new Canvas();
    this.ctx_ = this.canvas_.getContext();
    this.position_ = new Vector2(25, 22);
    this.fov_ = 75;
    this.minFov = 15
    this.maxFov = 500;

    void new CanvasTools(this);
  }

  get fov() {
    return this.fov_;
  }

  get position() {
    return this.position_;
  }

  bind(entity) {
    this.position_ = entity.position_;
  }

  setFov(fov) {
    this.fov_ = fov;
    if (this.fov_ < this.minFov) this.fov_ = this.minFov;
    if (this.fov_ > this.maxFov) this.fov_ = this.maxFov;
  }
}
