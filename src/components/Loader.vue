<template lang='pug'>
div(v-if='$store.state.context.loading')
  h1 {{ $store.state.context.loading }}
</template>

<script>

export default {
}

</script>

<style lang='stylus' scoped>

h1
    position: fixed
    left: 50%
    top: 32%
    transform: translateX(-50%)
    z-index: 9002
    padding: 0.5em
    background-color: rgba(22, 22, 22, 0.8)
    text-align: center
    border-radius: 0.5em

</style>
