import store from "../../store/redux";
import { OctalNode } from "./anyaNodes.js";
import { CanvasTools } from "./canvasTools";
import { Heap } from "./myHeap";
import { PathRenderer } from "./pathRenderer.js";
import { Vector2 } from "./vector2.js";
import { TILE_SIZE } from "./tileMap.js";

export class PathFinder {
    constructor(tileMap) {
        this.tileMap = tileMap;
        this.mapData = null;
        this.isSearching = false;
        store.subscribe(this.reduxSubscriptionHandler);
        this.tools = new CanvasTools();
        this.heap = new Heap(this.nodeSortFunction);
        this.stepDelay = null;
        this.finalPath = [];
        this.pathRenderer = new PathRenderer();
    }

    reduxSubscriptionHandler = () => {
        const fullState = store.getState();
        const wasSearching = this.isSearching;
        this.isSearching = fullState.isSearching;

        if (this.isSearching && !wasSearching) {
            this.startSearch(fullState);
        }
    }

    startSearch = (state) => {
        this.finalPath = [];
        this.pathRenderer.clear();
        this.heap.clear();
        this.mapData = JSON.parse(JSON.stringify(state.mapData)); // deep copy
        this.tileData = this.mapData.tileData;
        this.stepDelay = state.stepDelay;
        this.usedNodes = {};

        const startPosition = this.mapData.start;
        const goalPosition = this.mapData.goal;

        // insert start node into heap
        this.heap.insert(new OctalNode(null, startPosition, 0, this.getDist(startPosition, goalPosition)));

        this.startPositionGrid = this.convertPointToGrid(startPosition);
        this.goalPositionGrid = this.convertPointToGrid(goalPosition);
        this.startPosition = startPosition;
        this.endPosition = goalPosition;
        this.algorithmFinished = false;
        this.renderGrids = [];

        clearInterval(this.stepIntervalId);
        this.stepIntervalId = setInterval(this.step, this.stepDelay);
    }

    step = () => {
        console.log("STEP");

        const heap = this.heap;

        if (!heap.isEmpty()) {
            const node = heap.remove();
            if (this.nodeIsGoal(node)) {
                // TODO: this.finalPath = node.path;
                this.finalPath = this.generatePath(node);

                this.endAlgorithmn();
                return;
            } else {
                this.addNeighborsToHeap(node);
            }
        } else {
            this.endAlgorithmn();
        }
    }

    generatePath = (node) => {
        const path = [];
        while (node) {
            path.push(node.position);
            node = node.parent;
        }
        return path.reverse();
    }

    endAlgorithmn() {
        clearInterval(this.stepIntervalId);

        for (let position of this.finalPath) {
            this.pathRenderer.addNode(position);
            console.log(position)
        }


        for (let i = 0; i < this.finalPath.length - 1; i++) {
            const start = this.finalPath[i];
            const end = this.finalPath[i + 1];
            const grids = this.lineCheck(start, end);
            this.renderGrids.push(...grids);
        }

        // this.renderGrids = this.lineCheck(this.startPosition, this.endPosition);
        this.algorithmFinished = true;
        console.log("ALGORITHMN COMPLETE!");
    }

    addNeighborsToHeap = (node) => {
        // insert top
        this.heap.insert(this.createNeighborNode(node, new Vector2(0, 1)));
        this.heap.insert(this.createNeighborNode(node, new Vector2(1, 1)));
        this.heap.insert(this.createNeighborNode(node, new Vector2(1, 0)));
        this.heap.insert(this.createNeighborNode(node, new Vector2(1, -1)));
        this.heap.insert(this.createNeighborNode(node, new Vector2(0, -1)));
        this.heap.insert(this.createNeighborNode(node, new Vector2(-1, -1)));
        this.heap.insert(this.createNeighborNode(node, new Vector2(-1, 0)));
        this.heap.insert(this.createNeighborNode(node, new Vector2(-1, 1)));
    }

    nodePositionAlreadyCalculated = (position) => {
        // TODO: instead of checking usedNodes, compare path costs to node to determine if it should be re-added
        const { x, y } = position;
        return this.usedNodes[x] && this.usedNodes[x][y];
    }

    addPositionToUsedNodes = (position) => {
        if (!this.usedNodes[position.x]) {
            this.usedNodes[position.x] = {};
        }
        this.usedNodes[position.x][position.y] = true;
    }

    createNeighborNode = (parentNode, offset) => {
        const position = new Vector2(parentNode.position.x + offset.x, parentNode.position.y + offset.y);

        if (!this.validNewNodePosition(parentNode, offset)) return null;

        // NOTE: adding neighbors that aren't guaranteed to be in the final path
        //  causes the result to be non-optimal. We currently allow this because
        //  we are hoping that string pulling will fix the path.
        this.addPositionToUsedNodes(position);

        const pathCost = parentNode.pathCost + offset.magnitude();
        const heuristic = this.getDist(position, this.endPosition);
        const newNode = new OctalNode(parentNode, position, pathCost, heuristic);
        newNode.path = [...parentNode.path, position];
        return newNode;
    }

    validNewNodePosition = (parentNode, offset) => {
        const position = new Vector2(parentNode.position.x + offset.x, parentNode.position.y + offset.y);
        if (position.x < 0 || position.y < 0) return false;
        if (position.x >= this.mapData.width || position.y >= this.mapData.height) return false;

        // avoid recalculating same position
        if (this.nodePositionAlreadyCalculated(position)) return false;

        // if point on diagonal wall return false
        if (this.pointIsOnDiagonalWall(position)) return false;

        if (offset.x === 0 && offset.y === 1) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 1))) ||
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 1)))
        } else if (offset.x === 1 && offset.y === 1) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 1)))
        } else if (offset.x === 1 && offset.y === 0) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 0))) ||
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 1)))
        } else if (offset.x === 1 && offset.y === -1) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 0)))
        } else if (offset.x === 0 && offset.y === -1) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 0))) ||
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 0)))
        } else if (offset.x === -1 && offset.y === -1) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 0)))
        } else if (offset.x === -1 && offset.y === 0) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 0))) ||
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 1)))
        } else if (offset.x === -1 && offset.y === 1) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 1)))
        }


        return true;
    }

    pointIsOnDiagonalWall = (position) => {
        // 1 0
        // 0 1
        if (this.gridPositionContainsWall(Vector2.add(position, new Vector2(0, 0))) &&
            this.gridPositionContainsWall(Vector2.add(position, new Vector2(-1, 1)))
        ) return true;

        // 0 1
        // 1 0
        if (this.gridPositionContainsWall(Vector2.add(position, new Vector2(-1, 0))) &&
            this.gridPositionContainsWall(Vector2.add(position, new Vector2(0, 1)))
        ) return true;

        return false;
    }

    getOffsetPosition = (parentNode, offset) => {
        return new Vector2(parentNode.position.x + offset.x, parentNode.position.y + offset.y);
    }

    gridPositionContainsWall = (gridPos) => {
        return this.tileData[gridPos.x] && this.tileData[gridPos.x][gridPos.y];
    }

    nodeIsGoal = (node) => {
        return node.position.x === this.endPosition.x && node.position.y === this.endPosition.y;
    }

    // returns true if 'a' has higher priority than 'b'
    nodeSortFunction = (a, b) => {
        return a.value <= b.value;
    }

    DDACheck = (start, end) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        const xIncrement = dx / steps;
        const yIncrement = dy / steps;

        const result = [];

        for (let i = 0; i <= steps; i++) {
            result.push(new Vector2(Math.round(start.x + (i * xIncrement)), Math.round(start.y + (i * yIncrement))));
        }

        return result;
    }

    checkValidLine = (start, end) => {
        const points = this.lineCheck(start, end);

        for (let point of points) {
            if (this.gridPositionContainsWall(point)) {
                return false;
            }
        }

        return true;
    }

    lineCheck = (start, end) => {
        const result = [];
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        const stepAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';

        if (stepAxis === 'x') {
            // if step axis was y, we would have to swap x and y
            const slope = dy / dx;
            const steps = this.getStepsFrom(start.x, end.x);
            const points = [];
            for (let x of steps) {
                const y = start.y + slope * (x - start.x);
                const stepPosition = new Vector2(x, y);
                points.push(stepPosition);
            }

            for (let i = 0; i < points.length - 1; i++) {
                const point = points[i];
                const nextPoint = points[i + 1];

                const pointGrid = this.convertPointToGrid(point);
                const nextPointGrid = this.convertPointToGrid(nextPoint);

                const small = Math.min(pointGrid.y, nextPointGrid.y);
                const large = Math.max(pointGrid.y, nextPointGrid.y);

                for (let i = small; i <= large; i++) {
                    result.push(new Vector2(pointGrid.x, i));
                }

            }
        } else if (stepAxis === 'y') {
            // if step axis was x, we would have to swap y and x
            const slope = dx / dy;
            const steps = this.getStepsFrom(start.y, end.y);
            const points = [];
            for (let y of steps) {
                const x = start.x + slope * (y - start.y);
                const stepPosition = new Vector2(x, y);
                points.push(stepPosition);
            }

            for (let i = 0; i < points.length - 1; i++) {
                const point = points[i];
                const nextPoint = points[i + 1];

                const pointGrid = this.convertPointToGrid(point);
                const nextPointGrid = this.convertPointToGrid(nextPoint);

                const small = Math.min(pointGrid.x, nextPointGrid.x);
                const large = Math.max(pointGrid.x, nextPointGrid.x);

                for (let i = small; i <= large; i++) {
                    result.push(new Vector2(i, nextPointGrid.y));
                }

            }
        }

        // Trim ends of result
        // if (stepAxis === 'x') {
        //     if (this.startPosition.y % 1 === 0) {
        //         if (this.startPosition.y < this.endPosition.y) {
        //             console.log("SHIFTING Y");
        //             result.shift();
        //         }
        //     }

        //     if (this.endPosition.y % 1 === 0) {
        //         if (this.endPosition.y < this.startPosition.y) {
        //             console.log("Popping Y");
        //             result.splice(result.length - 2, 1);
        //         }
        //     }
        // }

        // if (stepAxis === 'y') {
        //     if (this.startPosition.x % 1 === 0) {
        //         if (this.startPosition.x > this.endPosition.x) {
        //             result.pop();
        //         }
        //     }

        //     if (this.endPosition.x % 1 === 0) {
        //         if (this.endPosition.x > this.startPosition.x) {
        //             result.splice(1, 1);

        //         }
        //     }
        // }

        return result;
    }

    getStepsFrom(a, b) {
        const result = [];

        const start = Math.min(a, b);
        const end = Math.max(a, b);

        if (start !== Math.ceil(start)) {
            result.push(start);
        }

        for (let i = Math.ceil(start); i < end; i++) {
            result.push(i);
        }

        result.push(end);

        return result;
    }

    getManhattanDist(posA, posB) {
        return Math.abs(posA.x - posB.x) + Math.abs(posA.y - posB.y);
    }

    getDist(posA, posB) {
        return Math.sqrt(Math.pow(posB.x - posA.x, 2) + Math.pow(posB.y - posA.y, 2));
    }

    convertPointToGrid = (point) => {
        return new Vector2(Math.floor(point.x), Math.ceil(point.y));
    }

    render() {
        if (!this.isSearching) return;

        // this.tileMap.colorGrid(this.startPositionGrid, "rgba(0, 255, 0, 0.25)");
        // this.tileMap.colorGrid(this.goalPositionGrid, "rgba(255, 0, 0, 0.25)");

        for (let node of this.heap.nodes_) {
            this.tools.drawCircle(
                {
                    x: node.position.x * TILE_SIZE,
                    y: node.position.y * TILE_SIZE
                },
                1 / 4,
                "rgba(255,255,255,0.5)"
            );
        }

        if (!this.algorithmFinished) return;

        for (let grid of this.renderGrids) {
            this.tileMap.colorGrid(grid, "rgba(255, 255, 255, 0.25)");
        }

        if (this.stepPoints) {
            for (let point of this.stepPoints) {
                this.tileMap.colorGrid(this.convertPointToGrid(point), "rgba(255, 255, 255, 0.25)");
            }
        }

        this.pathRenderer.render();
    }
}