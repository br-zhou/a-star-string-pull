import { CanvasTools } from "./canvasTools.js";
import { Vector2 } from "./vector2.js";
import store from "../../store/redux.js";
import { PathFinder } from "./pathFinder.js";

export const TILE_SIZE = 2;
export const MAP_OFFSET = new Vector2(0, 0);

/**
 * TileMap for ground
 */
export class TileMap {
  constructor() {
    this.mapData_ = null;
    this.tools = new CanvasTools();
    this.pathFinder = new PathFinder();
    store.subscribe(this.reduxSubscriptionHandler);

    this.mapData_ = this.getReduxSlice();
  }

  getReduxSlice = () => {
    const fullState = store.getState();
    return fullState.mapData;
  }

  reduxSubscriptionHandler = () => {
    const slice = this.getReduxSlice();
    this.mapData_ = {...slice};
  }

  update(dtSec, elapsedTimeSec) {
    // todo: implement tile update calls

    // update blocks
    if (this.mapData_.tileData != null) {
      // todo: optimize rendering to only show tiles visible to camera
      for (const gridX of Object.keys(this.mapData_.tileData)) {
        for (const gridY of Object.keys(this.mapData_.tileData[gridX])) {
          this.mapData_.tileData[gridX][gridY].update(dtSec, elapsedTimeSec);
        }
      }
    }

    // update start
    if (this.mapData_.start != null) {
      this.mapData_.start.update(dtSec, elapsedTimeSec);
    }

    // update goals

    for (const gridX of Object.keys(this.mapData_.goals)) {
      for (const gridY of Object.keys(this.mapData_.goals[gridX])) {
        this.mapData_.goals[gridX][gridY].update(dtSec, elapsedTimeSec);
      }
    }

    this.pathFinder.update(dtSec, elapsedTimeSec);
  }

  render() {
    this.pathFinder.render();
    
    if (this.mapData_.tileData != null) {
      // todo: optimize rendering to only show tiles visible to camera
      for (const gridX of Object.keys(this.mapData_.tileData)) {
        for (const gridY of Object.keys(this.mapData_.tileData[gridX])) {
          this.mapData_.tileData[gridX][gridY].render();
        }
      }
    }

    if (this.mapData_.start != null) {
      this.mapData_.start.render();
    }

    for (const gridX of Object.keys(this.mapData_.goals)) {
      for (const gridY of Object.keys(this.mapData_.goals[gridX])) {
        this.mapData_.goals[gridX][gridY].render();
      }
    }

    this.tools.drawRectOutline(
      new Vector2(0, (this.mapData_.height - 1) * TILE_SIZE),
      this.mapData_.width * TILE_SIZE,
      this.mapData_.height * TILE_SIZE,
      "#FFFFFF"
    );

  }

  /**
   * @param {x, y} position colors tile at index {x,y}
   * @param {string} color the specified color
   */
  colorGrid({ x, y }, color) {
    this.tools.drawRect(
      {
        x: x * TILE_SIZE + MAP_OFFSET.x,
        y: y * TILE_SIZE + MAP_OFFSET.y,
      },
      TILE_SIZE,
      TILE_SIZE,
      color
    );
  }

  /**
   * @param {x, y} position outlines tile at index {x,y}
   * @param {string} color the specified color
   */
  outlineGrid({ x, y }, color) {
    this.tools.drawRectOutline(
      {
        x: x * TILE_SIZE + MAP_OFFSET.x,
        y: y * TILE_SIZE + MAP_OFFSET.y,
      },
      TILE_SIZE,
      TILE_SIZE,
      color
    );
  }

  get offsetX() {
    return MAP_OFFSET.x;
  }

  get offsetY() {
    return MAP_OFFSET.y;
  }

  /**
   * @param {number, number} position world position
   * @returns {number, number} index in tileGrid
   */
  positionToGridIndex({ x, y }) {
    const OffsetPosition = { x: x - MAP_OFFSET.x, y: y - MAP_OFFSET.y };

    const gridIndex = {
      x: Math.floor(OffsetPosition.x / TILE_SIZE),
      y: Math.ceil(OffsetPosition.y / TILE_SIZE),
    };

    return gridIndex;
  }

  /**
   *
   * @param {number, number} gridIndex x and y indexes in tileGrid
   * @returns {number, number} world position of grid
   */
  gridIndexToPosition({ x, y }) {
    const worldPosition = {
      x: x * TILE_SIZE + MAP_OFFSET.x,
      y: y * TILE_SIZE + MAP_OFFSET.y,
    };

    return worldPosition;
  }

  /**
   *
   * @param {vector2} gridIndexPosition of block
   * @returns enitity that represents block
   * NOTE: altering the enitity does not alter the block
   */
  tileIndexToEntity({ x, y }) {
    return {
      position_: this.gridIndexToPosition(new Vector2(x, y)),
      size_: new Vector2(TILE_SIZE, TILE_SIZE),
    };
  }
}
