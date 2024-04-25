import store from "../../store/redux";
import { getElapsedTime } from "./animationLoop";
import { CanvasTools } from "./canvasTools";
import { Heap } from "./myHeap";
import { PathRenderer } from "./pathRenderer.js";
import { Tile } from "./tile";
import { MAP_OFFSET, TILE_SIZE } from "./tileMap";
// import { MAP_OFFSET, TILE_SIZE } from "./tileMap";
import { Vector2 } from "./vector2";

export class PathFinder {
    constructor() {
        this.mapData = null;
        this.isSearching = false;
        this.pathTiles = {};
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
        this.pathTiles = {};
        this.finalPath = [];
        this.heap.clear();
        this.mapData = JSON.parse(JSON.stringify(state.mapData));
        this.stepDelay = state.stepDelay;

        // delete all tiles that are in delete animation
        for (const gridX of Object.keys(this.mapData.tileData)) {
            for (const gridY of Object.keys(this.mapData.tileData[gridX])) {
                if (this.mapData.tileData[gridX][gridY].deleted) {
                    delete this.mapData.tileData[gridX][gridY];
                }
            }
        }

        for (const gridX of Object.keys(this.mapData.goals)) {
            for (const gridY of Object.keys(this.mapData.goals[gridX])) {
                if (this.mapData.goals[gridX][gridY].deleted) {
                    delete this.mapData.goals[gridX][gridY];
                }
            }
        }

        const startPosition = this.mapData.start.gridPos;

        // insert starting position into frontier
        this.heap.insert(startPosition, 0, this.getHeuristic(startPosition));

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
        // todo: update redux state
    }

    addNeighbourToHeap(node) {
        this.insertNeighbour(node, -1, 0);
        this.insertNeighbour(node, 1, 0);
        this.insertNeighbour(node, 0, -1);
        this.insertNeighbour(node, 0, 1);
    }

    tileIsGoal(pos) {
        const goals = this.mapData.goals;
        if (!goals[pos.x]) return false;

        return goals[pos.x][pos.y] && true;
    }

    insertNeighbour(node, x, y) {
        const heap = this.heap;
        const pathCost = node.pathCost + 1;
        const gridIndex = node.gridIndex;
        const pos = Vector2.add(gridIndex, new Vector2(x, y));
        const path = node.path;
        if (!this.isValidPath(pos)) return;

        heap.insert(
            pos,
            pathCost,
            this.getHeuristic(pos),
            path
        );
        this.createPathTile(pos, "#69859c");
    }
    // rgba(255, 255, 0, 0.5)
    createPathTile(pos, color = "#FADA5E") {
        const pathTiles = this.pathTiles;
        if (!pathTiles[pos.x]) pathTiles[pos.x] = {};
        pathTiles[pos.x][pos.y] = new Tile(
            new Vector2(pos.x, pos.y),
            "path",
            getElapsedTime(),
            color
        );
    }

    update(dtSec, elapsedTimeSec) {
        if (!this.isSearching) return;

        const pathsTiles = this.pathTiles;

        for (const gridX of Object.keys(pathsTiles)) {
            for (const gridY of Object.keys(pathsTiles[gridX])) {
                pathsTiles[gridX][gridY].update(dtSec, elapsedTimeSec);
            }
        }
    }

    getHeuristic(pos) {
        let minHeuristic = -1;

        for (const gridX of Object.keys(this.mapData.goals)) {
            for (const gridY of Object.keys(this.mapData.goals[gridX])) {
                const dist = this.getDist(pos, new Vector2(gridX, gridY));
                if (minHeuristic === -1 || dist < minHeuristic) {
                    minHeuristic = dist;
                }
            }
        }

        return minHeuristic;
    }

    getDist(posA, posB) {
        return Math.abs(posA.x - posB.x) + Math.abs(posA.y - posB.y);
    }

    render() {
        if (!this.isSearching) return;
        const pathsTiles = this.pathTiles;

        for (const gridX of Object.keys(pathsTiles)) {
            for (const gridY of Object.keys(pathsTiles[gridX])) {
                pathsTiles[gridX][gridY].render();
            }
        }

        this.renderFinalPath();
        this.pathRenderer.render();
    }

    renderFinalPath() {
        const PATH_WIDTH = TILE_SIZE / 3;
        const PATH_COLOR = "#C3B1E1"
        const finalPath = this.finalPath;
        const pathLength = finalPath.length;
        if (finalPath.length === 0) return;

        for (let i = 0; i < pathLength - 1; i++) {
            const startPoint = new Vector2(
                finalPath[i].x * TILE_SIZE + MAP_OFFSET.x + TILE_SIZE / 2,
                finalPath[i].y * TILE_SIZE + MAP_OFFSET.y - TILE_SIZE / 2,
            );

            const endPoint = new Vector2(
                finalPath[i + 1].x * TILE_SIZE + MAP_OFFSET.x + TILE_SIZE / 2,
                finalPath[i + 1].y * TILE_SIZE + MAP_OFFSET.y - TILE_SIZE / 2,
            );

            this.tools.drawLine(startPoint, endPoint, PATH_COLOR, PATH_WIDTH);

            this.tools.drawCircle(
                {
                    x: finalPath[i].x * TILE_SIZE + MAP_OFFSET.x + TILE_SIZE / 2,
                    y: finalPath[i].y * TILE_SIZE + MAP_OFFSET.y - TILE_SIZE / 2,
                },
                PATH_WIDTH / 2,
                PATH_COLOR);
        }

    }

    isValidPath(gridIndex) {
        const mapData = this.mapData;
        const pathTiles = this.pathTiles;
        const wallTiles = this.mapData.tileData;

        if (wallTiles[gridIndex.x] && wallTiles[gridIndex.x][gridIndex.y]) return false;
        if (pathTiles[gridIndex.x] && pathTiles[gridIndex.x][gridIndex.y]) return false;

        const inBounds = (
            !(gridIndex.x < 0) &&
            !(gridIndex.y < 0) &&
            gridIndex.x < mapData.width &&
            gridIndex.y < mapData.height
        );

        return inBounds;
    }
}