<template lang='pug'>
    div Add a custom badge!
        input(type='text', v-model='badgename', autocapitalize="none", autocomplete="off", autocorrect="off")
        label(for='badgename') choose badge name
        span
        button(@click="addBadge") Add Badge
        button(@click="removeBadge") Remove Badge

</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'
import request from 'superagent'

export default {
    mounted(){
        let memberId = this.$router.currentRoute.path.split('/')[2]
        if (memberId){
          this.member.memberId = memberId
        }
    },
    components: {
        SharedTitle, FormBox
    },
    methods: {
        addBadge(){
            console.log("Adding badge " + this.badge)
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'badge-added',
                    memberId: this.member.memberId,
                    badge: this.badgename,
                })
                .end((err,res)=>{
                    console.log(err, res);
                })
        },
        removeBadge(){
            console.log("Adding badge " + this.badge)
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'badge-removed',
                    memberId: this.member.memberId,
                    badge: this.badgename,
                })
                .end((err,res)=>{
                    console.log(err, res);
                })
        }
    },
    data(){
        return {
            member: {
                badge: '',
                memberId: ''
            }
        }
    }
}

</script>

<style lang='stylus' scoped>
@import '../../styles/colours'

</style>
