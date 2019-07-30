
const states = ["boat", "badge", "bounty", "timecube"]

const state = {
    mode: "boat"
}

const mutations = {
    setMode(state, index){
        console.log("set mode called", {state, index})
        state.mode = states[index]
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
