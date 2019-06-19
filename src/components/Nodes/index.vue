<template lang='pug'>

#nodes
    .row
        .six.columns
            summaryy
        .six.columns
            channel(v-for='n in $store.getters.channels', :c='n')
</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import Tag from './Tag'
import WhyLightning from './WhyLightning'
import Summaryy from './Summary'
import Mercher from './Mercher'
import Channel from './Channel'
import ChannelCreate from '../forms/ChannelCreate'

export default {
    components:{
        SharedTitle, Tag, WhyLightning, Summaryy, Mercher, Channel, ChannelCreate
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

.columns p
    font-size: .99em
    color: accent2

</style>
