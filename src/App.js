import { useEffect } from "react";
import { Editor } from "./game/editor.js";
import Toolbar from "./Components/Toolbar.js";
import HotBar from "./Components/Hotbar.js";
import Modal from "./Components/Modal.js";
import Menubar from "./Components/Menubar.js";


function App() {
  useEffect(() => {
    void new Editor();
  }, []);

  console.log("PAGE RENDER");

  return (
    <>
      <Toolbar />
      <Modal />
      <Menubar />
      <HotBar />
    </>
  );
}

export default App;
