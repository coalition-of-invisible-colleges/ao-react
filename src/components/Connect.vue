<template lang='pug'>

.Connect.container
    h1 Connect
    h2(v-if='liveConnections.length > 0'  ) Connected to
    div(v-for='r in liveConnections')
        h4 {{ r.state.cash.alias }} connected - {{ uptimePercent(r.successfuls, r.fails) }}% uptime ({{ r.successfuls + r.fails }} attempts) -
        span.conn(@click='pollState(r.address)') update
        span.discon(@click='discon(r.address)') delete
    h2(v-if='brokeConnections.length > 0'  ) Broken from
    div(v-for='r in brokeConnections')
        h4 {{ r.address.slice(0, 11) }} - {{ uptimePercent(r.successfuls, r.fails) }}% uptime ({{ r.successfuls + r.fails }} attempts) -
        span.conn(@click='pollState(r.address)') update
        span.discon(@click='discon(r.address)') delete
    h2(v-if='unmatchedSubs.length > 0') Feed to
    div(v-for='s in unmatchedSubs')
        span.conn {{ s.address }}
        span.discon(@click='discon(s.address)').discon delete
    h3 This Nodes Connection Info:

    h3 Connect to another AO:
    form-box(btntxt="connect"  event='ao-connected' v-bind:data='ao')
        label(for="aoAddressInput") address:
        input#aoAddressInput(v-model='ao.address' type='text')
        label(for="aoSecretInput")  connection secret:
        input#aoSecretInput(v-model='ao.secret' type='text')
    h3 Update AO name (currently called {{ $store.state.cash.alias }})
    form-box.topspace(btntxt="rename"  event='ao-named'  v-bind:data='aoNamed')
        label(for="aoAliasInput") change ao alias:
        input#aoAliasInput(v-model='aoNamed.alias' type='text')
    .ourinfo
        h4 Put this information into another AO to allow it to send cards here.
        h4 Address:
            code(v-if='$store.state.cash.alias') {{ $store.state.cash.address }}
            code(v-else) set an alias for this AO to display address
        h4 Connection Secret:
            code {{ $store.state.loader.token }}
</template>

<script>

import FormBox from './FormBox'

export default {
    mounted() {
        this.$store.commit('setMode' , 1)
        this.$store.commit('setDimension' , 2)
        this.$store.commit('stopLoading')
    },
    props: ['b', 'inId'],
    components: {
        FormBox
    },
    data() {
        return {
            aoNamed: {
                type: 'ao-named',
                alias: ''
            },
            ao: {
                type: "ao-connected",
                address: '',
                secret: '',
            },
        }
    },
    components: { FormBox },
    methods: {
        discon(address){
            console.log("try diconnection", address)
            this.$store.dispatch("makeEvent", {
                type: 'ao-disconnected',
                address,
            })
        },
        pollState(address) {
            console.log("pollstate")
            this.$store.dispatch("makeEvent", {
                type: 'ao-updated',
                address
            })
        },
        toggleGive(){
            this.showGive = !this.showGive
        },
        uptimePercent(successes, fails) {
            return ((successes / (successes + fails)) * 100).toFixed(1)
        },
    },
    computed: {
        liveConnections(){
            return this.$store.state.ao.filter(r => r.state && r.state.cash && r.state.cash.alias)
        },
        brokeConnections(){
            return this.$store.state.ao.filter(r => !r.state)
        },
        unmatchedSubs(){
            let addresses = this.$store.state.ao.map(r => r.address)
            console.log("connected addresses:" , {addresses})
            let un = this.$store.state.cash.subscribed.filter(s => {
                return addresses.indexOf(s.address) === -1
            })
            console.log('unmatched ', un)
            return un
        },
        playInfo(){
            return {
                type: 'task-sub-tasked',
                taskId:  this.toGuild,
                subTask: this.b.taskId,
            }
        },
        passInfo(){
            return {
                type: 'task-passed',
                taskId: this.b.taskId,
                fromMemberId: this.$store.getters.member.memberId,
                toMemberId: this.toMember,
            }
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'
@import '../styles/title'

h6
    text-align: center

label
    color: blue

.count
    float: right

.activated
    border-style: solid
    border-width: thick
    border-color: white

.upgrade
    height: 3em

.task
    color: white
    margin:10px 0
    padding:20px

.btn
    width:100%
    margin-top: 2em
    max-height: 3em

select
    background-color: lightteal

select.form-control
    color: black

.curs
    cursor: pointer;

.birdy
    float: left
    height: .777em
    cursor: pointer

.faded
    opacity: 0.235654

.faded:hover
    opacity: 1

.conn, .discon
    font-size: 0.8em
    margin-left: 0.5em
    margin-right: 0.5em

.discon
    cursor: pointer
    color: red

.conn
    cursor: pointer
    color: green
    word-wrap: break-word
    word-break: break-word

.clearboth
    // width: 50%
    // margin-left: 50%
    // transform: translateX(-50%)
    // clear: both
    // margin-top: 1em
    // padding-top: 0.75em

code
    word-wrap: break-word
    word-break: break-word

.padleft
    margin-left: 1em

.topspace
    margin-top: 1em

.flex
    display: flex
    flex-wrap: wrap
    flex-basis: 50%
    justify-content: center

@media all and (max-width: 600px)
    .flex
        flex-basis: 100%

.ourinfo
    background: lightGrey
    color: main
    padding: 1em
    border-radius: 1em
    h4
        text-align: center
</style>
