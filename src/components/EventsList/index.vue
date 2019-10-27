<template lang='pug'>

#home
    shared-title(title='Recent History')
    .row
        ev(v-for='a in recent', :e='a')
    button(@click='buildAll') Load All
</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import Ev from './Ev'

export default {
    mounted(){
        this.$store.commit('stopLoading')
    },
    data(){
        return {
            loadAll: false
        }
    },
    methods: {
        buildAll(){
            this.loadAll = true
        }
    },
    computed: {
        recent(){
            if (this.loadAll){
                return this.$store.state.recent.slice().reverse()
            }
            return this.$store.state.recent.slice(-7).reverse()
        }
    },
    components:{
        SharedTitle, Ev
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/button'
@import '../../styles/grid'


</style>
