
<template>
<div class="d-flex py-2 m-2">
  <!-- loading -->
  <div v-if="loading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
  </div>

  <div class="row w-100 m-0" v-if="data">
    <div class="col-sm-12" v-if="retracted">
      <Warning :animate="true" class="w-100 mb-2" :text="`This ${data['@type']} has been retracted.`"> </Warning>
    </div>

    <div class="col-sm-12 text-left">

      <!-- mini-nav for resource types -->
      <section class="d-flex justify-content-end w-100 bg-grey__lighter my-4">
        <div class="row d-flex justify-content-center w-100">
          <nav class="navbar navbar-expand-lg navbar-dark">
            <ul class="navbar-nav">
              <li class="nav-item text-light mr-4" v-for="(anchor, idx) in anchorsArr" :key="idx">
                <router-link class="nav-link no-underline p-0" :to="`#${anchor.replace(' ', '_')}`">
                  {{ anchor }}
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      <!-- type label -->
      <div :class="type.replace(/\s/g, '')" v-if="type">
        <!-- <StripeAccent :height="20" :width="4" :className="type" /> -->
        {{ type }}
        <span class="pub-type mx-3" v-if="data.publicationType && data.publicationType[0]">
          <template v-if="Array.isArray(data.publicationType)">
            <span v-for="(pub, idx) in data.publicationType" :key="idx">{{ pub }}<span v-if="idx < data.publicationType.length - 1" class="mx-2">&bull;</span></span>

          </template>
          <template v-else>{{ data.publicationType }}</template>
        </span>
      </div>

    </div>

    <div class="col-md-9 my-3 pr-5">

      <!-- description -->
      <ResourceDescription :data="data" :type="type" />

      <!-- special clinical trials description -->
      <ClinicalTrialDescription :data="data" v-if="type == 'ClinicalTrial'" />

      <div class="mr-5">
        <!-- downloads -->
        <div id="downloads" class="text-left border-top border-bottom text-muted py-3 my-3">
          <h6 class="m-0">Downloads</h6>
          <ul v-if="data.distribution" id="download-list">
            <li v-for="(item, idx) in data.distribution" :key="idx">
              <a :href="item.contentUrl" target="_blank" rel="noreferrer">
                {{ item.name ? item.name : item.contentUrl }}
              </a>
            </li>
          </ul>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>


        <!-- funding info -->
        <div id="funder" class="text-left border-bottom text-muted pb-3 mb-3">
          <h6 class="m-0">Funder</h6>
          <div v-if="data.funding || data.funder">
            <div v-if="data.funding">
              <ul>
                <template v-if="Array.isArray(data.funding)">
                  <li v-for="(funding, idx) in data.funding" :key="idx" class="mb-3">
                    <template v-if="Array.isArray(funding.funder)">
                      <div v-for="(funder, idx) in funding.funder" :key="idx">
                        <b v-if="funder.name">{{funder.name}}</b>
                        <span v-if="funder.name && funding.identifier">:&nbsp;</span>
                        <span v-if="funding.identifier">{{funding.identifier}}</span>
                        <span v-if="funder.role"> ({{funder.role}})</span>
                      </div>
                    </template>

                    <template v-else>
                      <div class="m-0">
                        <b v-if="funding.funder && funding.funder.name">{{funding.funder.name}}</b>
                        <span v-if="funding.funder && funding.funder.name && funding.identifier">:&nbsp;</span>
                        <span v-if="funding.identifier">{{funding.identifier}}</span>
                        <span v-if="funding.funder && funding.funder.role"> ({{funding.funder.role}})</span>
                      </div>
                    </template>
                    <div v-if="funding.description" class="line-height-1">
                      {{funding.description}}
                    </div>
                  </li>
                </template>
                <template v-else>
                  <li class="mb-3">
                    <template v-if="Array.isArray(data.funding.funder)">
                      <div v-for="(funder, idx) in data.funding.funder" :key="idx">
                        <b v-if="funder.name">{{funder.name}}</b>
                        <span v-if="funder.name && data.funding.identifier">:&nbsp;</span>
                        <span v-if="data.funding.identifier">{{data.funding.identifier}}</span>
                        <span v-if="funder.role"> ({{funder.role}})</span>
                      </div>
                    </template>

                    <template v-else>
                      <div class="m-0">
                        <b v-if="data.funding.funder && data.funding.funder.name">{{data.funding.funder.name}}</b>
                        <span v-if="data.funding.funder && data.funding.funder.name && data.funding.identifier">:&nbsp;</span>
                        <span v-if="data.funding.identifier">{{data.funding.identifier}}</span>
                        <span v-if="data.funding.funder && data.funding.funder.role"> ({{data.funding.funder.role}})</span>
                      </div>
                    </template>
                    <div v-if="data.funding.description" class="line-height-1">
                      {{data.funding.description}}
                    </div>
                  </li>
                </template>

              </ul>
            </div>
            <template v-if="data.funder">

              <template v-if="Array.isArray(data.funder)">
                <ul>
                  <li v-for="(funder, idx) in data.funder" :key="idx" class="mb-3">
                    <b v-if="funder.name">{{funder.name}}</b>
                    <span v-if="funder.name && funder.identifier">:&nbsp;</span>
                    <span v-if="funder.identifier">{{funder.identifier}}</span>
                    <span v-if="funder.role"> ({{funder.role}})</span>
                  </li>
                </ul>
              </template>

              <template v-else>
                <ul>
                  <li>
                    <b v-if="funder.name">{{funder.name}}</b>
                    <span v-if="funder.name && funder.identifier">:&nbsp;</span>
                    <span v-if="funder.identifier">{{funder.identifier}}</span>
                    <span v-if="funder.role"> ({{funder.role}})</span>
                  </li>
                </ul>
              </template>

            </template>
          </div>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>


        <!-- license -->
        <div id="license" class="text-left border-bottom text-muted pb-3 mb-3">
          <h6 class="m-0">License</h6>
          <div v-if="data.license">
            <a v-if="data.license.startsWith('http')" :href="data.license" target="_blank">{{ data.license }}
            </a>
            <span v-else v-html="data.license"></span>
          </div>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>

        <!-- based on -->
        <div id="based_on" class="text-left border-bottom text-muted pb-3 mb-3">
          <h6 class="m-0 mb-2">Based on</h6>
          <div v-if="data.isBasedOn && data.isBasedOn.length">
            <Citation :data="item" v-for="(item, idx) in data.isBasedOn" :key="idx" />
          </div>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>

        <!-- cited by -->
        <div id="cited_by" class="text-left border-bottom text-muted pb-3 mb-3" v-if="data['@type'] != 'ClinicalTrial'">
          <h6 class="m-0 mb-2">Cited by</h6>
          <div v-if="data.citedBy && data.citedBy.length">
            <Citation :data="item" v-for="(item, idx) in data.citedBy" :key="idx" />
          </div>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>

        <!-- related -->
        <div id="related" class="text-left border-bottom text-muted pb-3 mb-3">
          <h6 class="m-0 mb-2">Related resources</h6>
          <div v-if="data.relatedTo && data.relatedTo.length">
            <Citation :data="item" v-for="(item, idx) in data.relatedTo" :key="idx" />
          </div>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>


      </div>
    </div>
    <!-- RIGHT SIDE -->
    <div class="col-md-3 my-3">
      <ResourceSidebar :data="data" :date="dateModified" :type="data['@type']" v-if="data" />
    </div>
  </div>
  <!-- <div v-else class="min-height">
    Sorry, data on {{id}} is not found. Let us know at <a :href="`mailto:help@outbreak.info?subject=Missing metadata for id ${id}`" target="_blank">help@outbreak.info</a>
  </div> -->
</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  timeFormat,
  timeParse
} from "d3";

import {
  mapState
} from "vuex";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

library.add(faSpinner);

import {
  getResourceMetadata
} from "@/api/resources.js";

import cloneDeep from "lodash/cloneDeep";

import ResourceDescription from "@/components/ResourceDescription.vue";
import ResourceSidebar from "@/components/ResourceSidebar.vue";
import ClinicalTrialDescription from "@/components/ClinicalTrialDescription.vue";
import Citation from "@/components/Citation.vue";
import Warning from "@/components/Warning.vue";

export default Vue.extend({
  name: "ResourcePage",
  components: {
    ResourceDescription,
    ResourceSidebar,
    ClinicalTrialDescription,
    Citation,
    Warning,
    FontAwesomeIcon
  },
  data() {
    return ({
      type: null,
      data: null,
      id: null,
      anchors: {
        default: ["authors", "description", "downloads", "license", "funder", "based on", "cited by", "related"],
        ClinicalTrial: ["authors", "description", "design", "interventions", "eligibility", "outcome", "status", "funder", "publications", "based on", "related"]
      }
    })
  },
  methods: {
    formatDate(dateStr) {
      const parseDate = timeParse("%Y-%m-%d");
      const formatDate = timeFormat("%d %B %Y");
      return dateStr ? formatDate(parseDate(dateStr)) : null;
    },
    getData(id) {
      this.resultsSubscription = getResourceMetadata(this.$resourceurl, id).subscribe(results => {
        this.data = {
          "@context": {
            "outbreak": "https://discovery.biothings.io/view/outbreak/",
            "schema": "http://schema.org/"
          },
          "@type": "Publication",
          "_id": "pmid32830286",
          "_version": 1,
          "abstract": "PURPOSE OF REVIEW: The role of renin-angiotensin-aldosterone system (RAAS) inhibitors, notably angiotensin-converting enzyme inhibitors (ACEi) or angiotensin receptor blockers (ARBs), in the COVID-19 pandemic has not been fully evaluated. With an increasing number of COVID-19 cases worldwide, it is imperative to better understand the impact of RAAS inhibitors in hypertensive COVID patients. PubMed, Embase and the pre-print database Medrxiv were searched, and studies with data on patients on ACEi/ARB with COVID-19 were included. Random effects models were used to estimate the pooled mean difference with 95% confidence interval using Open Meta[Analyst] software.\nRECENT FINDINGS: A total of 28,872 patients were included in this meta-analysis. The use of any RAAS inhibition for any conditions showed a trend to lower risk of death/critical events (OR 0.671, CI 0.435 to 1.034, p\u2009=\u20090.071). Within the hypertensive cohort, however, there was a significant lower association with deaths (OR 0.664, CI 0.458 to 0.964, p\u2009=\u20090.031) or the combination of death/critical outcomes (OR 0.670, CI 0.495 to 0.908, p\u2009=\u20090.010). There was no significant association of critical/death outcomes within ACEi vs non-ACEi (OR 1.008, CI 0.822 to 1.235, p\u2009=\u20090.941) and ARB vs non-ARB (OR 0.946, CI 0.735 to 1.218, p\u2009=\u20090.668). This is the largest meta-analysis including critical events and mortality data on patients prescribed ACEi/ARB and found evidence of beneficial effects of chronic ACEi/ARB use especially in hypertensive cohort with COVID-19. As such, we would strongly encourage patients to continue with RAAS inhibitor pharmacotherapy during the COVID-19 pandemic.\n",
          "author": [{
            "@type": "outbreak:Person",
            "affiliation": [{
              "@type": "outbreak:Organization",
              "name": "Norfolk and Norwich University Hospital, Norwich, UK."
            }],
            "familyName": "Baral",
            "givenName": "Ranu",
            "name": "Ranu Baral"
          }, {
            "@type": "outbreak:Person",
            "affiliation": [{
              "@type": "outbreak:Organization",
              "name": "Norwich Medical School, University of East Anglia, Norwich Research Park, Norwich, NR4 7UQ, UK."
            }],
            "familyName": "White",
            "givenName": "Madeline",
            "name": "Madeline White"
          }, {
            "@type": "outbreak:Person",
            "affiliation": [{
              "@type": "outbreak:Organization",
              "name": "Norwich Medical School, University of East Anglia, Norwich Research Park, Norwich, NR4 7UQ, UK. v.vassiliou@uea.ac.uk."
            }],
            "familyName": "Vassiliou",
            "givenName": "Vassilios S",
            "name": "Vassilios S Vassiliou"
          }],
          "curatedBy": {
            "@type": "schema:WebSite",
            "curationDate": "2021-09-22",
            "name": "litcovid",
            "url": "https://www.ncbi.nlm.nih.gov/research/coronavirus/publication/32830286"
          },
          "date": "2020-12-18",
          "dateCompleted": "2020-09-04",
          "dateCreated": "2020-08-25",
          "dateModified": "2020-12-18",
          "datePublished": "2020-08-24",
          "doi": "10.1007/s11883-020-00880-6",
          "identifier": "32830286",
          "isBasedOn": [{
            "@type": "Publication",
            "citation": "JAMA. 2020 Apr 7;323(13):1239-1242",
            "identifier": "32091533",
            "pmid": "32091533"
          }, {
            "@type": "Publication",
            "citation": "Lancet. 2020 May 30;395(10238):1705-1714",
            "identifier": "32416785",
            "pmid": "32416785"
          }, {
            "@type": "Publication",
            "citation": "N Engl J Med. 2020 Jun 18;382(25):2441-2448",
            "identifier": "32356628",
            "pmid": "32356628"
          }, {
            "@type": "Publication",
            "citation": "JAMA Cardiol. 2020 Jul 1;5(7):811-818",
            "identifier": "32219356",
            "pmid": "32219356"
          }, {
            "@type": "Publication",
            "citation": "JAMA. 2020 May 26;323(20):2052-2059",
            "identifier": "32320003",
            "pmid": "32320003"
          }, {
            "@type": "Publication",
            "citation": "Emerg Microbes Infect. 2020 Dec;9(1):757-760",
            "identifier": "32228222",
            "pmid": "32228222"
          }, {
            "@type": "Publication",
            "citation": "N Engl J Med. 1992 Sep 3;327(10):678-84",
            "identifier": "1495520",
            "pmid": "1495520"
          }, {
            "@type": "Publication",
            "citation": "Hypertension. 2020 Aug;76(2):e13-e14",
            "identifier": "32458694",
            "pmid": "32458694"
          }, {
            "@type": "Publication",
            "citation": "N Engl J Med. 2020 Jun 18;382(25):e102",
            "identifier": "32356626",
            "pmid": "32356626"
          }, {
            "@type": "Publication",
            "citation": "Am J Cardiovasc Drugs. 2020 Jun;20(3):217-221",
            "identifier": "32281055",
            "pmid": "32281055"
          }, {
            "@type": "Publication",
            "citation": "J Am Coll Cardiol. 1993 Nov 15;22(6):1557-63",
            "identifier": "8227822",
            "pmid": "8227822"
          }, {
            "@type": "Publication",
            "citation": "JAMA Cardiol. 2020 Jul 1;5(7):825-830",
            "identifier": "32324209",
            "pmid": "32324209"
          }, {
            "@type": "Publication",
            "citation": "Arch Biochem Biophys. 2009 Jan 1;481(1):131-6",
            "identifier": "18940180",
            "pmid": "18940180"
          }, {
            "@type": "Publication",
            "citation": "JAMA Cardiol. 2020 Sep 1;5(9):1020-1026",
            "identifier": "32936273",
            "pmid": "32936273"
          }, {
            "@type": "Publication",
            "citation": "J Card Fail. 2020 May;26(5):370",
            "identifier": "32439095",
            "pmid": "32439095"
          }, {
            "@type": "Publication",
            "citation": "Ann Transl Med. 2020 Apr;8(7):430",
            "identifier": "32395474",
            "pmid": "32395474"
          }, {
            "@type": "Publication",
            "citation": "Anesthesiology. 2015 Aug;123(2):288-306",
            "identifier": "26200181",
            "pmid": "26200181"
          }, {
            "@type": "Publication",
            "citation": "Am J Respir Crit Care Med. 2020 Jun 1;201(11):1380-1388",
            "identifier": "32275452",
            "pmid": "32275452"
          }, {
            "@type": "Publication",
            "citation": "Circ Res. 2020 Jun 5;126(12):e142-e143",
            "identifier": "32496914",
            "pmid": "32496914"
          }, {
            "@type": "Publication",
            "citation": "N Engl J Med. 2020 Jun 25;382(26):2582",
            "identifier": "32501665",
            "pmid": "32501665"
          }, {
            "@type": "Publication",
            "citation": "Blood Press. 1993 Jun;2(2):136-41",
            "identifier": "8180726",
            "pmid": "8180726"
          }, {
            "@type": "Publication",
            "citation": "Curr Atheroscler Rep. 2020 May 7;22(3):14",
            "identifier": "32415481",
            "pmid": "32415481"
          }, {
            "@type": "Publication",
            "citation": "Zhonghua Xin Xue Guan Bing Za Zhi. 2020 Jun 24;48(6):450-455",
            "identifier": "32120458",
            "pmid": "32120458"
          }],
          "issueNumber": "1534-6242",
          "journalAbbreviation": "Curr Atheroscler Rep",
          "journalName": "Current atherosclerosis reports",
          "keywords": ["COVID", "Coronavirus", "Hypertension", "Renin-angiotensin-aldosterone system"],
          "name": "Effect of Renin-Angiotensin-Aldosterone System Inhibitors in Patients with COVID-19: a Systematic Review and Meta-analysis of 28,872 Patients.",
          "pmid": "32830286",
          "publicationType": ["Journal Article", "Meta-Analysis", "Systematic Review"],
          "url": "https://www.doi.org/10.1007/s11883-020-00880-6",
          "volumeNumber": "22",
          "evaluations": [{
            "@type": "Rating",
            "name": "covid19LST",
            "ratingExplanation": "Systematic review of randomized trials or n-of-1 trial",
            "ratingValue": "1",
            "reviewAspect": "Oxford 2011 Levels of Evidence",
            "author": {
              "@type": "Organization",
              "identifier": "covid19LST",
              "url": "https://www.covid19lst.org/",
              "name": "COVID-19 Literature Surveillance Team",
              "affiliation": "",
              "curationDate": "2021-09-14"
            }
          }, {
            "@type": "AggregateRating",
            "author": {
              "@type": "Organization",
              "identifier": "altmetric",
              "name": "Altmetric",
              "affiliation": ["Digital Science"],
              "curationDate": "2021-09-23"
            },
            "identifier": 88768198,
            "url": "http://www.altmetric.com/details.php?citation_id=88768198",
            "image": "https://badges.altmetric.com/?size=64&score=1534&types=mmbttttf",
            "name": "Altmetric",
            "reviewAspect": "Altmetric score",
            "ratingValue": 1533.75,
            "reviews": [{
              "@type": "Review",
              "reviewAspect": "cited_by_fbwalls_count",
              "reviewRating": {
                "ratingValue": 1
              }
            }, {
              "@type": "Review",
              "reviewAspect": "cited_by_feeds_count",
              "reviewRating": {
                "ratingValue": 2
              }
            }, {
              "@type": "Review",
              "reviewAspect": "cited_by_gplus_count",
              "reviewRating": {
                "ratingValue": 0
              }
            }, {
              "@type": "Review",
              "reviewAspect": "cited_by_msm_count",
              "reviewRating": {
                "ratingValue": 174
              }
            }, {
              "@type": "Review",
              "reviewAspect": "cited_by_posts_count",
              "reviewRating": {
                "ratingValue": 613
              }
            }, {
              "@type": "Review",
              "reviewAspect": "cited_by_rdts_count",
              "reviewRating": {
                "ratingValue": 0
              }
            }, {
              "@type": "Review",
              "reviewAspect": "cited_by_tweeters_count",
              "reviewRating": {
                "ratingValue": 288
              }
            }, {
              "@type": "Review",
              "reviewAspect": "cited_by_videos_count",
              "reviewRating": {
                "ratingValue": 0
              }
            }, {
              "@type": "Review",
              "reviewAspect": "cited_by_accounts_count",
              "reviewRating": {
                "ratingValue": 465
              }
            }, {
              "@type": "Review",
              "reviewAspect": "readers_count",
              "reviewRating": {
                "ratingValue": 122
              }
            }, {
              "@type": "Review",
              "reviewAspect": "citeulike reader count",
              "reviewRating": {
                "ratingValue": "0"
              }
            }, {
              "@type": "Review",
              "reviewAspect": "mendeley reader count",
              "reviewRating": {
                "ratingValue": "122"
              }
            }, {
              "@type": "Review",
              "reviewAspect": "connotea reader count",
              "reviewRating": {
                "ratingValue": "0"
              }
            }]
          }],
          "citedBy": [{
            "_id": "lst2020.09.11",
            "name": "Covid-19 LST Report 2020.09.11",
            "url": "https://www.covid19lst.org/post/september-11-daily-covid-19-lst-report"
          }],
          "topicCategory": ["Treatment", " Mechanism"]
        };
        this.type = this.data["@type"];
        this.dateModified = this.formatDate(this.data.date);
      })
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.id = to.params.id;
    this.getData(to.params.id);
    next();
  },
  metaInfo() {
    var metadata = null;
    // Based on https://scholar.google.com/intl/en/scholar/inclusion.html#indexing
    // Dublin Core ref: https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#section-4
    var citationTags = [];
    if (this.data) {
      metadata = cloneDeep(this.data);

      // phaseNumber causes problems
      if (metadata.studyDesign && metadata.studyDesign.phaseNumber) {
        delete metadata.studyDesign.phaseNumber;
      };
      // [null] will have problems embedding...
      metadata.citedBy = metadata.citedBy ? metadata.citedBy.filter(d => d) : null;

      metadata["includedInDataCatalog"] = {
        "@type": "DataCatalog",
        name: "outbreak.info",
        description: "During outbreaks of emerging diseases such as COVID-19, efficiently collecting, sharing, and integrating data is critical to scientific research. outbreak.info is a resource to aggregate all this information into a single location.",
        url: "https://outbreak.info/resources",
        publisher: {
          "@type": "Organization",
          name: "outbreak.info",
          url: "https://outbreak.info/"
        }
      }

      citationTags.push({
        title: "DC.type",
        content: this.data["@type"],
        vmid: "DC.type"
      });

      citationTags.push({
        title: "citation_title",
        content: this.data.name,
        vmid: "citation_title"
      });

      if (this.data.description) {
        citationTags.push({
          title: "DC.description",
          content: this.data.description,
          vmid: "DC.description"
        });
      }

      if (this.data.abstract) {
        citationTags.push({
          title: "DC.abstract",
          content: this.data.abstract,
          vmid: "DC.abstract"
        });
      }

      if (this.data.doi) {
        citationTags.push({
          title: "DC.identifier.DOI",
          content: this.data.doi,
          vmid: "DC.identifier.DOI"
        });
      }

      if (this.data.datePublished) {
        citationTags.push({
          title: "citation_publication_date",
          content: this.data.datePublished,
          vmid: "citation_publication_date"
        });
      }

      if (this.data.journalName) {
        citationTags.push({
          title: "citation_journal_title",
          content: this.data.journalName,
          vmid: "citation_journal_title"
        });
      }

      if (this.data.volumeNumber) {
        citationTags.push({
          title: "citation_volume",
          content: this.data.volumeNumber,
          vmid: "citation_volume"
        });
      }

      if (this.data.issueNumber) {
        citationTags.push({
          title: "citation_issue",
          content: this.data.issueNumber,
          vmid: "citation_issue"
        });
      }

      if (this.data.pagination) {
        citationTags.push({
          title: "citation_issue",
          content: this.data.issueNumber,
          vmid: "citation_issue"
        });
      }

      if (this.data.author) {
        if (Array.isArray(this.data.author)) {
          citationTags = citationTags.concat(this.data.author.map(d => {
            return ({
              title: "citation_author",
              content: d.name ? d.name : `${d.givenName} ${d.familyName}`,
              vmid: "citation_author"
            })
          }))
        } else {
          citationTags = citationTags.concat({
            title: "citation_author",
            content: this.data.author.name ? this.data.author.name : `${this.data.author.givenName} ${this.data.author.familyName}`,
            vmid: "citation_author"
          })
        }
      }

      if (this.data.creator) {
        citationTags = citationTags.concat(this.data.creator.map(d => {
          return ({
            title: "DC.creator",
            content: d.name ? d.name : `${d.givenName} ${d.familyName}`,
            vmid: "DC.creator"
          })
        }))
      }

    }

    if (metadata) {
      return {
        script: [{
          type: 'application/ld+json',
          json: metadata
        }],
        meta: citationTags
      }
    }
  },
  computed: {
    ...mapState("admin", ["loading"]),
    anchorsArr() {
      if (Object.keys(this.anchors).includes(this.type)) {
        return (this.anchors[this.type])
      }
      return (this.anchors["default"])
    },
    retracted() {
      if (this.data.publicationType) {
        return (this.data.publicationType.includes("Retracted Publication"))
      } else {
        return (false)
      }
    }
  },
  mounted() {
    this.id = this.$route.params.id;

    this.getData(this.id);
  }
});
</script>

<style lang="scss" scoped>
.pub-type {
    opacity: 0.6;
}

.helper {
    line-height: 1.2em;
}

.section-header {
    text-transform: uppercase;
}
.min-height {
    min-height: 72vh;
}
</style>
