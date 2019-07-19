<template lang='pug'>

.priorityaction.clearboth
    div.agedwrapper(:class="cardInputSty")
        .agedbackground.freshpaper
        //- hyper-card(:b='card')
        router-link.fr(:to='"/task/" + taskId')
            img.singleship(src='../../assets/images/vinebtn.svg')
        h3.ptr(@dblclick.stop.pre='goIn') {{card.name}}
        .row
            .six.grid
                button.accept(@click='claim')
                    img.arrow.fr(src='../../assets/images/buddadoge.svg')
                    span complete
            .six.grid
                button.dontaccept(@click='refuse')
                    img.arrow.fl(src='../../assets/images/buddadoge.svg')
                    span refocus
</template>

<script>

import request from 'superagent'
import HyperCard from '../Card'

export default {
    components: { HyperCard },
    data(){
        return {
            notes: ''
        }
    },
    props: ['taskId', 'nextAction', 'inId'],
    computed: {
        card(){
            return this.$store.getters.hashMap[this.taskId]
        },
        name(){
            return this.card.name
        },
        cardInputSty() {
          let color = this.card.color
          return {
              redwx : color == 'red',
              bluewx : color == 'blue',
              greenwx : color == 'green',
              yellowwx : color == 'yellow',
              purplewx : color == 'purple',
              blackwx : color == 'black',
          }
        }
    },
    methods: {
        goIn(){
            this.$router.push("/task/" + this.taskId)
        },
        claim(){
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'task-claimed',
                    taskId: this.taskId,
                    memberId: this.$store.getters.member.memberId,
                    inId: this.inId,
                    notes: this.notes,
                })
                .end((err,res)=>{

                })
        },
        refuse(){
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'task-refocused',
                    inId: this.inId, //does not exist
                    taskId: this.taskId,
                })
                .end((err,res)=>{

                })
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/grid'

button
    width: 100%
    span
        color : white
        font-weight: bolder;

.priorityaction
    color: white

.clearboth
    clear: both

.singleship
    width: 3.3724em
    margin-top: 0.5em

.arrow
    height: 3.35em
    border-radius: 3px

button
    img
        background: white
        padding: .1em


.accept, .dontaccept
    background: accent5
    padding: .789em
    border-style: none
    // img
.fr
  float:right

.fl
  float:left

.agedwrapper
    position: relative
    margin-top: 0.5em
    float: right
    padding: 0.5em
    width: calc(100% - 5.5em)
    margin-right: 0.5em

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
    //border-radius: 12px

.freshpaper
    background-image: url('../../assets/images/paper.jpg')
    opacity: 0.2

</style>
