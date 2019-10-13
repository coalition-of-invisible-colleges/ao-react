function playPageTurn() {
  	let flip = new Audio(require('../assets/sounds/myst158.wav'))
  	flip.volume = flip.volume * 0.15
  	flip.play()
}

function playScrollOpen() {
    let flip = new Audio(require('../assets/sounds/scroll.wav'))
    flip.volume = flip.volume * 0.15
    flip.play()
}

function playBookClose() {
    let flip = new Audio(require('../assets/sounds/book.wav'))
    flip.volume = flip.volume * 0.15
    flip.play()
}

function playDogeBark() {
    let bark = new Audio(require('../assets/sounds/bark3.wav'))
    bark.volume = bark.volume * 0.3
    bark.play()
}

function playBarkPing() {
    let ping = new Audio(require('../assets/sounds/echo.wav'))
    ping.volume = ping.volume * 0.6
    let bark = new Audio(require('../assets/sounds/bark3.wav'))
    bark.volume = bark.volume * 0.3
    ping.play()
    bark.play()
}

function playSqaWink() {
    let cachunk = new Audio(require('../assets/sounds/myst186.wav'))
    cachunk.volume = cachunk.volume * 0.15
    cachunk.play()
}

function playCaChunk() {
    let cachunk = new Audio(require('../assets/sounds/myst59.wav'))
    cachunk.volume = cachunk.volume * 0.15
    cachunk.play()
}

function playTwinkleDown() {
    let twinkle = new Audio(require('../assets/sounds/chrono07.wav'))
    twinkle.volume = twinkle.volume * 0.15
    twinkle.play()
}

function playTwinkleUp() {
    let twinkle = new Audio(require('../assets/sounds/chrono06.wav'))
    twinkle.volume = twinkle.volume * 0.15
    twinkle.play()
}

function playPortalTransit() {
    let link = new Audio(require('../assets/sounds/portal.wav'))
    link.volume = link.volume * 0.15
    link.play()
}

function playPortalBlocked() {
    let bzz = new Audio(require('../assets/sounds/myst89.wav'))
    bzz.volume = bzz.volume * 0.05
    bzz.play()
}

function playTickMark() {
    let tchk = new Audio(require('../assets/sounds/tickmark.wav'))
    tchk.volume = tchk.volume * 0.45
    tchk.play()
}

function playSailUnfurl() {
    let fulap = new Audio(require('../assets/sounds/shipcreation.wav'))
    fulap.volume = fulap.volume * 0.15
    fulap.play()

}

function playBoatCapsize() {
    let sploosh = new Audio(require('../assets/sounds/shipdeathsplash.wav'))
    sploosh.volume = sploosh.volume * 0.075
    sploosh.play()
}

function playChunkSwap() {
    let sploosh = new Audio(require('../assets/sounds/turnip.wav'))
    sploosh.volume = sploosh.volume * 0.15
    sploosh.play()
}

function playBirdFlap() {
    let flutter = new Audio(require('../assets/sounds/birdsflap.mp3'))
    flutter.volume = flutter.volume * 0.4
    flutter.play()
}

function playBattleCry() {
    let roar = []
    roar.push(new Audio(require('../assets/sounds/battlecry1.wav')))
    roar.push(new Audio(require('../assets/sounds/battlecry2.wav')))
    roar.push(new Audio(require('../assets/sounds/battlecry3.wav')))
    roar.push(new Audio(require('../assets/sounds/battlecry4.wav')))
    let index = Math.floor(Math.random() * roar.length)
    roar[index].volume = roar[index].volume * 0.10
    roar[index].play()
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
    playPortalBlocked,
    playTickMark,
    playSailUnfurl,
    playBoatCapsize,
    playChunkSwap,
    playBirdFlap,
    playBattleCry,
}