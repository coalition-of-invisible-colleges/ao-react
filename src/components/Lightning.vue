<template lang='pug'>

#nodes
  div(v-if='$store.state.cash.info')
    .row
        .six.columns.container
            .row
                p.fl {{ $store.state.cash.info.alias }} Wallet
                p.fr block {{ $store.state.cash.info.blockheight.toLocaleString() }}
            summaryy
            .row
                h4(v-if='unchanneled.length > 0') select peer to open channel
                div(v-for='p in unchanneled' @click='selectPeer(p.id)'  :class='{bluetx: p.id === selectedPeer}') {{ p.id }}
                button(v-if='selectedPeer'   @click='requestChannel') Request Channel
        .six.columns.container
            p {{ $store.state.cash.info.num_active_channels }} Lightning Channels
            local-remote-bar(v-for='n in $store.state.cash.channels', :c='n')
    .row
          h3 Connection Info
          template(v-for='a in $store.getters.connectionUris')
              .row.container
                  .six.columns
                      tag(:d='a')
                  .six.columns
                      label {{a}}
    payments
  .row(v-else)
      p <em>unable to read info from lightning node</em>
</template>

<script>
import calculations from '../calculations'
import SharedTitle from './SharedTitle'
import Tag from './Tag'
import Summaryy from './Summary'
import LocalRemoteBar from './LocalRemoteBar'
import Payments from './Payments'

import request from 'superagent'

export default {
    data(){
        return {
            selectedPeer: false
        }
    },
    components:{
        SharedTitle, Tag, Summaryy, LocalRemoteBar, Payments
    },
    computed: {
        unchanneled(){
            return this.$store.state.cash.info.peers.filter(p => !p.channels)
        }
    },
    methods:{
        selectPeer(pId){
            if (pId === this.selectedPeer){
                return this.selectedPeer = false
            }
            this.selectedPeer = pId
        },
        requestChannel(){
            request
                .post('/lightning/channel')
                .send({id : this.selectedPeer})
                .set("Authorization", this.$store.state.loader.token)
                .end((err, res)=>{
                    console.log("response from channel", res.body)
                })
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'

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
