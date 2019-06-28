<template lang='pug'>

.expandedcard
    hyper-deck(:taskId='id')
</template>

<script>

import request from 'superagent'
import Calendar from './Calendar'
import SharedTitle from '../slotUtils/SharedTitle'
import Current from '../Members/Current'
import TaskCreate from '../forms/TaskCreate'
import HyperDeck from '../Deck/HyperDeck'
import PreviewDeck from '../Deck/PreviewDeck'
import Hypercard from '../Card'
import calcs from '../../calculations'
import GuildCreate from '../forms/GuildCreate'
import BountyCreate from '../forms/BountyCreate'
import ResourceBook from '../forms/ResourceBook'
import Actions from '../Card/Actions'

export default {
    components:{
        SharedTitle, Calendar, Current, TaskCreate,
        HyperDeck, Hypercard, GuildCreate, ResourceBook,
        BountyCreate, PreviewDeck, Actions
    },
    data(){
        return {
            search: '',
            showMark:0,
        }
    },
    methods: {
        rotate(){
            this.showMark = (this.showMark + 1) % this.calcTask.deck.length
        }
    },
    computed: {
        id(){
            return this.$route.path.split('/')[2]
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'
@import '../../styles/button'

.expandedcard
    width: 100%



</style>
