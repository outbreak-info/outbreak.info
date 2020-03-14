<template>
  <div class="py-5">
    <p class="case-summary focustext">
      {{ currentDate ? `As of ${currentDate}` : "Currently" }}, there are
      <span class="text-highlight">{{
        currentTotalCases.toLocaleString()
      }}</span>
      confirmed COVID-19 cases in
      <span class="text-highlight">{{ numCountries }} countries</span>
      worldwide, with the most heavily hit areas including
      <span v-for="(country, idx) in mostCases" :key="idx">
        <router-link
          :data-tippy-info="`view ${country.locationName} over time`"
          :to="{
            name: 'Epidemiology',
            query: { location: country.locationName }
          }"
          class="hardest-hit text-sec font-weight-bold"
          >{{ country.locationName }}</router-link
        >
        <span v-if="idx < mostCases.length - 1">{{
          idx === mostCases.length - 2 ? ", and " : ", "
        }}</span> </span
      >.
    </p>
    <p class="focustext">
      In the last day,
      <span v-if="firstCases.length > 0">
        <router-link
          :data-tippy-info="
            `
        ${firstCases
          .map(d => d.locationName)
          .sort()
          .join(', ')}
      `
          "
          id="first-cases"
          :to="{ name: 'Epidemiology', query: { location: newCountries } }"
          class="text-sec font-weight-bold"
          >{{ firstCases.length }} countries</router-link
        >
        have announced their <span class="text-highlight">first cases</span>,
        and
      </span>
      <router-link
        id="changing-countries"
        :data-tippy-info="
          `
      ${countriesAboveThreshold
        .map(d => d.locationName)
        .sort()
        .join(', ')}`
        "
        :to="{ name: 'Epidemiology', query: { location: changingCountries } }"
        class="text-sec font-weight-bold"
        >{{ countriesAboveThresholdCount }} countries
      </router-link>
      have reported more than
      <span class="text-highlight">{{ caseThreshold }} new cases</span>.
    </p>
    <p class="text-center">
      <router-link
        class="btn btn-main-outline router-link no-underline m-5"
        role="button"
        :to="{ name: 'Epidemiology', query: { location: mostCasesNames } }"
        >Explore cases over time</router-link
      >
    </p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import tippy from "tippy.js";
import "tippy.js/themes/light.css";

import { timeFormat } from "d3";

export default Vue.extend({
  name: "CaseSumamry",
  props: {},
  data() {
    return {};
  },
  watch: {},
  computed: {
    ...mapState("epidata", [
      "mostRecentDate",
      "currentTotalCases",
      "firstCases",
      "mostCases",
      "numCountries",
      "caseThreshold",
      "countriesAboveThreshold"
    ]),
    currentDate() {
      const formatDate = timeFormat("%e %B %Y");
      let lastUpdated = null;
      if (this.mostRecentDate) {
        lastUpdated = formatDate(this.mostRecentDate);
      }
      return lastUpdated;
    },
    countriesAboveThresholdCount() {
      return this.countriesAboveThreshold.length;
    },
    changingCountries() {
      return this.countriesAboveThreshold.map(d => d.locationName).join(";");
    },
    newCountries() {
      return this.firstCases.map(d => d.locationName).join(";");
    },
    mostCasesNames: function() {
      return this.mostCases.map(d => d.locationName).join(";");
    }
  },
  methods: {},
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
