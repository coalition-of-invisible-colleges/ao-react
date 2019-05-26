import request from 'superagent'
import uuidV1 from 'uuid/v1'
import io from 'socket.io-client'
const socket = io()

const actions = {
    loadCurrent({ commit, state, dispatch }){
        console.log('loadCurrent')
        
        socket.on('connect', ()=> {
            console.log('socket connected, emiting authentication')
            socket.emit('authentication', {
                session: state.session,
                token: state.token
            })

            socket.on('authenticated', ()=> {
                console.log('authentication rec, applying stream')
                socket.on('eventstream', ev => {
                    console.log('stream triggered c!!')
                    commit('applyEvent', ev)
                    dispatch('displayEvent', ev)
                })
            });
        });

        request
            .post('/state')
            .set("Authorization", state.token)
            .end((err, res)=>{
                if (err || !res.body) {
                    console.log("error from state load, load failed", err)
                } else {
                    commit('setCurrent', res.body)
                }
            })
    },
}

const state = {
    token: '',
    session: '',
}

const mutations = {
    setAuth(loader, auth){
        loader.token = auth.token
        loader.session = auth.session
    }
}

export default {
    state,
    mutations,
    actions
}
