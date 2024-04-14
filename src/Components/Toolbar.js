import ToolbarBtn from "./ToolBtn";
import store from "../store/redux";

const Toolbar = () => {

    const clickHandler = (mode) => {
        console.log(mode);
        store.dispatch({ type: "brushType", value: mode });
    }

    return <div id="left-bar">
        <ToolbarBtn mode="brush" text="🖌️ Brush" click={clickHandler} />
        <ToolbarBtn mode="eraser" text="❌ Eraser" click={clickHandler} />
        <ToolbarBtn mode="start" text="🚀 Start" click={clickHandler} />
        <ToolbarBtn mode="goal" text="🚩 Goal" click={clickHandler} />
    </div>;
}

export default Toolbar;