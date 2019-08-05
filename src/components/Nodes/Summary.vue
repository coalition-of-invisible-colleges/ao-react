<template lang='pug'>

.summary
  .block block {{ $store.state.cash.info.blockheight }}
  p.chain
      span mainnet &#12471; {{ $store.getters.confirmedBalance.toLocaleString() }}
      .lim(v-if='$store.getters.limbo > 0') limbo &#12471; {{ $store.getters.limbo.toLocaleString() }}
  .row
    .six.grid
      p.local local &#12471; {{ $store.getters.totalLocal.toLocaleString() }}
    .six.grid
      p.remote remote  &#12471; {{ $store.getters.totalRemote.toLocaleString() }}
</template>

<script>

import Mercher from './Mercher'

export default {
    computed: {},
    components:{
        Mercher
    },
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'

.local
    margin: 0
    background: wrexpurple
    color: white
    padding: 1em

.remote
    margin: 0
    background: wrexgreen
    color: white
    text-align: right
    padding: 1em

.chain
    margin: 0
    background: wrexyellow
    color: white
    padding: 1em
    text-align: center
    position: relative


.break
    overflow-wrap: break-word;

#worf
    float: right

.lim
  color: black

.block
    float: right
    font-size: .77em

</style>
