<template>
<div class="bg-light d-flex flex-column justify-content-center align-items-center my-5">
  <h1 class="d-block">outbreak.info in the media</h1>
  <div id="press" class="text-left w-75">
    <div v-for="(article, aIdx) in press" :key="aIdx" class="my-4">
      <a :href="article.url" target="_blank" class="font-size-2 line-height-1">
        <div class="d-flex align-items-center">
          <img :src="require(`@/assets/press/${article.img}`)" class="article-logo mr-3" />
          <div class="d-flex flex-column">
            {{article.title}}
            <small class="text-muted no-underline">{{article.date}}</small>
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

.no-underline:hover {
  text-decoration: none !important;
}
</style>
