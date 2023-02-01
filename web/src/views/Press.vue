<template>
  <div
    class="bg-light d-flex flex-column justify-content-center align-items-center my-5"
  >
    <h1 class="d-block">outbreak.info in the media</h1>
    <div class="d-flex">
      <a
        :key="idx"
        :id="y"
        class="px-2"
        v-for="(y, idx) in yearOptions"
        @click="changeYear(y)"
      >
        {{ y }}
      </a>
    </div>
    <div class="w-75">
      <h2 class="text-left">{{ year }}</h2>
    </div>
    <div id="press" class="text-left w-75" v-if="pressList">
      <div
        v-for="(article, aIdx) in pressList"
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

<script>
import { mapState } from 'pinia';
import { pressStore } from '@/stores/pressStore';

export default {
  name: 'Press',
  data() {
    return {
      currentYear: new Date().getFullYear(),
      year: null,
      pressList: null,
      yearOptions: null,
    };
  },
  computed: {
    ...mapState(pressStore, ['press']),
  },
  mounted() {
    this.year = this.currentYear;

    // create an array of yearOptions from 2021 till now.
    const numYears = this.year - 2021 + 1;
    this.yearOptions = Array.from({length: numYears},(v,k) => k + 2021);

    this.updatePress();
  },
  methods: {
    changeYear(y) {
      this.year = y;
      this.updatePress();
    },
    updatePress() {
      this.pressList = this.press.filter((p) => p.date.includes(this.year));
      this.pressList.sort((a, b) => a.order - b.order);
    },
  },
};
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

a {
  text-underline: #007bff !important;
  color: #007bff !important;
  cursor: pointer;
}
</style>
