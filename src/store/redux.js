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
        start: null,
        goal: null,
    },
    modalMsg: null,
    stepDelay: 10,
};

const addBarrierTile = (mapData, x, y, ) => {
    const tileData = mapData.tileData;
    if (!tileData[x]) {
        tileData[x] = {};
    }

    if (tileData[x][y] && tileData[x][y] === "wall") return; // ignore walls
    if (x < 0 || y < 0) return;
    if (x >= mapData.width || y >= mapData.height) return;
    
    tileData[x][y] = "wall-barrier";
}

const reducer = (state = initialState, action) => {
    let result = { ...state };

    const tileData = result.mapData.tileData;

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
        case "add-tile":
            if (!tileData[action.x]) {
                tileData[action.x] = {};
            }

            if (tileData[action.x][action.y] && tileData[action.x][action.y] === "wall") return result;

            tileData[action.x][action.y] = "wall";

            addBarrierTile(result.mapData, action.x, action.y + 1);
            addBarrierTile(result.mapData, action.x + 1, action.y + 1);
            addBarrierTile(result.mapData, action.x + 1, action.y);
            addBarrierTile(result.mapData, action.x + 1, action.y - 1);
            addBarrierTile(result.mapData, action.x, action.y - 1);
            addBarrierTile(result.mapData, action.x - 1, action.y - 1);
            addBarrierTile(result.mapData, action.x - 1, action.y);
            addBarrierTile(result.mapData, action.x - 1, action.y + 1);



            

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