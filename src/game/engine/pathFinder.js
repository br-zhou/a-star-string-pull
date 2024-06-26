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
        this.pulledPathRenderer = new PathRenderer();
        this.pulledPathRenderer.pathColor = "rgba(0, 255, 0, 0.5)";
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
        this.pulledPathRenderer.clear();
        this.heap.clear();
        this.mapData = JSON.parse(JSON.stringify(state.mapData)); // deep copy
        this.pathData = this.mapData.pathData;
        this.stepDelay = state.stepDelay;
        this.usedNodes = {};

        const startPosition = Vector2.copy(this.mapData.start);
        const goalPosition = Vector2.copy(this.mapData.goal);

        startPosition.scale(2);
        goalPosition.scale(2);

        // insert start node into heap
        let startNode = new OctalNode(null, startPosition, 0, this.getDist(startPosition, goalPosition));
        if (startPosition.x % 1 !== 0 || startPosition.y % 1 !== 0) {
            startNode = new OctalNode(startNode, this.convertPointToGrid(startPosition), 0, this.getDist(startPosition, goalPosition));
        }
        this.heap.insert(startNode);

        this.startPositionGrid = this.convertPointToGrid(startPosition);
        this.goalPositionGrid = this.convertPointToGrid(goalPosition);
        this.startPosition = startPosition;
        if (goalPosition.x % 1 !== 0 || goalPosition.y % 1 !== 0) {
            this.endPosition = this.convertPointToGrid(goalPosition);
            this.realEndPosition = goalPosition;
        } else {
            this.endPosition = goalPosition;
            this.realEndPosition = null;
        }

        this.algorithmFinished = false;
        this.renderGrids = [];

        clearInterval(this.stepIntervalId);
        this.stepIntervalId = setInterval(this.step, this.stepDelay);
    }

    step = () => {
        const heap = this.heap;

        if (!heap.isEmpty()) {
            const node = heap.remove();
            if (this.nodeIsGoal(node)) {
                // TODO: this.finalPath = node.path;
                if (this.realEndPosition) {
                    const finalNode = new OctalNode(node, this.realEndPosition, 0, 0);
                    this.finalPath = this.generatePath(finalNode);
                } else {
                    this.finalPath = this.generatePath(node);
                }
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

        this.pulledFinalPath = this.generatePulledPath(this.finalPath);

        for (let position of this.pulledFinalPath) {
            const point = Vector2.copy(position)
            point.scale(1 / 2);
            this.pulledPathRenderer.addNode(point);
        }

        this.algorithmFinished = true;
        console.log("ALGORITHMN COMPLETE!");
    }

    generatePulledPath = (path) => {
        const result = [];

        let r = path.length - 1;
        let l = 0;

        while (l < r) {
            if (!this.lineCheck(path[l], path[r])) {
                l++;
            } else {
                result.push(path[r]);
                r = l;
                l = 0;

                if (result[result.length - 1] === path[r]) {
                    return result;
                }
            }
        }

        result.push(path[r]);
        result.push(path[l]);

        return result;
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
        if (position.x > this.mapData.width * 2 || position.y >= this.mapData.height * 2) return false;

        // avoid recalculating same position
        if (this.nodePositionAlreadyCalculated(position)) return false;

        // if point on diagonal wall return false
        if (this.pointIsOnDiagonalWall(position)) return false;

        if (offset.x === 0 && offset.y === 1) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 1)),) &&
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 1)),) &&
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 2)),) &&
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 2)),)
        } else if (offset.x === 1 && offset.y === 1) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 1)), false)
        } else if (offset.x === 1 && offset.y === 0) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 0)),) &&
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 1)),) &&
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(1, 0)),) &&
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(1, 1)),)
        } else if (offset.x === 1 && offset.y === -1) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 0)), false)
        } else if (offset.x === 0 && offset.y === -1) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, 0)),) &&
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 0)),) &&
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(0, -1)),) &&
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, -1)),)
        } else if (offset.x === -1 && offset.y === -1) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 0)), false)
        } else if (offset.x === -1 && offset.y === 0) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 0)),) &&
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 1)),) &&
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-2, 0)),) &&
                !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-2, 1)),)
        } else if (offset.x === -1 && offset.y === 1) {
            return !this.gridPositionContainsWall(this.getOffsetPosition(parentNode, new Vector2(-1, 1)), false)
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

    gridPositionContainsWall = (gridPos, ignoreBarriers = true) => {
        const BARRIER_TYPES = [2]
        const tileExists = this.pathData[gridPos.x] && this.pathData[gridPos.x][gridPos.y];
        if (ignoreBarriers && tileExists) {
            const tile = this.pathData[gridPos.x][gridPos.y];
            for (let type of BARRIER_TYPES) {
                if (tile === type) return false;
            }
            return true;
        } else {
            return Boolean(tileExists);
        }
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

    straightLineCheck = (start, end) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        console.log("STRAIGHT LINE CHECK");

        if (dy === 0) {
            console.log("HORIZONTAL");
            const y = start.y;
            const startX = Math.min(start.x, end.x);
            const endX = Math.max(start.x, end.x);
            for (let x = startX; x < endX; x++) {
                // If bottom tile is a wall
                if (this.gridPositionContainsWall(new Vector2(x, y), true)) {
                    console.log("BOTTOM WALL", x, y);
                    return false;
                }
                if (this.gridPositionContainsWall(new Vector2(x, y + 1), true)) {
                    console.log("TOP WALL")
                    return false;
                }
            }
        } else if (dx === 0) {
            console.log("VERTICAL");
            const x = start.x;
            const startY = Math.min(start.y, end.y);
            const endY = Math.max(start.y, end.y);
            for (let y = startY; y < endY; y++) {
                // If right tile is a wall
                if (this.gridPositionContainsWall(new Vector2(x, y), true)) {
                    console.log("BOTTOM WALL", x, y);
                    return false;
                }
                if (this.gridPositionContainsWall(new Vector2(x - 1, y), true)) {
                    console.log("LEFT WALL")
                    return false;
                }
            }
        }
        return true;
    }

    lineCheck = (start, end) => {
        const result = [];
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        if ((dx === 0 && start.x % 1 === 0) || (dy === 0 && start.y % 1 === 0)) {
            return this.straightLineCheck(start, end);
        }

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
        if (stepAxis === 'x') {
            if (start.x < end.x) {
                if (start.y % 1 === 0) {
                    if (start.y < end.y) {
                        result.shift();
                    }
                }

                if (end.y % 1 === 0) {
                    if (end.y < start.y) {
                        result.splice(result.length - 2, 1);
                    }
                }
            } else {
                if (end.y % 1 === 0) {
                    if (start.y > end.y) {
                        result.shift();
                    }
                }

                if (start.y % 1 === 0) {
                    if (end.y > start.y) {
                        result.splice(result.length - 2, 1);
                        // result.pop();
                    }
                }
            }
        }

        if (stepAxis === 'y') {
            if (start.x < end.x) {
                if (start.y < end.y) {
                    if (start.x % 1 === 0) {
                        if (start.x > end.x) {
                            result.shift();
                        }
                    }

                    if (end.x % 1 === 0) {
                        if (end.x > start.x) {
                            result.pop();
                        }
                    }
                } else {

                    if (end.x % 1 === 0) {
                        if (end.x > start.x) {
                            result.splice(1, 1);
                        }
                    }
                }
            }

            else if (start.x > end.x) {
                if (start.y < end.y) {
                    if (start.x % 1 === 0) {
                        if (start.x > end.x) {
                            result.splice(1, 1);
                        }
                    }

                } else {
                    if (start.x % 1 === 0) {
                        if (start.x > end.x) {
                            result.pop();
                        }
                    }
                }
            }
        }

        // get result
        for (let cell of result) {
            if (this.gridPositionContainsWall(cell, false)) {
                return false;
            }
        }

        return true;
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

        for (let node of this.heap.nodes_) {
            this.tools.drawCircle(
                {
                    x: node.position.x * TILE_SIZE / 2,
                    y: node.position.y * TILE_SIZE / 2
                },
                1 / 8,
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

        this.pulledPathRenderer.render();
    }
}