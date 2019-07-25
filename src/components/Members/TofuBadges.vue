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

export default {
    methods: {
        removeBadge(){
            this.$store.dispatch("makeEvent", {
                type: 'badge-removed',
                memberId: this.$store.getters.member.memberId,
                badge: this.badgename
            })
        },

        addBadge(){
            this.$store.dispatch("makeEvent", {
                type: 'badge-added',
                memberId: this.$store.getters.member.memberId,
                badge: this.badgename
            })
        }
    }
}
</script>
