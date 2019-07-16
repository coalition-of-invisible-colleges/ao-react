<template lang='pug'>

.current(v-if='memberId')
    span.checkmark(v-if='isCompleted') ☑
    span.checkmark(v-else  @click='complete') ☐
    span {{ name }}

</template>

<script>

import request from 'superagent'

export default {
  props: ['memberId', 'taskId', 'inId'],
  methods:{
    complete(){
        console.log('taskId is ' + this.taskId + ' and memberId is ' + this.memberId)
        request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'task-claimed',
                    taskId: this.taskId,
                    memberId: this.memberId,
                    inId: this.inId,
                    notes: 'checked by ' + this.$store.getters.member.memberId
                })
                .end((err,res)=>{

                })
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
        let completed = this.$store.getters.hashMap[this.taskId].completed
        if(!completed) return false
        return completed.indexOf(this.memberId) > -1
    },
  }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'

img
    height: 0.7em
    float: left
p
    margin-left: 1em
    color: white
    font-size: 1.2em

.checkmark
    font-size: 2em
    cursor: pointer
    color: white
    
</style>
