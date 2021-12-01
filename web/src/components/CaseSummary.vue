<template>
  <div>
    <div class="container py-3" v-if="currentSummary$">
      <p class="case-summary focustext">
        {{ currentDate$ ? `As of ${currentDate$}` : "Currently" }}, there are
        <span class="text-highlight">{{ currentSummary$["confirmed"] }}</span>
        confirmed COVID-19 cases
        <!-- in -->
        <!-- <span class="text-highlight">{{ currentSummary$.numCountries }} countries</span> -->
        worldwide with at least
        <span class="text-highlight">{{ currentSummary$.dead }} deaths</span>.
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
        <router-link
          id="changing-countries"
          :data-tippy-info="
            `
      ${currentSummary$.aboveThreshold.names}`
          "
          :to="{
            name: 'Epidemiology',
            query: { location: currentSummary$.aboveThreshold.link }
          }"
          class="text-sec font-weight-bold"
          >{{ currentSummary$.aboveThreshold.count }} countries
        </router-link>
        have reported more than
        <span class="text-highlight">{{ caseThreshold.toLocaleString() }} new cases</span>.
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

    <section
      class="d-flex flex-column justify-content-center align-items-left bg-grag-grey text-light px-3 pt-2 mb-5"
    >
      <div class="d-flex justify-content-center align-items-center mb-2">
        <div>
          <h5 class="at-a-glance-header m-0">At a glance</h5>
          <p class="ml-3 mb-0">
            View the three locations with the largest increase in COVID-19 cases in the
            past day, or select your own locations
          </p>
          <button
            class="btn btn-main-outline router-link no-underline white-background"
            @click="summaryDeletable = !summaryDeletable"
          >
            {{ summaryDeletable ? "done" : "change locations" }}
          </button>
        </div>
      </div>

      <div class="row d-flex justify-content-center">
        <GlanceSummary
          v-for="(location, idx) in glanceSummaries"
          :key="idx"
          class="d-flex mx-2 mb-3"
          :data="location"
          :idx="location.location_id"
          :deletable="summaryDeletable"
          @removed="removeSummary"
        />

        <div
          class="d-flex mx-2 py-3 px-3 flex-column align-items-center box-shadow add-items bg-grag-main"
          v-if="summaryDeletable"
        >
          <h6>Add locations</h6>
          <SearchBar @location="addSummary" class="search-bar"></SearchBar>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import tippy from "tippy.js";
import "tippy.js/themes/light.css";
import GlanceSummary from "@/components/GlanceSummary";
import SearchBar from "@/components/SearchBar";

import { timeFormat } from "d3";
import { getSummary} from "@/api/epi-basics.js";
import { getGlanceSummary } from "@/api/genomics.js";
import { getCurrentDate } from "@/api/biothings.js";

export default Vue.extend({
  name: "CaseSummary",
  components: {
    GlanceSummary,
    SearchBar
  },
  props: {},
  data() {
    return {
      currentDate: null,
      caseThreshold: 1000,
      glanceLocations: [],
      glanceSummaries: [],
      summaryDeletable: false,
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
    removeSummary: function(idx) {
      this.glanceLocations = this.glanceLocations.filter((d, i) => d !== idx);
      Vue.$cookies.set("custom_locations", this.glanceLocations);
      if (this.glanceLocations.length > 0) {
        this.updatedSubscription = getGlanceSummary(
          this.$apiurl, this.$genomicsurl,
          this.glanceLocations
        ).subscribe(d => {
          this.glanceSummaries = this.sortSummaries(d);
        });
      } else {
        this.glanceSummaries = [];
      }
    },
    addSummary: function(location_id) {
      this.glanceLocations = this.glanceLocations.concat(location_id);
      Vue.$cookies.set("custom_locations", this.glanceLocations);
      this.updatedSubscription = getGlanceSummary(
        this.$apiurl, this.$genomicsurl,
        this.glanceLocations
      ).subscribe(d => {
        this.glanceSummaries = this.sortSummaries(d);
      });
    },
    sortSummaries(data) {
      if (this.glanceLocations && this.glanceLocations.length > 0) {
        data.sort(
          (a, b) =>
            this.glanceLocations.indexOf(a.location_id) -
            this.glanceLocations.indexOf(b.location_id)
        );
      }
      return data;
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
      currentDate$: getCurrentDate(this.$apiurl)
    };
  },
  mounted() {
    const locations = Vue.$cookies.get("custom_locations");
    this.glanceLocations = locations ? locations.split(",") : [];

    this.dataSubscription = getGlanceSummary(
      this.$apiurl, this.$genomicsurl,
      this.glanceLocations
    ).subscribe(d => {
      this.glanceSummaries = this.sortSummaries(d);
      this.glanceLocations = d.map(d => d.location_id);
      Vue.$cookies.set("custom_locations", this.glanceLocations);
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
    });
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.at-a-glance-header {
  text-transform: uppercase;
}
.search-bar {
  width: 250px;
}
.white-background {
  background: white;
}
.add-items {
  height: 120px;
}
</style>
