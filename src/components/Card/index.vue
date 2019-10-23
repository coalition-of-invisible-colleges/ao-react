``<template lang='pug'>
.task(:class="cardInputSty"  ref='wholeCard').dont-break-out.agedwrapper
    .agedbackground.freshpaper(v-if='cardAge < 8')
    .agedbackground.weekoldpaper(v-else-if='cardAge < 30')
    .agedbackground.montholdpaper(v-else-if='cardAge < 90')
    .agedbackground.threemontholdpaper(v-else='cardAge >= 90')
    bird(:b='b', :inId='inId')
    flag(:b='b', :inId='inId')
    .row
        img.claimvine(v-for='n in b.claimed'  src='../../assets/images/mark.svg')
    .dogecoin.tooltip(v-if='b.weight && b.weight > 0')
        img(v-for='n in parseInt(Math.floor(b.weight))'  :key='n'  src='../../assets/images/doge_in_circle.png')
        img(v-if='b.weight % 1 > 0 || b.weight < 1'  :class="[ 'sixteenth' + fractionalReserveDoge ]"  src='../../assets/images/doge_in_circle.png')
        .tooltiptext
            p prioritized by:
            current(v-for='doger in b.dogers'  :memberId='doger')
    .tooltip
        .tooltip
            .tooltiptext
                current.block(v-for='memberId in b.claimed', :memberId='memberId')
    .buffertop
      preview-deck(:task='b')
      .cardbody
          .cardhud(v-if='calcVal >= 1')
              img.smallguild(src='../../assets/images/treasurechestnobkgrndwhiteD.png')
              span {{ calcVal }}
          .cardhud(v-if='cardStart')
              img.smallguild(src='../../assets/images/timecubewithwhite.png')
              span {{ cardStart.days.toFixed(1) }} days
          linky.cardhud(:x='b.name' v-if='!dogeCard')
          .cardhud(v-if='dogeCard') {{ dogeCard.name }}
    simple-priorities(v-if='b.guild && $store.getters.contextCard.taskId != b.taskId && $store.state.context.action != b.taskId', :taskId="b.taskId", :inId='b.taskId')
    passed(:b='b')
    shipped(:b='b', :inId='inId')
    .spacer
    div
        scroll.faded(:b='b', :inId='inId')
        vine.faded(:b='b')
        .tooltip.dogepepecoin
            img.dogepepecoin.spinslow(:class="{ungrabbedcoin : !isGrabbed}" src='../../assets/images/dogepepecoin.png' @click='toggleGrab')
            .tooltiptext
                current.block(v-for='memberId in b.deck'  :memberId='memberId')
                .suggest(v-if='!isGrabbed') click to hodl
                .suggest(v-if='isGrabbed') click to dump
            p.hodlcount(:class="{grabbedhodlcount: isGrabbed}") {{ b.deck.length }}
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
import Shipped from './Shipped'
import Linky from './Linky'
import SimplePriorities from '../Deck/SimplePriorities'
import Current from '../Resources/Current'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import SoundFX from '../../modules/sounds'

export default {
    props: ['b', 'inId', 'c'],
    data(){
        return { active: false }
    },
    components: {FormBox, PreviewDeck, Bird, Flag, Scroll, Vine, Passed, Shipped, Linky, SimplePriorities, Current},
    mounted() {
        let el = this.$refs.wholeCard
        if(!el) return
        let mc = Propagating(new Hammer.Manager(el))

        let doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2, time: 400 })
        let longPress = new Hammer.Press({ time: 500 })

        mc.add([doubleTap, longPress])

        longPress.recognizeWith([doubleTap]);
        longPress.requireFailure([doubleTap]);
        
        mc.on('doubletap', (e) => {
            this.goIn()
            e.stopPropagation()
        })  

        mc.on('press', (e) => {
            this.copyCardToClipboard()
            e.stopPropagation()
        })
    },
    methods: {
        purge(){
          this.$store.dispatch("makeEvent", {
              type: 'task-removed',
              taskId: this.b.taskId,
          })
        },
        goIn(){
            SoundFX.playPageTurn()
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

            let parents = []

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

            this.$router.push("/" + this.$store.state.upgrades.mode)
        },
        toggleGrab(){
            if (this.isGrabbed) {
                SoundFX.playTwinkleDown()
                this.$store.dispatch("makeEvent", {
                    type: 'task-dropped',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                })
            } else {
                SoundFX.playTwinkleUp()
                this.$store.dispatch("makeEvent", {
                    type: 'task-grabbed',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                })
            }
        },
        copyCardToClipboard(){
            SoundFX.playChunkSwap()
            navigator.clipboard.writeText(this.b.name)
        },
        deaction(){
          SoundFX.playPageTurn()
          this.$store.commit("setAction", false)
        },
    },
    computed: {
        cardStart(){
            // XXX recalc on nav
            if ( this.b.book.startTs ){
              let now = Date.now()
              let msTill = this.b.book.startTs - now
              // XXX TODO
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
          if(!this.b) {
            console.log("bad card data in card index")
            return
          }
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
        fractionalReserveDoge() {
            return Math.max(Math.floor((this.b.weight % 1) * 16), 1)
        }
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
    position: relative

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
    bottom: 0
    right: 0

.tooltip .tooltiptext
    font-size: 1em
    padding-bottom: 1em

.block
    display: block
    clear: both

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
    position: relative
    z-index: 14

.cardheader
    margin: 0 auto
    font-size: 1.2em

.cardname
    z-index: 15
    position: relative

.suggest
    font-style: italic
    margin-top: 1em

.flag
    position: absolute
    right: 1em
    top: 1em

.dogecoin
    position: absolute
    top: -0.66em
    left: 50%
    transform: translateX(-50%)
    z-index: 100

.dogecoin .tooltiptext
    left: 3em

.dogecoin img
    width: 1.3em

.sixteenth1
    clip-path: polygon(50% 50%, 50% 0, 25% 0)

.sixteenth2
    clip-path: polygon(50% 50%, 50% 0, 0 0)

.sixteenth3
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 25%)

.sixteenth4
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 50%)

.sixteenth5
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 75%)

.sixteenth6
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%)

.sixteenth7
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 25% 100%)

.sixteenth8
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 50% 100%)

.sixteenth9
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 75% 100%)

.sixteenth10
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%)

.sixteenth11
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%, 100 75%)

.sixteenth12
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%, 100% 50%)

.sixteenth13
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%, 100% 25%)

.sixteenth14
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%, 100% 0)

.sixteenth15
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%, 100% 0, 75% 0)

.sixteenth16
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%, 100% 0, 50% 0)

.buffertop
    margin-top: 1em
    clear: both
    width: 100%
    
.cardbody
    width: 100%
  
.preview
    width: 15%
    float: right
    margin-left: 0.5em
    margin-bottom: 0.5em
</style>
