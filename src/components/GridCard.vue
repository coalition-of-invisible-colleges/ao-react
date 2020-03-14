<template lang='pug'>
.meme(ref='wholeCard')
    linky(:x='b.name' v-if='!dogeCard')
    div(v-else) {{ dogeCard.name }}
</template>

<script>
import Linky from './Linky'

export default {
    props: ['b'],
    components: { Linky },
}

</script>

<style lang="stylus" scoped>

.meme
  overflow-wrap: break-word
  word-wrap: break-word
  word-break: break-word
  hyphens: auto
  display: flex
  justify-content: center
  align-items: center
  width: 100%
  height: 100%
  overflow: hidden
</style>
