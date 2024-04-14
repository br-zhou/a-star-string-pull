import store from "../../store/redux";
import { getElapsedTime } from "./animationLoop";
import { Tile } from "./tile";
import { TILE_SIZE, MAP_OFFSET } from "./tileMap";

const TILE_SPAWN_ANIMATION_TIME = 0.125;

export class CircleTile extends Tile {
    constructor(gridPos, type, creationTime, color="#000000") {
        super(gridPos, type, creationTime, color);
        this.gridPos = gridPos;
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
        this.tools.drawCircle(
            {
                x: this.gridPos.x * TILE_SIZE + MAP_OFFSET.x + TILE_SIZE / 2,
                y: this.gridPos.y * TILE_SIZE + MAP_OFFSET.y - TILE_SIZE / 2,
            },
            this.renderedTileSize / 2 * 0.9,
            this.color
        );
    }

    delete() {
        this.deleted = true;
        this.createdAt = getElapsedTime();
        this.animationFinished = false;
    }

}