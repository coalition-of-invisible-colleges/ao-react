<template lang='pug'>

.current(v-if='memberId')
    span.checkmark.clickable(v-if='isCompleted'  @click='uncheck') ☑
    span.checkmark.clickable(v-else  @click='complete') ☐
    span.name(@click.exact.stop='toggleHighlight()'  @click.ctrl.exact.stop='toggleHighlight(true)'  :class='{ highlight : isHighlighted, lowdark : isLowdarked }') {{ name }}
    template(v-for='c in completions'  :key='$store.state.upgrades.highlights')
      span.tooltip.plain(@click='goIn(c.taskId)')
        span.checkmark(:class="{ ...cardInputSty(c.color), highlight : (checkmarkHighlights.hasOwnProperty(c.taskId) && checkmarkHighlights[c.taskId] === 1), lowdark : (checkmarkHighlights.hasOwnProperty(c.taskId) && checkmarkHighlights[c.taskId] === -1), lilypad : (checkmarkHighlights.hasOwnProperty(c.taskId) && checkmarkHighlights[c.taskId] === 2) }"  :key='checkmarkHighlights') ☑
          .tooltiptext.smalltext
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
    },
    toggleHighlight(invert = false) {
        if(!this.isHighlighted && !this.isLowdarked && (!this.completions || this.completions.length < 1)) return
        this.$store.commit("toggleHighlight", { memberId: this.memberId, valence: !invert })
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
        return this.b.claimed.indexOf(this.memberId) > -1
    },
    isHighlighted() {
        return this.$store.state.upgrades.highlights[this.memberId] === true
    },
    isLowdarked() {
        return this.$store.state.upgrades.highlights[this.memberId] === false
    },
    checkmarkHighlights() {
        let highlights = {}
        if(Object.keys(this.$store.state.upgrades.highlights).length >= 1) {
            let checkmarks = this.$store.getters.hodlersByCompletions.find(m => m.taskId === this.memberId)
            if(!checkmarks || !checkmarks.contextCompletions) return highlights
            checkmarks = checkmarks.contextCompletions
            checkmarks.forEach((c, i) => {
                Object.entries(this.$store.state.upgrades.highlights).forEach((arr) => {
                    if(arr[1] && c.claimed.indexOf(arr[0]) !== -1) {
                        highlights[c.taskId] = 1
                    } else if(!arr[1] && c.claimed.indexOf(arr[0]) === -1) {
                        if(highlights.hasOwnProperty(c.taskId) && highlights[c.taskId] !== 1) {
                            highlights[c.taskId] = -1
                        } else {
                            highlights[c.taskId] = 0
                        }
                    }
                })
            })
        }
        return highlights
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
    user-select: none

.checkmark
    font-size: 2em
    margin-right: 0.25em

.clickable
    cursor: pointer
    color: white

.plain
    text-decoration: none

.tooltiptext.smalltext
    z-index: 153
    font-size: 0.7em
        
.highlight
    text-shadow: 0 0 20px yellow, 0 0 20px yellow, 0 0 20px yellow

.lowdark
    text-shadow: 0 0 20px red, 0 0 20px red, 0 0 20px red
    
.lilypad
    text-shadow: 0 0 20px green, 0 0 20px green, 0 0 20px green
</style>
