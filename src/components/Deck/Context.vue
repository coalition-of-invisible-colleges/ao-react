<template lang='pug'>

.context.paperwrapper(:class="cardInputSty")
    //router-link(:to='"/task/" + taskId')
    //div.paperwrapper
    .hyperpaper
    .popup()
        linky.here(:x='name'  :key='name')
    slot
</template>

<script>

import Linky from '../Card/Linky'

export default {
    props: ['taskId'],
    components: { Linky },
    computed: {
        name(){
            return this.$store.getters.hashMap[this.taskId].name
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

.paperwrapper
    position: relative

.hyperpaper
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
    opacity: 0.2
    
.popup
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: relative
    width: 100%
    height: 1.5em
    cursor: pointer
    
.popup .here
    visibility: hidden
    
.popup:hover
    height: 100%
    
.popup:hover .here
    visibility: visible
    padding: 1em
    
.here
    position: inline
    color: white
    pointer-events: none
</style>