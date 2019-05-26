<template lang='pug'>

.bountycreate
  .choose
    button(@click='setOneTime(false)').p
      img(v-if='!task.oneTime' src='../../assets/images/check.svg')
      span Recur
    button(@click='setOneTime(true)').p
      img(v-if='task.oneTime' src='../../assets/images/check.svg')
      span One Time
  form-box(v-if='task.oneTime' btntxt="add bounty" event='task-bountied' v-bind:data="oneTimeTask")
    fancy-input(labelText='Instructions')
        input.input-effect(v-model='task.instructions' type='text')
    fancy-input(labelText='Value')
        input.input-effect(v-model='task.boost' type='text')
    img.cashup(src='../../assets/images/cash1.svg')
  form-box(v-else, btntxt="add bounty" event='task-bountied' v-bind:data="recurringTask")
    fancy-input(labelText='Instructions')
        input.input-effect(v-model='task.instructions' type='text')
    fancy-input(labelText='Monthly Budget')
        input.input-effect(v-model='task.monthlyValue' type='text')
    fancy-input(labelText='Maximum Payout')
        input.input-effect(v-model='task.cap' type='text')

</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'
import FancyInput from '../slotUtils/FancyInput'

export default {
    mounted(){
        let taskId = this.$router.currentRoute.path.split('/')[2]
        if (taskId){
            this.task.taskId = taskId
        }
    },
    data(){
        return {
            task: {
                taskId: '',
                instructions: '',
                boost: '',
                monthlyValue: '',
                cap: '',
                oneTime: '',
                blame: this.$store.getters.member.memberId,
            }
        }
    },
    components: {
        SharedTitle, FormBox, FancyInput
    },
    methods: {
        setOneTime(x){
            this.task.oneTime = !!x
        }
    },
    computed: {
        oneTimeTask(){
            return {
                taskId: this.task.taskId,
                instructions: this.task.instructions,
                boost: parseFloat( this.task.boost ),
                monthlyValue: 0,
                cap: 0,
                oneTime: true,
                blame: this.$store.getters.member.memberId,
            }
        },
        recurringTask(){
            return {
                taskId: this.task.taskId,
                instructions: this.task.instructions,
                boost: 0,
                monthlyValue: parseFloat( this.task.monthlyValue ),
                cap: parseFloat( this.task.cap ),
                oneTime: false,
                blame: this.$store.getters.member.memberId,
            }
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/grid'
@import '../../styles/button'

.bountycreate
  background: transparent
  padding: 2.5em
  color: white

.choose
  button
    width: 250px
    height: 3em
    margin-left: 11px
    img
      float: right
      height: 2.5em
      margin-right: 1em

.g
    background: green

.p
    background: purple

.onetime
    display: inline

.cashup
    height: 9em

</style>
