<template lang='pug'>

.changer
    h2 Update {{$store.getters.member.name}}:
        select(v-model='change.field', @change='empty')
            option(value='name') hackername
            option(value='secret') password
            option(value='fob') fob
    .input-container
        input.input-effect(:type='inputType' v-model='change.newfield'  :class='{"has-content":!!change.newfield}')
        label {{"new " + change.field}}
        span.focus-border
    br
    .input-container(v-if='inputType === "password"')
        input.input-effect(:type='inputType', v-model='change.confirmNewfield'  :class='{"has-content":!!change.confirmNewfield}')
        label repeat
        span.focus-border
    .check(v-if='inputType === "password"')
        img(v-if='matched', src='../assets/images/check.svg')
        img(v-else, src='../assets/images/warn.svg')
    button(@click='update') update account
</template>

<script>

import cryptoUtils from '../crypto'

export default {
    computed: {
        matched(){
            let x = this.change.newfield
            let y = this.change.confirmNewfield
            return x === y
        },
        changeReq(){
            if (this.change.field === 'secret'){
                  return {
                      type: "member-field-updated",
                      field: this.change.field,
                      newfield: cryptoUtils.createHash( this.change.newfield),
                      memberId: this.$store.getters.member.memberId
                  }
            }
            return {
                type: "member-field-updated",
                field: this.change.field,
                newfield: this.change.newfield,
                memberId: this.$store.getters.member.memberId
            }
        },
        secure(){
            let secure = false
            if ( this.$store.getters.member.badges ) {
                secure = this.$store.getters.member.badges.some(b => b === 'secure')
            }
            return secure
        },
        inputType(){
            if (this.change.field === 'secret'){
                return 'password'
            } else {
                return 'text'
            }
        }
    },
    data(){
        return {
            change: {
                field: 'secret',
                newfield: '',
                confirmNewfield: ''
            }
        }
    },
    methods: {
        empty(){
            this.change.newfield = ''
            this.change.confirmNewfield = ''
        },
        update(){
            this.$store.dispatch('makeEvent', this.changeReq)
        }
    }
}
</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/button'
@import '../styles/skeleton'
@import '../styles/input'

img
    float: left
    height: 3em
    position: relative
    right: 0

input, select
    z-index:123123

</style>
