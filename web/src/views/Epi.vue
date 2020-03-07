<template>
<div>
  <template>
    <Autocomplete :items="allPlaces" :selected="selectedPlaces" @selected="updateSelected" />
  </template>

  <div class="flex">
    <EpiCurve v-bind:data="data" />
    <EpiTable v-bind:data="data" />
  </div>
  <div id="presetLocations">
    <button v-for="(place, idx) in presetGroups" v-bind:key="idx" @click="selectGroup(place)">
      {{place.label}}
    </button>
  </div>
</div>
</template>


<script>
// @ is an alias to /src
import EpiCurve from "@/components/EpiCurve.vue";
import EpiTable from "@/components/EpiTable.vue";
import Autocomplete from "@/components/Autocomplete.vue";

import store from '@/store';
import {
  mapState
} from "vuex";

export default {
  name: "Epidemiology",
  components: {
    EpiCurve,
    EpiTable,
    Autocomplete
  },
  props: {
    region: String,
    country: String,
    location: String
  },
  data() {
    return {
      topX: 6,
      presetGroups: [{
        label: "United States",
        locations: ["US", "King County, WA", "Cook County, IL", "Tempe, AZ", "Orange, CA", "Los Angeles, CA", "Santa Clara, CA", "Boston, MA", "San Benito, CA", "Madison, WI", "San Diego County, CA", "San Antonio, TX",
          "Omaha, NE (From Diamond Princess)", "Travis, CA (From Diamond Princess)", "Lackland, TX (From Diamond Princess)", "Humboldt County, CA", "Sacramento County, CA", "Unassigned Location (From Diamond Princess)", "Portland, OR",
          "Snohomish County, WA", "Providence, RI", "Grafton County, NH", "Hillsborough, FL", "New York City, NY", "Placer County, CA", "San Mateo, CA", "Sarasota, FL", "Sonoma County, CA", "Umatilla, OR"
        ]
      }],
      selectedPlaces: [],
      data: []
    }
  },
  watch: {
    selectedPlaces: function(newValue, oldValue) {
      const newLocation = newValue ? newValue.join(";") : "";
      if (this.$route.query.location !== newLocation) {
        this.$router.push({
          path: 'epidemiology',
          query: {
            location: newLocation
          }
        })
      }
    },
    location: function(newLocation, oldLocation) {
      this.setLocation(newLocation);
    }
  },
  computed: {
    ...mapState('epidata', ["cases", "allPlaces"])
  },
  methods: {
    filterData: function(locations) {
      this.data = this.cases.filter(d => locations.map(d => d.toLowerCase()).includes(d.placeName.toLowerCase()));

      store.commit('colors/setLocations', this.data.map(d => d.placeName));
    },
    setLocation: function(locationString, nullLocationHandler) {
      if (locationString && locationString !== "") {
        const locations = locationString.split(";").map(d => d.trim());
        this.selectedPlaces = locations;
        this.filterData(locations);
      } else {
        this.clearLocations();
      }
    },
    clearLocations: function() {
      this.selectedPlaces = [];
      this.filterData([]);
    },
    updateSelected: function(selected) {
      this.selectedPlaces = selected;
    },
    selectGroup: function(locationGroup) {
      this.selectedPlaces = locationGroup.locations;
    },
  },
  mounted() {
    this.setLocation(this.location);
  }
};
</script>

<style lang="scss" scoped>
.remove-btn {
    font-size: 0.75em;
}
</style>
