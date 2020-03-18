<template>
<div class="container full-page py-5 bg-light">
  <!-- <h1 v-if="allData$">{{allData$.length}} records</h1> -->
  <Autocomplete class="m-auto" :items="allPlaces" :toAdd="addable" :selected="selectedPlaces" @selected="updateSelected" />
  <div class="d-flex row m-0">
    <EpiCurve class="col-s-12 col-md-12 col-lg-6" :data$="data$" @addable="updateAddable" id="curveContainer" v-if="data$"/>
    <!-- <EpiTable class="col-s-12 col-md-12 col-lg-6" :data="tableData$" :colorScale="colorScale" /> -->
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
  getEpiData
} from "@/api/epi-traces.js"
import store from "@/store";
import {
  mapState
} from "vuex";

export default {
  name: "Epidemiology",
  components: {
    EpiCurve,
    // EpiTable,
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
    ...mapState("epidata", ["allPlaces"])
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
      console.log("setting location")
      if (locationString && locationString !== "") {
        const locations = locationString.split(";").map(d => d.trim());
        this.selectedPlaces = locations;
        this.data$ = getEpiData(this.$apiurl, locations);
      } else {
        this.clearLocations();
      }
    },
    colorScale: function(location) {
      const scale = store.getters["colors/getColor"];
      return scale(location);
    },
    clearLocations: function() {
      this.selectedPlaces = [];
      // this.filterData([]);
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
      // allData$: getEpiData(this.$apiurl, ["RWA"])
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
