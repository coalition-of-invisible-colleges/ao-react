<template lang='pug'>

.panel
    .row(v-if='$store.getters.red.length + $store.getters.green.length + $store.getters.blue.length > 0')
      .four.grid(v-if='$store.getters.red.length > 0')
          card-panel(:c='$store.getters.red', :taskId='$store.state.context.panel[$store.state.context.top]')
      .four.grid(v-if='$store.getters.green.length > 0')
          card-panel(:c='$store.getters.green', :taskId='$store.state.context.panel[$store.state.context.top]')
      .four.grid(v-if='$store.getters.blue.length > 0')
          card-panel(:c='$store.getters.blue', :taskId='$store.state.context.panel[$store.state.context.top]')
    .row(v-if='$store.getters.yellow.length + $store.getters.purple.length > 0')
      .two.grid
          p &nbsp;
      .four.grid(v-if='$store.getters.yellow.length > 0')
          card-panel(:c='$store.getters.yellow', :taskId='$store.state.context.panel[$store.state.context.top]')
      .four.grid(v-if='$store.getters.purple.length > 0')
          card-panel(:c='$store.getters.purple', :taskId='$store.state.context.panel[$store.state.context.top]')
</template>

<script>

import CardPanel from './CardPanel'

export default {
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
