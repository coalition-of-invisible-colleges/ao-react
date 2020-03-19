<template lang="pug">

.portal(ref='memeportal')
    img.pepe(src='../assets/images/pepe.svg'  :class='{ highlight : isMemed }'  :key='$store.getters.contextCard')
</template>

<script>
  import Hammer from "hammerjs";
  import Propagating from "propagating-hammerjs";

  export default {
    mounted() {
      let el = this.$refs.memeportal;
      if (!el) return;
      let mc = Propagating(new Hammer.Manager(el));

      let singleTap = new Hammer.Tap({ event: "singletap", time: 400 });
      let doubleTap = new Hammer.Tap({
        event: "doubletap",
        taps: 2,
        time: 400,
        interval: 400
      });
      let longPress = new Hammer.Press({ time: 400 });

      mc.add([doubleTap, singleTap, longPress]);

      doubleTap.recognizeWith(singleTap);
      singleTap.requireFailure([doubleTap]);

      mc.on("singletap", e => {
        this.goPepe();
        e.stopPropagation();
      });

      mc.on("doubletap", e => {
        this.goPepe();
        e.stopPropagation();
      });

      mc.on("press", e => {
        this.meme();
        this.goPepe();
        e.stopPropagation();
      });
    },
    methods: {
      goPepe() {
        this.$router.push("/grid");
      },
      meme() {
        // add a meme to the empty spot nearest the center
      }
    },
    computed: {
      isMemed() {
        // for some reason this isn't being called; :key above seems wrong
        return Object.values(this.$store.state.grid).some(row => {
          if (!row) return false;
          return Object.values(row).some(tId => {
            if (tId === this.$store.getters.contextCard.taskId) {
              return true;
            }
          });
        });
      }
    }
  };
</script>

<style lang="stylus" scoped>

  @import '../styles/colours'

  .portal
      position: fixed
      bottom: 0
      right: 0
      margin-left: 0.5em
      margin-bottom: 0.3em
      z-index: 151

  .pepe
      left: -30px
      bottom: 15px
      position: relative
      opacity: 0.5
      height: 35px
      width: 35px
      cursor: pointer
      z-index: 9001

  .highlight
      box-shadow: 0 0 20px wrexblue
      border-radius: 50%
</style>
