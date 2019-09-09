<template lang='pug'>

.AOs
    .row
        .six.columns
            form-box(btntxt="connect"  event='ao-connected' v-bind:data='ao')
                label(for="aoAddressInput") onion address:
                input#aoAddressInput(v-model='ao.address' type='text')
                label(for="aoSecretInput") connection secret:
                input#aoSecretInput(v-model='ao.secret' type='text')
        .six.columns
            h4 currently connected to:
            .row
                template.row(v-for='r in $store.state.ao')
                    p {{ r.address }}
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
            ao: {
                type: "ao-connected",
                address: "uuzwra53lwkzcp47ue5t6ilr7w2fzgkdjdcrqosrrm5mqqnloudmnxqd.onion:8003",
                secret: this.$store.state.loader.token,
            }
        }
    },
    components: { FormBox },
    methods: {
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

label
    color: black
    text-align: center
    padding: 0
    margin-bottom: -50px

.birdy
    float: left
    height: .777em
    cursor: pointer

.faded
    opacity: 0.235654

.faded:hover
    opacity: 1

</style>
