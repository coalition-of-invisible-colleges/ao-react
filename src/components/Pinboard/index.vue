<template lang='pug'>

#wrex
    .intro(v-if='!$store.getters.isLoggedIn')
        home
    .pinboard(v-else)
        .row
            .eight.columns
                card-panel(:c='guilds')
                members
            .four.columns
                img.fw(src='../../assets/images/buddadoge.svg')
    img.fw(src='../../assets/memes/Spiderman.jpg')
</template>

<script>

import request from "superagent"
import Hypercard from "../Card"
import BountyCard from "../Bounties/BountyCard"
import SharedTitle from '../slotUtils/SharedTitle'
import CrazyBtn from '../slotUtils/CrazyBtn'
import calculations from '../../calculations'
import Guild from './Guild'
import TaskCreate from '../forms/TaskCreate'
import WhyLightning from '../Nodes/WhyLightning'
import PreviewDeck from '../Deck/PreviewDeck'
import Home from '../Home'
import CardPanel from '../Deck/CardPanel'
import Calendar from '../MemberCalendar'
import Members from '../Members'

export default {
  data(){
      return { }
  },
  computed: {
      guilds(){
          return this.$store.getters.guilds.slice().sort((a, b) => {
              let aVal = a.deck.length
              let bVal = b.deck.length
              return aVal < bVal
          })
      },
      // bounties(){
      //     return this.$store.getters.bounties.slice().sort((a, b) => {
      //         let aVal = parseInt( calculations.calculateTaskPayout(a) )
      //         let bVal = parseInt( calculations.calculateTaskPayout(b) )
      //         return aVal < bVal
      //     })
      // },
  },
  components:{
      SharedTitle,
      Hypercard,
      CrazyBtn,
      BountyCard,
      Guild,
      TaskCreate,
      WhyLightning,
      PreviewDeck,
      Home,
      CardPanel,
      Calendar,
      Members,
  },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'
@import '../../styles/button'

#wrex
    width: 100%

.fw
    width: 100%
    height: auto
    opacity: 0.45

#gift
    display: inline
    height: 3em
    clear: none

#rotate
    float: right
    height: 3em

#sundogepurp
    width:100%
    max-height:auto

#dctrlverse
    width:100%
    max-height:auto

button
    margin: .55em

p
    padding: 1.4em
    font-size: 1.4em

.priorities
    color: red

.guilds
    color: green

.titleimg


h2
    display: inline
    clear: none

.nextg
    cursor: pointer

.fr
    float: right

.fl
    float: left

.arrow
    height: 3.35em

.accept, .dontaccept
    background: accent5
    padding: .789em
    border-style: none
    img
        background: white
        padding: .1em
        border-radius: 3px


.columns p
    font-size: .99em
    color: accent2

</style>
