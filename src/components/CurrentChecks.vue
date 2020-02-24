<template lang='pug'>

.current(v-if='memberId')
    span.checkmark.clickable(v-if='isCompleted'  @click='uncheck') ☑
    span.checkmark.clickable(v-else  @click='complete') ☐
    span.name(@click.exact.stop='toggleHighlight()'  @click.ctrl.exact.stop='toggleHighlight(true)'  :class='{ highlight : isHighlighted, lowdark : isLowdarked }') {{ name }}
    span(v-for='c in checkmarks'  :key='c.taskId')
        span.tooltip.plain(@click='goIn(c.taskId)')
            span.checkmark(:class="{ ...cardInputSty(c.color), highlight : c.highlight === 1, lowdark : c.highlight === -1, lilypad : c.highlight === 2 }") ☑
            linky.tooltiptext.bigger(:x='c.name')
</template>

<script>

import Linky from './Linky'

export default {
  props: ['memberId'],
  components: { Linky },
  methods: {
    goIn(taskId){
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

            if(this.$store.state.upgrades.mode === 'doge' && this.$store.getters.contextCard.priorities.length > 0) {
                this.$store.commit("setMode", 1)
            }
        }, 5)
    },
    complete(){
        this.$store.dispatch("makeEvent", {
            type: 'task-claimed',
            taskId: this.$store.getters.contextCard.taskId,
            memberId: this.memberId,
            notes: 'checked by ' + this.$store.getters.member.memberId
        })
    },
    uncheck(){
        this.$store.dispatch("makeEvent", {
            type: 'task-unclaimed',
            taskId: this.$store.getters.contextCard.taskId,
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
    },
    toggleHighlight(invert = false) {
        // XXX not sure about this abort
        // if(!this.isHighlighted && !this.isLowdarked && (!this.completions || this.completions.length < 1)) return

        this.$store.dispatch("makeEvent", {
            type: 'highlighted',
            taskId: this.$store.getters.contextCard.taskId,
            memberId: this.memberId,
            valence: !invert
        })
    },
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
        return this.$store.getters.contextCard.claimed.indexOf(this.memberId) > -1
    },

    isHighlighted() {
        return this.$store.getters.contextCard.highlights.some(h => {
            return (h.valence && h.memberId === this.memberId)
        })
    },
    isLowdarked() {
        return this.$store.getters.contextCard.highlights.some(h => {
            return (!h.valence && h.memberId === this.memberId)
        })
    },

    checkmarks() {
        
        return []
    },
  }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/tooltips'

img
    height: 0.7em
    float: left
.name
    color: white
    font-size: 1.2em
    margin-right: 1em
    position: relative
    top: -0.3em
    user-select: none

.checkmark
    font-size: 2em
    margin-right: 0.25em

.clickable
    cursor: pointer
    color: white

.plain
    text-decoration: none

.tooltiptext.bigger
    z-index: 153
    font-size: 1.2em

.highlight
    text-shadow: 0 0 20px yellow, 0 0 20px yellow, 0 0 20px yellow

.lowdark
    text-shadow: 0 0 20px red, 0 0 20px red, 0 0 20px red

.lilypad
    text-shadow: 0 0 20px green, 0 0 20px green, 0 0 20px green
</style>
