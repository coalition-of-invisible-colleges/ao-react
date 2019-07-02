<template lang='pug'>

#wrex
    .intro(v-if='!$store.getters.isLoggedIn')
        home
    .pinboard(v-else)
        .row
            .seven.columns
                div(@click='cycleGuilds').bluewx
                    h1 {{ showGuild + 1 }} of {{ $store.getters.pubguilds.length }}
                        img.fr(src='../../assets/images/right.svg')
                hypercard(:b='$store.getters.pubguilds[showGuild]')
                div.space
                row(v-for="m in $store.getters.recentMembers.slice(0,7)", :m="m")
                router-link(to='/members/') see all
            .five.columns
                calendar(:inId='$store.getters.pubguilds[showGuild].taskId')
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
import Calendar from '../TaskCalendar/Calendar'
import Members from '../Members'
import Row from '../Members/Row'

export default {
  components:{
      Row,
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
  data(){
      return {
          showGuild: 0
      }
  },
  methods:{
      cycleGuilds(){
          console.log('cycling')
          this.showGuild = (this.showGuild + 1) % this.$store.getters.pubguilds.length
      }
  }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'
@import '../../styles/button'

.space
    height: 1.1em

 h1
  cursor: pointer
  text-align: center
  color: main
  img
    height: 2em

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

.fw
    width: 100%

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
