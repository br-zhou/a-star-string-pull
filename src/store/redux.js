import { createStore } from 'redux';
import { Vector2 } from '../game/engine/vector2';
import { deleteAllTilesOutsideRange } from '../util/redux-util';

const initialState = {
    brushType: "brush",
    isSearching: false,
    mapData: {
        width: 25,
        height: 25,
        tileData: {},
        pathData: {},
        start: null,
        goal: null,
    },
    modalMsg: null,
    stepDelay: 10,
};

const WALL = 1
const WALL_BARRIER = 2

const setPathTile = (mapData, x, y, type) => {
    const pathData = mapData.pathData;
    if (!pathData[x]) pathData[x] = {};

    if (pathData[x][y] && pathData[x][y] === WALL) return; // ignore walls
    if (x < 0 || y < 0) return;
    if (x >= mapData.width * 2 || y >= mapData.height * 2) return;

    pathData[x][y] = type;
}

const isWall = (mapData, x, y) => {
    const pathData = mapData.pathData;
    return (pathData[x] && pathData[x][y] === WALL)
}

const canDeleteBarrier = (mapData, x, y) => {
    const pathData = mapData.pathData;
    if (!pathData[x] || !pathData[x][y]) return false;

    const type = pathData[x][y];

    if (type === WALL) return false;

    if (isWall(mapData, x - 1, y + 1)) return false;
    if (isWall(mapData, x + 0, y + 1)) return false;
    if (isWall(mapData, x + 1, y + 1)) return false;
    if (isWall(mapData, x + 1, y + 0)) return false;
    if (isWall(mapData, x + 1, y - 1)) return false;
    if (isWall(mapData, x + 0, y - 1)) return false;
    if (isWall(mapData, x - 1, y - 1)) return false;
    if (isWall(mapData, x - 1, y - 0)) return false;

    return true;
}

const needsBarrier = (mapData, x, y) => {
    if (isWall(mapData, x - 1, y + 1)) return true;
    if (isWall(mapData, x + 0, y + 1)) return true;
    if (isWall(mapData, x + 1, y + 1)) return true;
    if (isWall(mapData, x + 1, y + 0)) return true;
    if (isWall(mapData, x + 1, y - 1)) return true;
    if (isWall(mapData, x + 0, y - 1)) return true;
    if (isWall(mapData, x - 1, y - 1)) return true;
    if (isWall(mapData, x - 1, y - 0)) return true;

    return false;
}
const erasePathTile = (mapData, x, y, type) => {
    const pathData = mapData.pathData;
    if (!pathData[x]) return;
    if (!pathData[x][y]) return;

    if (type === WALL) {
        delete pathData[x][y];
    } else if (canDeleteBarrier(mapData, x, y)) {
        delete pathData[x][y];
    }

    if (Object.keys(pathData[x]).length === 0) delete pathData[x];
}

const reducer = (state = initialState, action) => {
    let result = { ...state };

    const tileData = result.mapData.tileData;
    const pathData = result.mapData.pathData;

    switch (action.type) {
        case "update-settings":
            result.mapData.width = action.newWidth;
            result.mapData.height = action.newHeight;
            result.stepDelay = action.newDelay;

            deleteAllTilesOutsideRange(
                result,
                {
                    x: action.newWidth,
                    y: action.newHeight
                }
            );

            return result;
        case "close-modal":
            result.modalMsg = null;
            return result;
        case "modal-msg":
            result.modalMsg = [action.title, action.message];
            return result;
        case "toggle-search":
            if (result.isSearching === false) {
                if (result.mapData.start === null) {
                    result.modalMsg = ["ERROR", "Must have starting tile for search!"];
                } else if (result.mapData.goal === null) {
                    result.modalMsg = ["ERROR", "Must have a goal tile for search!"];
                } else {
                    result.isSearching = true;
                    result.modalMsg = null;
                }
            } else {
                result.isSearching = false;
            }

            return result;
        case "clear-map":
            result.mapData.tileData = {};
            result.mapData.start = null;
            result.mapData.goal = null;
            return result;
        case "set-start":
            result.mapData.start = new Vector2(action.x, action.y);
            // result.mapData.start = new Vector2(Math.round(action.x), Math.round(action.y));
            return result;
        case "set-goal":
            result.mapData.goal = new Vector2(action.x, action.y);
            // result.mapData.goal = new Vector2(Math.round(action.x), Math.round(action.y));
            return result;
        case "load-map":
            result.mapData = action.mapData;
            return result;
        case "add-tile":
            if (!tileData[action.x]) {
                tileData[action.x] = {};
            }

            if (tileData[action.x][action.y] && tileData[action.x][action.y] === "wall") return result;

            tileData[action.x][action.y] = "wall";

            setPathTile(result.mapData, action.x * 2, action.y * 2, WALL);
            setPathTile(result.mapData, action.x * 2 + 1, action.y * 2, WALL);
            setPathTile(result.mapData, action.x * 2, action.y * 2 - 1, WALL);
            setPathTile(result.mapData, action.x * 2 + 1, action.y * 2 - 1, WALL);

            setPathTile(result.mapData, action.x * 2 - 1, action.y * 2 + 1, WALL_BARRIER);
            setPathTile(result.mapData, action.x * 2, action.y * 2 + 1, WALL_BARRIER);
            setPathTile(result.mapData, action.x * 2 + 1, action.y * 2 + 1, WALL_BARRIER);
            setPathTile(result.mapData, action.x * 2 + 2, action.y * 2 + 1, WALL_BARRIER);

            setPathTile(result.mapData, action.x * 2 + 2, action.y * 2, WALL_BARRIER);
            setPathTile(result.mapData, action.x * 2 + 2, action.y * 2 - 1, WALL_BARRIER);

            setPathTile(result.mapData, action.x * 2 + 2, action.y * 2 - 2, WALL_BARRIER);
            setPathTile(result.mapData, action.x * 2 + 1, action.y * 2 - 2, WALL_BARRIER);
            setPathTile(result.mapData, action.x * 2 + 0, action.y * 2 - 2, WALL_BARRIER);
            setPathTile(result.mapData, action.x * 2 - 1, action.y * 2 - 2, WALL_BARRIER);

            setPathTile(result.mapData, action.x * 2 - 1, action.y * 2, WALL_BARRIER);
            setPathTile(result.mapData, action.x * 2 - 1, action.y * 2 - 1, WALL_BARRIER);

            // add walk barriers

            return result;
        case "erase-tile":
            if (action.omit !== "wall") {
                if (
                    tileData[action.x] &&
                    tileData[action.x][action.y]
                ) {
                    delete tileData[action.x][action.y];
                    if (tileData[action.x].length === 0) {
                        delete tileData[action.x];
                    }
                }
            }
  
            erasePathTile(result.mapData, action.x * 2, action.y * 2, WALL);
            erasePathTile(result.mapData, action.x * 2 + 1, action.y * 2, WALL);
            erasePathTile(result.mapData, action.x * 2, action.y * 2 - 1, WALL);
            erasePathTile(result.mapData, action.x * 2 + 1, action.y * 2 - 1, WALL);

            if (needsBarrier(result.mapData, action.x * 2, action.y * 2, WALL)) setPathTile(result.mapData, action.x * 2, action.y * 2, WALL_BARRIER);
            if (needsBarrier(result.mapData, action.x * 2 + 1, action.y * 2, WALL)) setPathTile(result.mapData, action.x * 2 + 1, action.y * 2, WALL_BARRIER);
            if (needsBarrier(result.mapData, action.x * 2, action.y * 2 - 1, WALL)) setPathTile(result.mapData, action.x * 2, action.y * 2 - 1, WALL_BARRIER);
            if (needsBarrier(result.mapData, action.x * 2 + 1, action.y * 2 - 1, WALL)) setPathTile(result.mapData, action.x * 2 + 1, action.y * 2 - 1, WALL_BARRIER);


            erasePathTile(result.mapData, action.x * 2 - 1, action.y * 2 + 1, WALL_BARRIER);
            erasePathTile(result.mapData, action.x * 2, action.y * 2 + 1, WALL_BARRIER);
            erasePathTile(result.mapData, action.x * 2 + 1, action.y * 2 + 1, WALL_BARRIER);
            erasePathTile(result.mapData, action.x * 2 + 2, action.y * 2 + 1, WALL_BARRIER);

            erasePathTile(result.mapData, action.x * 2 + 2, action.y * 2, WALL_BARRIER);
            erasePathTile(result.mapData, action.x * 2 + 2, action.y * 2 - 1, WALL_BARRIER);

            erasePathTile(result.mapData, action.x * 2 + 2, action.y * 2 - 2, WALL_BARRIER);
            erasePathTile(result.mapData, action.x * 2 + 1, action.y * 2 - 2, WALL_BARRIER);
            erasePathTile(result.mapData, action.x * 2 + 0, action.y * 2 - 2, WALL_BARRIER);
            erasePathTile(result.mapData, action.x * 2 - 1, action.y * 2 - 2, WALL_BARRIER);

            erasePathTile(result.mapData, action.x * 2 - 1, action.y * 2, WALL_BARRIER);
            erasePathTile(result.mapData, action.x * 2 - 1, action.y * 2 - 1, WALL_BARRIER);

            return result;
        case "delete-tile":
            // delete walls
            if (
                tileData[action.x] &&
                tileData[action.x][action.y]
                && action.omit !== "wall"
            ) {
                delete tileData[action.x][action.y];

                if (Object.keys(tileData[action.x]).length === 0) {
                    delete tileData[action.x];
                }
            }

            return result;
        default:
            return {
                ...state,
                [action.type]: action.value
            };
    }
}

const store = createStore(reducer);

export default store;