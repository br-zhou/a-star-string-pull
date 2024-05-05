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
        this.pathRenderer.addNode(startPosition)
        this.pathRenderer.addNode(goalPosition)

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

        const dxSign = Math.sign(dx);
        const dySign = Math.sign(dy);


        const startGrid = this.convertPointToGrid(start);
        const endGrid = this.convertPointToGrid(end);

        result.push(startGrid);

        let stepPosition = Vector2.copy(start);
        let stepGrid = this.convertPointToGrid(stepPosition);
        if (stepAxis && dxSign === 1) {
            while (true) {
                const xStep = stepPosition.x % 1 === 0 ? 1 : Math.ceil(stepPosition.x) - stepPosition.x;
                const yStep = dy / dx * xStep;

                const nextPosition = new Vector2(stepPosition.x + xStep, stepPosition.y + yStep);
                const nextGrid = this.convertPointToGrid(nextPosition);

                result.push(Vector2.copy(nextGrid))

                // if y increases when step taken
                if (nextGrid.y !== stepGrid.y) {
                    result.push(new Vector2(stepGrid.x, stepGrid.y + dySign));
                }

                stepPosition = nextPosition;
                stepGrid = nextGrid;

                if (Vector2.equals(stepGrid, endGrid)) {
                    break;
                }
            }

        }

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

        this.pathRenderer.render();
    }
}