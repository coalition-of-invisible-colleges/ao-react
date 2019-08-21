<template lang='pug'>

#manage
    
</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import MemberPaid from '../forms/MemberPaid'
import RentSet from '../forms/RentSet'
import CapSet from '../forms/CapSet'
import Resources from '../Resources'
import AdminRow from './AdminRow'
import Summaryy from '../Nodes/Summary'
import ChannelCreate from '../forms/ChannelCreate'
import CardPanel from '../Deck/CardPanel'
import Changer from '../MyPage/Changer'
import Home from '../Home'

export default {
    data(){
        return {
            selectedMember: '',
            showCash: false,
            showAo: false,
        }
    },
    methods: {
        
    },
    components:{
        SharedTitle, Changer,
        RentSet, CapSet, Resources, MemberPaid, AdminRow,
        Summaryy, ChannelCreate, CardPanel
    },
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours';
@import '../../styles/skeleton';
@import '../../styles/button';



</style>
