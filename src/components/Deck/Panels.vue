<template lang='pug'>

.panel(:class='{ fullwidth : $store.state.upgrades.stacks === 1 }')
    div(v-if='$store.state.upgrades.stacks === 5')
        .row(v-if='$store.getters.red.length + $store.getters.green.length + $store.getters.blue.length > 0')
          .four.columns.minheight
              card-panel(v-if='$store.getters.red.length > 0'  :c='$store.getters.red', :taskId='$store.state.context.panel[$store.state.context.top]')
          .four.columns.minheight
              card-panel(v-if='$store.getters.green.length > 0'  :c='$store.getters.green', :taskId='$store.state.context.panel[$store.state.context.top]')
          .four.columns(v-if='$store.getters.blue.length > 0')
              card-panel(:c='$store.getters.blue', :taskId='$store.state.context.panel[$store.state.context.top]')
        .row(v-if='$store.getters.yellow.length + $store.getters.purple.length > 0')
          .two.columns.minheight
          .four.columns.minheight(v-if='$store.getters.yellow.length > 0')
              card-panel(:c='$store.getters.yellow', :taskId='$store.state.context.panel[$store.state.context.top]')
          .four.columns(v-if='$store.getters.purple.length > 0')
              card-panel(:c='$store.getters.purple', :taskId='$store.state.context.panel[$store.state.context.top]')
    .padonestack(v-else-if='$store.state.upgrades.stacks === 1')
        card-panel(v-if='$store.getters.all.length > 0'  :c='$store.getters.all', :taskId='$store.state.context.panel[$store.state.context.top]')
</template>

<script>

import CardPanel from './CardPanel'

export default {
  components:{
      CardPanel,
  },
  computed: {
    
  }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/button'

.panel
    margin: 0 1em 1em 1em
    clear: both
    padding-bottom: 1.5em

.card
    padding: 2em
    color: white
    text-align: center
    font-size:1.3em
    color:white

#cyber
    width: 100%
    opacity: 0.5

.minheight
    min-height: 0.5em

.padonestack
    padding-top: 0.001em
    max-width: calc(100vw - 4em)

.fullwidth
    width: 100%

.minheight
    min-height: 0.001em
</style>
