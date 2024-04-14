let elapsedTimeSec = 0;

export function getElapsedTime() {
  return elapsedTimeSec;
}

/**
 * Starts an animation loop and calls callback every frame
 * @param {function(number, number)} callback loop function that is called every frame.
 * Passes dtSec and elapsedTimeSec to callback
 */
export function startLoop(callback) {
  let lastFrameElapsedTimeMillis = 0;

  function loop(elapsedTimeMillis) {
    elapsedTimeSec = elapsedTimeMillis / 1000;
    let dtSec = (elapsedTimeMillis - lastFrameElapsedTimeMillis) / 1000;
    
    const maxDt = 0.1;
    if (dtSec > maxDt) dtSec = maxDt;
    
    callback(dtSec, elapsedTimeSec);

    lastFrameElapsedTimeMillis = elapsedTimeMillis;
    window.requestAnimationFrame(loop);
  }

  loop(0); // starts loop, with Elapsed time = 0
}
