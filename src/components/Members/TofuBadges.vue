<template lang="pug">
div Add a custom badge!
    input(type='text', v-model='badgename', autocapitalize="none", autocomplete="off", autocorrect="off")
    label(for='badgename') choose badge name
    span
    button(@click="addBadge") Add Badge
    span
    button(@click="removeBadge") Remove Badge
</template>

<script>

import request from 'superagent'

export default {
    methods: {
        removeBadge(){
            console.log("Removing badge " + this.badgename)
             request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'badge-removed',
                    memberId: this.$store.getters.member.memberId,
                    badge: this.badgename
                })
                .end((err,res)=>{
                    console.log(err, res);
                })
        },

        addBadge(){
            console.log("Adding badge " + this.badgename)
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'badge-added',
                    memberId: this.$store.getters.member.memberId,
                    badge: this.badgename
                })
                .end((err,res)=>{
                    console.log(err, res);
                })
        }
    }
}
</script>
