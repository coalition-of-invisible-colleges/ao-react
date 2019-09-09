<template lang='pug'>

#wrex
    .pinboard
        div(v-if='$store.state.upgrades.mode == "boat"')
            h1.up Top Missions
            .centered
                .guildname(v-for='(t, i) in $store.getters.pubguilds'  @click='selectGuild(i)'  :class='{ greentx: i === showGuild, post: i === $store.getters.pubguilds.length - 1 }') {{ t.guild }}
            hypercard.gutter(v-if='$store.getters.pubguilds[showGuild] && $store.state.upgrades.mode == "boat"'  :b='$store.getters.pubguilds[showGuild]'  :key='resetKey'  :c='pubGuildIds')
        .container(v-else-if='$store.state.upgrades.mode == "badge"')
            h1.up Much Recent
            row(v-for="m in $store.getters.recentMembers.slice(0, 7)", :m="m")
        div(v-else-if='$store.state.upgrades.mode == "bounty"')
            h1.up Bounties
            .row.pagemargins
                .columns
                    .three.columns
                        hypercard.bounty(v-for='(t, i) in getBountyColumn(0)'  :b='t'  :key='t.taskId'  :c='pubGuildIds'  @click='goIn(t)')
                    .three.columns
                        hypercard.bounty(v-for='(t, i) in getBountyColumn(1)'  :b='t'  :key='t.taskId'  :c='pubGuildIds'  @click='goIn(t)')
                    .three.columns
                        hypercard.bounty(v-for='(t, i) in getBountyColumn(2)'  :b='t'  :key='t.taskId'  :c='pubGuildIds'  @click='goIn(t)')
                    .three.columns
                        hypercard.bounty(v-for='(t, i) in getBountyColumn(3)'  :b='t'  :key='t.taskId'  :c='pubGuildIds'  @click='goIn(t)')
        .container(v-else-if='$store.state.upgrades.mode == "timecube"')
          h1.up Calendar
          .centered
              .guildname(v-for='(t, i) in $store.getters.pubguilds'  @click='selectGuild(i)'  :class='{ greentx: i === showGuild, post: i === $store.getters.pubguilds.length - 1 }') {{ t.guild }}
          calendar(:inId='$store.getters.pubguilds[showGuild].taskId')
        div(v-else)
          img.wallpaper(src='../../assets/images/wow_much_wallpaper.jpg')
          img.buddadoge(src='../../assets/images/buddadoge.svg')
        auth(v-if='!$store.getters.isLoggedIn').container
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
import Bounties from '../Bounties'

export default {
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
      Bounties,
  },
  data(){
      return {
          showGuild: 0,
          resetKey: 0,
      }
  },
  methods:{
      goIn(b){

          let panel = this.c
          if (panel && panel.length && panel.length > 0){

          } else {
              panel = [this.b.taskId]
          }

          let top = panel.indexOf(this.b.taskId)

          if (top > -1){

          } else {
              top = 0
          }

          let parents = [  ]

          if (this.$store.state.context.panel[this.$store.state.context.top]){
              parents.push(this.$store.getters.contextCard.taskId)
          }

          if (this.inId && parents.indexOf(this.inId) < 0){
              parents.push(this.inId)
          }

          this.$store.dispatch("goIn", {
              parents,
              top,
              panel
          })

          this.$router.push("/task/" + this.b.taskId)
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
      },
      getBountyColumn(index, columns = 4){
          return this.$store.getters.bounties.slice().filter( (a, i) => { return i % columns === index })
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



.bounty:hover
    border-style: dashed
    border-width: 3px
    border-color: yellow

h1
    text-align: center
    color: yellow

.space
    height: 1.1em


ol
    font-size: 1.5em
    li
        margin: .3em

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

.bounty
    margin-bottom: 2em

.pagemargins
    margin: 0 3% 0 1%
    width: 96%

.three.columns
    width: 23%
    margin-left: 2%

.up
    width: fit-content
    background: rgba(22, 22, 22, 0.8)
    border-radius: 0.5em
    margin: -1.25em auto 0.25em auto
    padding: 0.25em
    z-index: 80
</style>
