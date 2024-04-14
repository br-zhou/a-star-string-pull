const TutorialModal = (props) => {
    const open = props.open;

    const closeModal = () => {
        if (props.setOpen) props.setOpen(false);
    }

    return open && <div className="relative z-20" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 transition-opacity backdrop-blur-sm"></div>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto" onClick={closeModal}>
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">CONTROLS:</h3>
                            <div className="mt-2">
                                <p className="text-gray-500">Hold <strong>right click</strong> to pan around!</p>
                                <br></br>
                                <p className="text-gray-500">Use the <strong>left click</strong> to paint!</p>
                                <br></br>
                                <p className="text-gray-500">Search Requires:</p>
                                <ul>
                                    <li> - a <strong>start tile</strong></li>
                                    <li> - at least <strong>one goal tile</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                            onClick={closeModal}
                        >
                            OKAY
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default TutorialModal;