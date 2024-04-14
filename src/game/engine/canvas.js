/**
 * 2d canvas for game
 * Singleton class
 */
export class Canvas {
  constructor() {
    if (Canvas.instance instanceof Canvas) {
      return Canvas.instace;
    }

    this.canvas_ = document.querySelector('canvas');
    this.context_ = this.canvas_.getContext('2d');
    this.mode = null;

    this.setEventsListeners_();
    this.resizeCanvas_();

    Canvas.instace = this;
  }

  /**
   * Creates event listeners that class needs.
   */
  setEventsListeners_() {
    window.addEventListener(
      "resize",
      () => {
        this.resizeCanvas_();
      },
      false
    );
  }

  /**
   * Sets the width and height of canvas to window's.
   */
  resizeCanvas_() {
    this.canvas_.width = window.innerWidth;
    this.canvas_.height = window.innerHeight;

    this.mode = (window.innerWidth > window.innerHeight) ? CanvasModes.HORIZONATAL : CanvasModes.VERTICAL;
  }

  getContext() {
    return this.context_;
  }

  get width() {
    return this.canvas_.width;
  }

  get height() {
    return this.canvas_.height;
  }
}

/**
 * Enum for the view mode of canvas
 */
export const CanvasModes = {
  HORIZONATAL: Symbol("Horizontal"),
  VERTICAL: Symbol("Vertical")
}
Object.freeze(CanvasModes);