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

  const importMap = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.id = "map-upload";

    fileInput.click();

    fileInput.onchange = () => {
      const fileReader = new FileReader();

      fileReader.onload = () => {
        const mapData = fileReader.result;

        store.dispatch({
          type: "load-map",
          mapData: JSON.parse(mapData),
        });
        fileInput.remove();
      };

      fileReader.readAsText(fileInput.files[0]);
    };
  };


  const exportMap = () => {
    const { mapData } = store.getState();
    delete mapData.start;
    delete mapData.goal;

    const file = new Blob([JSON.stringify(mapData)], {
      type: "application/json",
    });

    let url = window.URL.createObjectURL(file);

    let anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "map.json";

    anchor.click();

    window.URL.revokeObjectURL(url);

    anchor.remove();
  };
  const getSearchBtnColor = () => isSearching ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700";

  return <div id="bot-right">
    {!isSearching && <button className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded mx-2 select-none" onClick={importMap}>IMPORT MAP 📦</button>}
    {!isSearching && <button className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded mx-2 select-none" onClick={exportMap}>EXPORT MAP 📤</button>}
    {!isSearching && <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2 select-none" onClick={clearMap}>CLEAR MAP ❌</button>}
    <button className={`${getSearchBtnColor()} text-white font-bold py-2 px-4 mx-2 rounded select-none`} onClick={toggleSearch}>
      {isSearching ? "CANCEL SEARCH" : "START SEARCH ⭐"}
    </button>
  </div>
}

export default HotBar;