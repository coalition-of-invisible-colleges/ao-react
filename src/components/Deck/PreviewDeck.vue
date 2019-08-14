<template lang='pug'>

.preview(v-if='deck.length > 0')
    .row
        .four.grid
            .tooltip(v-for="(tId,i) in task.priorities.slice().reverse()")
                img.tinyboat(v-if="i < 5", @click='goto(tId)', src='../../assets/images/boatbtnselected.svg')
                .tooltiptext {{ tId? card(tId).name : "unknown card" }}
            .bead.redwx.tooltip(v-for="(b,i) in red", v-if="i < (5 - task.priorities.length)"  :b="b", @click='goto(b.taskId)')
                .tooltiptext {{ b? b.name : "unknown card" }}
        .four.grid
            .bead.greenwx.tooltip(v-for="(b,i) in green", v-if="i < 5", @click='goto(b.taskId)')
                .tooltiptext {{ b? b.name : "unknown card" }}
        .four.grid
            .bead.bluewx.tooltip(v-for="(b,i) in blue", v-if="i < 5", @click='goto(b.taskId)')
                .tooltiptext {{ b? b.name : "unknown card" }}
    .row
        .two.grid
        .four.grid
            .bead.yellowwx.tooltip(v-for="(b,i) in yellow", v-if="i < 5", @click='goto(b.taskId)')
                .tooltiptext {{ b? b.name : "unknown card" }}
        .four.grid
            .bead.purplewx.tooltip(v-for="(b,i) in purple", v-if="i < 5", @click='goto(b.taskId)')
                .tooltiptext {{ b? b.name : "unknown card" }}
</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import TaskCreate from '../forms/TaskCreate'

export default {
  props: ['memberId', 'taskId', 'task'],
  methods:{
    getTask(taskId){
        return this.$store.getters.hashMap[taskId]
    },
    goto(taskId){
        // goIn(taskId){
            console.log("goIn called")
            let panel = [taskId]
            let top = 0
            let t = this.$store.getters.hashMap[taskId]
            let panelColor = this.task.subTasks.filter( p => {
              this.card(p).color === t.color
            })
            let topColor = panelColor.indexOf(taskId)

            if (topColor > -1){
              console.log('setting topcolor', topColor)
              panel = panelColor
              top = topColor
            }
            let parents =  [this.task.taskId]
            this.$store.dispatch("tryGoIn", {parents, panel, top})

            this.$router.push("/task/" + taskId)

    },
    card(tId){
        return this.$store.getters.hashMap[tId]
    },
  },
  computed: {
      deck(){
          let tasks = []
          if (this.memberId) {
              tasks = this.$store.state.tasks.filter( t => t.deck.indexOf(this.memberId) !== -1 )
          } else if (this.taskId) {
              let subTasks = []
              let t = this.$store.getters.hashMap[this.taskId]
              t.subTasks.forEach(t => tasks.push( this.getTask(t)))
          } else if (this.task && this.task.subTasks) {
              this.task.subTasks.forEach( tId => tasks.push( this.getTask(tId) ))
          }
          return tasks
      },
      red(){
          return this.deck.filter( c => { if(!c) { return false } return c.color === 'red' } )
      },
      yellow(){
          return this.deck.filter( c => { if(!c) { return false } return c.color === 'yellow' } )
      },
      blue(){
          return this.deck.filter( c => { if(!c) { return false } return c.color === 'blue' } )
      },
      purple(){
          return this.deck.filter( c => { if(!c) { return false } return c.color === 'purple' } )
      },
      green(){
          return this.deck.filter( c => { if(!c) { return false } return c.color === 'green' } )
      },
  },
  components:{
      SharedTitle,
      TaskCreate,
  },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/grid'
@import '../../styles/tooltips'

.preview
    width: 100%
    //opacity: 0.5

.tinyboat
    height: 15px
    width: 100%
    display: inline-block;
    cursor: pointer

.bead
    padding: 0
    margin:0
    height: 5px
    width: 100%
    border-radius: 50%;
    display: inline-block;
    border-width: 2px
    border-color: rgba(255, 255, 255, 0.68)
    border-style: solid
    cursor: pointer

.tooltip .tooltiptext
    font-size: 1em
</style>
