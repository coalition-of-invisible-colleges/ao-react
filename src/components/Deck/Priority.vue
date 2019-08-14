<template lang='pug'>

.p.clearboth
  .row
    .shipcontainer
      img.singleship(@click='allocate'  src='../../assets/images/singleship.svg')
      .allocated(v-if='allocated > 0') {{ allocated }}
      div.agedwrapper(@click='setAction'  :class="cardInputSty")
          .agedbackground.freshpaper(v-if='cardAge < 8')
          .agedbackground.weekoldpaper(v-else-if='cardAge < 30')
          .agedbackground.montholdpaper(v-else-if='cardAge < 90')
          .agedbackground.threemontholdpaper(v-else='cardAge >= 90')
          linky(:x='name'  :key='name')
</template>

<script>

import Linky from '../Card/Linky'
import Hypercard from '../Card/index'

export default {
    props: ['taskId'],
    components: { Hypercard, Linky },
    methods: {
        setAction(){
            this.$store.commit("setAction", this.taskId)
        },
        allocate(){
          this.$store.dispatch("makeEvent", {
            type: 'task-allocated',
            taskId: this.$store.getters.contextCard.taskId,
            allocatedId: this.taskId
          })
        },
    },
    computed: {
        allocated(){
            let allocatedAmount = 0
            // this.$store.state.tasks.forEach(t => {
                // t.allocations.forEach(als => {
                //     if (als.allocatedId === this.taskId){
                //         allocatedAmount += als.amount
                //     }
                // })
            // })
            return allocatedAmount

        },
        card(){
          return this.$store.getters.hashMap[this.taskId]
        },
        name(){
            return this.card.name
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
    width: calc(100% - 5.5em)
    float: right
    padding: 0.5em
    margin-right: 0.5em

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

</style>
