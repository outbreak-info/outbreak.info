<template>
<div>
  <div class="row m-0">
    <div class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5" style="min-height: 70vh;">
      <div class="container half-page">
        <h1>Latest changes</h1>
        <p>
          A summary of the latest additions and data changes to outbreak.info
        </p>

        <div class="d-flex mb-4" v-for="(update, idx) in updates" :key="idx">
          <span class="update-date">
            {{formatDate(update.date)}}
          </span>
          <div class="d-flex flex-column text-left">
            <h5 class="m-0 mb-1"><span class="update-type mr-2"> {{update.category}}</span> {{update.title}}</h5>
            <div>

              <span v-html="update.description" class="text-muted"></span>
              <router-link class="ml-2" :to="update.route" v-if="update.route">Example</router-link>
            </div>
          </div>

        </div>
      </div>
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
  name: "Latest",
  computed: {
    ...mapState("admin", ["updates"])
  },
  methods: {
    formatDate: function(date) {
      const dateFormatter = timeFormat("%d %B %Y");
      return dateFormatter(date)
    }
  },
  mounted() {
    this.updates.sort((a,b) => b.date - a.date);
  }
});
</script>

<style lang="scss" scoped>
.update-type {
    text-transform: uppercase;
    font-weight: 700;
    opacity: 0.5;
    color: $secondary-color;
}

.update-date {
  opacity: 0.6;
  min-width: 150px;
}
</style>
