<template lang='pug'>

.memberrow(@dblclick='goIn(m.memberId)'  :key='m.memberId')
    .row
        .three.grid
            img(v-if='isLoggedIn', src='../../assets/images/loggedIn.svg')
            img(v-else, src='../../assets/images/loggedOut.svg')
            label(:class='{redtx: m.active < 0}') {{ m.name }}
                br
                span(v-for='g in rowsGuilds')
                    router-link.yellowtx(:to='"/task/" + g.taskId'  @click='goIn(g.taskId)') {{ g.guild }} -
        .two.grid(v-if='!hasAnyVouches  &&  $router.currentRoute.path === "/dash" || isSlayer')
            img.btn.goldengun(src='../../assets/gifs/golden_gun.gif' @click='purgeAccount')
        .one.grid
            img.btn.dogepepecoin.spinslow(:class="{ungrabbedcoin : !isVouched, nopointer: m.memberId === $store.getters.member.memberId }" src='../../assets/images/dogepepecoin.png' @click='toggleGrab')
            p.hodlcount(:class="{grabbedhodlcount: isVouched > 0}") {{ b.deck.length }}
            span.counts.iceblue(v-if='$router.currentRoute.path === "/dash"') {{ vouchCount }}
        .grid(:class='{ seven: $router.currentRoute.path === "/dash" || hasAnyVouches, five: !hasAnyVouches }')
            simple-priorities(:taskId='m.memberId')
        .grid.one
            preview-deck(:task='$store.getters.hashMap[m.memberId]')
            img.viney.faded(src='../../assets/images/vinebtn.svg'  @click='goIn(m.memberId)')
</template>


<script>

import DctrlActive from './DctrlActive'
import Badges from './Badges'
import Addr from './Addr'
import PreviewDeck from '../Deck/PreviewDeck'
import SimplePriorities from '../Deck/SimplePriorities'
import SoundFX from '../../modules/sounds'

export default {
    props: ['m'],
    components: {DctrlActive, Badges, Addr, PreviewDeck, SimplePriorities},
    methods:{
        goIn(taskId){
            SoundFX.playPageTurn()
            let panel = [taskId]
            let parents = [  ]
            let top = 0

            if (this.$store.getters.contextCard.taskId){
                parents.push(this.$store.getters.contextCard.taskId)
            } else if (this.$store.getters.memberCard.taskId){
                parents.push(this.$store.getters.memberCard.taskId)
            }

            this.$store.dispatch("goIn", {
                parents,
                top,
                panel
            })

            // this.$router.push("/task/" + this.b.taskId)
        },
        toggleGrab(){
            if (this.isVouched) {
                this.$store.dispatch("makeEvent", {
                    type: 'task-dropped',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                })
            } else {
                this.$store.dispatch("makeEvent", {
                    type: 'task-grabbed',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                    })
            }
        },
        purgeAccount(){
            this.$store.dispatch("makeEvent", {
                type: 'member-purged',
                memberId: this.m.memberId,
            })
       }
    },
    computed:{
        isSlayer(){
            let routeSplit =  this.$router.currentRoute.path.split("/")
            console.log({routeSplit})
            return routeSplit[2] === 'slayer'
        },
        isLoggedIn(){
            let isLoggedIn
            this.$store.state.sessions.forEach( s => {
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
        vouchCount(){
            let vouchCount = this.$store.getters.membersVouches.find(c => c.memberId === this.m.memberId)
            if(!vouchCount) return 0
            return vouchCount.count
        },
        vouchRatio(){
            let ratio = this.vouchCount / this.b.deck.length
            if(this.b.deck.length <= 0 && this.vouchCount > 0) return '-∞'
            else if(this.vouchCount === 0) return '0'
            else return ratio.toFixed(2)
        }
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

.faded
    opacity: 0.235654

.faded:hover
    opacity: 1

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

.grabbedhodlcount {
    color: white
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

.counts {
    position:relative
    top: 0
}

.iceblue
    color: #6ff
    text-align: center
    font-weight: bold
    margin-right: 2em
</style>
