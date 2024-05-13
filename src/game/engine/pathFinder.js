import store from "../../store/redux";
import { CanvasTools } from "./canvasTools";
import { Heap } from "./myHeap";
import { PathRenderer } from "./pathRenderer.js";
import { Vector2 } from "./vector2.js";

export class PathFinder {
    constructor(tileMap) {
        this.tileMap = tileMap;
        this.mapData = null;
        this.isSearching = false;
        store.subscribe(this.reduxSubscriptionHandler);
        this.tools = new CanvasTools();
        this.heap = new Heap();
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
        this.stepDelay = state.stepDelay;

        const startPosition = this.mapData.start;
        const goalPosition = this.mapData.goal;

        // insert start node into heap
        // this.pathRenderer.addNode(startPosition)
        // this.pathRenderer.addNode(goalPosition)

        this.startPositionGrid = this.convertPointToGrid(startPosition);
        this.goalPositionGrid = this.convertPointToGrid(goalPosition);
        this.startPosition = startPosition;
        this.endPosition = goalPosition;
        this.algorithmFinished = false;

        clearInterval(this.stepIntervalId);
        this.stepIntervalId = setInterval(this.step, this.stepDelay);
    }

    step = () => {
        const heap = this.heap;

        if (!heap.isEmpty()) {
            const node = heap.remove();
            const gridIndex = node.gridIndex;
            this.createPathTile(gridIndex);

            if (this.tileIsGoal(gridIndex)) {
                this.finalPath = node.path;
                this.endAlgorithmn();
                return;
            } else {
                this.addNeighbourToHeap(node);
            }
        } else {
            this.endAlgorithmn();
        }
    }

    endAlgorithmn() {
        clearInterval(this.stepIntervalId);
        this.renderGrids = this.lineCheck(this.startPosition, this.endPosition);
        this.algorithmFinished = true;
        console.log("ALGORITHMN COMPLETE!");
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

    BresenhamCheck = (start, end) => {
        // Bresenham's line algorithm
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        return [];
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
                // for rendering
                this.pathRenderer.addNode(stepPosition);
            }
            console.log(points);

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
                // for rendering
                this.pathRenderer.addNode(stepPosition);
            }
            console.log(points);

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

    convertPointToGrid = (point) => {
        return new Vector2(Math.floor(point.x), Math.ceil(point.y));
    }

    render() {
        if (!this.isSearching || !this.algorithmFinished) return;

        // this.tileMap.colorGrid(this.startPositionGrid, "rgba(0, 255, 0, 0.25)");
        // this.tileMap.colorGrid(this.goalPositionGrid, "rgba(255, 0, 0, 0.25)");

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