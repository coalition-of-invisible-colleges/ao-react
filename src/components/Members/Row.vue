<template lang='pug'>

.memberrow
    .row
        .four.grid
            img(v-if='isLoggedIn', src='../../assets/images/loggedIn.svg')
            img(v-else, src='../../assets/images/loggedOut.svg')
            label(:class='{redtx: m.active <= 0}') {{ m.name }}
                br
                span(v-for='g in rowsGuilds')
                    router-link.yellowtx(:to='"/task/" + g.taskId') {{ g.guild }} -
        .two.grid(v-if='!hasAnyVouches')
            img.btn.goldengun(v-if='!hasAnyVouches' src='../../assets/gifs/golden_gun.gif' @click='purgeAccount')
        .one.grid
            img.btn.dogepepecoin.spinslow(:class="{ungrabbedcoin : !isVouched, nopointer: m.memberId === $store.getters.member.memberId }" src='../../assets/images/dogepepecoin.png' @click='toggleGrab')
            p.hodlcount() {{ b.deck.length }}
        .grid(:class='{ six: hasAnyVouches, four: !hasAnyVouches }')
            priorities(:taskId='m.memberId')
        .grid.one
            preview-deck(:task='$store.getters.hashMap[m.memberId]')
            router-link.fw(:to='"/task/" + m.memberId')
                img.viney(src='../../assets/images/vinebtn.svg')
</template>


<script>

import DctrlActive from './DctrlActive'
import Badges from './Badges'
import Addr from './Addr'
import PreviewDeck from '../Deck/PreviewDeck'
import Priorities from '../Deck/Priorities'
import request from 'superagent'

export default {
    props: ['m'],
    components: {DctrlActive, Badges, Addr, PreviewDeck, Priorities},
    methods:{
        toggleGrab(){
            if (this.isVouched) {
                request
                    .post('/events')
                    .set('Authorization', this.$store.state.loader.token)
                    .send({
                        type: 'task-dropped',
                        taskId: this.b.taskId,
                        memberId: this.$store.getters.member.memberId,
                    })
                    .end((err,res)=>{

                    })
            } else {
                request
                    .post('/events')
                    .set('Authorization', this.$store.state.loader.token)
                    .send({
                        type: 'task-grabbed',
                        taskId: this.b.taskId,
                        memberId: this.$store.getters.member.memberId,
                    })
                    .end((err,res)=>{

                    })
                if(!this.isDecked) {
                request
                    .post('/events')
                    .set('Authorization', this.$store.state.loader.token)
                    .send({
                      type: 'task-sub-tasked',
                      subTask: this.b.taskId,
                      taskId: this.$store.getters.memberCard.taskId,
                    })
                    .end((err,res)=>{

                    })
                }
            }
        },
        purgeAccount(){
            request
            .post('/events')
            .set('Authorization', this.$store.state.loader.token)
            .send({
                type: 'member-purged',
                memberId: this.m.memberId,
            })
            .end((err,res)=>{

            })
       }
    },
    computed:{
        isLoggedIn(){
            let isLoggedIn
            this.$store.state.sessions.forEach( s => {
                console.log("this.m is", this.m)
                console.log("and memberId is ", this.m.memberId)
                if ( s.ownerId === this.m.memberId ){
                    isLoggedIn = true
                }
            })
            return isLoggedIn
        },
        rowsGuilds(){
            let g = []
            this.$store.getters.pubguilds.forEach(t => {
                if (t.deck.indexOf(this.m.memberId) > -1){
                    g.push(t)
                }
            })
            return g
        },
        b(){
            return this.$store.getters.hashMap[this.m.memberId]
        },
        isVouched(){
            return this.b.deck.indexOf( this.$store.getters.member.memberId ) > -1
        },
        hasAnyVouches(){
            return this.b.deck.length > 0
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'
@import '../../styles/spinners'

img
    height: 4em

label
    font-size: 1.246em
    font-weight: normal;
    margin: 1em

.memberrow
    border-bottom: .2em dashed softGrey
    padding-bottom: .3em
    margin-bottom: .5em

.fw
    width: 100%

.viney
    float: right
    height: 1.3em

.yellowtx
    text-decoration: none

.dogepepecoin {
  width: 35px
  height: 35px
  cursor: pointer
  top: 1em
  position: relative
}

.hodlcount {
    position: relative
    top: calc(-1em + -15.5px)
    text-align: center
    width: 35px
    padding-bottom: 0
    margin-bottom: 0
    font-weight: bold
    color: rgba(255, 255, 255, 0.75)
    pointer-events: none
}

.ungrabbedcoin {
    opacity: 0.3
}

.goldengun
    cursor: pointer
    width: 100%
    height: auto
    margin-top: 1em

.nopointer
    cursor: auto
</style>
