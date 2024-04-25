import { Camera } from "./camera.js";
import { TileMap } from "./tileMap.js";

/**
 * Represents a scene in the game. Holds all
 * drawable objects related to scene.
 */
export class Scene {
  constructor() {
    this.camera_ = new Camera(this);
    this.backgroundColor_ = '#355C7D';
    this.tileMap = new TileMap();
  }

  update(dtSec, elapsedTimeSec) {
    // pass
  }

  /**
   * renders background, foreground, the entities onto canvas
   */
  render() {
    this.renderBackground_();
    this.renderForeground_();
  }

  renderBackground_() {
    const canvas = this.camera_.canvas_;
    const ctx = canvas.getContext();
    ctx.fillStyle = this.backgroundColor_;
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  renderForeground_() {
    this.tileMap.render();
  }

  get camera() {
    return this.camera_;
  }
}