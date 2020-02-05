<template lang='pug'>

.zen
</template>

<script>

export default {
    mounted() {
        this.$store.commit('setMode' , 0)
        this.$store.commit('setDimension' , 0)
        this.$store.commit('stopLoading')
    },
}
</script>
