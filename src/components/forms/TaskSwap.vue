<template lang='pug'>

#newmember
    shared-title(:title='getTitle')
    form-box(btntxt="Claim task", v-bind:data="info", event='task-claimed')
        label Did you do the following?
        p {{ getInstructions }}
        label Add a Note (optional)
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
    data(){
        return {
            info: {
                taskId: '',
                memberId: this.$store.getters.memberId,
                notes: ''
            }
        }
    },
    computed: {
        getTitle(){
            let title = '...'
            this.$store.state.tasks.forEach(t => {
                if (t.taskId == this.info.taskId){
                    title = "Claim " + t.name + "!"
                }
            })
            return title
        },
        getInstructions(){
            let instructions = '...'
            this.$store.state.tasks.forEach(t => {
                if (t.taskId == this.info.taskId){
                    instructions = t.instructions + "!!!"
                }
            })
            return instructions
        }
    },
    components: {
        SharedTitle, FormBox
    }
}

</script>

<style lang='stylus' scoped>
@import '../../styles/colours'


</style>
