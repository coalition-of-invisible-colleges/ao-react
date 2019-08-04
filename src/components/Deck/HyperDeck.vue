<template lang='pug'>
.deck
    .paperwrapper
        .row
            .six.columns.card()
                member-row(v-if='$store.getters.contextMember', :m='$store.getters.contextMember')
                resource-row(v-if='$store.getters.contextResource'   :r='$store.getters.contextResource')
                hypercard(v-if='!$store.getters.contextMember && !$store.getters.contextResource'  :b="card" )
                .bar()
            .six.columns.buffer
                div.upgradesbar()
                    upgrades(:b='card')
        div.fadey(:class='cardInputSty')
            .completed(v-if='$store.getters.contextCompleted.length > 0'  @click='toggleShowComplete'  :class='{faded:!$store.state.context.completed, completedtabbed: $store.state.context.completed}') completed
            task-create
            panels
        img.fw(src='../../assets/images/pixeldesert.png')
        .agedbackground.translucent(:class='cardInputSty')
        .agedbackground.freshpaperbg(v-if='cardAge < 8')
        .agedbackground.weekoldpaperbg(v-else-if='cardAge < 30')
        .agedbackground.montholdpaperbg(v-else-if='cardAge < 90')
        .agedbackground.threemontholdpaperbg(v-else='cardAge >= 90')
</template>

<script>

import calculations from '../../calculations'
import Hypercard from "../Card"
import SharedTitle from '../slotUtils/SharedTitle'
import TaskCreate from '../forms/TaskCreate'
import Panels from './Panels'
import Priorities from './Priorities'
import Priority from './Priority'
import Upgrades from './Upgrades'
import MemberRow from './Member'
import ResourceRow from '../Resources/Row'
import BountyCard from '../Bounties/BountyCard'

export default {
  data(){
      return {resetHack: true}
  },
  components:{
      SharedTitle, Hypercard, TaskCreate,
      Panels, Priorities, MemberRow,
      Upgrades, BountyCard, ResourceRow, Priority
  },watch: {
      '$route': 'reset'
  },
  methods:{
      toggleShowComplete(){
          console.log("clcik trig call toggleCompleted")

          this.$store.commit("toggleCompleted")
      },
      setPageTitle(){
          if(this.card.taskId === this.$store.getters.member.memberId) document.title = 'deck'
          else if(this.card.guild) document.title = this.card.guild
          else document.title = this.card.name
          return true
      },
      reset(){
            this.resetHack=false
            setTimeout(()=>{ this.resetHack = true }, 12)
      },
  },
  computed: {
      card(){
          return this.$store.getters.contextCard
      },
      cardInputSty(){
          if (this.card) return {
              redwx : this.card.color == 'red',
              bluewx : this.card.color == 'blue',
              greenwx : this.card.color == 'green',
              yellowwx : this.card.color == 'yellow',
              purplewx : this.card.color == 'purple',
              blackwx : this.card.color == 'black',
          }
      },
      cardAge(){
          let now = Date.now()
          let msSince = now - this.card.timestamp
          let days = msSince / (1000 * 60 * 60 * 24)
          return days
      },
  },

}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/button'

.bluewx
    color: white

.faded
    opacity: 0.4

.deck
    width: 100%

.card
    color: white
    font-size:1.111em
    padding-left: 1em
    padding-top: 1em

#cyber
    width: 100%
    opacity: 0.5

.buffer
    padding-right: 1em
    padding-top: 1em

.padbottom
    margin-bottom: 2em

.upgradesbar
  height: fit-content
  margin-bottom: 2em
  background-color: rgba(21, 21, 21, 0.25)
  border-radius: 40px

.upgrade
    height: 4em
    border: 4px solid rgba(0, 0, 0, 0.5)
    background-color: rgba(0, 0, 0, 0, 0.2)

.bar
    min-height: 1em
    margin-bottom:2em

.fw
    width: 100%
    opacity: 0.11

.fadey
    background-color: rgba(255,255,255,0.1)
    padding: 1em 2em 1em 0
    margin: 0 1em

.slide-fade-enter-active {
  transition: all .6s ease;
}
.slide-fade-leave-active {
  transition: all .4s ease;
}
.slide-fade-enter {
  // transform: translateY(-400px);
  opacity: 0;
}
.slide-fade-leave-to {
 // transform: translateY(-400px);
  opacity: 0;
}

.paperwrapper
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

.freshpaperbg
    background-image: url('../../assets/images/paper.jpg')
    opacity: 0.2
    z-index: -2

.weekoldpaperbg
    background-image: url('../../assets/images/paper_aged_1.png')
    opacity: 0.25
    z-index: -2

.montholdpaperbg
    background-image: url('../../assets/images/paper_aged_2.png')
    opacity: 0.3
    z-index: -2

.threemontholdpaperbg
    background-image: url('../../assets/images/paper_aged_3.png')
    opacity: 0.35
    z-index: -2

.translucent
    background-image: none
    z-index: -2
    opacity: 0.42
    // content: " "
    // z-index: 10
    // display: block
    // position: absolute
    // height: 100%
    // width: 100%
    // top: 0;
    // left: 0;
    // right: 0;
    // bottom: 0;
    // height: 0;
    // z-index: -3

.completed
    float: right
    cursor: pointer
    font-size: 1.35em
    font-weight: bold
    padding: 0.5em
    margin-right: -0.5em

.upgrademode
    float: left
    cursor: pointer
    font-size: 1.35em
    font-weight: bold
    padding: 0.5em
    margin-right: -0.5em

.completedtabbed
    background-color: rgba(0, 0, 0, 0.3)
    border-radius: 5px
    color: white
    margin-right: -0.5em

// .bluewx
//   background-color: rgba(255, 0, 0, 0.2)

// .greenwx
//   background-color: rgba(255, 0, 0, 0.2)

// .yellowwx
//   background-color: rgba(255, 0, 0, 0.2)

// .purplewx
//   background-color: rgba(134, 66, 169, 0.2)

// .redwx
//   background-color: rgba(255, 0, 0, 0.2)

</style>
