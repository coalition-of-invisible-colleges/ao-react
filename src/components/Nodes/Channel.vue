<template lang='pug'>

.channel
  .row.grid
    .one.grid
      img#active(v-if='c.active', src='../../assets/images/check.svg')
      img#active(v-else, src='../../assets/images/warn.svg')
    .three.grid
      .dontbreak(@click='open') {{ c.funding_txid }}
    .eight.grid
      local-remote-bar(:c='c')

</template>

<script>

import LocalRemoteBar from './LocalRemoteBar'

export default {
    components: { LocalRemoteBar },
    props: ['c'],
    computed: {
      node(){
          return false
      },
    },
    methods: {
      open(){
        window.open('https://blockstream.info/tx/' + this.c.funding_txid)
      }
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/grid'

.channel
    color: accent3
    padding: 1em

#nodes
  width: 100%

img
  position: relative
  height: 3em
  left: -10px

.dontbreak
    word-break: break-all
    cursor: pointer
    color: purple
    text-decoration: underline;

</style>
