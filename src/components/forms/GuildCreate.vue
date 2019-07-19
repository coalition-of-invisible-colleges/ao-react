<template lang='pug'>

.guildcreate
  form-box.centerform(btntxt="create guild" event='task-guilded' v-bind:data="task")
    fancy-input(labelText='code name')
        input.input-effect(v-model='task.guild' type='text')

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
                guild: '',
            }
        }
    },
    components: {
        SharedTitle, FormBox, FancyInput
    },
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/grid'
@import '../../styles/button'

.guildcreate
  background: transparent
  padding: 0em 2.5em
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

.centerform
    margin: 0 auto 1em auto
</style>
