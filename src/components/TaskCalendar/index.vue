<template lang='pug'>

.expandedcard
    hyper-deck(:taskId='id')
</template>

<script>

import HyperDeck from '../Deck/HyperDeck'

export default {
    components:{
        HyperDeck
    },
    computed: {
        id(){
            return this.$route.path.split('/')[2]
        },
    },
}

</script>

<style lang='stylus' scoped>

.expandedcard
    width: 100%

</style>
