<template lang='pug'>

#tasks(:id='uuid')
    .row.ptr(v-if="topCard")
        .three.grid(@click='last')
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
            .toglr.mandalign(@click='toggleOpen')
                img(v-if='open', src='../../assets/images/openRed.svg')
                img(v-else, src='../../assets/images/open.svg')
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
        hypercard(v-for='b in c'  :b="b"  :inId='taskId')
    .box(v-else  :class='panelSty')
        hypercard(:b="c[top]"  :key="componentKey"  :inId='taskId')
</template>

<script>

import Hypercard from "../Card"
import uuidv1 from 'uuid/v1'
import request from 'superagent'

export default {
  props: ['c', 'taskId'],
  mounted(){
        var el = document.getElementById(this.uuid)
        var mc = new Hammer.Manager(el)
        var Swipe = new Hammer.Swipe()
        mc.add(Swipe)

        mc.on('swipeleft', (e) => {
          this.top = (this.top - 1) % this.c.length
          if (this.top === -1) {
            this.top = this.c.length - 1
          }
        });

        mc.on('swiperight', (e) => {
          this.top = (this.top + 1) % this.c.length
        });

        mc.on('swipeup', (e) => {
            console.log('got swipe up')
            this.swap(-1)
            this.last()
        });

        mc.on('swipedown', (e) => {
            console.log('got swipe down')
            this.swap(1)
        });

        var Press = new Hammer.Press({
          time: 500
        });
        mc.add(Press)

        mc.on('press', (e) => {
            e.preventDefault()
            navigator.clipboard.writeText(this.c[0].name)
            .then(() => {
              //console.log('card copied to clipboard');
            })
            .catch(err => {
              // This can happen if the user denies clipboard permissions:
              console.error('could not copy text: ', err);
            });
        });
  },
  data(){
      return {
          open: false,
          top: 0,
          uuid: uuidv1(),
          componentKey: 0,
      }
  },
  methods:{
    toggleOpen(){
        this.open = !this.open
    },
    last(){
        this.top = (this.top - 1) % this.c.length
        if (this.top === -1) {
            this.top = this.c.length - 1
        }
        this.componentKey ++
    },
    next(){
        this.top = (this.top + 1) % this.c.length
        this.componentKey ++
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
      request
        .post('/events')
        .set('Authorization', this.$store.state.loader.token)
        .send({
            type: 'task-swapped',
            taskId: this.taskId,
            swapId1: this.topCard.taskId,
            swapId2: this.c[swapIndex].taskId,
            direction: 'up',
        })
        .end((err,res)=>{

        })
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
    cursor: pointer
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

.fl
    float: left
    margin-right: 0.5em
    margin-top: 0.5em
    //margin-bottom: 0.8em
    margin-left: 0.5em

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

.center
    text-align: center

</style>
