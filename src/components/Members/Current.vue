<template lang='pug'>

.current(v-if='memberId')
    span.checkmark.clickable(v-if='isCompleted'  @click='uncheck') ☑
    span.checkmark.clickable(v-else  @click='complete') ☐
    span.name(@click.exact.stop='toggleHighlight()'  @click.ctrl.exact.stop='toggleHighlight(true)'  :class='{ highlight : isHighlighted, lowdark : isLowdarked }') {{ name }}
    template(v-for='c in checkmarks'  :key='$store.state.upgrades.highlights')
        span.tooltip.plain(@click='goIn(c.taskId)')
            span.checkmark(:class="{ ...cardInputSty(c.color), highlight : c.highlight === 1, lowdark : c.highlight === -1, lilypad : c.highlight === 2 }"  :key='checkmarks') ☑
            linky.tooltiptext.bigger(:x='c.name')
</template>

<script>

import SoundFX from '../../utils/sounds'
import Linky from '../Card/Linky'

export default {
  props: ['memberId', 'b', 'inId', 'completions'],
  components: { Linky },
  methods: {
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

            if(this.$store.state.upgrades.mode === 'doge' && this.$store.getters.contextCard.priorities.length > 0) {
                this.$store.commit("setMode", 1)
            }
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
    checkmarks() {
        let checkmarks = this.$store.getters.hodlersByCompletions.find(m => m.taskId === this.memberId)
        if(!checkmarks || !checkmarks.contextCompletions) {
            console.log("null contextpletions")
            return []
        }
        checkmarks = checkmarks.contextCompletions
        // remove duplicates, shouldn't be possible
        checkmarks = [...new Set(checkmarks)]
        checkmarks.forEach(c => {
            delete c.highlight
        })
        Object.entries(this.$store.state.upgrades.highlights).forEach((arr) => {
            checkmarks.forEach((c, i) => {
                if(arr[1]) {
                    if(c.claimed.indexOf(arr[0]) >= 0) {
                        if(!c.hasOwnProperty('highlight')) {
                            c.highlight = 1
                        }
                    } else {
                        c.highlight = 0
                    }
                } else if(!arr[1]) {
                    if(c.claimed.indexOf(arr[0]) === -1) {
                        if(!c.hasOwnProperty('highlight')) {
                            c.highlight = -1
                        } else {
                            c.highlight *= -1
                        }
                    } else {
                        c.highlight = 0
                    }
                }
            })
        })
        return checkmarks
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
