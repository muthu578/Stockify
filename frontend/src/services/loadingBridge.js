// This is a simple bridge to allow non-React files (like api.js) 
// to trigger the loading state in the LoadingContext.

let startLoadingCallback = () => {};
let stopLoadingCallback = () => {};

export const loadingBridge = {
    start: () => startLoadingCallback(),
    stop: () => stopLoadingCallback()
};

export const registerLoadingCallbacks = (start, stop) => {
    startLoadingCallback = start;
    stopLoadingCallback = stop;
};
