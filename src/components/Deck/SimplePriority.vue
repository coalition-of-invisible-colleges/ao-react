<template lang='pug'>

.p.clearboth(@dblclick='goIn')
  .row
    div.agedwrapper(:class="cardInputSty")
      .agedbackground.freshpaper(v-if='cardAge < 8')
      .agedbackground.weekoldpaper(v-else-if='cardAge < 30')
      .agedbackground.montholdpaper(v-else-if='cardAge < 90')
      .agedbackground.threemontholdpaper(v-else='cardAge >= 90')
      img.front.nopad(v-if='card.guild'  src="../../assets/images/badge.svg")
      span.front.nudge(v-if='card.guild')  {{ card.guild }}
      img.left.front(v-if='isMember' src="../../assets/images/loggedIn.svg")
      span.right.front(v-if='card.book.startTs') {{ cardStart.days.toFixed(1) }} days
      img.right.front(v-if='card.book.startTs' src="../../assets/images/timecube.svg")
      linky.cardname.front(:x='card.name'  :key='name')
</template>

<script>

import Linky from '../Card/Linky'
import Hypercard from '../Card/index'

export default {
    props: ['taskId', 'inId', 'c'],
    components: { Hypercard, Linky },
    methods: {
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

            let parents = [  ]

            if (this.$store.getters.contextCard){
                parents.push(this.$store.getters.contextCard.taskId)
            }

            if (this.inId && parents.indexOf(this.inId) < 0){
                parents.push(this.inId)
            }

            console.log('dispatching goIn with', {
                parents,
                top,
                panel
            })

            this.$store.dispatch("goIn", {
                parents,
                top,
                panel
            })

            this.$router.push("/task/" + this.b.taskId)
        },
    },
    computed: {
        card(){
            return this.$store.getters.hashMap[this.taskId]
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
        cardStart(){
            // XXX recalc on nav 
            if ( this.card.book.startTs ){
              let now = Date.now()
              let msTill = this.card.book.startTs - now
              // XXX TODO
              let days = msTill / (1000 * 60 * 60 * 24)
              let hours = 0
              let minutes = 0
              console.log({now, msTill, days})
              return {
                  days,
                  hours,
                  minutes
              }
            }
        },
        cardInputSty() {
          return {
              redwx : this.card.color == 'red',
              bluewx : this.card.color == 'blue',
              greenwx : this.card.color == 'green',
              yellowwx : this.card.color == 'yellow',
              purplewx : this.card.color == 'purple',
              blackwx : this.card.color == 'black',
          }
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

.p
    color: white

.clearboth
    clear: both

.singleship
    width: 3.3724em
    position: absolute
    margin-top: 1em
    float: right

.agedwrapper
    position: relative
    margin-top: 0.5em
    width: calc(100% - 2em)
    padding: 0.5em
    margin-right: 0.5em
    margin-left: 0.5em

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

.allocated
    position: absolute
    padding-left: 0.25em
    width: 2em
    text-align: center
    font-size: 0.95em
    margin-top: 0.5em
    color: white
    text-shadow: 2px 2px 2px rgba(0.05, 0.05, 0.05, 0.5)
    font-size: 1.5em
    pointer-events: none

.cardname
    z-index: 15
    position: relative
    
img
    height: 1.1em
    padding-right: 0.5em

.left
    float: left
    
.right
    float: right
    
.nopad
    padding-right: 0.15em

.nudge
    top: -0.2em
    
.front
    position: relative
    z-index: 100
</style>
