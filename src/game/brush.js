import { CanvasTools } from "./engine/canvasTools.js";
import { Vector2 } from "./engine/vector2.js";
import store from "../store/redux.js";
import { TILE_SIZE } from "./engine/tileMap.js";

export default class Brush {
  constructor(scene) {
    this.scene = scene;
    this.camera = scene.camera_;
    this.mousePos = new Vector2();
    this.tools = new CanvasTools();
    this.tileMap = scene.tileMap;
    this.mouseDown = false;
    this.mouseDown = false;
    this.mouseWorldPos = null;
    this.mouseGridIndex = null;
    this.canvas = this.scene.camera_.canvas_.canvas_;

    document.addEventListener("keydown", this.onKeyDown);
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mouseup", this.onMouseUp);
    this.canvas.addEventListener("pointermove", this.onMouseMove);
    this.canvas.addEventListener("mouseleave", this.onMouseUp);
  }

  onKeyDown = (e) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    let newBrushState = null;

    switch (key) {
      case "e":
        newBrushState = "eraser";
        break;
      case "b":
        newBrushState = "brush";
        break;
      case "s":
        newBrushState = "start";
        break;
      case "g":
        newBrushState = "goal";
        break;
      default:
        return;
    }

    store.dispatch({ type: "brushType", value: newBrushState });
  };

  onMouseDown = (e) => {
    const btn = e.button;
    if (btn === 0) {
      this.mouseDown = true;
      this.handlePainting();
    }
  };

  onMouseUp = (e) => {
    const btn = e.button;
    if (btn === 0) {
      this.mouseDown = false;
      this.mouseDrag = false;
    }
  };

  onMouseMove = (e) => {
    this.mousePos.x = e.clientX;
    this.mousePos.y = e.clientY;
    if (this.mouseDown) this.mouseDrag = true;
  };

  update() {
    this.mouseWorldPos = this.tools.screenToWorld(this.mousePos);
    this.mouseGridIndex = this.tileMap.positionToGridIndex(this.mouseWorldPos);

    if (this.mouseDown) this.handlePainting();
  }

  handlePainting() {
    if (!this.isPaintable(this.mouseGridIndex)) return;

    const fullState = store.getState();
    if (fullState.isSearching) return;

    switch (fullState.brushType) {
      case "brush":
        this.paint(this.mouseGridIndex, "wall");
        break;
      case "start":
        if (!this.mouseDrag) this.setStart(this.tileMap.positionToGrid(this.mouseWorldPos));
        break;
      case "goal":
        if (!this.mouseDrag) this.setGoal(this.tileMap.positionToGrid(this.mouseWorldPos));
        break;
      case "eraser":
        this.erase(this.mouseGridIndex);
        break;
      default:
        break;
    }
  }

  setGoal(worldPos) {
    this.delete(worldPos, "goal");
    store.dispatch({
      type: "set-goal",
      x: worldPos.x,
      y: worldPos.y,
    });
  }

  setStart(worldPos) {
    this.delete(worldPos, "start");

    store.dispatch({
      type: "set-start",
      x: worldPos.x,
      y: worldPos.y,
    });
  }

  paint(gridPos, blockType = "wall") {
    this.delete(this.mouseGridIndex, "wall");
    store.dispatch({
      type: "add-tile",
      x: gridPos.x,
      y: gridPos.y,
      blockType
    });
  }

  erase(gridPos, omit = null) {
    store.dispatch({
      type: "erase-tile",
      x: gridPos.x,
      y: gridPos.y,
      omit
    });
  }

  delete(gridPos, omit = null) {
    store.dispatch({
      type: "delete-tile",
      x: gridPos.x,
      y: gridPos.y,
      omit
    });
  }

  isPaintable(gridIndex) {
    const mapData = this.tileMap.mapData_;
    return (
      !(gridIndex.x < 0) &&
      !(gridIndex.y < 0) &&
      gridIndex.x < mapData.width &&
      gridIndex.y < mapData.height
    );
  }

  render = () => {
    const fullState = store.getState();
    if (fullState.isSearching) return;

    if (fullState.brushType === "start" || fullState.brushType === "goal") {
      // Render Point brush
      const mouse = this.mouseWorldPos;
      this.tools.drawCircle(
        {
          x: mouse.x,
          y: mouse.y,
        },
        TILE_SIZE / 4,
        "rgba(255,255,255,0.5)"
      );
    } else {
      // Render grid brush
      const tileEntity = this.tileMap.tileIndexToEntity(this.mouseGridIndex);

      const paintable = this.isPaintable(this.mouseGridIndex);
      const brushRenderFunc = paintable
        ? this.tools.drawRectOutline
        : this.tools.drawRect;
      brushRenderFunc(
        tileEntity.position_,
        tileEntity.size_.x,
        tileEntity.size_.y,
        paintable ? "#FFFFFF" : "rgba(255,0,0,0.5)"
      );
    }
  };
}
