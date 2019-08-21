<template lang='pug'>

#wrex
    .pinboard
        auth(v-if='!$store.getters.isLoggedIn')
        div(v-if='$store.state.upgrades.mode == "boat"')
            .centered
                .guildname(v-for='(t, i) in $store.getters.pubguilds'  @click='selectGuild(i)'  :class='{ greentx: i === showGuild, post: i === $store.getters.pubguilds.length - 1 }') {{ t.guild }}
            hypercard.gutter(v-if='$store.getters.pubguilds[showGuild] && $store.state.upgrades.mode == "boat"'  :b='$store.getters.pubguilds[showGuild]'  :key='resetKey'  :c='pubGuildIds')
        row(v-else-if='$store.state.upgrades.mode == "badge"'  v-for="m in $store.getters.recentMembers.slice(0, 7)", :m="m")
        p(v-else-if='$store.state.upgrades.mode == "bounty"') <em>bounties zone coming soon</em>
        calendar(v-else-if='$store.getters.pubguilds[showGuild] && $store.state.upgrades.mode == "timecube"'  :inId='$store.getters.pubguilds[showGuild].taskId')
        div(v-else)
          img.wallpaper(src='../../assets/images/wow_much_wallpaper.jpg')
          img.buddadoge(src='../../assets/images/buddadoge.svg')
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
    
.gutter
    margin: 0 20%
    
.centered
    text-align: center
    
.post
    margin-right: 0

@keyframes nlpDoge
    0% { width: 24em; margin-left: -12em; margin-top: -6.75em; opacity: 0.68}
    100% { width: 240em; margin-left: -55em; margin-top: -85em; opacity: 0 }

.wallpaper
    position: fixed
    width: 240em
    top: 29%
    left: 50%
    margin-left: -55em
    margin-top: -85em
    opacity: 0
    animation-name: nlpDoge
    animation-duration: 322s
    transition-timing-function: ease-in
    transition-property: width, margin-left, margin-top, opacity
    z-index: -15
    border-radius: 50px

@keyframes abide
  0% { opacity: 0 }
  99.667% { opacity: 0 }
  100% { opacity: 0.5 }
  
.buddadoge
    position: fixed
    width: 16em
    top: 50%
    left: 50%
    margin-left: -8em
    margin-top: -16em
    opacity: 0.5
    animation-name: abide
    animation-duration: 300s
    transition-timing-function: ease
    transition-property: opacity
    z-index: -15

</style>
