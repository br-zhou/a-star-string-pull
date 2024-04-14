import { useState } from "react";
import { useSelector } from "react-redux";
import SettingsModal from "./Settings/SettingsModal";
import TutorialModal from "./TutorialModal";

const Menubar = () => {
    const GITHUB_URL = "https://github.com/br-zhou/path-finder-react";
    const isSearching = useSelector(state => state.isSearching);

    const [settingsModal, setSettingsModal] = useState(false);
    const [tutorialModal, setTutorialModal] = useState(false);

    const openSettings = () => {
        setSettingsModal(true);
    }

    const openTutorial = () => {
        setTutorialModal(true);
    }

    return !isSearching && (<>
        <SettingsModal open={settingsModal} setOpen={setSettingsModal} />
        <TutorialModal open={tutorialModal} setOpen={setTutorialModal} />
        <div id="top-right">
            <a href={GITHUB_URL} target="_blank">
                <button className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded mx-2 select-none"> Source Code </button>
            </a>
            <button className="bg-gray-300 hover:bg-gray-500 text-black hover:text-white font-bold py-2 px-4 rounded mx-2 select-none" onClick={openTutorial}>Controls 🎮</button>
            <button className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mx-2 select-none" onClick={openSettings}>Settings ⚙️</button>
        </div>
    </>)
}

export default Menubar;