
const modes = ["boat", "badge", "bounty", "timecube"]
const payments = ["bitcoin", "lightning"]


const state = {
    parent: [],
    panel: ['f995aa70-92d7-11e9-a780-3572d50243e1'],
    top: 0
    // history: [] // $router ?
}

const mutations = {
    setParent(state, p){
        state.parent = p
    },
    setPanel(state, px){
        state.panel = px
        console.log("panel set?", state)
    },
    last(state){
        state.top = (this.top - 1) % state.panel.length
        if (state.top === -1) {
            state.top = state.panel.length - 1
        }
    },
    next(state){
        state.top = (state.top + 1) % state.panel.length
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
