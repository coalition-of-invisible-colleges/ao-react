<template lang='pug'>

.AOs
    .row
        .six.columns
            h4 {{ $store.state.cash.alias }} Connection Info:
            h6 Address:
                code(v-if='$store.state.cash.alias') {{ $store.state.cash.address }}
                code(v-else) set an alias for this AO to display address
            h6 Connection Secret:
                code {{ connectionString }}
            form-box(btntxt="rename"  event='ao-named'  v-bind:data='aoNamed')
                label(for="aoAliasInput") change ao alias:
                input#aoAliasInput(v-model='aoNamed.alias' type='text')
        .six.columns
            h4 Connect to AO
            form-box(btntxt="connect"  event='ao-connected' v-bind:data='ao')
                label(for="aoAddressInput") address:
                input#aoAddressInput(v-model='ao.address' type='text')
                label(for="aoSecretInput")  connection secret:
                input#aoSecretInput(v-model='ao.secret' type='text')
        .clearboth
            h4 Connected AOs
            ul
                li(v-for='$store.state.ao') {{ ao }}
    //- h4 current active links:
    //- .row
    //-     template.row(v-for='r in $store.state.ao')
    //-         // relay info / recent communications
    //-         h6 {{ r.address }} -
    //-             span.discon(@click='discon(r.address)') disconnect
    //-         h6 attempts: {{ r.attempts }} -- successes: {{ r.successfuls }}, fails: {{ r.fails }}
    //-     template.row(v-for='a in $store.state.cash.subscribed')
    //-         p {{ a }}
</template>

<script>

import FormBox from './slotUtils/FormBox'

export default {
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
            connectionString: this.$store.state.loader.token
        }
    },
    components: { FormBox },
    methods: {
        discon(address){
            this.$store.dispatch("makeEvent", {
                type: 'ao-disconnected',
                address,
            })
        },
        toggleGive(){
            this.showGive = !this.showGive
        },
    },
    computed: {
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

@import '../styles/colours';
@import '../styles/skeleton';
@import '../styles/grid';
@import '../styles/button';

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

.discon
    cursor: pointer
    color: red

.clearboth
    width: 40%
    margin-left: 50%
    transform: translateX(-50%)
    clear: both
</style>
