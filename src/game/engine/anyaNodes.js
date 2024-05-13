export class OctalNode {
  constructor(parent, gridPosition, pathCost, heuristic) {
    // TODO: separate attributes by the classes that use them
    this.position = gridPosition;
    this.pathCost = pathCost;
    this.heuristic = heuristic;
    this.value = this.pathCost + this.heuristic; // f-value
    this.parent = parent;
    this.path = [];
    // used for rendering
    this.color = "#FF00FF";
  }
}