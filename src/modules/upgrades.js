const modes = ["boat", "badge", "bounty", "timecube"]
const payments = ["bitcoin", "lightning"]
const dimensions = ["time", "space", "replication"]

const state = {
    mode: "boat",
    payment: false,
    dimension: false
}

const mutations = {
    nextMode(state) {
        let currentIndex = modes.indexOf(state.mode)
        let nextIndex = (currentIndex + 1) % modes.length
        state.mode = modes[nextIndex]
    },
    previousMode(state) {
        let currentIndex = modes.indexOf(state.mode)
        let prevIndex = (currentIndex <= 0) ? (modes.length - 1) : (currentIndex - 1)
        state.mode = modes[prevIndex]
    },
    setMode(state, index) {
        state.mode = modes[index]
    },
    closeUpgrades(state) {
        state.mode = false
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
}

const actions = {}
const getters = {}

export default {
    state,
    mutations,
    actions,
    getters,
}
