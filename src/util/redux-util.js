export const deleteAllTilesOutsideRange = (state, { x, y }) => {

    if (state.mapData.start) {
        const startPos = state.mapData.start;
        if (startPos.x >= x || startPos.y >= y) {
            state.mapData.start = null;
        } else {
            console.log(startPos);
        }
    }

    if (state.mapData.goal) {
        const goalPos = state.mapData.goal;
        if (goalPos.x >= x || goalPos.y >= y) {
            state.mapData.goal = null;
        } else {
            console.log(goalPos);
        }
    }

    //clear map
    for (const gridX of Object.keys(state.mapData.tileData)) {
        for (const gridY of Object.keys(state.mapData.tileData[gridX])) {
            if (gridX >= x || gridY >= y) delete state.mapData.tileData[gridX][gridY];
        }
    }
}