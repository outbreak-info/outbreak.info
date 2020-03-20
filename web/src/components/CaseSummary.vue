<template>
<div class="py-5" v-if="currentSummary$">
  <p class="case-summary focustext">
    {{ currentDate$ ? `As of ${currentDate$}` : "Currently" }}, there are
    <span class="text-highlight">{{
        currentSummary$["confirmed"]
      }}</span>
    confirmed COVID-19 cases
    <!-- in -->
    <!-- <span class="text-highlight">{{ currentSummary$.numCountries }} countries</span> -->
    worldwide with at least <span class="text-highlight">{{currentSummary$.dead}} deaths</span>.
    <!-- , with the most heavily hit areas including
    <span v-for="(country, idx) in mostCases" :key="idx">
      <router-link :data-tippy-info="`view ${country.name} over time`" :to="{
            name: 'Epidemiology',
            query: { location: country.location_id }
          }" class="hardest-hit text-sec font-weight-bold">{{ country.name }}</router-link>
      <span v-if="idx < mostCases.length - 1">{{
          idx === mostCases.length - 2 ? ", and " : ", "
        }}</span>
    </span>. -->
  </p>
  <p class="focustext">
    In the last day,
    <!-- <span v-if="currentSummary$.firstCases.count > 0">
      <router-link :data-tippy-info="
            `${currentSummary$.firstCases.names}`
          " id="first-cases" :to="{ name: 'Epidemiology', query: { location: currentSummary$.firstCases.link } }" class="text-sec font-weight-bold">{{ currentSummary$.firstCases.count }} countries</router-link>
      have announced their <span class="text-highlight">first cases</span>,
      and
    </span> -->
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

  <section class="row">
    <div class="col-sm-12">
      <h4 class="text-left m-0">At a glance</h4>
      <button @click="changeLocations()">change locations</button>
    </div>

    <div class="row d-flex">
      <GlanceSummary v-for="(location, idx) in glanceSummaries" :key=idx class="d-flex mx-2 mb-3" :data="location" :idx="String(idx)"/>
    </div>

  </section>

</div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  mapState
} from "vuex";
import tippy from "tippy.js";
import "tippy.js/themes/light.css";
import GlanceSummary from "@/components/GlanceSummary";

import {
  timeFormat
} from "d3";
import {
  getSummary,
  getGlanceSummary
} from "@/api/epi-basics.js";
import {
  getCurrentDate
} from "@/api/biothings.js";

export default Vue.extend({
  name: "CaseSummary",
  components: {
    GlanceSummary
  },
  props: {},
  data() {
    return {
      currentDate: "2001-02",
      caseThreshold: 50,
      glanceLocations: [],
      glanceSummaries: [],
      dataSubscription: null,
      updatedSubscription: null
    };
  },
  watch: {},
  computed: {
    ...mapState("epidata", ["mostCases"]),
    mostCasesNames: function() {
      return this.mostCases.map(d => d.location_id).join(";");
    }
  },
  methods: {
    changeLocations() {
      this.glanceLocations = ["KOR", "US-CA_USA", "US-MO_USA"];
      this.updatedSubscription = getGlanceSummary(this.$apiurl, this.glanceLocations).subscribe(d => {
        this.glanceSummaries = d;
      });
    }
  },
  destroyed() {
    this.dataSubscription.unsubscribe();
    if (this.updatedSubscription) {
      this.updatedSubscription.unsubscribe();
    }
  },
  subscriptions() {
    return {
      currentSummary$: getSummary(this.$apiurl, this.caseThreshold),
      currentDate$: getCurrentDate(this.$apiurl),
    }
  },
  mounted() {
    this.dataSubscription = getGlanceSummary(this.$apiurl, this.glanceLocations).subscribe(d => {
      this.glanceSummaries = d;
    });
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
