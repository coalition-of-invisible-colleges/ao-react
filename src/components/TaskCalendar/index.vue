<template lang='pug'>

.expandedcard
    hyper-deck
</template>

<script>

import HyperDeck from '../Deck/HyperDeck'

export default {
    components:{
        HyperDeck
    },
    beforeRouteEnter(to, from, next) {
          next(vm => {
              vm.setDeck()
          })
    },
    methods: {
        setDeck(){
            this.$store.commit("setPanel", [this.$route.path.split('/')[2]], 0)
        },
    },
}

</script>

<style lang='stylus' scoped>

.expandedcard
    width: 100%

</style>
