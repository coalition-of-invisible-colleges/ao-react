<template lang='pug'>

#createtask
  .label
      .row.btnpanel
          .btnwrapper
            button(@click='switchColor("red")').redwx.paperwrapper
              img.agedbackground
            button(@click='switchColor("yellow")').yellowwx.paperwrapper
              img.agedbackground
            button(@click='switchColor("green")').greenwx.paperwrapper
              img.agedbackground
            button(@click='switchColor("purple")').purplewx.paperwrapper
              img.agedbackground
            button(@click='switchColor("blue")').bluewx.paperwrapper
              img.agedbackground
  transition(name="slide-fade")
      .cc(v-show='showCreate')
          textarea#card.fwi(v-model='task.name' type='text', :class='cardInputSty', placeholder="idea here", @keyup.enter.exact='createOrFindTask', @keydown.enter.exact.prevent).paperwrapper
          img.specialoverlay
          button(@click='createOrFindTask').fwi Create Card

</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'
import request from "superagent"

export default {
    props: ['taskId'],
    data(){
        return {
            currentColor: '',
            showCreate: false,
            task: {
                name: '',
                color: '',
            },
        }
    },
    components: {
        SharedTitle, FormBox
    },
    methods: {
        switchColor(color){
            if (this.task.color === color){
                this.showCreate = !this.showCreate
            } else if (this.showCreate) {
                // don't close, switch
            } else {
                this.showCreate = !this.showCreate
            }
            this.task.color = color
            setTimeout(()=>{
                    document.getElementById('card').focus()
            }, 1) 
        },
        resetCard(){
            this.task.name = ''
        },
        subTaskTask(taskId) {
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'task-sub-tasked',
                    taskId: this.taskId,
                    subTask: taskId,
                })
                .end((err,res)=>{
                    console.log({err,res})
                    this.resetCard()
                })
        },
        createOrFindTask(){
            let foundId = this.matchCard
            let potentialCard = this.task.name.trim()
            console.log("potentialCard is ", potentialCard)
            if(!foundId) {
                request
                    .post('/events')
                    .set('Authorization', this.$store.state.loader.token)
                    .send({
                        type: 'task-created',
                        name: potentialCard,
                        color: this.task.color,
                        deck: [this.$store.getters.member.memberId],
                    })
                    .end((err,res)=>{
                        if (err) return console.log(err);
                        this.$store.state.tasks.forEach( t => {
                            if (t.name === potentialCard){
                                this.subTaskTask(t.taskId)
                            }
                        })
                    })
            }
            this.subTaskTask(foundId)
        },
    },
    computed: {
        matchCard(){
            let foundId
            this.$store.state.tasks.filter(t => {
                if(t.name === this.task.name.trim()) {
                    foundId = t.taskId
                }
            })
            return foundId
        },
        colorWord(){
            switch (this.task.color) {
                case "blue": return 'info'
                case "red": return 'challenge'
                case "green": return 'do'
                case "purple": return 'dream'
                case "yellow": return 'align'
                case "black": return 'bark'
            }
        },
        cardInputSty(){
            return {
                redwx : this.task.color == 'red',
                bluewx : this.task.color == 'blue',
                greenwx : this.task.color == 'green',
                yellowwx : this.task.color == 'yellow',
                purplewx : this.task.color == 'purple',
                blackwx : this.task.color == 'black',
            }
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/grid'
@import '../../styles/skeleton'
@import '../../styles/button'
@import '../../styles/breakpoints'

#createtask
  width: fit-content
  background-color: rgba(51, 51, 51, 0.3)
  color: accent1
  margin: 0 auto 0 auto
  text-align: center
  padding: 0.5em

button
    background: green
    border-color: rgba(0, 0, 0, 0.4)
    
.onetime
    display: inline

.color
    height: 2.5em
    color: white
    padding: 1em

.colorlabel
    font-size: 1.6em
    color: white
    align-content: center;
    text-align: center

@media (max-width: breakpoint)
    .colorlabel
        span
            display: none

#bark
    float: right
    height: 3em

.fwi
    width: 100%
    text-align: center
    color: white
    max-width: 20.225425em

.specialoverlay
    background-image: url('../../assets/images/paper.jpg')
    background-repeat: no-repeat
    background-position: center center
    background-size: cover
    top: 0
    left: 0
    right: 0
    bottom: 0
    width: 20.225425em
    pointer-events: none
    height: 12.5em
    z-index: 10
    position: absolute
    opacity: 0.13

.tealbk
    background: green

.cc
    position: relative
    
p
    font-size: 1.3em
    color: accent1

.upgradeimg
   height: 3em

.btnpanel
    button
        cursor: pointer
        min-height: 2.5em
        width: 4.045085em
        margin: 0
        
.btnwrapper
    width: 100%
    display: block
    text-align: center

.slide-fade-enter-active {
  transition: all .6s ease;
}
.slide-fade-leave-active {
  transition: all .4s ease;
}
.slide-fade-enter {
  // transform: translateY(-400px);
  opacity: 0;
}
.slide-fade-leave-to {
 // transform: translateY(-400px);
  opacity: 0;
}

.label
    color: white
    font-weight: bolder

textarea
    padding-top: 1em
    border-color: rgba(0, 0, 0, 0.4)
    height: 12.5em
    padding-top: 5.5em
    
.centr
    text-align: center

.paperwrapper
    position: relative
    
.agedbackground
    background-image: url('../../assets/images/paper.jpg')
    background-repeat: no-repeat
    background-position: center center
    background-size: cover
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: absolute
    width: 100%
    height: 100%
    pointer-events: none
    opacity: 0.2
    
</style>
