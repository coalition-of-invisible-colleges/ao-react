<template lang='pug'>

.flag(v-if="$store.getters.memberCard"  @click='flagIt')
  div(v-if="inId")
    img.flaggy.faded(v-if='!isFlagged', src='../../assets/images/boatbtn.svg')
    img.flaggy.prioritized(v-else, src='../../assets/images/boatbtnselected.svg')
  div(v-else  @click='deckIt')
    div(v-if='$store.getters.memberCard.subTasks.indexOf(b.taskId) === -1')
      img.flaggy.faded(src='../../assets/images/scroll.svg')
  h1 {{ $store.state.upgrades.mode }}
</template>

<script>

import FormBox from '../slotUtils/FormBox'

export default {
    props: ['b', 'inId'],
    methods: {
        deckIt(){
            this.$store.dispatch("makeEvent", {
                type: 'task-sub-tasked',
                subTask: this.b.taskId,
                taskId: this.$store.getters.memberCard.taskId,
            })
        },
        flagIt(){
            if (!this.isFlagged) {
                this.$store.dispatch("makeEvent", {
                    type: 'task-prioritized',
                    taskId: this.b.taskId,
                    inId: this.inId,
                })
            } else {
                this.$store.dispatch("makeEvent", {
                    type: 'task-refocused',
                    taskId: this.b.taskId,
                    inId: this.inId,
                })
            }
        },
    },
    computed: {
        isFlagged(){
            let isFlagged = false
            this.$store.state.tasks.forEach( t => {
                if (t.taskId === this.inId){
                    isFlagged = t.priorities.indexOf(this.b.taskId) > -1
                }
            })
            return isFlagged
        }
    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours';
@import '../../styles/skeleton';
@import '../../styles/grid';
@import '../../styles/button';

.count
    float: right

.activated
    border-style: solid
    border-width: thick
    border-color: white

.upgrade
    height: 3em

.task
    color: white
    margin:10px 0
    padding:20px

.row
    width: 100%
    .mainColumn
      width:calc(100% - 75px - 4%)
    .secondaryColumn
      width:75px
      button
        height:75px

.btn
    width:100%
    margin-top: 2em
    max-height: 3em

select
    background-color: lightteal

select.form-control
    color: black

.curs
    cursor: pointer;

label
    color: black
    text-align: center
    padding: 0
    margin-bottom: -50px

.flaggy
    float: right
    height: .777em
    cursor: pointer

.prioritized
    height: 1.3em

.faded
    opacity: 0.235654

.faded:hover
    opacity: 1

</style>
