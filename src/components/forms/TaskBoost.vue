<template lang='pug'>

#boost-task
    shared-title(:title='getTitle')
    form-box(btntxt="Edit task" event='task-boosted' v-bind:data="info")
        label Boost Amount
        input(v-model='info.amount' type='text')
        label notes
        input(v-model='info.notes' type='text')

</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'

export default {
    mounted(){
        let taskId = this.$router.currentRoute.path.split('/')[2]
        if (taskId){
          this.info.taskId = taskId
        }
    },
    computed: {
        getTitle(){
            let title
            this.$store.state.tasks.forEach(b => {
                if (b.taskId == this.info.taskId){
                    title = "Boost " + b.name + " task!"
                }
            })
            return title
        }
    },
    data(){
        return {
            info: {
                taskId: '',
                amount:'',
                notes: ''
            }
        }
    },
    components:{
        SharedTitle, FormBox
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

p
    font-size:1.3em
    color:white
    font-family: 'Open Sans', light, sans-serif;

a
    color: accent2

h3
    text-align: left
    color:accent1
    font-family: 'Open Sans', light, sans-serif;


</style>
