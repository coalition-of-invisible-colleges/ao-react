<template lang='pug'>

div
    p(v-html='linkifiedName')
    slot.centered

</template>

<script>

export default {
    name: 'linky',
    props: ['x'],
    computed: {
        linkifiedName(){
            var text = this.x
            var regex = /((http|ftp|https):\/\/)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z0-9]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
            var linkedtext = text.replace(regex, function (url) {
              var linkedurl = url
              var hasprotocolregex = /((http|ftp|https):\/\/)/i
              if(hasprotocolregex.exec(url) === null) {
                linkedurl = "http://" + url
              }
              linkedurl = "<a href='" + linkedurl + "' target='_blank'>" + url + "</a>"
              return linkedurl
            } );
            return linkedtext
        },
    }
}

</script>

<style lang='stylus'>

.centered
    text-align: center
    width: 100%

</style>
