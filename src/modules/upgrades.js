const modes = ["boat", "badge", "bounty", "timecube"]
const payments = ["bitcoin", "lightning"]

const state = {
    mode: "boat",
    payment: "lightning"
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
    setPayMode(state, index) {
        state.payment = payments[index]
    },
    closeUpgrades(state) {
        state.mode = false
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
