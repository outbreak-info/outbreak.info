<template>
  <div
    class="bg-light d-flex flex-column justify-content-center align-items-center my-5"
  >
    <h1 class="d-block">outbreak.info in the media</h1>
    <div id="press" class="text-left w-75">
      <div
        v-for="(article, aIdx) in press"
        :key="aIdx"
        class="my-3 checkbook p-2"
      >
        <a
          :href="article.url"
          target="_blank"
          class="font-size-2 line-height-1 no-underline"
        >
          <div class="d-flex align-items-center">
            <img
              :src="require(`@/assets/press/${article.img}`)"
              class="article-logo mr-3"
            />
            <div class="d-flex flex-column">
              <span class="hover-underline">{{ article.title }}</span>
              <small class="text-muted">{{ article.date }}</small>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="js">
import Vue from "vue";

import {
  mapState
} from "vuex";

import {
  timeFormat
} from "d3";

export default Vue.extend({
  name: "Press",
  computed: {
    ...mapState("press", ["press"])
  },
  mounted() {
    this.press.sort((a,b) => a.order - b.order);
  }
})
</script>

<style lang="scss" scoped>
.article-logo {
  width: 100px;
  height: 100%;
}

.hover-underline:hover {
  text-decoration: underline !important;
}

.checkbook:nth-child(2n + 1) {
  background: lighten($base-grey, 70%);
}
</style>
