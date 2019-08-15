<template lang='pug'>

.panel
    .row(v-if='red.length + green.length + blue.length > 0')
      .four.grid(v-if='red.length > 0')
          card-panel(:c='red')
      .four.grid(v-if='green.length > 0')
          card-panel(:c='green')
      .four.grid(v-if='blue.length > 0')
          card-panel(:c='blue')
    .row(v-if='yellow.length + purple.length > 0')
      .two.grid
          p &nbsp;
      .four.grid(v-if='yellow.length > 0')
          card-panel(:c='yellow')
      .four.grid(v-if='purple.length > 0')
          card-panel(:c='purple')
</template>

<script>

import CardPanel from './CardPanel'

export default {
  props: ['c'],
  computed:{
      red(){
          return this.c.filter(f => f.color === "red")
      },
      yellow(){
          return this.c.filter(f => f.color === "yellow")
      },
      green(){
          return this.c.filter(f => f.color === "green")
      },
      purple(){
          return this.c.filter(f => f.color === "purple")
      },
      blue(){
          return this.c.filter(f => f.color === "blue")
      },
  },
  components:{
      CardPanel,
  },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/button'

.panel
    width: (100% - 2em)
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
