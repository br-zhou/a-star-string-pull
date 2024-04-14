export const deleteAllTilesOutsideRange = (state, { x, y }) => {
    console.log(state);

    if (state.mapData.start) {
        const startPos = state.mapData.start.gridPos;
        if (startPos.x >= x || startPos.y >= y) {
            state.mapData.start = null;
        } else {
            console.log(startPos);
        }
    }

    //clear map
    for (const gridX of Object.keys(state.mapData.tileData)) {
        for (const gridY of Object.keys(state.mapData.tileData[gridX])) {
            if (gridX >= x || gridY >= y) delete state.mapData.tileData[gridX][gridY];
        }
    }

    for (const gridX of Object.keys(state.mapData.goals)) {
        for (const gridY of Object.keys(state.mapData.goals[gridX])) {
            if (gridX >= x || gridY >= y) {
                delete state.mapData.goals[gridX][gridY];
                if (Object.keys(state.mapData.goals[gridX]).length === 0) {
                    delete state.mapData.goals[gridX];
                }
            } 
        }
    }
}