function playPageTurn() {
  	var flip = new Audio(require('../assets/sounds/myst158.wav'))
  	flip.volume = flip.volume * 0.15
  	flip.play()
}

function playScrollOpen() {
    var flip = new Audio(require('../assets/sounds/scroll.wav'))
    flip.volume = flip.volume * 0.15
    flip.play()
}

function playBookClose() {
    var flip = new Audio(require('../assets/sounds/book.wav'))
    flip.volume = flip.volume * 0.15
    flip.play()
}

function playDogeBark() {
    var bark = new Audio(require('../assets/sounds/bark3.wav'))
    bark.volume = bark.volume * 0.3
    bark.play()
}

function playBarkPing() {
    var ping = new Audio(require('../assets/sounds/echo.wav'))
    ping.volume = ping.volume * 0.6
    var bark = new Audio(require('../assets/sounds/bark3.wav'))
    bark.volume = bark.volume * 0.3
    ping.play()
    bark.play()
}

function playSqaWink() {
    var cachunk = new Audio(require('../assets/sounds/myst186.wav'))
    cachunk.volume = cachunk.volume * 0.15
    cachunk.play()
}

function playCaChunk() {
    var cachunk = new Audio(require('../assets/sounds/myst59.wav'))
    cachunk.volume = cachunk.volume * 0.15
    cachunk.play()
}

function playTwinkleDown() {
    var twinkle = new Audio(require('../assets/sounds/chrono07.wav'))
    twinkle.volume = twinkle.volume * 0.15
    twinkle.play()
}

function playTwinkleUp() {
    var twinkle = new Audio(require('../assets/sounds/chrono06.wav'))
    twinkle.volume = twinkle.volume * 0.15
    twinkle.play()
}

function playPortalTransit() {
    var link = new Audio(require('../assets/sounds/portal.wav'))
    link.volume = link.volume * 0.15
    link.play()
}

function playPortalBlocked() {
    var bzz = new Audio(require('../assets/sounds/myst89.wav'))
    bzz.volume = bzz.volume * 0.15
    bzz.play()
}

function playTickMark() {
    var tchk = new Audio(require('../assets/sounds/tickmark.wav'))
    tchk.volume = tchk.volume * 0.45
    tchk.play()

}

function playSailUnfurl() {
    var fulap = new Audio(require('../assets/sounds/shipcreation.wav'))
    fulap.volume = fulap.volume * 0.15
    fulap.play()

}

function playBoatCapsize() {
    var sploosh = new Audio(require('../assets/sounds/shipdeathsplash.wav'))
    sploosh.volume = sploosh.volume * 0.075
    sploosh.play()
}

function playChunkSwap() {
    var sploosh = new Audio(require('../assets/sounds/turnip.wav'))
    sploosh.volume = sploosh.volume * 0.15
    sploosh.play()
}

export default {
    playPageTurn,
    playScrollOpen,
    playBookClose,
    playDogeBark,
    playBarkPing,
    playSqaWink,
    playCaChunk,
    playTwinkleDown,
    playTwinkleUp,
    playPortalTransit,
    playTickMark,
    playSailUnfurl,
    playBoatCapsize,
    playChunkSwap,
}