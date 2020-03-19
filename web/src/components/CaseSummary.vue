<template>
<div class="py-5" v-if="currentSummary$">
  <p class="case-summary focustext">
    {{ currentDate ? `As of ${currentDate}` : "Currently" }}, there are
    <span class="text-highlight">{{
        currentSummary$["confirmed"]
      }}</span>
    confirmed COVID-19 cases in
    <span class="text-highlight">{{ currentSummary$.numCountries }} countries</span>
    worldwide with at least <span class="text-highlight">{{currentSummary$.dead}} deaths</span>, with the most heavily hit areas including
    <span v-for="(country, idx) in mostCases" :key="idx">
      <router-link :data-tippy-info="`view ${country.name} over time`" :to="{
            name: 'Epidemiology',
            query: { location: country.location_id }
          }" class="hardest-hit text-sec font-weight-bold">{{ country.name }}</router-link>
      <span v-if="idx < mostCases.length - 1">{{
          idx === mostCases.length - 2 ? ", and " : ", "
        }}</span>
    </span>.
  </p>
  <p class="focustext">
    In the last day,
    <span v-if="currentSummary$.firstCases.count > 0">
      <router-link :data-tippy-info="
            `${currentSummary$.firstCases.names}`
          " id="first-cases" :to="{ name: 'Epidemiology', query: { location: currentSummary$.firstCases.link } }" class="text-sec font-weight-bold">{{ currentSummary$.firstCases.count }} countries</router-link>
      have announced their <span class="text-highlight">first cases</span>,
      and
    </span>
    <router-link id="changing-countries" :data-tippy-info="
          `
      ${currentSummary$.aboveThreshold.names}`
        " :to="{ name: 'Epidemiology', query: { location:  currentSummary$.aboveThreshold.link } }" class="text-sec font-weight-bold">{{ currentSummary$.aboveThreshold.count }} countries
    </router-link>
    have reported more than
    <span class="text-highlight">{{ caseThreshold }} new cases</span>.
  </p>
  <p class="text-center">
    <router-link class="btn btn-main-outline router-link no-underline m-5" role="button" :to="{ name: 'Epidemiology', query: { location: mostCasesNames } }">Explore cases over time</router-link>
  </p>
</div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  mapState
} from "vuex";
import tippy from "tippy.js";
import "tippy.js/themes/light.css";

import {
  timeFormat
} from "d3";
import {
  getSummary
} from "@/api/epi-basics.js";

export default Vue.extend({
  name: "CaseSumamry",
  props: {},
  data() {
    return {
      currentDate: "2001-02",
      caseThreshold: 50

    };
  },
  watch: {},
  computed: {
    ...mapState("epidata", ["mostCases"]),
    // currentDate() {
    //   const formatDate = timeFormat("%e %B %Y");
    //   let lastUpdated = null;
    //   if (this.mostRecentDate) {
    //     lastUpdated = formatDate(this.mostRecentDate);
    //   }
    //   return lastUpdated;
    // },
    mostCasesNames: function() {
      return this.mostCases.map(d => d.location_id).join(";");
    }
  },
  methods: {},
  subscriptions() {
    return {
      currentSummary$: getSummary(this.$apiurl, this.caseThreshold)
    }
  },
  mounted() {
    tippy("#first-cases", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });

    tippy("#changing-countries", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });

    tippy(".hardest-hit", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped></style>
