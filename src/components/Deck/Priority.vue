<template lang='pug'>

.priorities.clearboth
    router-link(:to='"/task/" + taskId')
        //- img.singleship(v-if='!isBounty'  src='../../assets/images/vinebtn.svg')
        img.singleship(v-else  src='../../assets/images/cash1.svg')
    div.agedwrapper(:class="cardInputSty")
        .agedbackground.freshpaper
        span {{ name }} !
</template>

<script>

export default {
    props: ['taskId'],
    computed: {
        name(){
            let name
            this.$store.state.tasks.some(t => {
                if (this.taskId === t.taskId){
                    name = t.name
                    return true
                }
            })
            return name
        },
        isBounty(){
            return this.$store.getters.bounties.some( t => {
                return t.taskId === this.taskId
            })
        },
        cardInputSty() {
          let color
          this.$store.state.tasks.some(t => {
              if (this.taskId === t.taskId){
                  color = t.color
                  return true
              }
          })
          return {
              redwx : color == 'red',
              bluewx : color == 'blue',
              greenwx : color == 'green',
              yellowwx : color == 'yellow',
              purplewx : color == 'purple',
              blackwx : color == 'black',
          }
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

.priorities
    color: white

.clearboth
    clear: both

.singleship
    width: 3.3724em

.agedwrapper
    position: relative
    margin-top: 0.5em
    width: calc(100% - 5.5em)
    float: right
    padding: 0.5em
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
