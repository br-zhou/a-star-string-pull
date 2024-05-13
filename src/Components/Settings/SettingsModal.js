import { useRef } from "react";
import store from "../../store/redux";
import Input from "./SettingsInput";

const SettingsModal = (props) => {
    const currentState = store.getState();
    let defaultXValue = currentState.mapData.width;
    let defaultYValue = currentState.mapData.height;
    let defaultStepDelay = currentState.stepDelay;

    const gridXRef = useRef();
    const gridYRef = useRef();
    const stepDelayRef = useRef();

    const saveSettings = () => {
        try {
            const newWidth = parseInt(gridXRef.current.value);
            const newHeight = parseInt(gridYRef.current.value);
            const newDelay = parseInt(stepDelayRef.current.value);

            if (newWidth <= 0) throw "Grid width must be a postitive integer.";
            if (newHeight <= 0) throw "Grid height must be a postitive integer.";
            if (newDelay < 0) throw "Step delay cannot be negative";
            

            store.dispatch({
                type: "update-settings",
                newWidth,
                newHeight,
                newDelay
            });

            props.setOpen(false);
        } catch (e) {
            store.dispatch({
                type: "modal-msg",
                title: "ERROR",
                message: e
            });

            return;
        }

    }

    const closeModal = () => {
        if (props.setOpen) props.setOpen();
    }

    // modal code taken from https://tailwindui.com/components/application-ui/overlays/modals
    return props.open && <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm"></div>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">Settings</h3>
                            <div className="mt-2">
                                <p className="text-gray-500">Grid Size</p>
                                <Input placeholder="width" default={defaultXValue} reference={gridXRef} />
                                <Input placeholder="height" default={defaultYValue} reference={gridYRef} />

                                <p className="text-gray-500">Algorithmn Step Delay</p>
                                <Input placeholder="ms" default={defaultStepDelay} reference={stepDelayRef} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                            onClick={saveSettings}
                        >
                            Okay
                        </button>
                        <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default SettingsModal;