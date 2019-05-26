
<template lang='pug'>

div
   iframe(frameborder='0')


</template>

<script>

export default {
    methods:{
      firstUrl(){
        var text = this.b.name;
        var regex = /((http|ftp|https):\/\/)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z0-9]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        var urls = regex.exec(text);

        if(urls !== null) {
          var url = urls[0];
          var hasprotocolregex = /((http|ftp|https):\/\/)/i;
          if(hasprotocolregex.exec(url) === null) {
            url = "http://" + url;
          }

          return url;
        }
        return false;
      },
    }
}

</script>

<style lang='stylus'></style>
