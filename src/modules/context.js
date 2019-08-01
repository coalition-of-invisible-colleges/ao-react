
const modes = ["boat", "badge", "bounty", "timecube"]
const payments = ["bitcoin", "lightning"]


const state = {
    parent: [],
    panel: [],
    top: 0
}

const mutations = {
    setParent(state, p){
        state.parent = p
        console.log("parent set?", state)
    },
    setPanel(state, px, i){
        console.log("trying to set i: ", i)
        state.panel = px
        state.top = i | 0
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
