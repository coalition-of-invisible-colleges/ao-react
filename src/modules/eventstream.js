const _ = require( 'lodash')

let memes = [
    'very database',
    'such create',
    'wow',
    'much store',
    'wow',
    'very happen',
    'much do',
]

let colors = [
    'white',
    'red',
    'yellow',
    'lime',
    'aqua',
    'blue',
    'fuchsia',
]

function bestMeme(){
  return memes[Math.floor(Math.random()*memes.length)];
}

const state = []

const mutations = {
    show(state, ev){
        let newBubble = {
            meme: bestMeme(),
            type: "",
            showEvent: false,
            randomX: '45%',
            randomColors: [],
            randomXs: [],
            randomYs: []
        }
        _.assign(newBubble, ev)
        newBubble.meme = bestMeme()
        newBubble.showEvent = true
        newBubble.randomX = Math.random().toFixed(2) * 91 + '%'
        for(let i = 0; i < 2; i++) newBubble.randomColors.push(colors[Math.floor(Math.random() * colors.length)])
        for(let i = 0; i < 2; i++) newBubble.randomXs.push(Math.floor(Math.random() * 100) + '%')
        for(let i = 0; i < 2; i++) newBubble.randomYs.push(Math.floor(Math.random() * 100) + '%')

        state.push(newBubble)
    },
    hide(state){
        state[0].showEvent = false
        state.shift()
    }
}

const actions = {
    displayEvent({commit, getters}, ev){
        console.log("ev type is ", ev.type)
        if(!getters.member.muted && (ev.type === 'doge-barked' || ev.type === 'resource-used')) {
            commit('bark')
            return
        }
        console.log('calling show for ', ev)
        commit('show', ev)
        setTimeout(()=>{
            console.log('calling hide')
            commit('hide')
        }, 3567)
    }
}

module.exports = {
  state,
  mutations,
  actions
}
