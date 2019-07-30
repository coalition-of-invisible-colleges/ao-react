
const modes = ["boat", "badge", "bounty", "timecube"]
const payments = ["bitcoin", "lightning"]


const state = {
    mode: "boat",
    payment: "lightning"
}

const mutations = {
    nextMode(state){
        let currentIndex = modes.indexOf(state.mode)
        let nextIndex = (currentIndex + 1) % modes.length
        state.mode = modes[nextIndex]
    },
    setMode(state, index){
        state.mode = modes[index]
    },
    setPayMode(state, index){
        state.payment = payments[index]
    },
    closeUpgrades(state){
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
