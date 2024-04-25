import store from "../../store/redux";
import { CanvasTools } from "./canvasTools";
import { Heap } from "./myHeap";
import { PathRenderer } from "./pathRenderer.js";

export class PathFinder {
    constructor() {
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
        this.heap.clear();
        this.mapData = JSON.parse(JSON.stringify(state.mapData)); // deep copy
        this.stepDelay = state.stepDelay;

        const startPosition = this.mapData.start;
        const goalPosition = this.mapData.goal;

        // insert start node into heap

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
        console.log("ALGORITHMN COMPLETE!");
    }

    getManhattanDist(posA, posB) {
        return Math.abs(posA.x - posB.x) + Math.abs(posA.y - posB.y);
    }

    render() {
        if (!this.isSearching) return;

        this.pathRenderer.render();
    }
}