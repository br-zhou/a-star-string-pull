import store from "../../store/redux";
import { getElapsedTime } from "./animationLoop";
import { CanvasTools } from "./canvasTools";
import { TILE_SIZE, MAP_OFFSET } from "./tileMap";

const TILE_SPAWN_ANIMATION_TIME = 0.125;

export class Tile {
    constructor(gridPos, type, creationTime, color="#000000") {
        this.gridPos = gridPos;
        this.type = type;
        this.createdAt = creationTime;
        this.tools = new CanvasTools();
        this.renderedTileSize = 0;
        this.animationFinished = false;
        this.deleted = false;
        this.color = color;
    }

    update(dtSec, elapsedTimeSec) {
        if (this.animationFinished) return;

        if (elapsedTimeSec - this.createdAt > TILE_SPAWN_ANIMATION_TIME) {
            this.e = true;

            if (!this.deleted) {
                this.renderedTileSize = TILE_SIZE;
            } else {
                store.dispatch({
                    type: "delete-tile",
                    x: this.gridPos.x,
                    y: this.gridPos.y,
                });
            }
        } else {
            if (!this.deleted) {
                // spawn animation
                this.renderedTileSize = Math.min(
                    (TILE_SIZE * (elapsedTimeSec - this.createdAt)) / TILE_SPAWN_ANIMATION_TIME,
                    TILE_SIZE
                );
            } else {
                // delete animation
                this.renderedTileSize = Math.max(
                    TILE_SIZE - (TILE_SIZE * (elapsedTimeSec - this.createdAt)) / TILE_SPAWN_ANIMATION_TIME,
                    0
                );
            }
        }

    }

    render() {
        this.tools.drawRect(
            {
                x: this.gridPos.x * TILE_SIZE + MAP_OFFSET.x,
                y: this.gridPos.y * TILE_SIZE + MAP_OFFSET.y,
            },
            this.renderedTileSize,
            this.renderedTileSize,
            this.color
        );
    }

    delete() {
        this.deleted = true;
        this.createdAt = getElapsedTime();
        this.animationFinished = false;
    }

}