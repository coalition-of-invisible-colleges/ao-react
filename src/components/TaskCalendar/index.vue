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
    mounted(){
        console.log("mounted called on task calend, not trigging ")
        // this.$store.commit("setParent", [])
        if (this.$store.state.context.panel.length === 0){
            this.$store.commit("setPanel", [this.$route.path.split('/')[2]], 0)
        }
    }
    // watch: {
    //     '$route': 'set'
    // },
    // methods: {
    //     set(){
    //         console.log("route called in taskcal")
    //     },
    // },
}

</script>

<style lang='stylus' scoped>

.expandedcard
    width: 100%

</style>
