<template lang='pug'>

.priorityaction.clearboth
    img.singleship.rotate(@click="deaction"   src='../../assets/images/singleship.svg')
    .row.clearboth
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

import HyperCard from '../Card'
import Linky from '../Card/Linky'

export default {
    components: { HyperCard, Linky },
    data(){
        return {
            notes: ''
        }
    },
    props: ['taskId', 'inId'],
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
        },
        isGrabbed(){
          return this.card.deck.indexOf( this.$store.getters.member.memberId ) > -1
        },
        isDecked(){
          return this.$store.getters.memberCard.subTasks.indexOf(this.taskId) > -1
        },
    },
    methods: {
        deaction(){
            this.$store.commit("setAction", false)
        },
        goIn(){
            this.$router.push("/task/" + this.taskId)
        },
        claim(){
            if(!this.isGrabbed) {
                this.$store.dispatch("makeEvent", {
                    type: 'task-grabbed',
                    taskId: this.taskId,
                    memberId: this.$store.getters.member.memberId,
                })
            }
            this.$store.dispatch("makeEvent", {
                type: 'task-claimed',
                taskId: this.taskId,
                memberId: this.$store.getters.member.memberId,
                inId: this.inId,
                notes: this.notes,
            })
        },
        refuse(){
            this.$store.dispatch("makeEvent", {
                type: 'task-refocused',
                inId: this.inId, //does not exist
                taskId: this.taskId,
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
    position: relative
    top: 0em
    left: -5.9em

.arrow
    height: 3.35em
    border-radius: 3px

button
    img
        background: white
        padding: .1em

.rotate
    transform: rotate(180deg);

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

.emphasize
    font-weight: bold
    font-size: 1.5em
</style>
