<template lang='pug'>

#nodes
    .row
        .six.columns
            p Node Wallet Totals - {{ $store.state.cash.info.alias }}
            summaryy
        .six.columns
            p {{ $store.state.cash.info.num_active_channels }} Active Lightning Channels
            local-remote-bar(v-for='n in $store.getters.channels', :c='n')
</template>

<script>

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
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'

a
    color: purple

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

</style>
