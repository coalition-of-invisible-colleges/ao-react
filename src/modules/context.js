
const modes = ["boat", "badge", "bounty", "timecube"]
const payments = ["bitcoin", "lightning"]


const state = {
    parent: [],
    panel: ['f995aa70-92d7-11e9-a780-3572d50243e1'],
    top: 0
}

const mutations = {
    setParent(state, p){
        state.parent = p
        console.log("parent set?")
    },
    setPanel(state, px){
        state.panel = px
        console.log("panel set?")
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
    addParent(state, pId){
        state.parent.push(pId)
        console.log("parent pushed")
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
