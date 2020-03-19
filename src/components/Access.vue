<template lang="pug">

#resource.container
    h1 Access
    .list(v-if='isLoggedIn  && resources.length > 0')
        row(v-for="r in resources", :r="r", :c='panel')
    .padding(v-else)
        h5 dctrl fobtap points
        ol
            li Raspberry pi running fobtap rfid scan point.
            li Door, vending machine, ... many possibilities
            button(@click='createTest') create test resource
</template>

<script>
  import Row from "./ResourceRow";
  import uuidV1 from "uuid/v1";

  export default {
    mounted() {
      this.$store.commit("setMode", 0);
      this.$store.commit("setDimension", 2);
      this.$store.dispatch("loaded");
    },
    computed: {
      resources() {
        return this.$store.state.resources.slice().filter(r => !r.pubkey);
      },
      isLoggedIn() {
        return this.$store.getters.isLoggedIn;
      },
      panel() {
        return this.resources.map(r => r.resourceId);
      }
    },
    components: {
      Row
    },
    methods: {
      createTest(letter) {
        let newEv = {
          type: "resource-created",
          resourceId: uuidV1(),
          name: "teste",
          charged: 0,
          secret: "asd",
          trackStock: true
        };
        this.$store.dispatch("makeEvent", newEv);
      }
    }
  };
</script>

<style lang="stylus" scoped>

  @import '../styles/colours'
  @import '../styles/button'
  @import '../styles/skeleton'
  @import '../styles/title'

  #resource
      width: 100%

  .padding
      padding: 1.987654321em
  li
      margin-left: 1em
</style>
