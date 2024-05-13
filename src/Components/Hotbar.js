import { useSelector } from "react-redux";
import store from "../store/redux";

const HotBar = () => {
    const isSearching = useSelector(state => state.isSearching);

    const clearMap = () => {
        if (isSearching) return;
        store.dispatch({ type: "clear-map" });
    }

    const toggleSearch = () => {
        store.dispatch({ type: "toggle-search" });
    }

    const getSearchBtnColor = () => isSearching ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700";

    return <div id="bot-right">
        {!isSearching && <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2 select-none" onClick={clearMap}>CLEAR MAP ❌</button>}
        <button className={`${getSearchBtnColor()} text-white font-bold py-2 px-4 mx-2 rounded select-none`} onClick={toggleSearch}>
            {isSearching ? "CANCEL SEARCH" : "START SEARCH ⭐"}
        </button>
    </div>
}

export default HotBar;