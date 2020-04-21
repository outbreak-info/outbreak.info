<template>
<div class="container d-flex py-2">
  <div class="row w-100 m-0">
    <div class="col-md-9 my-3">
      <ResourceDescription :data="data" type="Publication" />
    </div>

    <!-- RIGHT SIDE -->
    <div class="col-md-3 my-3">
      <ResourceSidebar :data="data" :date="datePublished" type="Publication" v-if="data" />
    </div>

  </div>
</div>
</template>


<script>
import StripeAccent from "@/components/StripeAccent.vue";
import ResourceDescription from "@/components/ResourceDescription.vue";
import ResourceSidebar from "@/components/ResourceSidebar.vue";

import {
  timeFormat,
  timeParse
} from "d3";

export default {
  name: "Publication",
  components: {
    ResourceDescription,
    ResourceSidebar
    // StripeAccent
  },
  methods: {},
  computed: {
    datePublished: function() {
      const parseDate = timeParse("%Y-%m-%d");
      const formatDate = timeFormat("%d %B %Y")
      return (formatDate(parseDate(this.data.datePublished)))
    }
  },
  data() {
    return {
      showAffiliation: false,
      data: {   '@context': {   'outbreak': 'https://discovery.biothings.io/view/outbreak/',
                          'schema': 'http://schema.org/'},
          '@type': 'outbreak:Publication',
          '_id': 'pmid32279462',
          'abstract': 'Technology integration in teaching is an evolving concept in modern medical education like other study disciplines in India. The domain of medical science education is presently deficient of deploying technology-based practices. Currently, majority of medical schools and colleges continue to choose traditional wet laboratory dissections over new virtual dissections which are being followed in institutions such as All India Institute of Medical Sciences (AIIMS) and handful of other governmental as well as private medical schools of India like AIIMS Rishikesh, AIIMS Jodhpur, Government Medical College Vimsar, Burla, Odisha, GSL Medical College Rajahmundry, Andhra Pradesh, Yennapoya University Mangalore, Dutta Megha Medical College, GMC Chindwara Madhya Pradesh, Symbiosis Institute Pune and Apollo Medical College Chitoor. Not to mention, as the current push for technology integration increases, it is likely that a large number of Indian academic scholars will begin seeing virtual dissections as beneficial to their classroom.',
          'author': [   {   '@type': 'outbreak:Person',
                            'affiliation': [   {   '@type': 'outbreak:Organization',
                                                   'name': 'Department of Anatomy, All India Institute of Medical Sciences, Rishikesh, India.'}],
                            'familyName': 'Ravi',
                            'givenName': 'Kumar Satish',
                            'name': 'Kumar Satish Ravi'},
                        {   '@type': 'outbreak:Person',
                            'affiliation': [   {   '@type': 'outbreak:Organization',
                                                   'name': 'Department of Anatomy, All India Institute of Medical Sciences, Rishikesh, India.'}],
                            'familyName': 'Ravi',
                            'givenName': 'Kumar Satish',
                            'name': 'Kumar Satish Ravi'},
                        {   '@type': 'outbreak:Person',
                            'affiliation': [   {   '@type': 'outbreak:Organization',
                                                   'name': 'Department of Anatomy, All India Institute of Medical Sciences, Rishikesh, India.'}],
                            'familyName': 'Ravi',
                            'givenName': 'Kumar Satish',
                            'name': 'Kumar Satish Ravi'},
                        {   '@type': 'outbreak:Person',
                            'affiliation': [   {   '@type': 'outbreak:Organization',
                                                   'name': 'Department of Anatomy, All India Institute of Medical Sciences, Rishikesh, India.'}],
                            'familyName': 'Ravi',
                            'givenName': 'Kumar Satish',
                            'name': 'Kumar Satish Ravi'},
                        {   '@type': 'outbreak:Person',
                            'affiliation': [   {   '@type': 'outbreak:Organization',
                                                   'name': 'Department of Anatomy, All India Institute of Medical Sciences, Rishikesh, India.'}],
                            'familyName': 'Ravi',
                            'givenName': 'Kumar Satish',
                            'name': 'Kumar Satish Ravi'}],
          'curatedBy': {   '@type': 'schema:WebSite',
                           'name': 'litcovid',
                           'url': 'https://www.ncbi.nlm.nih.gov/research/coronavirus/publication/32279462'},
          'datePublished': '2020-04-11',
          'doi': '10.1002/ase.1962',
          'identifier': '32279462',
          'issueNumber': '1935-9780',
          'journalAbbreviation': 'Anat Sci Educ',
          'journalName': 'Anatomical sciences education',
          'keywords': [   'Covid-19',
                          'India',
                          'body donation',
                          'cadavers',
                          'dissection',
                          'gross anatomy education'],
          'name': 'Dead body management in times of Covid-19 and its potential impact on the availability of cadavers for medical education in India.',
          'pmid': '32279462',
          'publicationType': ['Letter']},

    };
  }
}
</script>

<style lang="scss" scoped>
</style>
