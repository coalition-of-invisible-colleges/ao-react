const modes = ["doge", "boat", "badge", "chest", "timecube"]
const payments = ["bitcoin", "lightning"]
const dimensions = ["time", "space", "replication"]

const state = {
    mode: modes[0],
    payment: false,
    dimension: false,
    bird: false,
    warp: -1,
}

const mutations = {
    toggleBird(state){
        state.bird = !state.bird
    },
    nextMode(state) {
        let currentIndex = modes.indexOf(state.mode)
        let nextIndex = (currentIndex + 1) % modes.length
        state.mode = modes[nextIndex]
    },
    previousMode(state) {
        let currentIndex = modes.indexOf(state.mode)
        let prevIndex = (currentIndex <= 0) ? modes.length - 1 : (currentIndex - 1)
        state.mode = modes[prevIndex]
    },
    setMode(state, index) {
        state.mode = modes[index]
    },
    closeUpgrades(state) {
        state.mode = modes[0]
    },
    setPayMode(state, index) {
        state.payment = payments[index]
    },
    closePayMode(state) {
        state.payment = false
    },
    setDimension(state, index) {
        state.dimension = dimensions[index]
    },
    closeDimension(state) {
        state.dimension = false
    },
    setWarp(state, i){
        state.warp = i
    },
    closeWarp(state){
        state.warp = -1
    }
}

const actions = {}
const getters = {}

export default {
    state,
    mutations,
    actions,
    getters,
}
