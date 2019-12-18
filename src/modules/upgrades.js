import Vue from 'vue'

const modes = ["doge", "boat", "badge", "chest", "timecube"]
const payments = ["bitcoin", "lightning"]
const dimensions = ["time", "space", "replication"]

const state = {
    mode: modes[0],
    payment: false,
    dimension: false,
    bird: false,
    stacks: 1,
    warp: -1,
    highlights: {},
    sierpinski: true,
    barking: false,
    pinging: false,
}

const mutations = {
    toggleBird(state){
        state.bird = !state.bird
    },
    toggleStacks(state){
        if(state.stacks === 5) {
            state.stacks = 1
        } else {
            state.stacks = 5
        }
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
    },
    toggleHighlight(state, args) {
        let valence = args.valence
        let memberId = args.memberId
        console.log("upgrades togglehighlight")
        if(state.highlights.hasOwnProperty(memberId) && (state.highlights[memberId] === valence || valence === true)) {
            console.log("removing highlight")
            Vue.delete(state.highlights, memberId)
        } else {
            console.log("setting highlight")
            Vue.set(state.highlights, memberId, valence)
        }
    },
    toggleSierpinski(state, primed) {
        state.sierpinski = !state.sierpinski
    },
    bark(state) {
        state.barking = true
        state.pinging = true
        setTimeout(()=> {
            state.barking = false
        }, 1000)
        setTimeout(()=> {
            state.pinging = false
        }, 2000)
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
