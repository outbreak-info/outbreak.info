<template>
<div>
  <Warning :animate="false" class="mt-2" text="Case counts will increase when testing becomes more prevalent. So be careful how you interpret these doubling rates: rate of testing could confound the interpretation of doubling rates.">
  </Warning>
  <div class="d-flex align-items-center mx-4">
    <div class="d-flex flex-column align-items-center mr-5">
      <h3 class="plot-title text-sec py-5" v-if="epi$">
        Cumulative number of COVID-19 <select v-model="variable" class="select-dropdown" @change="changeParams">
          <option v-for="option in variableOptions" :value="option.value" :key="option.value">
            {{ option.label }}
          </option>
        </select>
        <span v-if="epi$"> in
          <router-link v-if="epi$" :to="{ name: 'Epidemiology', query: { location: locationID } }">{{epi$.data[0].name}}</router-link>
        </span>
      </h3>
      <h3 v-else class="pt-5">Select a location</h3>
      <SearchBar class="w-100 mb-3" @location="setLocation" :selected="selected" placeholder="Change location"></SearchBar>
      <DoublingCurve v-if="epi$" :data="epi$" :toFit="toFit" @executeFit="executeFit" :variable="variable" />
    </div>
    <DoublingTable :data="epi$" :isFitting1="fitting1" :isFitting2="fitting2" @changeFit="changeFit" v-if="epi$" />
  </div>

</div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  getDoubling,
  getAllDoubling
} from "@/api/calc-doubling.js";

import DoublingCurve from "@/components/DoublingCurve.vue"
import DoublingTable from "@/components/DoublingTable.vue"
import Warning from "@/components/Warning.vue"
import SearchBar from "@/components/SearchBar.vue"

export default Vue.extend({
  name: "DoublingRates",
  components: {
    DoublingCurve,
    DoublingTable,
    Warning,
    SearchBar
  },
  data() {
    return {
      locationID: null,
      variable: "confirmed",
      variableOptions: [{
        label: "Cases",
        value: "confirmed"
      }, {
        label: "Deaths",
        value: "dead"
      }],
      epi$: null,
      dataSubscription: null,
      toFit: null,
      fitting1: false,
      fitting2: true,
      // set up initial plot indices
      // (this.plottedData.length - this.numFit)
      // this.plottedData.length - this.numFit * 2 && i < this.plottedData.length - this.numFit)
      // this.fitIdx1 = [23,24,25,26];
      // this.fitIdx2 = [23,24,25,26];
    }
  },
  computed: {
    selected() {
      if (this.epi$) {
        return ({
          id: this.epi$.data[0].location_id,
          label: this.epi$.data[0].name
        })
      } else {
        return null
      }
    }
  },
  methods: {
    changeFit: function(fitIdx) {
      this.toFit = fitIdx;
    },
    changeParams: function(newVar) {
      console.log('change');
      this.updateData();
      this.$router.push({
        path: "doubling-rates",
        query: {
          location: this.locationID,
          variable: this.variable
        }
      })
    },
    executeFit: function(fitIdx) {
      this[`fitting${fitIdx}`] = !this[`fitting${fitIdx}`];
    },
    setLocation: function(result) {
      console.log(result);
      this.locationID = result;
      this.updateData();
    },
    updateData: function() {
      this.dataSubscription = getDoubling(this.$apiurl, this.locationID, this.variable).subscribe(results => {
        this.epi$ = results;
      })
    }
  },
  mounted() {
    // getAllDoubling(this.$apiurl, this.variable).subscribe(d => console.log(d))
    this.locationID = this.$route.query.location;
    this.variable = this.$route.query.variable ? this.$route.query.variable : "confirmed";

    this.updateData();
  },
  beforeDestroy() {
    this.dataSubscription.unsubscribe();
  }
});
</script>
