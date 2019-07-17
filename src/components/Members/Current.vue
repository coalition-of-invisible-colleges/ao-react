<template lang='pug'>

.current(v-if='memberId && b.guild.length > 0')
    span.checkmark.clickable(v-if='isCompleted'  @click='uncheck') ☑
    span.checkmark.clickable(v-else  @click='complete') ☐
    span.name {{ name }} 
    router-link.plain(v-for='c in completions'  :to='"/task/" + c.taskId')
        span.checkmark(:class="cardInputSty(c.color)") ☑
.current(v-else)
    img.bullet(src='../../assets/images/bullet.svg')
    span.name {{ name }} 
</template>

<script>

import request from 'superagent'

export default {
  props: ['memberId', 'b', 'inId'],
  methods:{
    complete(){
        console.log('taskId is ' + this.b.taskId + ' and memberId is ' + this.memberId)
        request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'task-claimed',
                    taskId: this.b.taskId,
                    memberId: this.memberId,
                    notes: 'checked by ' + this.$store.getters.member.memberId
                })
                .end((err,res)=>{

                })
    },
    uncheck(){
        console.log('taskId is ' + this.b.taskId + ' and memberId is ' + this.memberId)
        request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'task-unclaimed',
                    taskId: this.b.taskId,
                    memberId: this.memberId,
                    notes: ''
                })
                .end((err,res)=>{

                }) 
    },
    cardInputSty(c){
        console.log("color is " + c)
        return {
            redtx : c === 'red',
            bluetx : c === 'blue',
            greentx : c === 'green',
            yellowtx : c === 'yellow',
            purpletx : c === 'purple',
            blacktx : c === 'black',
        }
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
        let completed = this.b.claimed
        return completed.indexOf(this.memberId) > -1
    },
    completions(){
        let completions = []
        let allTasks = this.b.subTasks.concat(this.b.priorities).concat(this.b.claimed)
        allTasks.forEach(t => {
            let task = this.$store.getters.hashMap[t]
            if(!task || !task.claimed) return
            if(task.claimed.indexOf(this.memberId) > -1) {
                if(completions.indexOf(task) === -1) {
                    completions.push(task)
                }
            }
        })
        return completions
    },
  }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'

img
    height: 0.7em
    float: left
.name
    color: white
    font-size: 1.2em
    margin-right: 1em
    position: relative
    top: -0.3em
    
.checkmark
    font-size: 2em
    margin-right: 0.25em

.bullet
    height: 0.7em
    margin-right: 0.25em
    
.clickable
    cursor: pointer
    color: white
    
.plain
    text-decoration: none
</style>
