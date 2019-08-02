let memes = [
    'very database',
    'such create',
    'wow',
    'much store',
    'wow',
    'very happen',
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
            randomX: '45%'
        }

        newBubble.meme = bestMeme()
        newBubble.type = ev.type
        newBubble.showEvent = true
        newBubble.randomX = Math.random().toFixed(2) * 92 + '%'
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
