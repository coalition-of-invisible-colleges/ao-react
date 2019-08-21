<template lang='pug'>

#nodes
    h1 lightning
    .row(v-if='$store.state.cash.info')
        .six.columns
            .row
                p.fl {{ $store.state.cash.info.alias }} Wallet
                p.fr block {{ $store.state.cash.info.blockheight.toLocaleString() }}
            summaryy
        .six.columns
            p {{ $store.state.cash.info.num_active_channels }} Lightning Channels
            local-remote-bar(v-for='n in $store.getters.channels', :c='n')
    .row(v-else)
        p <em>unable to read info from lightning node</em>
    .row
        p 1 point is {{ sats }}  &#12471;
        p 1 BTC is {{ cadPrice }} CAD
</template>

<script>
import calculations from '../../calculations'
import SharedTitle from '../slotUtils/SharedTitle'
import Tag from './Tag'
import WhyLightning from './WhyLightning'
import Summaryy from './Summary'
import Mercher from './Mercher'
import Channel from './Channel'
import ChannelCreate from '../forms/ChannelCreate'
import LocalRemoteBar from './LocalRemoteBar'

export default {
    components:{
        SharedTitle, Tag, WhyLightning, Summaryy, Mercher, Channel, ChannelCreate, LocalRemoteBar
    },
    computed: {
        sats(){
            let sats = calculations.cadToSats( 1 , this.$store.state.cash.spot )
            return parseInt( sats ).toLocaleString()
        },
        cadPrice(){
            return parseInt( this.$store.state.cash.spot ).toLocaleString()
        },
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'

a
    color: purple

h1
    text-align: center
    
.h
    height: 2em

.j
    color: accent1
    font-size: 1.5em
    margin-bottom: 1.123em
    background-color: main

#nodes
    color:paleYellow
    width: 100%

.break
    overflow-wrap: break-word;

#worf
    height: 23em

#palm
    width:110%

.setupyourown
    margin-top: 2.2345em
    padding: 2em
    color: purple
    font-size: 1.12em

.small
    font-size: .68em
    word-break: break-all

p
    text-align: center

.fl
    float: left
.fr
    float: right


</style>
