<template lang='pug'>

#newmember
    shared-title(:title='calcTitle')
    form-box(btntxt="Cash Placed in Safe"  event='member-paid' v-bind:data='member')
        label amount
        input(autofocus="autofocus" v-model='member.paid' type='text')
        label notes
        input(v-model='member.notes' type='text')

</template>

<script>
import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'

export default {
    mounted(){
        let memberId = this.$router.currentRoute.path.split('/')[2]
        if (memberId){
          this.member.memberId = memberId
        }
    },
    data(){
        return {
            member: {
                memberId: '',
                paid: '',
                isCash: false,
                notes: ''
            }
        }
    },
    components: {
        SharedTitle, FormBox
    },
    computed: {
        calcTitle(){
            let name = 'nobodies'
            this.$store.state.members.forEach( member => {
                if (member.memberId === this.member.memberId){
                    name = member.name
                }
            })
            return name + " bought thing: "
        }
    }
}

</script>

<style lang='stylus' scoped>
@import '../../styles/colours'


</style>
