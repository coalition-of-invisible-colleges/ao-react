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
            let taskId = this.$route.path.split('/')[2]
            console.log("routed hyperdeck ", {taskId})
            if (!this.$store.getters.contextCard){
                this.$store.commit("setPanel", [taskId] , 0)
            }
        },
    },
}

</script>

<style lang='stylus' scoped>

.expandedcard
    width: 100%

</style>
