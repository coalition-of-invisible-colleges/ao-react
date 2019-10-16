<template lang='pug'>

#tasks(:id='uuid', @contextmenu.prevent)
    .row.ptr(v-if="topCard")
        .three.grid(@click='previous')
            span &nbsp;
            img.fl(v-if='!open && topCard.color === "red"', src='../../assets/images/backRed.svg')
            img.fl(v-if='!open && topCard.color === "yellow"', src='../../assets/images/backYellow.svg')
            img.fl(v-if='!open && topCard.color === "green"', src='../../assets/images/backGreen.svg')
            img.fl(v-if='!open && topCard.color === "purple"', src='../../assets/images/backPurple.svg')
            img.fl(v-if='!open && topCard.color === "blue"', src='../../assets/images/backBlue.svg')
        .one.grid.horizcenter(:class='panelSty')
            .box.verticalcenter
                h3(v-if='!open') {{ top + 1 }}
        .four.grid.horizcenter(:class='panelSty')
            .toglr.mandalign(:id='orbuuid')
                img(v-if='open && $store.state.upgrades.stacks === 5', src='../../assets/images/openRed.svg'  draggable='false')
                img(v-else-if='$store.state.upgrades.stacks === 5'  src='../../assets/images/open.svg'  draggable='false')
                img.iris(v-else-if='open && $store.state.upgrades.stacks === 1'  src='../../assets/images/mandelorb_sequential.svg'  draggable='false')
                img.iris(v-else  src='../../assets/images/mandelorb_linear.svg'  draggable='false')
        .one.grid.horizcenter(:class='panelSty')
            .box.verticalcenter
                h3(v-if='!open') {{ c.length }}
                h3(v-else) all
        .three.grid(@click='next')
            span &nbsp;
            img.fr(v-if='!open && topCard.color === "red"', , src='../../assets/images/forwardRed.svg')
            img.fr(v-if='!open && topCard.color === "yellow"', src='../../assets/images/forwardYellow.svg')
            img.fr(v-if='!open && topCard.color === "green"', src='../../assets/images/forwardGreen.svg')
            img.fr(v-if='!open && topCard.color === "purple"', src='../../assets/images/forwardPurple.svg')
            img.fr(v-if='!open && topCard.color === "blue"', src='../../assets/images/forwardBlue.svg')
    .row.fadey(v-else)
      .three.grid
          img.fl(src='../../assets/images/back.svg')
      .six.grid
          .toglr.fr
              img(src='../../assets/images/open.svg')
          .box
              h3 0 / 0
      .three.grid
          img.fr(src='../../assets/images/forward.svg')
    .open(v-if='open')
        hypercard(v-for='b in c'  :b="b"  :key="b.taskId"  :inId='taskId'  :c='panelIds')
    .box(v-else  :class='panelSty')
        hypercard(:b="c[top]"  :key="componentKey"  :inId='taskId'  :c='panelIds')
</template>

<script>

import Hypercard from "../Card"
import uuidv1 from 'uuid/v1'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import SoundFX from '../../modules/sounds'

export default {
  props: ['c', 'taskId'],
  mounted(){
        let el = document.getElementById(this.uuid)
        let mc = Propagating(new Hammer.Manager(el))
        let Swipe = new Hammer.Swipe({ threshold: 144 })
        mc.add(Swipe)

        mc.on('swipeleft', (e) => {
          this.previous()
          e.stopPropagation()
        })

        mc.on('swiperight', (e) => {
          this.next()
          e.stopPropagation()
        })

        mc.on('swipeup', (e) => {
            console.log('got swipe up')
            this.swap(-1)
            this.previous()
            e.stopPropagation()
        })

        mc.on('swipedown', (e) => {
            console.log('got swipe down')
            this.swap(1)
            e.stopPropagation()
        });

        var orbel = document.getElementById(this.orbuuid)
        var orbmc = Propagating(new Hammer.Manager(orbel))
        
        let orbTap = new Hammer.Tap({ time: 400 })
        orbmc.add(orbTap)
        orbmc.on('tap', (e) => {
            this.toggleOpen()
            e.stopPropagation()
        })

        var orbSwipe = new Hammer.Swipe({ threshold: 144 })
        orbmc.add(orbSwipe)

        orbmc.on('swipeleft', (e) => {
          // this should navigate all five stacks at once
        })

        orbmc.on('swiperight', (e) => {
          // this should navigate all five stacks at once
        })

        orbmc.on('swipeup', (e) => {
            this.first()
            e.stopPropagation()
        })

        orbmc.on('swipedown', (e) => {
            this.last()
            e.stopPropagation()
        })

        let orbPress = new Hammer.Press({ time: 400 })
        orbmc.add(orbPress)
        orbmc.on('press', (e) => {
            this.toggleStacks()
            e.stopPropagation()
        })
  },
  data(){
      return {
          open: false,
          top: 0,
          uuid: uuidv1(),
          orbuuid: uuidv1(),
          componentKey: 0,
      }
  },
  methods:{
    toggleOpen(){
        if(!this.open) {
            SoundFX.playScrollOpen()
        } else {
            SoundFX.playBookClose()
        }
        this.open = !this.open
    },
    first() {
        this.top = 0
    },
    previous(){
        SoundFX.playPageTurn()
        this.top = (this.top - 1) % this.c.length
        if (this.top === -1) {
            this.top = this.c.length - 1
        }
        this.componentKey ++
    },
    next(){
        SoundFX.playPageTurn()
        this.top = (this.top + 1) % this.c.length
        this.componentKey ++
    },
    last() {
        this.top = this.c.length - 1
    },
    swap(direction){
        let cardIndex
        this.c.forEach((t, i) => {
          if(t.taskId === this.topCard.taskId) {
            cardIndex = i
          }
        })
        let swapIndex = (cardIndex + direction) % this.c.length
        if (swapIndex === -1) {
            swapIndex = this.c.length - 1
        } else if (swapIndex > this.c.length - 1) {
            swapIndex = 0
        }
        SoundFX.playChunkSwap()
        this.$store.dispatch("makeEvent", {
            type: 'task-swapped',
            taskId: this.taskId,
            swapId1: this.topCard.taskId,
            swapId2: this.c[swapIndex].taskId,
            direction: 'up',
        })
    },
    toggleStacks(){
      this.$store.commit('toggleStacks')
    },
  },
  computed: {
    topCard(){
        this.componentKey ++
        if (this.c.length > 0){
            return this.c[this.top]
        }
        return false
    },
    panelSty(){
        return {
            redtx : this.topCard.color == 'red',
            bluetx : this.topCard.color == 'blue',
            greentx : this.topCard.color == 'green',
            yellowtx : this.topCard.color == 'yellow',
            purpletx : this.topCard.color == 'purple',
            blacktx : this.topCard.color == 'black',
        }
    },
    panelIds(){
        return this.c.map(g => g.taskId)
    }
  },
  components:{
      Hypercard,
  },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/grid'
@import '../../styles/button'

button
    background: darkteal

#tasks
    width: 100%

tr
    border-color: accent4
    border-top-style: solid
    border-bottom-style: solid
    border-width: 3px
    vertical-align:middle

thead
    tr
        text-align: center

td
    vertical-align: middle
    color: accent2
    font-size: 1.34em
    text-align: center

li
    text-align: left

img
    height: 3.9em

table
    text-align:center
    width: 100%
th
    font-family: sans-serif
    font-weight: lighter
    font-size: 1.1em
    color: accent1
    border-color: accent1

td
    color: accent3

.padding
    padding: 1.987654321em

li
    margin-left: 1em

.bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

img
    height: 3em

.ptr
    margin-bottom: 0
    margin: 1em 0 0.5em 0
    background-color: rgba(51, 51, 51, 0.3)
    border-radius: 40px

.fr
    float: right
    margin-left: 0.5em
    margin-top: 0.5em
    //margin-bottom: 0.8em
    margin-right: 0.5em
    cursor: pointer

.fl
    float: left
    margin-right: 0.5em
    margin-top: 0.5em
    //margin-bottom: 0.8em
    margin-left: 0.5em
    cursor: pointer

.fadey
    opacity: 0.36

.box
    min-height: 1em

.bar
    min-height: 1em
    background: softGrey

.verticalcenter
    margin-top: 1em

.horizcenter
    text-align: center

.mandalign
    margin-top: 5px
    cursor: pointer

.center
    text-align: center

</style>
