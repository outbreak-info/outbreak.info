<template>
<div class="container full-page py-5 bg-light">
  <div v-if="loading" class="loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>
  <Autocomplete class="m-auto" :items="allPlaces" :toAdd="addable" :selected="selectedPlaces" @selected="updateSelected" />
  <div class="d-flex row m-0">
    <EpiCurve class="row" @addable="updateAddable" id="curveContainer" v-if="data$"/>
    <EpiTable class="row overflow-auto" :locations="selectedPlaces" :colorScale="colorScale" colorVar="location_id" />
  </div>
  <!-- <div id="presetLocations">
    <button v-for="(place, idx) in presetGroups" v-bind:key="idx" @click="selectGroup(place)">
      {{place.label}}
    </button>
  </div> -->
</div>
</template>

<script>
// @ is an alias to /src
import EpiCurve from "@/components/EpiCurve.vue";
import EpiTable from "@/components/EpiTable.vue";
import Autocomplete from "@/components/Autocomplete.vue";
import {
  getEpiData, epiDataSubject, epiTableSubject
} from "@/api/epi-traces.js"
import store from "@/store";
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
      presetGroups: [{
        label: "United States",
        locations: []
      }],
      selectedPlaces: [],
      addable: [],
      data$: null
    };
  },
  computed: {
    ...mapState("admin", ["loading"]),
    ...mapState("epidata", ["allPlaces"]),
    colorScale: function() {
      const scale = store.getters["colors/getColor"];
      return scale;
    },
  },
  watch: {
    selectedPlaces: function(newValue, oldValue) {
      const newLocation = newValue ? newValue.join(";") : "";
      if (this.$route.query.location !== newLocation) {
        this.$router.push({
          path: "epidemiology",
          query: {
            location: newLocation
          }
        });
      }
    },
    location: function(newLocation, oldLocation) {
      this.setLocation(newLocation);
    }
  },
  methods: {
    setLocation: function(locationString, nullLocationHandler) {
      if (locationString && locationString !== "") {
        const locations = locationString.split(";").map(d => d.trim());
        this.selectedPlaces = locations;
        this.data$ = getEpiData(this.$apiurl, locations, "-confirmed_currentCases", 10, 0).subscribe(_ => null);
        // need to call subscription in order to trigger calling API function and passing subscription to child
      } else {
        this.clearLocations();
      }
    },
    clearLocations: function() {
      this.selectedPlaces = [];
      epiDataSubject.next([]);
      epiTableSubject.next([]);
    },
    updateSelected: function(selected) {
      this.selectedPlaces = [...new Set(selected)];
    },
    updateAddable: function(selected) {
      this.addable = selected;
    },
    selectGroup: function(locationGroup) {
      // this.selectedPlaces = locationGroup.locations;
    }
  },
  subscriptions() {
    return {
    }
  },
  mounted() {
    this.setLocation(this.location);
  }
};
</script>

<style lang="scss" scoped>
.epi-group {
    align-items: center;
    width: 100%;
}
</style>
