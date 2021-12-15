<template>
<div class="home flex-column text-left d-flex">
  <div v-if="loading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
  </div>
  <!-- INTRO -->
  <section>
    <div class="row m-0 w-100 d-flex">
      <div class="col-sm-12 d-flex justify-content-center align-items-center bg-main__darker px-0 back-1">
        <div class="d-flex flex-column w-100 align-items-center my-2">
          <div class="row m-0 w-100 d-flex justify-content-center">
           <img src="@/assets/logo-full-white-01.svg" alt="Outbreak.info" class="w-20"/>
          </div>
          <h1 class="text-light my-1 mx-3"> Local Build</h1>
          <p class="text-light my-1 mx-3">
            a standardized, open-source database of COVID-19 resources and epidemiology data
          </p>
        </div>
      </div>
    </div>
  </section>

  <div class="col-sm-12 d-flex justify-content-center align-items-center p-0 bg-grey__lightest">
    <div class="row d-flex align-items-center p-3 px-4 larger">
       <p>
          Outbreak.info is a project from the <a href="http://sulab.org/" target="_blank">Su</a>, <a href="https://wulab.io/" target="_blank">Wu</a>, and <a href="https://andersen-lab.com/" target="_blank">Andersen</a> labs at Scripps Research to
          unify COVID-19 and SARS-CoV-2 epidemiology and genomic data, published research, and other resources.
        </p>

        <p>Outbreak.info Local Build is an additional project that allows researchers to use the outbreak.info interative visualizations for genomic variants to explore SARS-CoV-2 data from customizable data sources. The original project, outbreak.info can be found <a href="https://outbreak.info/" target="_blank">here</a>
        </p>
   </div>
  </div>

  <section class="d-flex flex-column justify-content-center align-items-left bg-grag-grey text-light px-3 pt-2 mb-5">
    <div class="d-flex justify-content-center align-items-center px-5 py-3">
      <div class="d-flex w-100 justify-content-between">
        <div>
          <h4 class="at-a-glance-header m-0">{{localBuildName}}</h4>
       </div>
      </div>
    </div>
  </section> 
  <section>
    <h5>Total Sequences</h5>    
  </section> 
 
 <section class="d-flex flex-column justify-content-center align-items-left bg-grag-grey text-light px-3 pt-2 mb-5">
    <div class="d-flex justify-content-center align-items-center px-5 py-3">
      <div class="d-flex w-100 justify-content-between">
        <div>
          <h4 class="at-a-glance-header m-0">At a glance</h4>
          <p class="mb-0">
            View the data in the local build.
         </p>
        </div>
      </div>
    </div>
       
  </section>
  <section id=bar>
    <div class="d-flex justify-content-center align-items-center mb-4">
    <!-- Barchart -->
    <div class="d-flex align-items-start justify-content-center" style="margin-left: 50px;" :class="{'flex-wrap' : mediumScreen}">
    <div class="barchart-container">
        <StackedBargraph :data="seqLocCounts" :admin_level="admin_level"/>
    </div>
    </div>
    <!-- Sequencing Hist -->
    <div class="d-flex align-items-start justify-content-center" style="margin-left: 50px;" :class="{'flex-wrap' : mediumScreen}"> 
     <div class="container">
        <div v-for="(prev, index) in seqCountsLineWindowed" class="box" :key="index" :class="[mediumScreen ? 'w-100' : 'w-33']">          
           <SequencingHistogram :data="prev.data" :width="widthHist" :height="heightHist" :downward="false" 
           :includeXAxis="true" :title="`${prev.id} Samples sequenced per day over last ${recentWindow} days`" 
           :margin="marginHist" :onlyTotals="true" v-if="seqCountsLineWindowed"/>     
       </div>
     </div>
     </div>
   </div>
   </section>
 
   <section class="d-flex flex-wrap justify-content-center align-items-center mb-4" id="longitudinal" v-if="prevalence">
     <div v-for="(prev, index) in prevalence" :key="index"> 
         <h4 class="mb-0">Average daily {{prev.id}} prevalence {{locationLabel}}</h4>
         <small class="text-muted mb-2">Based on reported sample collection date</small>
         <ReportPrevalence :data="prev.prevalence" :mutationName="prev.reportName" :xmin="xmin" :xmax="xmax" :location="location" :setWidth="setWidth" :simpleView="true" v-if="prev"/>
      
     </div>
   </section>
  

</div>
</template>
<script>
// @ is an alias to /src
// import Vue from "vue";
import SearchBar from "@/components/SearchBar.vue";
import CustomReportForm from "@/components/CustomReportForm";
import TypeaheadSelect from "@/components/TypeaheadSelect";
import SequencingHistogram from "@/components/SequencingHistogram";
import StackedBargraph from "@/components/StackedBargraph.vue";
import ReportPrevalence from "@/components/ReportPrevalence.vue";
import QuickStats from "@/components/QuickStats.vue";
import {
  getGlanceSummary
} from "@/api/epi-basics.js";
import Vue from "vue";
import {
  mapState
} from "vuex";

import store from "@/store";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faSpinner,
  faAngleDoubleRight,
  faSearch
} from "@fortawesome/free-solid-svg-icons";

library.add(faSpinner, faAngleDoubleRight, faSearch);

//get the config for default locations
import json from '@/localConfig.json'

import {
  findPangolin,
  findLocation,
  getSequenceCount,
  getReportData,
  getLocationReportData,
  getBasicLocationReportData,
  getPrevalenceofCuratedLineages
} from "@/api/genomics.js";
import {
  timeDay
}  from "d3";

export default {
  name: "Home",
  components: {
    FontAwesomeIcon,
    StackedBargraph,
    SequencingHistogram,
    ReportPrevalence,
    //QuickStats,
 },
  data() {
    return {
      searchQuery: "",
      glanceLocations: [],
      glanceSummaries: [],
      lineages: null,
      summaryDeletable: false,
      dataSubscription: null,
      reportSubscription: null,
      reportName: null,
      muts: null,
      selectedLocation: null,
      admin_level: 0,
      queryPangolin: null,
      queryLocation: null,
      xmin: null,
      xmax: null,
      recentWindow: "60",
      seqCounts: null,
      locationFocus: null,
      seqLocCounts: null,
      countSubscription: null,
      countLocSubscription: null,
      basicSubscription: null,
      dataReportSubscription:null,
      dateUpdated: null,
      lastUpdated: null,
      totalSequences: null,
      curatedLineages: null,
      voc: null,
      voi: null,
      recentMin:null,
      loc: null,
      setWidth:null,
      prevalence: null,
      widthHist: 200,
      heightHist: 150,
      seqCountsLine: [],
      marginHist: {
        left: 55,
        right: 55,
        top: 7,
        bottom: 25
      },
    };
  },
 watch: {
    curatedLineages(){
        this.setupPrevalence();
    }
 },
 computed: {
    ...mapState("admin", ["loading"]),
    seqCountsWindowed() {
      //console.log("In seqCountsWindowed", this.seqCounts, this.recentMin);
      return this.recentMin && this.seqCounts ?
        this.seqCounts.filter(d => d.dateTime >= this.recentMin) : null;
    },
    
   seqCountsLineWindowed() {
      var seqCountsLineNew = [];
      this.seqCountsLine.forEach(d => {
        var temp = [];
        temp['data'] = [];
        temp['id'] = d.id;
        d.prevalence.forEach(x => {
            if (x.dateTime >= this.recentMin){
                x.total_count = x.lineage_count_rolling
                temp.data.push(x);
            }
        });
        
        seqCountsLineNew.push(temp);
      });
      console.log('seq', seqCountsLineNew);
      return(seqCountsLineNew);
   }, 
  },
 methods: {
  //set up basic information
  setupReport(){
   this.basicSubscription = getBasicLocationReportData(this.$genomicsurl, this.loc).subscribe(results => {
        this.dateUpdated = results.dateUpdated.dateUpdated;
        this.lastUpdated = results.dateUpdated.lastUpdated;
        this.totalSequences = results.total;
        this.curatedLineages = results.curated;
        this.voc = results.voc;
        this.voi = results.voi;
        this.selectedLocation = results.location;
      })
    },

  // set up information for each of the prevlance reports
  setupPrevalence(){    
    var totalThresh = 25; 
    this.prevalence = [];
    
    //set up the basics for prevlance loop 
    this.dataReportSubscription = getPrevalenceofCuratedLineages(this.$genomicsurl, this.loc, this.loc, this.curatedLineages).subscribe(results => {
         results.forEach(d => {
            if ("admin_level" in d.at(0)){
              this.location = d.at(0).label;
            } else{
              var temp = []
              //console.log(d);
              temp['prevalence'] = d.at(0)['data'];
              temp['reportName'] = d.at(0).pango_descendants.at(0);
              temp['id'] = d.at(0).id
              this.seqCountsLine.push(temp);
              this.prevalence.push(temp);
              //console.log(this.prevalence);
            }
            
         });
        this.selectedLocation = this.location
    });
    //console.log("prevalence", this.prevalence, this.location);
    //this.prevalence.forEach(d=>{console.log('p', d);});

  },
  getAllSequencesByLocation(admin_level) {
    this.countLocSubscription = getSequenceCount(this.$genomicsurl, false, true, false, true).subscribe(results => {
        this.seqLocCounts = results;
      })
   },
   updateSequenceCount() {
      this.countSubscription = getSequenceCount(this.$genomicsurl, this.loc, false).subscribe(results => {
        this.seqCounts = results;
      })
   },
   updatePangolin(selected) {
      if(selected.alias){
        this.$router.push({
          name: "MutationReport",
          params: {
            alias: selected.name.toLowerCase()
          }
        });
      } else{
      this.$router.push({
        name: "MutationReport",
        query: {
          pango: selected.name
        }
      });}
    },
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
   if (this.basicSubscription) {
      this.basicSubscription.unsubscribe();
    }
    if (this.countLocSubscription) {
      this.countLocSubscription.unsubscribe();
    }
    if (this.countSubscription) {
      this.countSubscription.unsubscribe();
    }
    this.dataSubscription.unsubscribe();
    if (this.updatedSubscription) {
      this.updatedSubscription.unsubscribe();
    }
    if (this.dataReportSubscription) {
      this.dataReportSubscription.unsubscribe();
    }
   },
  mounted() {
    this.localBuildName = json['local-build-name']
    this.setupReport();
    this.loc= json["location-focus"];
    this.updateSequenceCount();
    this.getAllSequencesByLocation(this.admin_level);
    const locations = Vue.$cookies.get("custom_locations");
    this.glanceLocations = locations ? locations.split(",") : [];
    this.currentTime = new Date();
    //this.xmax = "2021-12-10";
    this.setWidth = 518.4;
    //this.xmin = "2020-06-10";
    this.recentMin = timeDay.offset(this.currentTime, -1 * this.recentWindow);

  }
}
</script>

<style lang="scss" scoped>
.resources-intro {
    background: #507192;
    border-left: 3px solid white;
}

.variants-intro {
    width: 400px;
    height: 400px;
    background: $secondary-color;
    border-left: 3px solid white;
}

.epi-intro {
    width: 400px;
    height: 400px;
    background: $primary-color;

}

.barchart-container {
  margin-bottom: 20px;
  width:500px;
  height:500px;
  //background-color: #fff;
} 

.container {
  //margin: 20px auto;
  width:500px;
  height:500px;
  //background-color: #fff;
  display:grid;
  padding:0;
  grid-template-columns: 200px 200px;
  grid-row: auto auto;
  grid-column-gap: 5px;
  grid-row-gap: 5px;
  .box{
    margin-top:20px;
    //background-color:#fff;
    //color:#fff;
    //padding:10px;
    display:flex;
    //align-items:center;
    //justify-content:center;
  }
}

@media (max-width:767px) {
    .epi-intro {
        border: none !important;
    }
    .variants-intro {
        border: none !important;
    }
    .resources-intro {
        border: none !important;
    }
}

.w-33 {
    width: 33% !important;
}
.text-light-highlight {
    color: #d5d5d5 !important;
}

.pspan {
    content:"\a";
    white-space:pre;
}
.at-a-glance-header {
    text-transform: uppercase;
}
.search-bar {
    width: 250px;
}

.add-items {
    height: 120px;
}

.w-20 {
    width: 20% !important;
}

.larger {
    font-size: x-large;
}
</style>
