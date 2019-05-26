<template lang='pug'>

#task-rate-change
    shared-title(:title='getTitle')
    form-box(btntxt="change rate" event='task-rate-updated' v-bind:data="info")
        label New Monthly Amount
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
                    title = "Change rate ~ " + b.name + " !"
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
