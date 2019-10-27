<template lang='pug'>
.deck(:key='$store.getters.contextCard.taskId')
    .paperwrapper.padsides
        .card(:class='{ adjustwidth : !$store.getters.contextMember, closedwidth : $store.state.upgrades.mode === "doge" }')
            auth(v-if='!$store.getters.isLoggedIn')
            member-row(v-else-if='$store.getters.contextMember', :m='$store.getters.contextMember'  :key='card.taskId')
            resource-row(v-if='$store.getters.contextResource'   :r='$store.getters.contextResource'  :key='card.taskId')
            .centerer
                .more(v-if='panelSplit.before.length > 5') +{{ panelSplit.before.length - 5 }}
            template(v-for='(n, i) in (panelSplit.before.length > 5 ? panelSplit.before.slice(-6, panelSplit.before.length - 1) : panelSplit.before)')
              div(@click="goWithinPanel(n)"  :style='{ marginLeft : 0.5 + ((Math.min(panelSplit.before.length, 5) - i) * 0.25) + "em", marginRight: 1.5 + ((Math.min(panelSplit.before.length, 5) - i) * 0.25) + "em" }')
                context(:taskId='n')
            hypercard.fullwidth(v-if='!$store.getters.contextMember && !$store.getters.contextResource'  :b="card"   :key='card.taskId')
            template(v-for='(n, i) in panelSplit.after.slice(0, 5)')
              div(@click="goWithinPanel(n)"  :style='{ marginLeft: 0.25 + (i * 0.25) + "em", marginRight: 1.25 + (i * 0.25) + "em" }')
                context(:taskId='n')
            .centerer
                .more.aftermore(v-if='panelSplit.after.length > 5') +{{ panelSplit.after.length - 5 }}
        .upgradesbar(v-show='$store.state.upgrades.mode !== "doge"')
            slot
    .fadey(:class='{ cardInputSty, onestack : $store.state.upgrades.stacks === 1, completedfadey : $store.state.context.completed }')
        panels
        .completed(v-if='$store.getters.contextCompleted.length > 0  || $store.state.context.completed'  @click='toggleShowComplete'  :class='{ faded : !$store.state.context.completed, completedtabbed : $store.state.context.completed, normaltopmargin : $store.getters.red.length + $store.getters.green.length + $store.getters.blue.length + $store.getters.yellow.length + $store.getters.purple.length === 0 }') ☑
    img.fw(src='../../assets/images/pixeldesert.png')
    .agedbackground.translucent(:class='cardInputSty')
    .agedbackground.freshpaperbg(v-if='cardAge < 8')
    .agedbackground.weekoldpaperbg(v-else-if='cardAge < 30')
    .agedbackground.montholdpaperbg(v-else-if='cardAge < 90')
    .agedbackground.threemontholdpaperbg(v-else='cardAge >= 90')
</template>

<script>
import calculations from '../../calculations'
import MemberRow from './Member'
import ResourceRow from '../Resources/Row'
import Context from './Context'
import Hypercard from "../Card"
import Panels from './Panels'
import Auth from '../Auth'
import SoundFX from '../../modules/sounds'

export default {
    beforeRouteUpdate (to, from, next) {
      console.log("update called ", to.path)
      // this.$store.

    // called when the route that renders this component has changed,
    // but this component is reused in the new route.
    // For example, for a route with dynamic params `/foo/:id`, when we
    // navigate between `/foo/1` and `/foo/2`, the same `Foo` component instance
    // will be reused, and this hook will be called when that happens.
    // has access to `this` component instance.
  },
  components:{
      Hypercard,
      Panels, MemberRow,
      ResourceRow, Context, Auth
  },
  methods:{
      goWithinPanel(n){
          SoundFX.playPageTurn()
          let i = this.$store.state.context.panel.indexOf(n)
          if (i > -1){
              this.$store.commit("setTop", i)
          }
      },
      toggleShowComplete(){
          SoundFX.playTickMark()
          this.$store.commit("toggleCompleted")
      },
      setPageTitle(){
          if(this.card.taskId === this.$store.getters.member.memberId) document.title = 'deck'
          else if(this.card.guild) document.title = this.card.guild
          else document.title = this.card.name
          return true
      },
  },
  computed: {
      panelSplit(){
          let before = []
          let after = []
          let top = this.$store.state.context.top
          this.$store.state.context.panel.forEach((n, i) => {
              if (i < top){
                  before.push(n)
              }
              if (i > top){
                after.push(n)
              }
          })

          return {before, after}
      },
      card(){
          if (!this.$store.getters.contextCard){
              return {
                  taskId: 'test',
                  name: 'hello, world',
              }
          }
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
    opacity: 0.6

.small
    font-size:0.8
    opacity: 0.5

.deck
    width: 100%

.card
    color: white
    font-size:1.111em
    margin-top: 1em
    display: inline-block
    // width: 39.3333333333%
    margin-left: 1em
    margin-right: 1em
    flex-grow: 1

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
    background-color: rgba(21, 21, 21, 0.25)
    border-radius: 30px
    margin-left: 1em
    float: right
    margin-top: 1em
    margin-right: 1em
    flex-grow: 1
    // width: 58%
    flex-basis: 54%

.upgrade
    height: 4em
    border: 4px solid rgba(0, 0, 0, 0.5)
    background-color: rgba(0, 0, 0, 0, 0.2)

.fw
    width: 100%
    opacity: 0.11

.fadey
    background-color: rgba(255,255,255,0.1)
    margin: 0 1em 0 1em
    min-height: 2em
    position: relative
    margin-top: 1em
    margin-bottom: 1em
    clear: both
  
.completedfadey
    background: repeating-radial-gradient(
      circle,
      rgba(0, 0, 0, 0.2),
      rgba(0, 0, 0, 0.2) 10px,
      rgba(0, 0, 0, 0.3) 10px,
      rgba(0, 0, 0, 0.3) 20px
    )

.onestack
    // margin-top: 1em
    display: flex
    flex-wrap: wrap
    max-width: 34em
    position: relative
    left: 50%
    transform: translateX(calc(-50% - 1em))
    
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
    
.paperwrapper.padsides
    display: flex
    flex-wrap: wrap
    justify-content: center

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
    color: white
    float: right
    cursor: pointer
    font-size: 1.35em
    font-weight: bold
    position: absolute
    right: 0.5em
    bottom: 0.25em
    

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
    right: 0
    bottom: 0
    padding: 0.25em 0.5em 0.25em 0.5em

.dot
  height: 0.5em
  width: 0.5em
  border-radius: 50%
  display: inline-block
  margin-right: 0.5em

.more
    text-align: center
    background-color: rgba(22, 22, 22, 0.4)
    border-radius: 50%;
    display: inline-block;
    border-width: 2px
    //border-color: rgba(255, 255, 255, 0.68)
    //border-style: solid
    padding: 0.5em
    margin: 0em auto 0.5em auto
    font-size: 0.8em
    opacity: 0.3
    color: white

.aftermore
    margin-top: 0.5em
    margin-left: 1.5em
    margin-bottom: 0

.centerer
    text-align: center
    width: 100%

// .fullwidth
    // width: calc(100% - 1em)

.normaltopmargin
    margin-top: 0

.closedwidth
    width: 30.65em
    // transform: translateX(calc(50% - 1em))
    flex-grow: 0
    
 // .card.adjustwidth
    // max-width: 100%
    // max-width: 29.8em
    // max-width: 39.333333333333%
</style>
