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

            if (!this.$store.state.context.panel[this.$store.state.context.top]){
                console.log('dont have context building simple')
                this.$store.commit("setPanel", [taskId])
                this.$store.commit("setTop", 0)
                this.$store.commit("setParent", [])
            } else {

            }

        },
    },
}

</script>

<style lang='stylus' scoped>

.expandedcard
    width: 100%

</style>
