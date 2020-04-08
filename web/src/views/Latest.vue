<template>
<div>
  <div class="row m-0">
    <div class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5" style="min-height: 70vh;">
      <div class="container half-page">
        <h1>Latest changes</h1>
        <p>
          A summary of the latest additions and data changes to outbreak.info
        </p>

        <div class="update-container">
          <div class="d-flex mb-4" v-for="(update, idx) in updates" :key="idx">
            <span class="update-linker">
            </span>
            <span class="update-date pl-3">
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
    this.updates.sort((a, b) => b.date - a.date);
  }
});
</script>

<style lang="scss" scoped>
$circle-width: 10px;
.update-type {
    text-transform: uppercase;
    font-weight: 700;
    opacity: 0.5;
    color: $secondary-color;
}

.update-container {
    border-left: 1px solid $grey-40;
}

.update-date {
    opacity: 0.6;
    min-width: 170px;
    position: relative;
}

// .update-date:before {
//     background: $grey-40;
//     content: "";
//     left: 0;
//     height: 1px;
//     position: absolute;
//     top: 0.75em;
//     transform: translateY(-50%);
//     width: 32px;
//     z-index: 1;
// }

.update-linker {
    position: relative;
}

.update-linker:before {
    background: $grey-40;
    content: "";
    left: 0;
    height: 1px;
    position: absolute;
    top: 0.75em;
    transform: translateY(-50%);
    width: 20px;
    z-index: 1;
}

.update-linker:after {
  content: '';
  display: inline-block;
  width: $circle-width;
  height: $circle-width;
  -moz-border-radius: 7.5px;
  -webkit-border-radius: 7.5px;
  border-radius: 7.5px;
    background: $grey-40;
  position: absolute;
  top: 0.75em;
  transform: translate(22px, -50%);
}
</style>
