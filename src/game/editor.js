import Brush from "./brush.js";
import { startLoop } from "./engine/animationLoop.js";
import { Scene } from "./engine/scene.js";
import CameraController from "./cameraController.js";

/**
 * Contains main game logic
 * Singleton Instance
 */
export class Editor {
  constructor() {
    if (Editor.instance instanceof Editor) return Editor.instance;

    this.scene = new Scene();
    this.inputHandler = new CameraController(this.scene);
    this.brush = new Brush(this.scene);

    this.setup();
    startLoop(this.loop);

    Editor.instance = this;
  }

  setup() {
    // nothing
  }

  loop = (dtSec, elapsedTimeSec) => {
    this.scene.update(dtSec, elapsedTimeSec);
    
    this.brush.update();

    this.scene.render();
    this.brush.render();
  };
}
