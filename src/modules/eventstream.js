let memes = [
    'very database',
    'such create',
    'wow',
    'much store',
    'wow',
    'very happen',
]

let colors = [
    'white',
    'red',
    'maroon',
    'yellow',
    'olive',
    'lime',
    'green',
    'aqua',
    'teal',
    'blue',
    'navy',
    'fuchsia',
    'purple',
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

        newBubble.meme = bestMeme()
        newBubble.type = ev.type
        newBubble.showEvent = true
        newBubble.randomX = Math.random().toFixed(2) * 92 + '%'
        for(let i = 0; i < 2; i++) newBubble.randomColors.push(colors[Math.floor(Math.random() * colors.length)])
        for(let i = 0; i < 2; i++) newBubble.randomXs.push(Math.floor(Math.random() * 100) + '%')
        for(let i = 0; i < 2; i++) newBubble.randomYs.push(Math.floor(Math.random() * 100) + '%')
        //newBubble.wiggleFactor = Math.random().toFixed(2) * 10

        state.push(newBubble)
    },
    hide(state){
        state[0].showEvent = false
        state.shift()
    }
}

const actions = {
    displayEvent({commit}, ev){
        commit('show', ev)
        setTimeout(()=>{
            commit('hide')
        }, 4567)
    }
}

export default {
  state,
  mutations,
  actions
}
