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
      <p>View the three regions with the largest increase in cases in the past day, or select your own regions</p>
      <button @click="summaryDeletable = !summaryDeletable">{{summaryDeletable ? "done" : "change locations"}}</button>
    </div>

    <div class="row d-flex">
      <GlanceSummary v-for="(location, idx) in glanceSummaries" :key=idx class="d-flex mx-2 mb-3" :data="location" :idx="String(idx)" :deletable="summaryDeletable" @removed="removeSummary" />

      <div class="d-flex align-items-center" v-if="summaryDeletable">
        <SearchBar :routable="false" @location="addSummary"></SearchBar>
        <button class="add-location d-flex justify-content-center align-items-center">
          <font-awesome-icon :icon="['fas', 'plus-circle']" class="add-btn" />
        </button>
      </div>
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
import SearchBar from "@/components/SearchBar";

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

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faPlusCircle
} from "@fortawesome/free-solid-svg-icons";

library.add(faPlusCircle);

export default Vue.extend({
  name: "CaseSummary",
  components: {
    GlanceSummary,
    SearchBar,
    FontAwesomeIcon
  },
  props: {},
  data() {
    return {
      currentDate: "2001-02",
      caseThreshold: 50,
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
      this.glanceLocations = this.glanceLocations.filter((d,i) => i !== +idx);
      Vue.$cookies.set('custom_locations', this.glanceLocations);
      if (this.glanceLocations.length > 0) {
        this.updatedSubscription = getGlanceSummary(this.$apiurl, this.glanceLocations).subscribe(d => {
          this.glanceSummaries = d;
        });
      } else {
        this.glanceSummaries = [];
      }
    },
    addSummary: function(location_id) {
      this.glanceLocations = this.glanceLocations.concat(location_id);
      Vue.$cookies.set('custom_locations', this.glanceLocations);
      this.updatedSubscription = getGlanceSummary(this.$apiurl, this.glanceLocations).subscribe(d => {
        this.glanceSummaries = d;
      });
    },
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
    const locations = Vue.$cookies.get('custom_locations');
    this.glanceLocations = locations ? locations.split(",") : [];

    this.dataSubscription = getGlanceSummary(this.$apiurl, this.glanceLocations).subscribe(d => {
      this.glanceSummaries = d;
      this.glanceLocations = d.map(d => d.location_id);
      console.log(this.glanceLocations)
      Vue.$cookies.set('custom_locations', this.glanceLocations);
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
.add-location {
    width: 50px;
    height: 50px;
    background: lighten($warning-color, 38%);
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        background: $warning-color;
        & .add-btn {
            color: lighten($warning-color, 35%) !important;
        }
    }
}
.add-btn {
    color: $warning-color;
    font-size: 36px;
}
</style>
