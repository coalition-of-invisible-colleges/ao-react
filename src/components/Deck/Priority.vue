<template lang='pug'>

.p.clearboth(:id='uuid')
    div.agedwrapper.dont-break-out(:class="cardInputSty")
        .agedbackground.freshpaper.middle(v-if='cardAge < 8')
        .agedbackground.weekoldpaper.middle(v-else-if='cardAge < 30')
        .agedbackground.montholdpaper.middle(v-else-if='cardAge < 90')
        .agedbackground.threemontholdpaper.middle(v-else='cardAge >= 90')
        img.front.nopad.cancel(v-if='card.guild'  src="../../assets/images/badge.svg")
        span.front.nudge(v-if='card.guild')  {{ card.guild }}
        img.left.front.cancel(v-if='isMember' src="../../assets/images/loggedIn.svg")
        span.right.front(v-if='card.book.startTs') {{ cardStart.days.toFixed(1) }} days
        img.right.front.cancel(v-if='card.book.startTs' src="../../assets/images/timecube.svg")
        linky.front(:x='name'  :key='name')
</template>

<script>

import Linky from '../Card/Linky'
import Hypercard from '../Card/index'
import uuidv1 from 'uuid/v1'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'

export default {
    props: ['taskId'],
    components: { Hypercard, Linky },
    data(){
      return {
          uuid: uuidv1(),
      }
    },
    mounted() {
        let el = document.getElementById(this.uuid)
        if(!el) return
        let mc = Propagating(new Hammer.Manager(el))

        let Tap = new Hammer.Tap({ time: 400 })
        mc.add(Tap)
        mc.on('tap', (e) => {
            console.log("tap on priority")
            this.debounce(this.setAction, 500, [ this.taskId ])
            e.stopPropagation()
        })
        // need to move goIn here too i think
        // let Tap = new Hammer.Tap({ taps: 2, time: 400 })
        // mc.add(Tap)
        // mc.on('tap', (e) => {
        //     this.goIn()
        //     e.stopPropagation()
        // })

    },
    computed: {
        card(){
          return this.$store.getters.hashMap[this.taskId]
        },
        name(){
            return this.card.name
        },
        isMember(){
            let is = false
            this.$store.state.members.some(m => {
                if (m.memberId === this.taskId){
                    is = m.name
                    return true
                }
            })
            return is
        },
        isBounty(){
            return this.$store.getters.bounties.some( t => {
                return t.taskId === this.taskId
            })
        },
        cardAge(){
          let now = Date.now()
          let msSince = now - this.card.timestamp
          let days = msSince / (1000 * 60 * 60 * 24)
          return days
        },
        cardStart(){
            // XXX recalc on nav
            if ( this.card.book.startTs ){
              let now = Date.now()
              let msTill = this.card.book.startTs - now
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
        cardInputSty() {
          let color
          this.$store.state.tasks.some(t => {
              if (this.taskId === t.taskId){
                  color = t.color
                  return true
              }
          })
          return {
              redwx : color == 'red',
              bluewx : color == 'blue',
              greenwx : color == 'green',
              yellowwx : color == 'yellow',
              purplewx : color == 'purple',
              blackwx : color == 'black',
          }
        }
    },
    methods: {
        debounce(func, delay) {
          let inDebounce
          const context = this
          const args = arguments
          clearTimeout(inDebounce)
          inDebounce = setTimeout(() => func.apply(context, args[2]), delay)
        },
        deaction(){
          SoundFX.playPageTurn()
          this.$store.commit("setAction", false)
        },
        setAction(taskId){
            this.$store.commit("setAction", taskId)
        },
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

img
    height: 1.1em
    padding-right: 0.5em

.left
    float: left

.right
    float: right

.p
    color: white

.nopad
    padding-right: 0.15em

.nudge
    top: -0.2em

.clearboth
    clear: both

.cancel .priority .closedcard img
    margin-left: 0
    transform: none

.agedwrapper
    position: relative
    margin-top: 0.5em
    padding: 0.5em
    margin-right: 0.5em
    cursor: pointer
    z-index: 5

.front
    position: relative
    z-index: 100

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
    z-index: 50

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

.dont-break-out
    overflow-wrap: break-word
    word-wrap: break-word
    word-break: break-word
    hyphens: auto

</style>
