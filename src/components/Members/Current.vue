<template lang='pug'>

.current(v-if='memberId')
    span.checkmark.clickable(v-if='isCompleted'  @click='uncheck') ☑
    span.checkmark.clickable(v-else  @click='complete') ☐
    span.name {{ name }}
    template(v-for='c in completions')
      span.tooltip.plain(@click='goIn(c.taskId)')
        span.checkmark(:class="cardInputSty(c.color)") ☑
          .tooltiptext
            .bigger {{ c.name }}
</template>

<script>

import SoundFX from '../../utils/sounds'

export default {
  props: ['memberId', 'b', 'inId', 'completions'],
  methods:{
    goIn(taskId){
        SoundFX.playPageTurn()
        if (!this.$store.state.context.completed){
            this.$store.commit("toggleCompleted")
        }
        let panel = [taskId]
        let top = 0
        let parents = []
        setTimeout(()=>{
            let t = this.$store.getters.hashMap[taskId]
            let panelColor = this.$store.getters[t.color]
            let panelColorIds = panelColor.map(d => d.taskId)

            let topColor = panelColorIds.indexOf(taskId)
            if (topColor > -1){
                panel = panelColorIds
                top = topColor
            }

            if (this.$store.getters.contextCard.taskId){
                parents.push(this.$store.getters.contextCard.taskId)
            } else if (this.$store.getters.memberCard.taskId){
                parents.push(this.$store.getters.memberCard.taskId)
            }

            this.$store.dispatch("goIn", {taskId, panel, top, parents})

        }, 5)
    },
    complete(){
        this.$store.dispatch("makeEvent", {
            type: 'task-claimed',
            taskId: this.b.taskId,
            memberId: this.memberId,
            notes: 'checked by ' + this.$store.getters.member.memberId
        })
    },
    uncheck(){
        this.$store.dispatch("makeEvent", {
            type: 'task-unclaimed',
            taskId: this.b.taskId,
            memberId: this.memberId,
            notes: ''
        })
    },
    cardInputSty(c){
        return {
            redtx : c === 'red',
            bluetx : c === 'blue',
            greentx : c === 'green',
            yellowtx : c === 'yellow',
            purpletx : c === 'purple',
            blacktx : c === 'black',
        }
    }
  },
  computed:{
    name(){
        let memberId = this.memberId
        let name = false
        this.$store.state.members.forEach(member => {
            if (member.memberId == memberId){
                name = member.name
            }
        })
        return name
    },
    isCompleted(){
        return this.b.claimed.indexOf(this.memberId) > -1
    },
  }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/tooltips'

img
    height: 0.7em
    float: left
.name
    color: white
    font-size: 1.2em
    margin-right: 1em
    position: relative
    top: -0.3em

.checkmark
    font-size: 2em
    margin-right: 0.25em

.clickable
    cursor: pointer
    color: white

.plain
    text-decoration: none

.bigger
    font-size: 2.02em
</style>
