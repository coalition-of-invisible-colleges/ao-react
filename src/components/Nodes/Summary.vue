<template lang='pug'>

.summary
  p.chain mainnet ({{ $store.getters.confirmedBalance.toLocaleString() }})
    .lim(v-if='$store.getters.limbo > 0') limbo ({{ $store.getters.limbo.toLocaleString() }})
  .row
    .six.grid
      p.local local ({{ $store.getters.totalLocal.toLocaleString() }})
    .six.grid
      p.remote remote ({{ $store.getters.totalRemote.toLocaleString() }})
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
    background: purple
    color: white
    padding: 1em

.remote
    margin: 0
    background: green
    color: white
    text-align: right
    padding: 1em

.chain
    margin: 0
    background: accent2
    color: white
    padding: 1em
    text-align: center


.break
    overflow-wrap: break-word;

#worf
    float: right

.lim
  color: black



</style>
