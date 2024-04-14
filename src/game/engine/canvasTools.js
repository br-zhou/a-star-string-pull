import { CanvasModes } from "./canvas.js";
import { Vector2 } from "./vector2.js";

/**
 * Gives tools needed to draw on canvas
 * Singleton class
 */
export class CanvasTools {
  constructor(camera) {
    if (CanvasTools.instance instanceof CanvasTools) {
      return CanvasTools.instance;
    }

    this.camera = camera;
    this.canvas = this.camera.canvas_;
    this.ctx = this.canvas.getContext();

    CanvasTools.instance = this;
  }

  /**
   * gives tools needed for rendering
   */
  get tools() {
    return {
      fov: this.camFov,
      camPos: this.camPos,
    };
  }

  get camFov() {
    return this.camera.fov;
  }

  get camPos() {
    return this.camera.position;
  }

  get windowSize() {
    return { x: window.innerWidth, y: window.innerHeight };
  }

  /**
   * @param {number} positionX
   * @returns the world coordinate positionX converted to the window pixel
   */
  worldToScreenPosX(positionX) {
    return (
      this.worldToScreenConvert(positionX) -
      this.worldToScreenConvert(this.camPos.x) +
      this.windowSize.x / 2
    );
  }

  /**
   * @param {number} positionY
   * @returns the world coordinate positionY converted to the window pixel
   */
  worldToScreenPosY(positionY) {
    return (
      -this.worldToScreenConvert(positionY) +
      this.worldToScreenConvert(this.camPos.y) +
      this.windowSize.y / 2
    );
  }

  /**
   * @param {Vector2} position position on screen
   * @returns position in world coordinates as Vector2
   */
  screenToWorld(position) {
    let referenceLength = 0;
    if (this.canvas.mode === CanvasModes.HORIZONATAL) {
      referenceLength = this.windowSize.x;
    } else {
      referenceLength = this.windowSize.y;
    }

    const xWorld =
      (position.x / this.windowSize.x - 0.5) *
        (this.windowSize.x / referenceLength) *
        this.camFov +
      this.camPos.x;
    const yWorld =
      (0.5 - position.y / this.windowSize.y) *
        (this.windowSize.y / referenceLength) *
        this.camFov +
      this.camPos.y;
    return new Vector2(xWorld, yWorld);
  }

  /**
   * @param {number} length
   * @returns the world units converted to window pixel length
   */
  worldToScreenConvert(length) {
    if (this.canvas.mode === CanvasModes.HORIZONATAL) {
      return (length / this.camFov) * this.windowSize.x;
    } else {
      return (length / this.camFov) * this.windowSize.y;
    }
  }

  /**
   * @param {number} length
   * @returns the world units converted to window pixel length
   */
  screenToWorldConvert(length) {
    let referenceLength =
      this.canvas.mode === CanvasModes.HORIZONATAL
        ? this.windowSize.x
        : this.windowSize.y;
    
    return length / referenceLength * this.camFov;
  }

  /**
   * Draws a rectangle of given width and height,
   * with the top left corner at the world postion x and y
   * @param {number} x x world position
   * @param {number} y y world position
   * @param {number} width width of rectangle
   * @param {number} height height of rectangle
   * @param {string} color String in the format '#000000'
   */
  drawRect = ({ x, y }, width, height, color = "#FF000") => {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      Math.floor(this.worldToScreenPosX(x)),
      Math.floor(this.worldToScreenPosY(y)),
      Math.ceil(this.worldToScreenConvert(width)),
      Math.ceil(this.worldToScreenConvert(height))
    );
  }

  /**
   * Draws a write rectangle of given width and height,
   * with the top left corner at the world postion x and y
   * @param {number} x x world position
   * @param {number} y y world position
   * @param {number} width width of rectangle
   * @param {number} height height of rectangle
   * @param {string} color String in the format '#000000'
   */
  drawRectOutline = ({ x, y }, width, height, color = "#FF0000") => {
    this.ctx.strokeStyle = color;
    const originalLineWidth = this.ctx.lineWidth;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      this.worldToScreenPosX(x),
      this.worldToScreenPosY(y),
      this.worldToScreenConvert(width),
      this.worldToScreenConvert(height)
    );
    this.ctx.lineWidth = originalLineWidth;
  }

  /**
   * Draws a circle at world position, with given radius and color
   * @param {Vector2} position
   * @param {Number} radius
   * @param {String} color
   */
  drawCircle({ x, y }, radius, color = "#FF0000") {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(
      this.worldToScreenPosX(x),
      this.worldToScreenPosY(y),
      this.worldToScreenConvert(radius),
      0,
      2 * Math.PI
    );

    this.ctx.fill();
  }

  /**
   *
   * @param {Image} img
   * @param {Vector2} spriteIndex
   * @param {Vector2} spriteSize
   * @param {Vector2} worldPos
   * @param {Vector2} worldSize
   * Renders sprite at index at world position with given size
   */
  drawSpriteMap(
    img,
    spriteIndex,
    spriteSize,
    worldPos,
    worldSize,
    flipped = false
  ) {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(
      img,
      spriteIndex.x * spriteSize.x,
      spriteIndex.y * spriteSize.y,
      spriteSize.x,
      spriteSize.y,
      this.worldToScreenPosX(worldPos.x),
      this.worldToScreenPosY(worldPos.y),
      this.worldToScreenConvert(worldSize.x),
      this.worldToScreenConvert(worldSize.y)
    );
  }

  /**
   * Draws a line from point1 to point2
   * @param {Vector2} point1 start point of line
   * @param {Vector2} point2 end point of line
   */
  drawLine(startPoint, endPoint, color = "#FF0000", width = 0.25) {
    const originalLineWidth = this.ctx.lineWidth;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = this.worldToScreenConvert(width);
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.worldToScreenPosX(startPoint.x),
      this.worldToScreenPosY(startPoint.y)
    );
    this.ctx.lineTo(
      this.worldToScreenPosX(endPoint.x),
      this.worldToScreenPosY(endPoint.y)
    );
    this.ctx.stroke();
    this.ctx.lineWidth = originalLineWidth;
  }
}
