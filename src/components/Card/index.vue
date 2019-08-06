<template lang='pug'>

.task(:class="cardInputSty"  @dblclick='goIn').dont-break-out.agedwrapper
  .agedbackground.freshpaper(v-if='cardAge < 8')
  .agedbackground.weekoldpaper(v-else-if='cardAge < 30')
  .agedbackground.montholdpaper(v-else-if='cardAge < 90')
  .agedbackground.threemontholdpaper(v-else='cardAge >= 90')
  .row
      .ten.grid
          bird(:b='b', :inId='inId')
      .two.grid
          flag(:b='b', :inId='inId')
  .tooltip
      img.claimvine(v-for='n in b.claimed'  src='../../assets/images/mark.svg')
      current.tooltiptext(v-for='memberId in b.claimed', :memberId='memberId')
  .row
    .ten.grid
        .cardhud(v-if='b.guild')
            img.smallguild(src='../../assets/images/guildwithwhitenobkgrnd.png')
            span.bold {{ b.guild }}
        .cardhud(v-if='calcVal >= 1')
            img.smallguild(src='../../assets/images/treasurechestnobkgrndwhiteD.png')
            span {{ calcVal }}
        .cardhud(v-if='cardStart')
            img.smallguild(src='../../assets/images/timecubewithwhite.png')
            span {{ cardStart.toFixed(1) }} days
        linky(:x='b.name' v-if='!dogeCard')
        div(v-if='dogeCard') {{ dogeCard.name }}
    .two.grid
        preview-deck(:task='b')
  priorities(v-if='b.guild && $router.currentRoute.path.split("/")[2] != b.taskId', :taskId="b.taskId", :inId='b.taskId')
  passed(:b='b')
  .row
      scroll.faded(:b='b', :inId='inId')
      vine.faded(:b='b')
      .spacer
      .tooltip.dogepepecoin
          img.dogepepecoin.spinslow(:class="{ungrabbedcoin : !isGrabbed}" src='../../assets/images/dogepepecoin.png' @click='toggleGrab')
          current.tooltiptext(v-for='memberId in b.deck', :memberId='memberId')
          p.hodlcount(:class="{grabbedhodlcount: isGrabbed}") {{ b.deck.length }}
  //- button(v-if='b.deck.length === 0' @click='purge') purge
</template>

<script>

import calculations from '../../calculations'
import FormBox from '../slotUtils/FormBox'
import PreviewDeck from '../Deck/PreviewDeck'
import Bird from './Bird'
import Flag from './Flag'
import Scroll from './Scroll'
import Vine from './Vine'
import Passed from './Passed'
import Linky from './Linky'
//import spin from '../../styles/spinners.styl'
import Priorities from '../Deck/Priorities'
import Current from '../Resources/Current'

export default {
    props: ['b', 'inId', 'c'],
    data(){
        return { active: false }
    },
    components: {FormBox, PreviewDeck, Bird, Flag, Scroll, Vine, Passed, Linky, Priorities, Current},
    methods: {
        purge(){
          this.$store.dispatch("makeEvent", {
              type: 'task-removed',
              taskId: this.b.taskId,
          })
        },
        goIn(){

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

            this.$store.dispatch("goIn", {
                inId: this.inId,
                top,
                panel
            })

            this.$router.push("/task/" + this.b.taskId)
        },
        toggleGrab(){
            if (this.isGrabbed) {
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
        }
    },
    computed: {
        cardStart(){
            if ( this.b.book.startTs ){
              let now = Date.now()
              let msTill = this.b.book.startTs - now
              let days = msTill / (1000 * 60 * 60 * 24)
              let hours = 0
              let minutes = 0
              return {
                  days,
                  hours,
                  minutes
              }
            }
        },
        cardInputSty(){
          return {
              redwx : this.b.color == 'red',
              bluewx : this.b.color == 'blue',
              greenwx : this.b.color == 'green',
              yellowwx : this.b.color == 'yellow',
              purplewx : this.b.color == 'purple',
              blackwx : this.b.color == 'black',
          }
        },
        calcVal(){
            let v = calculations.calculateTaskPayout(this.b)
            return parseInt(v)
        },
        countClass(){
            return {
                grabbed : this.b.deck.indexOf(this.$store.getters.member.memberId) !== -1,
            }
        },
        parent(){
          let task
          this.$store.state.tasks.forEach( t => {
              if(t.taskId === this.inId) {
                  task = t
              }
          })
          return task
        },
        isGrabbed(){
          return this.b.deck.indexOf( this.$store.getters.member.memberId ) > -1
        },
        isDecked(){
          return this.$store.getters.memberCard.subTasks.indexOf(this.b.taskId) > -1
        },
        cardAge(){
          let now = Date.now()
          let msSince = now - this.b.timestamp
          let days = msSince / (1000 * 60 * 60 * 24)
          return days
        },
        dogeCard(){
          let mc
          this.$store.state.members.forEach( m => {
              if (this.b.name === m.memberId ){
                  mc = m
              }
          })
          return mc
      },
    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'
@import '../../styles/button'
@import '../../styles/spinners'
@import '../../styles/tooltips'

.count
    float: right

.activated
    border-style: solid
    border-width: thick
    border-color: white

.upgrade
    height: 3em

.task
    color: white
    margin:0
    margin-bottom: .25em
    padding:1em
    //border-radius: 12px
    box-shadow: -7px 7px 7px 1px rgba(21, 21, 21, 0.5)

.dont-break-out
  overflow-wrap: break-word
  word-wrap: break-word
  word-break: break-word
  hyphens: auto

.brder
    label
        text-align: center

.claimvine
    position: relative
    height: 1em
    top: 0
    left: 0

.tooltip .tooltiptext
    font-size: 1em

.arrow
    height: 3.35em

.thumbnail-container {
  width: calc(1440px * 0.19)
  height: calc(900px * 0.19)
  display: inline-block
  overflow: hidden
  position: relative
}

.thumbnail {
  width: calc(1440px)
  height: calc(900px)
  position: relative
  -ms-zoom: 0.19
  -moz-transform: scale(0.19)
  -moz-transform-origin: 0 0
  -o-transform: scale(0.19)
  -o-transform-origin: 0 0
  -webkit-transform: scale(0.19)
  -webkit-transform-origin: 0 0
}

.thumbnail iframe {
  width: 1440px
  height: 900px
}

.thumbnail:after {
  content: ""
  display: block
  position: absolute
  top: 0
  left: 0
  right: 0
  bottom: 0
}

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

.grabbedhodlcount {
    opacity: 1
}

.ungrabbedcoin {
    opacity: 0.3
}

.faded
    opacity: 0.235654

.faded:hover
    opacity: 1

.agedwrapper
    position: relative

.agedbackground
    background-image: url('../../assets/images/paper.jpg')
    background-repeat: no-repeat
    background-position: center center
    background-size: cover
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: absolute
    width: 100%
    height: 100%
    pointer-events: none
    //border-radius: 12px

.freshpaper
    background-image: url('../../assets/images/paper.jpg')
    opacity: 0.2

.weekoldpaper
    background-image: url('../../assets/images/paper_aged_1.png')
    opacity: 0.25

.montholdpaper
    background-image: url('../../assets/images/paper_aged_2.png')
    opacity: 0.3

.threemontholdpaper
    background-image: url('../../assets/images/paper_aged_3.png')
    opacity: 0.35


.smallguild
    height: 1.67em

.bold
    height: 1.21
    font-weight: bolder

.spacer
    clear: both
    height: 2.25em
    width: 100%
    margin-top: 1.5em

.cardhud
    margin-bottom: 1em
    margin-right: 1em
</style>
