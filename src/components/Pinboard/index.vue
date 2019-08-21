<template lang='pug'>

#wrex
    .pinboard
        auth(v-if='!$store.getters.isLoggedIn')
        .centered(v-if='$store.state.upgrades.mode == "boat"')
            .guildname(v-for='(t, i) in $store.getters.pubguilds'  @click='selectGuild(i)'  :class='{greentx: i === showGuild}') {{ t.guild }}
            hypercard.gutter(v-if='$store.getters.pubguilds[showGuild] && $store.state.upgrades.mode == "boat"'  :b='$store.getters.pubguilds[showGuild]'  :key='resetKey'  :c='pubGuildIds')
        row(v-else-if='$store.state.upgrades.mode == "badge"'  v-for="m in $store.getters.recentMembers.slice(0, 7)", :m="m")
        p(v-else-if='$store.state.upgrades.mode == "bounty"') <em>bounties zone coming soon</em>
        calendar(v-else-if='$store.getters.pubguilds[showGuild] && $store.state.upgrades.mode == "timecube"'  :inId='$store.getters.pubguilds[showGuild].taskId')
</template>

<script>

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
import Auth from '../Auth'

export default {
  beforeRouteEnter(to, from, next) {
        next(vm => {
            vm.setDeck()
        })
  },
  components:{
      Auth,
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
          showGuild: 0,
          resetKey: 0,
      }
  },
  methods:{
      setDeck(){
          console.log("pinboard route handle called")
          this.$store.commit("setPanel", [this.$store.getters.member.memberId])
          this.$store.commit("setTop", 0)
          this.$store.commit("setParent", [])
      },
      cycleGuilds(){
          console.log('cycling')
          if (this.$store.getters.pubguilds){
            this.showGuild = (this.showGuild + 1) % this.$store.getters.pubguilds.length
          }
      },
      selectGuild(x){
          this.showGuild = parseInt(x)
          this.resetKey ++
      }
  },
  computed: {
      pubGuildIds(){
          return this.$store.getters.pubguilds.map(g => g.taskId)
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


ol
    font-size: 1.5em
    li
        margin: .3em

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

.budda
    opacity: 0.45
    float: left
    height: 0

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

p, .link
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
    float: left
    opacity: 0.5

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

.clearboth
    clear: both

.guildname
    font-size: 1.5em
    margin-right: 1em
    display: inline
    cursor: pointer

.centered
    text-align: center
    
.gutter
    margin: 0 20%

</style>
