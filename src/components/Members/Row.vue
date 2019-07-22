<template lang='pug'>

.memberrow
      .row
        .four.grid
            img(v-if='isLoggedIn', src='../../assets/images/loggedIn.svg')
            img(v-else, src='../../assets/images/loggedOut.svg')
            label {{ m.name }} -
                br
                span(v-for='g in rowsGuilds')
                    router-link.yellowtx(:to='"/task/" + g.taskId') {{ g.guild }}
        .one.grid
            img.btn.dogepepecoin.spinslow(:class="{ungrabbedcoin : !isVouched}" src='../../assets/images/dogepepecoin.png' @click='toggleGrab')
            p.hodlcount() {{ b.deck.length }}
        .seven.grid
            priorities(:taskId='m.memberId')
            router-link.fw(:to='"/task/" + m.memberId')
                img.viney(src='../../assets/images/vinebtn.svg')
</template>


<script>

import DctrlActive from './DctrlActive'
import Badges from './Badges'
import Addr from './Addr'
import PreviewDeck from '../Deck/PreviewDeck'
import Priorities from '../Deck/Priorities'

export default {
    props: ['m'],
    components: {DctrlActive, Badges, Addr, PreviewDeck, Priorities},
    computed:{
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
        isVouched(){
            let memberCard = this.$store.getters.hashMap[this.m.memberId]
            return memberCard.deck.indexOf( this.$store.getters.member.memberId ) > -1
        },

    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'

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
  position: absolute
  left: calc(50% - 17.5px)
  bottom: 0.75em
  cursor: pointer
}

.hodlcount {
    position: absolute
    left: calc(50% - 17.5px)
    text-align: center
    width: 35px
    bottom: calc(0.75em + 9px)
    padding-bottom: 0
    margin-bottom: 0
    font-weight: bold
    color: rgba(255, 255, 255, 0.75)
    pointer-events: none
}

.ungrabbedcoin {
    opacity: 0.3
}

</style>
