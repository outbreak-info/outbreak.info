<template>
<div>
  <div class="d-flex flex-wrap justify-content-center mt-2">
    <label class="b-contain m-0 mr-3 mb-2" v-for="option in options" :key="option.label">
      <small>{{option.label}}</small>
      <input type="checkbox" :value="option" v-model.lazy="selectedMutations" @change="debounceSelectMutation" />
      <div class="b-input"></div>
    </label>
  </div>
  <ReportPrevalenceOverlay :data="prevalences" :seqCounts="seqCounts" :epi="epi" v-if="prevalences && epi" :locationID="locationID" :locationName="locationName" />

</div>
</template>

<script>
import Vue from "vue";

import {
  getEpiMutationPrevalence,
  getAllTemporalPrevalences
} from "@/api/genomics.js";
import {
  getEpiTraces
} from "@/api/epi-traces.js";
import ReportPrevalenceOverlay from "@/components/ReportPrevalenceOverlay.vue";

import uniq from "lodash/uniq";
import debounce from "lodash/debounce";

export default {
  name: "LocationReport",
  props: {
    options: Array,
    seqCounts: Array,
    locationID: String,
    locationName: String,
    selected: [Array, String]
  },
  components: {
    ReportPrevalenceOverlay
  },
  watch: {
    locationID() {
      this.setMutations();
      this.updateData();
    },
    selected() {
      this.setMutations();
      this.updateMutations();
    }
  },
  data() {
    return ({
      // filters
      numPreselected: 3,
      selectedMutations: [],
      // data
      prevalences: null,
      epi: null
    })
  },
  created: function() {
    this.debounceSelectMutation = debounce(this.selectMutation, 250);
  },
  mounted() {
    this.setMutations();
    this.updateData();
  },
  methods: {
    selectMutation() {
      const queryParams = this.$route.query;

      this.$router.push({
        name: "LocationReport",
        params: {
          disableScroll: true
        },
        query: {
          loc: this.locationID,
          xmin: queryParams.xmin,
          xmax: queryParams.xmax,
          muts: queryParams.muts,
          pango: queryParams.pango,
          variant: queryParams.variant,
          selected: this.selectedMutations.map(d => d.label)
        }
      })
      // this.updateMutations();
    },
    setMutations() {
      if (this.selected.length) {
        this.selectedMutations = typeof(this.selected) == "string" ? this.options.filter(d => this.selected == d.label) : this.options.filter(d => uniq(this.selected).includes(d.label));
      } else {
        this.selectedMutations = this.options.slice(0, this.numPreselected);
      }
    },
    updateMutations() {
      this.prevalenceSubscription = getAllTemporalPrevalences(this.$genomicsurl, this.locationID, this.selectedMutations).subscribe(results => {
        this.prevalences = results;
      })
    },
    updateData() {
      this.prevalenceSubscription = getEpiMutationPrevalence(this.$genomicsurl, this.$apiurl, this.locationID, this.selectedMutations).subscribe(results => {
        this.epi = results.epi;
        this.prevalences = results.mutations;
      })
    }
  }
}
</script>
