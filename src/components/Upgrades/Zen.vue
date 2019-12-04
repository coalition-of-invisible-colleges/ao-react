<template lang='pug'>

.zen
</template>

<script>

export default {
    mounted() {
        this.$store.commit('stopLoading')
    },
}
</script>
