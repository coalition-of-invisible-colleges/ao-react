<template lang='pug'>

#nodes
  div(v-if='$store.state.cash.info')
    .row
        .six.columns
            .row
                p.fl {{ $store.state.cash.info.alias }} Wallet
                p.fr block {{ $store.state.cash.info.blockheight.toLocaleString() }}
            summaryy
            .row

                select(v-model='selectedPeer')
                    option(v-for='p in $store.state.cash.info.peers'  val='p.id'  :class='{bluetx: p.channels, redtx: !p.channels }') {{ p.id }}
                button Open Channel
        .six.columns
            p {{ $store.state.cash.info.num_active_channels }} Lightning Channels
            local-remote-bar(v-for='n in $store.getters.channels', :c='n')
    .row
          h3 Connection Info
          template(v-for='a in $store.getters.connectionUris')
              .container
                  span.bluewx
                      tag(:d='a')
                  span {{a}}
  .row(v-else)
      p <em>unable to read info from lightning node</em>
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
    data(){
        return {
            selectedPeer: false
        }
    },
    components:{
        SharedTitle, Tag, WhyLightning, Summaryy, Mercher, Channel, ChannelCreate, LocalRemoteBar
    },
    computed: {

    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'
@import '../../styles/button'

.container
    content-align: center

h3
    text-align: center

option
    // background: wrexblue
    color: white

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

label
    word-break: break-all


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
