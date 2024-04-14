import { CanvasTools } from "./engine/canvasTools.js";
import { Vector2 } from "./engine/vector2.js";

export default class CameraController {
  constructor(scene) {
    this.scene = scene;
    this.camera = scene.camera_;
    this.camDragData = null;
    this.mousePos = new Vector2();

    document.addEventListener("keydown", this.onKeyDown, false);
    document.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mousewheel", this.onScroll);
    // document.addEventListener("DOMMouseScroll", this.onScroll); // todo: add firefox compatibility
  }

  onScroll = (e) => {
    const scrollSpeed = 25;
    const originalFov = this.camera.fov_;
    const direction = Math.sign(e.wheelDelta);

    this.camera.setFov(originalFov - direction * scrollSpeed);
  };

  onKeyDown = (e) => {
    if (e.repeat) return;
  };

  onMouseDown = (e) => {
    const btn = e.button;
    if (btn === 2) {
      document.documentElement.style.cursor = 'grab';
      this.camDragData = {
        initMousePos: Vector2.copy(this.mousePos),
        initCamPos: Vector2.copy(this.camera.position_),
      };
    }
  };

  onMouseUp = (e) => {
    const btn = e.button;
    if (btn === 2) {
      this.camDragData = null;
      document.documentElement.style.cursor = 'auto';
    }
  };

  onMouseMove = (e) => {
    this.mousePos.x = e.clientX;
    this.mousePos.y = e.clientY;

    if (this.camDragData) {
      this.handleCameraDrag();
    }
  };

  handleCameraDrag = (e) => {
    const tools = new CanvasTools();

    const dMouse = Vector2.subtract(
      this.mousePos,
      this.camDragData.initMousePos
    );

    const dWorldPos = new Vector2(
      tools.screenToWorldConvert(dMouse.x),
      tools.screenToWorldConvert(dMouse.y)
    );

    this.camera.position_ = new Vector2(
      this.camDragData.initCamPos.x - dWorldPos.x,
      this.camDragData.initCamPos.y + dWorldPos.y
    );
  };
}
