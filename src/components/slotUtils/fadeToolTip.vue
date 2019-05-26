<template lang="pug">

transition(name='fade')
    .feed(v-if='msg')
        p {{ msg }}

</template>

<script>

export default {
    props: ['msg'],
    computed:{
    }
}
</script>

<style lang='stylus' scoped>

.feed
    position: relative
    background: rgba(0, 0, 0, 0.5)
    color: white
    top: 25px
    left: 25px

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
}

</style>
