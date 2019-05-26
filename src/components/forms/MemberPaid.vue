<template lang='pug'>

#newmember
  form-box(btntxt="Cash Safed"  event='member-paid' v-bind:data='member')
    fancy-input(labelText='amount')
      input.input-effect(autofocus="autofocus" v-model='member.paid' type='text')
    fancy-input(labelText='notes')
      input.input-effect(v-model='member.notes' type='text')

</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'
import FancyInput from '../slotUtils/FancyInput'

export default {
    props: ['memberId'],
    data(){
        return {
            member: {
                memberId: this.memberId,
                paid: '',
                isCash: true,
                notes: ''
            }
        }
    },
    components: {
        SharedTitle, FormBox, FancyInput
    },
    computed: {
        calcTitle(){
            let name = 'nobodies'
            this.$store.state.members.forEach( member => {
                if (member.memberId === this.member.memberId){
                    name = member.name
                }
            })
            return name + "'s paying cash: "
        }
    }
}

</script>

<style lang='stylus' scoped>
@import '../../styles/colours'


</style>
