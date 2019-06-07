<template lang='pug'>

.panel
    .row
      .four.columns(v-if='red.length > 0')
          card-panel(:c='red', :taskId='inId')
      .four.columns(v-if='green.length > 0')
          card-panel(:c='green', :taskId='inId')
      .four.columns(v-if='blue.length > 0')
          card-panel(:c='blue', :taskId='inId')
    .row
      .two.columns
          p &nbsp;
      .four.columns(v-if='yellow.length > 0')
          card-panel(:c='yellow', :taskId='inId')
      .four.columns(v-if='purple.length > 0')
          card-panel(:c='purple', :taskId='inId')

</template>

<script>

import CardPanel from './CardPanel'

export default {
  props: ['c', 'inId'],
  components:{
      CardPanel,
  },
  computed: {
      red(){
          return this.c.filter( c => { if(!c) { return false } return c.color === 'red' } )
      },
      yellow(){
          return this.c.filter( c => { if(!c) { return false } return c.color === 'yellow' } )
      },
      blue(){
          return this.c.filter( c => { if(!c) { return false } return c.color === 'blue' } )
      },
      purple(){
          return this.c.filter( c => { if(!c) { return false } return c.color === 'purple' } )
      },
      green(){
          return this.c.filter( c => { if(!c) { return false } return c.color === 'green' } )
      },
  },

}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/button'

.panel
    width: 100%
    margin: 0 1em 0 -1em
    padding: 0 2em

.card
    padding: 2em
    color: white
    text-align: center
    font-size:1.3em
    color:white

#cyber
    width: 100%
    opacity: 0.5


</style>
