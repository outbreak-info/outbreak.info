// initial state
const state = {
  loading: false,
  dataloading: false, // separate loader for data. When there's a bunch of data coming in, but also the page load data loaded initially w/ the App.vue, they can conflict.
  reportloading: false, // separate loader for reports
  outbreak: {
    authors: "Julia L. Mullen, Ginger Tsueng, Alaa Abdel Latif, Manar Alkuzweny, Marco Cano, Emily Haag, Jerry Zhou, Mark Zeller, Emory Hufbauer, Nate Matteson, Kristian G. Andersen, Chunlei Wu, Andrew I. Su, Karthik Gangavarapu, Laura D. Hughes, and the Center for Viral Systems Biology"
  },
  mutationAuthors: "Alaa Abdel Latif, Julia L. Mullen, Manar Alkuzweny, Ginger Tsueng, Marco Cano, Emily Haag, Jerry Zhou, Mark Zeller, Emory Hufbauer, Nate Matteson, Chunlei Wu, Kristian G. Andersen, Andrew I. Su, Karthik Gangavarapu, Laura D. Hughes, and the Center for Viral Systems Biology",
  team: [
    {
      name: "Chrissy Aceves",
      img: "chrissy.jpg"
    },
    {
      name: "Manar Alkuzweny",
      img: "manar.jpg"
    },
    {
      name: "Kristian Andersen",
      img: "kristian.jpg",
      twitter: "https://twitter.com/K_G_Andersen",
      linkedin: "http://www.linkedin.com/in/kga1978"
    },
    {
      name: "Marco Cano",
      img: "marco.jpg"
    },
    {
      name: "Karthik Gangavarapu",
      img: "karthik.jpg",
      email: "gkarthik@scripps.edu",
      twitter: "https://twitter.com/gkay92"
    },
    {
      name: "Emily Haag",
      img: "emily.jpg"
    },
    {
      name: "Emory Hufbauer",
      img: "emory.jpg"
    },
    {
      name: "Laura Hughes",
      img: "laura.jpg",
      twitter: "https://twitter.com/flaneuseks",
      email: "lhughes@scripps.edu",
      linkedin: "https://www.linkedin.com/in/lauradhughes/"
    },
    {
      name: "Kaleigh Jaeger",
      img: "kaleigh.png"
    },
    {
      name: "Alaa Abdel Latif",
      img: "alaa.jpg"
    },
    {
      name: "Josh Levy",
      img: "josh.png"
    },
    {
      name: "Julia Mullen",
      img: "julia.jpg"
    },
    {
      name: "Zhongchao Qian",
      img: "zhongchao.jpg"
    },
    {
      name: "Rachel Sattler",
      img: "rachel.jpg"
    },
    {
      name: "Andrew Su",
      img: "andrew.jpg",
      email: "asu@scripps.edu",
      twitter: "http://twitter.com/andrewsu",
      linkedin: "http://www.linkedin.com/in/andrewsu"
    },
    {
      name: "Ginger Tsueng",
      img: "ginger.jpg"
    },
    {
      name: "Chunlei Wu",
      img: "chunlei.jpg",
      email: "cwu@scripps.edu",
      twitter: "https://twitter.com/chunleiwu",
      linkedin: "https://www.linkedin.com/in/chunleiwu"
    },
    {
      name: "Mark Zeller",
      img: "mark.jpg"
    },
    {
      name: "Jerry Zhou",
      img: "jerry.jpg"
    }
  ],
  funding: [{
      identifier: "5 U19 AI135995-04S3",
      name: "CViSB",
      funder: {
        name: "National Institute for Allergy and Infectious Diseases"
      },
      url: "https://projectreporter.nih.gov/project_info_details.cfm?aid=9634840"
    },
    {
      identifier: "5 U24 TR00230",
      name: "CD2H",
      funder: {
        name: "National Center for Data to Health"
      }
    },
    {
      identifier: "75D30120C09795",
      name: "CDC",
      funder: {
        name: "Centers for Disease Control and Prevention"
      }
    }
  ],
  sources: [{
      id: "JHU",
      name: "Johns Hopkins University Center for Systems Science and Engineering",
      scope: "non-U.S. data",
      img: "jhu.png",
      description: 'Confirmed cases, recovered cases, and deaths over time for countries outside the United States, and provinces in Australia, Canada, and China. See <a target="_blank" rel="noreferrer" href="https://systems.jhu.edu/research/public-health/2019-ncov-map-faqs/">data FAQ</a>.',
      url: "https://github.com/CSSEGISandData/COVID-19",
      license: {
        url: "https://github.com/CSSEGISandData/COVID-19/blob/master/README.md"
      },
      citation: 'Center for Systems Science and Engineering (CSSE) at Johns Hopkins University. <i>COVID-19 Data Repository</i>. Available online: <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank">https://github.com/CSSEGISandData/COVID-19</a> (2020)'
    },
    {
      id: "NYT",
      name: "The New York Times",
      img: "nytimes.png",
      scope: "U.S. data",
      description: 'Confirmed cases and deaths over time for the United States, U.S. States, U.S. Metropolitan Areas, U.S. cities and U.S. counties. Note that "New York City" refers to the combined totals for New York, Kings, Queens, Bronx and Richmond Counties; "Kansas City" refers to cases within the Missouri portion of the Kansas City Metropolitan area and values for Jackson, Cass, Clay, and Platte counties are the totals excluding the KCMO data; cities like St. Louis that are administered separately from their containing county are reported separately. See other <a target="_blank" rel="noreferrer" href="https://github.com/nytimes/covid-19-data#geographic-exceptions">geographic exceptions</a>.',
      url: "https://github.com/nytimes/covid-19-data",
      license: {
        url: "https://github.com/nytimes/covid-19-data/blob/master/LICENSE",
        name: "CC BY-NC"
      },
      citation: 'The New York Times. <i>Coronavirus (Covid-19) Data in the United States</i>. Available online: <a href="https://github.com/nytimes/covid-19-data" target="_blank">https://github.com/nytimes/covid-19-data</a> (2020)'
    }
  ],
  genomicSources: [{
    id: "gisaid",
    name: "GISAID Initiative",
    img: "gisaid.png",
    scope: "SARS-CoV-2 virus sequences",
    description: "<p>We would like to thank the GISAID Initiative and are grateful to all of the data contributors, i.e.the Authors, the Originating laboratories responsible for obtaining the specimens, and the Submitting laboratories for generating the genetic sequence and metadata and sharing via the GISAID Initiative, on which this research is based. GISAID data provided on this website are subject to GISAID’s <a href='https://www.gisaid.org/registration/terms-of-use/' target='_blank'>Terms and Conditions</a>.</p><p class='mb-2'>The GISAID Initiative promotes the rapid sharing of data from all influenza viruses and the coronavirus causing COVID-19. This includes genetic sequence and related clinical and epidemiological data associated with human viruses, and geographical as well as species-specific data associated with avian and other animal viruses, to help researchers understand how viruses evolve and spread during epidemics and pandemics.</p><p class='mb-2'>GISAID does so by overcoming disincentive hurdles and restrictions, which discourage or prevented sharing of virological data prior to formal publication.</p><p class='mb-2'>The Initiative ensures that open access to data in GISAID is provided free-of-charge to all individuals that agreed to identify themselves and agreed to uphold the GISAID sharing mechanism governed through its <a href='https://www.gisaid.org/registration/terms-of-use/' target='_blank'>Database Access Agreement</a>.",
    url: "https://www.gisaid.org/",
    license: {
      url: "https://www.gisaid.org/registration/terms-of-use/",
    },
    citation: 'Elbe, S., and Buckland-Merrett, G. (2017) Data, disease and diplomacy: GISAID’s innovative contribution to global health. Global Challenges, 1:33-46. DOI: <a href="http://dx.doi.org/10.1002/gch2.1018" target="_blank">10.1002/gch2.1018</a>  PMCID: <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6607375/" target="_blank">31565258</a>; Shu, Y., McCauley, J. (2017)  GISAID: Global initiative on sharing all influenza data – from vision to reality. EuroSurveillance, 22(13) DOI: <a href="http://dx.doi.org/10.2807/1560-7917.ES.2017.22.13.30494" target="_blank">10.2807/1560-7917.ES.2017.22.13.30494</a>  PMCID: <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5388101/" target="_blank">PMC5388101</a>'
  }],
  geoSources: [{
      id: "naturaleath",
      name: "Natural Earth",
      img: "naturalearth.png",
      scope: "country names",
      description: "Country names and World Bank region locations",
      url: "https://www.naturalearthdata.com/downloads/",
      license: {
        url: "https://www.naturalearthdata.com/about/terms-of-use/",
        name: "CC0"
      },
      citation: 'Natural Earth. <i>Admin 0 – Countries Cultural Vectors</i>. Available online: <a href="https://www.naturalearthdata.com/downloads/" target="_blank">https://www.naturalearthdata.com/downloads/</a> (2020)'
    },
    {
      id: "census",
      name: "United States Census Bureau",
      scope: "Metropolitan areas",
      img: "census.svg",
      description: "Metropolitan areas are defined by the U.S. Census Bureau's Core Based Statistical Areas. Totals for Metro areas are calculated by aggregating the component U.S. counties into the Core Based Statistical Areas.",
      url: "https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html",
      citation: 'United States Census Bureau. <i>Metropolitan and Micropolitan Statistical Areas and Related Statistical Areas</i>. Available online: <a href="https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html" target="_blank">https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html</a> (2020)'
    }
  ],
  resources: [{
      category: "Publications",
      id: "Publication",
      sources: [{
          id: "litcovid",
          name: "LitCovid / PubMed",
          img: "litcovid_pubmed.png",
          img_lg: "litcovid_pubmed_lg.png",
          url: "https://www.ncbi.nlm.nih.gov/research/coronavirus/",
          description: 'LitCovid is a curated literature hub for tracking up-to-date scientific information about the 2019 novel Coronavirus. It is the most comprehensive resource on the subject, providing a central access to 4929 (and growing) relevant articles in PubMed. The articles are updated daily and are further categorized by different research topics and geographic locations for improved access. You can read more at <a href="https://www.nature.com/articles/d41586-020-00694-1" target="_blank" rel="noreferrer">Chen et al. Nature (2020)</a> and download their data <a href="https://www.ncbi.nlm.nih.gov/research/coronavirus/#data-download" rel="noreferrer" target="_blank">here</a>.',
          license: {
            url: "https://www.ncbi.nlm.nih.gov/home/about/policies/"
          },
          citation: 'Chen Q, Allot A, Lu Z. <i>Keep up with the latest coronavirus research</i>. Nature. 2020;579(7798):193.'
        },
        {
          id: "biorxiv",
          name: "bioRxiv",
          img: "biorxiv.png",
          url: "https://connect.biorxiv.org/relate/content/181",
          description: 'bioRxiv (pronounced "bio-archive") is a free online archive and distribution service for unpublished preprints in the life sciences. It is operated by Cold Spring Harbor Laboratory, a not-for-profit research and educational institution. By posting preprints on bioRxiv, authors are able to make their findings immediately available to the scientific community and receive feedback on draft manuscripts before they are submitted to journals.',
          license: {
            url: "https://www.biorxiv.org/about-biorxiv"
          },
          citation: '<a href="https://www.biorxiv.org/about-biorxiv target="_blank"">How to cite a bioRxiv preprint</a>'
        },
        {
          id: "medrxiv",
          name: "medRxiv",
          img: "medrxiv.png",
          url: "https://connect.biorxiv.org/relate/content/181",
          description: 'medRxiv (pronounced "med-archive") is a free online archive and distribution server for complete but unpublished manuscripts (preprints) in the medical, clinical, and related health sciences. Preprints are preliminary reports of work that have not been certified by peer review. They should not be relied on to guide clinical practice or health-related behavior and should not be reported in news media as established information.',
          license: {
            url: "https://www.medrxiv.org/about/FAQ"
          },
          citation: '<a href="https://www.medrxiv.org/about/FAQ" target="_blank">How to cite a medRxiv preprint</a>'
        },
        {
          id: "imperial",
          name: "MRC Centre for Global Infectious Disease Analysis",
          img: "imperial.png",
          url: "https://www.imperial.ac.uk/mrc-global-infectious-disease-analysis/covid-19/",
          description: 'Since the emergence of the new coronavirus (COVID-19) in December 2019, we have adopted a policy of immediately sharing research findings on the developing pandemic. These pages provide all output from the Imperial College COVID-19 Response Team, including publicly published online reports, planning tools, scientific resources, publications and video updates.',
          license: {
            url: "https://www.imperial.ac.uk/research-and-innovation/support-for-staff/scholarly-communication/open-access/oa-policy/"
          },
          citation: 'Imperial College London. <i>MRC Centre for Global Infectious Disease Analysis COVID-19</i>. Available online: <a href="https://www.imperial.ac.uk/mrc-global-infectious-disease-analysis/covid-19/" target="_blank">https://www.imperial.ac.uk/mrc-global-infectious-disease-analysis/covid-19/</a> (2020)'
        },
        {
          id: "covid19LST",
          name: "COVID-19 Literature Surveillance Team",
          img: "covid19_lst.png",
          url: "https://www.covid19lst.org/",
          description: "We are a non-profit composed of medical students, PhDs, physicians and other passionate individuals. We keep up with the latest research on COVID-19/SARS-CoV-2, find the newest articles, read them, grade their level of evidence, and bring you the bottom line. Our goal is to empower you to take the best care of yourself and those in your care.",
          license: {
            url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
            name: "CC BY-NC-SA 4.0"
          },
          citation: 'COVID-19 Literature Surveillance Team. <i>Daily COVID-19 LST Reports</i>. Available online: <a href="https://www.covid19lst.org/reports" target="_blank">https://www.covid19lst.org/reports</a> (2020)'
        }
      ]
    },
    {
      category: "Clinical Trials",
      id: "ClinicalTrial",
      sources: [{
          id: "nct",
          name: "ClinicalTrials.gov",
          img: "clinicaltrialsgov.png",
          url: "https://clinicaltrials.gov/ct2/results?cond=COVID-19",
          description: 'ClinicalTrials.gov is a database of privately and publicly funded clinical studies conducted around the world. Some modifications were made to the data to standardize how metadata are reported and to align to our <a href=""',
          license: {
            url: "https://clinicaltrials.gov/ct2/about-site/terms-conditions#Use"
          },
          citation: 'ClinicalTrials.gov. <i>Clinical studies related to the coronavirus disease (COVID-19)</i>. Available online: <a href="https://clinicaltrials.gov/ct2/results?cond=COVID-19" target="_blank">https://clinicaltrials.gov/ct2/results?cond=COVID-19</a> (2020)'
        },
        {
          id: "who",
          name: "WHO International Clinical Trials Registry Platform",
          img: "who.svg",
          url: "https://www.who.int/ictrp/en/",
          description: "The main aim of the WHO ICTRP is to facilitate the prospective registration of the WHO Trial Registration Data Set on all clinical trials, and the public accessibility of that information. Clinical trials are sourced from the Australian New Zealand Clinical Trials Registry (ANZCTR), Brazilian Clinical Trials Registry (ReBec), Chinese Clinical Trial Register (ChiCTR), Clinical Research Information Service (CRiS), Republic of Korea, Clinical Trials Registry - India (CTRI), Cuban Public Registry of Clinical Trials (RPCEC), EU Clinical Trials Register (EU-CTR), German Clinical Trials Register (DRKS), Iranian Registry of Clinical Trials (IRCT), ISRCTN, Japan Primary Registries Network (JPRN), Netherlands National Trial Register (NTR), Pan African Clinical Trial Registry (PACTR), Peruvian Clinical Trials Registry (REPEC), Sri Lanka Clinical Trials Registry (SLCTR), and Thai Clinical Trials Register (TCTR). Note that clinical trials also listed in ClinicalTrials.gov have been excluded from this source.",
          license: {
            url: "https://www.who.int/about/who-we-are/publishing-policies/copyright"
          },
          citation: '<a href="https://www.who.int/ictrp/How_to_cite.pdf?ua=1" target="_blank">WHO Citation Policy</a>'
        }
      ]
    },
    {
      category: "Datasets",
      id: "Dataset",
      sources: [{
          id: "dde",
          name: "Data Discovery Engine",
          img: "dde.svg",
          img_lg: "dde_full.svg",
          url: "https://discovery.biothings.io/dataset",
          description: "The CTSA Data Discovery Engine is a website that provides guidance for reserachers on how to make their data discoverable and reusable, and bring the practical benefits of data sharing to researcher’s own research projects, as well as the research community as a whole.",
          license: {
            url: 'https://discovery.biothings.io/about',
            name: 'CC-BY'
          },
          citation: 'Data Discovery Engine. <i>Data Discovery Engine Data Registry</i>. Available online: <a href="https://discovery.biothings.io/dataset" target="_blank">https://discovery.biothings.io/dataset</a> (2020)'
        },
        {
          id: "figshare",
          name: "Figshare",
          img: "figshare_icon.svg",
          img_lg: "figshare.svg",
          url: "https://covid19.figshare.com/",
          description: "figshare is a repository where users can make all of their research outputs available in a citable, shareable and discoverable manner.",
          license: {
            url: "https://knowledge.figshare.com/articles/item/data-access-policy"
          },
          citation: 'Figshare. <i>COVID-19 Open Research Data</i>. Available online: <a href="https://covid19.figshare.com/" target="_blank">https://covid19.figshare.com/</a> (2020)'
        },
        {
          id: "dataverse",
          name: "Harvard Dataverse",
          img: "dataverse_icon.png",
          img_lg: "dataverse.png",
          url: "https://dataverse.harvard.edu/dataverse/covid19",
          license: {
            url: "https://dataverse.org/best-practices/harvard-dataverse-general-terms-use"
          },
          citation: '<a href="https://dataverse.org/best-practices/data-citation target="_blank"">Dataverse Citation Policies</a>',
          description: "This is a general collection of COVID-19 data deposited in the Harvard Dataverse repository. The list in this collection is maintained by the Harvard Dataverse data curation team (IQSS and Harvard Library). Researchers who deposit their related data into Harvard Dataverse will have their data linked to this collection, to increase discoverability of their data."
        },
        {
          id: "immport",
          name: "ImmPort",
          img: "immport.png",
          img_lg: "immport_lg.png",
          url: "https://www.immport.org/shared/search?filters=study_2_condition_or_disease.condition_preferred:COVID-19%20-%20DOID:0080600&utm_source=COVID-19&utm_medium=banner&utm_campaign=COVID-19",
          license: {
            url: "https://www.immport.org/agreement"
          },
          citation: '<a href="https://www.immport.org/cite target="_blank"">Citing ImmPort</a>',
          description: "The Immunology Database and Analysis Portal (ImmPort) provides an open access platform for research data sharing, ontaining experimental data and metadata describing the purpose of the study and the methods of data generation.  To better understand the COVID-19 pandemic, ImmPort presents an opportunity to leverage legacy studies on infectious diseases, including Influenza (over 100 studies) and other respiratory-like illnesses from diverse cohorts (e.g., age, race, gender) sourced from NIAID-sponsored programs and beyond."
        },
        {
          id: "pdb",
          name: "The Protein Data Bank",
          img: "pdb.png",
          url: "https://www.rcsb.org/news?year=2020&article=5e74d55d2d410731e9944f52&feature=true",
          description: "Since 1971, the Protein Data Bank archive (PDB) has served as the single repository of information about the 3D structures of proteins, nucleic acids, and complex assemblies.",
          license: {
            url: 'https://www.rcsb.org/pages/usage-policy',
            name: 'CC0'
          },
          citation: '<a href="https://www.rcsb.org/pages/policies#References target="_blank"">PDB Citation Policies</a>'
        },
        {
          id: "zenodo",
          name: "Zenodo",
          img: "zenodo.svg",
          url: "https://zenodo.org/communities/covid-19/",
          description: "This community collects research outputs that may be relevant to the Coronavirus Disease (COVID-19) or the SARS-CoV-2. Scientists are encouraged to upload their outcome in this collection to facilitate sharing and discovery of information. Although Open Access articles and datasets are recommended, also closed and restricted access material are accepted. All types of research outputs can be included in this Community (Publication, Poster, Presentation, Dataset, Image, Video/Audio, Software, Lesson, Other).",
          license: {
            url: "https://about.zenodo.org/policies/"
          },
          citation: 'Zenodo. <i>Coronavirus Disease Research Community - COVID-19</i>. Available online: <a href="https://zenodo.org/communities/covid-19/" target="_blank">https://zenodo.org/communities/covid-19/</a> (2020)'
        }
      ]
    },

    {
      category: "Protocols",
      id: "Protocol",
      sources: [{
        id: "protocolsio",
        name: "protocols.io",
        img: "protocolsio.png",
        img_lg: "protocolsio_lg.png",
        url: "https://www.protocols.io/groups/coronavirus-method-development-community",
        description: "protocols.io is a platform for sharing for science methods, assays, clinical trials, operational procedures and checklists.",
        license: {
          name: "CC BY",
          url: "https://www.protocols.io/terms#tos1"
        },
        citation: 'protocols.io. <i>Coronavirus Method Development Community</i>. Available online: <a href="https://www.protocols.io/groups/coronavirus-method-development-community" target="_blank">https://www.protocols.io/groups/coronavirus-method-development-community</a> (2020)'
      }]
    }
  ],
  updates: [{
      date: new Date("2020-06-12 0:0"),
      category: "feature",
      title: "Downloadable visualizations and epidemiology data",
      description: 'All visualizations and their underlying data can be downloaded as .jsons, .tsvs, or .svgs.',
      route: {
        name: "Epidemiology",
        query: {
          location: "BRA;RUS;IND",
          variable: 'confirmed_numIncrease'
        }
      }
    },
    {
      date: new Date("2020-06-12 0:0"),
      category: "feature",
      title: "Downloadable resource metadata",
      description: 'All metadata for COVID-19 and SARS-CoV-2 resources can be downloaded as .jsons or .tsvs. Results from searches like <a href=https://outbreak.info/resources/search?q=remdesivir&filter=%40type%3Aclinicaltrial&page=0&size=10&sort=>Remdesivir Clinical Trials</a> or entire data sources, like <a href=http://localhost:8080/sources#Publication>all publications</a>, can be downloaded.',
      route: {
        name: "Resources",
        query: {
          q: "remdesivir"
        }
      }
    },
    {
      date: new Date("2021-07-15 0:0"),
      category: "feature",
      title: "Added warning for the characteristic mutations of lineages with few sequences",
      description: 'To alert users that characteristic mutations of lineages with few sequences may change as new data is collected, added a warning message.',
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-07-16 0:0"),
      category: "feature",
      title: "Enabled navigation from Variant Report maps",
      description: 'On the choropleth maps in the Lineage|Mutation Tracker and Location Tracker, clicking on a country or state/province in the map will redirect you to data for that location.',
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.1.7"
        }
      }
    },
    {
      date: new Date("2021-07-15 0:0"),
      category: "feature",
      title: "Added a light mode to Lineage Comparison",
      description: 'To focus on commonalities between lineages when comparing their mutations, we added a light mode that allows you to focus on the high prevalence mutations.',
      route: {
        name: "SituationReportComparison",
        query: {
          dark: false
        }
      }
    },
    {
      date: new Date("2020-12-04 0:0"),
      category: "data",
      title: "Added COVID-19 Literature Surveillance Team Reports",
      description: 'Added resource metadata from <a href="https://www.covid19lst.org/reports" target="_blank" rel="noreferrer">COVID-19 Literature Surveillance Team Reporst</a>. <a href="/sources#resources">View more about sources</a>',
      route: {
        name: "Resources",
        query: {
          filter: 'curatedBy.name:"COVID-19 Literature Surveillance Team"'
        }
      }
    },
    {
      date: new Date("2020-07-02 0:0"),
      category: "feature",
      title: "Added world and U.S. choropleths",
      description: "Added choropleths of daily new cases and deaths (7 day rolling average) and two-week change in average cases and deaths.",
      route: {
        name: "Maps"
      }
    },
    {
      date: new Date("2020-06-12 0:0"),
      category: "feature",
      title: "Added 7-day rolling averages for case counts",
      description: 'To visualize the trendline for daily new cases or deaths, added a 7-day rolling average (+/- 3 days) to the visualizations.',
      route: {
        name: "Epidemiology",
        query: {
          location: "BRA;RUS;IND",
          variable: 'confirmed_numIncrease'
        }
      }
    },
    {
      date: new Date("2021-03-30 0:0"),
      category: "feature",
      title: "Added Lineage Comparison tool",
      description: "Added tool to compare mutations within particular lineages. Lineages can be selected manually, based on the presence of a particular mutation(s), based on prevalence within a location, or from the Variants of Concern and Interest.",
      route: {
        name: "SituationReportComparison"
      }
    },
    {
      date: new Date("2021-07-01 0:0"),
      category: "feature",
      title: "Added email subscription",
      description: "Added the option to subscribe to outbreak.info email updates.",
      route: {
        name: "About",
        hash: "#subscribe"
      }
    },
    {
      date: new Date("2020-07-06 0:0"),
      category: "feature",
      title: "Overlaid 7-day rolling averages for case counts",
      description: 'Maps 7-day rolling averages between locations directly.',
      route: {
        name: "Epidemiology",
        query: {
          location: "USA_US-NY;USA_US-TX;USA_US-FL",
          variable: 'confirmed_rolling'
        }
      }
    },
    {
      date: new Date("2020-08-06 0:0"),
      category: "feature",
      title: "Added time slider to geographic data",
      description: 'Scroll through timepoints to compare countries, U.S. states, U.S. metropolitan areas, and U.S. counties case and death counts over time',
      route: {
        name: "Maps"
      }
    },
    {
      date: new Date("2020-10-15 0:0"),
      category: "data",
      title: "Added ImmPort datasets",
      description: 'Added resource metadata from <a href="https://www.immport.org/shared/search?filters=study_2_condition_or_disease.condition_preferred:COVID-19%20-%20DOID:0080600&utm_source=COVID-19&utm_medium=banner&utm_campaign=COVID-19" target="_blank" rel="noreferrer">ImmPort</a>. <a href="/sources#resources">View more about sources</a>',
      route: {
        name: "Resources",
        query: {
          filter: 'curatedBy.name:"ImmPort"'
        }
      }
    },
    {
      date: new Date("2021-03-16 0:0"),
      category: "data",
      title: "Released U.S. county-level Lineage | Mutation Reports",
      description: 'Added county-level data to SARS-CoV-2 Mutation & Variant Situation reports and migrated to location id-based reports.',
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.526",
          selected: "USA_US-NY_36005"
        }
      }
    },
    {
      date: new Date("2021-12-31 0:0"),
      category: "data",
      title: "Removed COVID Tracking Project data",
      description: "Since the COVID Tracking Project stopped tracking data on <a href='https://covidtracking.com/analysis-updates/giving-thanks-and-looking-ahead-our-data-collection-work-is-done' target='_blank'>7 March 2021</a>, removed U.S. hospitalization / testing data."
    },
    {
      date: new Date("2021-03-16 0:0"),
      category: "variants",
      title: "Reclassified B.1.427 and B.1.429 as Variants of Concern",
      description: 'Based on the <a href="https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/variant-surveillance/variant-info.html" target="_blank">CDC</a> classification, lineages B.1.427 and B.1.429 have been upgraded from <b>Variants of Interest</b> to <b>Variants of Concern</b>.',
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.429",
          selected: "USA_US-CA"
        }
      }
    },
    {
      date: new Date("2021-09-20 0:0"),
      category: "variants",
      title: "Updated ECDC's classification of B.1.1.7, B.1.525, B.1.617.1, P.2, P.3 & PHE's classification of B.1.617.1 as De-escalated Variants",
      description: 'Based on the <a href="https://www.ecdc.europa.eu/en/covid-19/variants-concern" target="_blank">ECDC</a> classification, updated their classification of B.1.1.7/Alpha, B.1.525/Eta, B.1.617.1/Kappa, P.2/Zeta, and P.3/Theta and the classification of B.1.617.1/Kappa by <a href="https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1014926/Technical_Briefing_22_21_09_02.pdf" target="_blank">PHE</a> as De-escalated Variants.',
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-09-22 0:0"),
      category: "variants",
      title: "Updated WHO's classification of B.1.1.7, B.1.351, P.1, B.1.427, B.1.429, B.1.525, B.1.617.1, B.1.617.3, B.1.621, and P.2 as VUMs",
      description: 'Based on the updated <a href="https://www.who.int/en/activities/tracking-SARS-CoV-2-variants/" target="_blank">WHO</a> classification, changing WHO classification of  from Variant of Interest to Variant Under Monitoring.',
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-09-22 0:0"),
      category: "variants",
      title: "Updated CDC's classification of B.1.1.7, B.1.351, P.1, B.1.427, B.1.429, B.1.525, B.1.617.1, B.1.617.3, B.1.621, and P.2 as VUMs",
      description: 'Based on the updated <a href="https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/variant-surveillance/variant-info.html" target="_blank">CDC</a> classification, changing CDC classification of B.1.1.7/Alpha, B.1.351/Beta, and P.1/Gamma from Variant of Concern to Variant Under Monitoring and all CDC Variants of Interest as Variants Under Monitoring (B.1.427 and B.1.429/Epsilon, B.1.525/Eta, B.1.526/Iota, B.1.617.1/Kappa, B.1.617.3, B.1.621/Mu, and P.2/Zeta).',
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-09-22 0:1"),
      category: "variants",
      title: "Downgraded B.1.525/Eta, B.1.526/Iota, B.1.617.1/Kappa, P.3/Theta, B.1.1.318, B.1.617.3, C.36.3 to VUMs",
      description: 'Based on updated classifications from the CDC, WHO, ECDC, and PHE, downgraded Variants of Interest B.1.525/Eta, B.1.526/Iota, B.1.617.1/Kappa, P.3/Theta, B.1.1.318, B.1.617.3, C.36.3 to Variants Under Monitoring',
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-08-23 0:0"),
      category: "variants",
      title: "Outbreak.info, CDC, and ECDC reclassified B.1.427 and B.1.429 as Variants under Monitoring",
      description: 'Updated the outbreak.info, <a href="https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/variant-surveillance/variant-info.html" target="_blank">CDC</a>, and <a href="https://www.ecdc.europa.eu/en/covid-19/variants-concern" target="_blank">ECDC</a> classification of lineages B.1.427 and B.1.429 from <b>Variants of Interest</b> to <b>Variants under Monitoring</b>.',
      route: {
        name: "MutationReport",
        params: {
          alias: "epsilon",
        },
        query: {
          selected: "USA_US-CA"
        }
      }
    },
    {
      date: new Date("2021-09-03 0:0"),
      category: "variants",
      title: "Added C.1.2 as a VUM",
      description: 'Added C.1.2 as a Variant Under Monitoring',
      route: {
        name: "MutationReport",
        query: {
          pango: "C.1.2",
          selected: "ZAF"
        }
      }
    },
    {
      date: new Date("2021-09-03 0:0"),
      category: "variants",
      title: "De-escalated AV.1 from VOI",
      description: 'Based on WHO and CDC classifications, removed AV.1 as a Variant of Interest',
      route: {
        name: "MutationReport",
        query: {
          pango: "AV.1",
          selected: "GBR"
        }
      }
    },
    {
      date: new Date("2021-09-03 0:0"),
      category: "variants",
      title: "De-escalated Epsilon/B.1.427/B.1.429 from VUM",
      description: 'Based on WHO, CDC, and ECDC classifications, removed Epsilon/B.1.427/B.1.429 as a Variant Under Monitoring',
      route: {
        name: "MutationReport",
        params: {
          alias: "epsilon",
        },
        query: {
          selected: "USA_US-CA"
        }
      }
    },
    {
      date: new Date("2021-11-25 0:0"),
      category: "variants",
      title: "Added B.1.1.529 as a Variant under Monitoring",
      description: 'Based on the WHO classification, added B.1.1.529 as a Variant under Monitoring.',
      route: {
        name: "MutationReport",
        params: {
          alias: "omicron",
        },
        query: {
          selected: "ZAF"
        }
      }
    },
    {
      date: new Date("2021-12-17 0:0"),
      category: "variants",
      title: "Fixed Omicron mutation counting",
      description: 'Adjusted parameters within the minimap2 alignment call (added <span style="font-family: monospace">--score-N=0</span>) in the <a href="https://github.com/andersen-lab/bjorn/commit/560591e12e1fbc8bd469bcc4b24d3a858abb89da" target="_blank">Bjorn</a> pipeline to account for long stretches of unknown base pairs (Ns) in Omicron. This fixes the mutation prevalence of mutations like S:S477N, S:T478K, S:E484A, whose prevalence was underreported before the patch.',
      route: {
        name: "SituationReportComparison",
        query: {
          pango: "Omicron"
        }
      }
    },
    {
      date: new Date("2021-12-02 0:0"),
      category: "variants",
      title: "Added CDC classification of Omicron as a VOC",
      description: "Updated the CDC's classification of Omicron as a Variant of Concern",
      route: {
        name: "MutationReport",
        params: {
          alias: "omicron",
        },
        query: {
          selected: "ZAF"
        }
      }
    },
    {
      date: new Date("2021-12-06 0:0"),
      category: "variants",
      title: "Added PHE classification of Omicron as a VOC",
      description: "Updated the PHE's classification of Omicron as a Variant of Concern based on their <a href='https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1038404/Technical_Briefing_30.pdf' target='_blank'>latest report.</a>",
      route: {
        name: "MutationReport",
        params: {
          alias: "omicron",
        },
        query: {
          selected: "ZAF"
        }
      }
    },
    {
      date: new Date("2021-12-14 0:0"),
      category: "variants",
      title: "Redesignated Omicron as B.1.1.529 and its sublineages",
      description: "Redesignated Omicron as B.1.1.529 and its sub lineages. Updated NextStrain clades",
      route: {
        name: "MutationReport",
        params: {
          alias: "omicron",
        },
        query: {
          selected: "ZAF"
        }
      }
    },
    {
      date: new Date("2021-11-26 0:0"),
      category: "variants",
      title: "Added Omicron as a Variant of Concern",
      description: 'Based on the WHO and ECDC classifications, upgraded Omicron / B.1.1.529 to a Variant of Concern.',
      route: {
        name: "MutationReport",
        params: {
          alias: "omicron",
        },
        query: {
          selected: "ZAF"
        }
      }
    },
    {
      date: new Date("2021-09-03 0:0"),
      category: "variants",
      title: "De-escalated Zeta/P.2 from VOI",
      description: 'Based on WHO, CDC, PHE, and ECDC classifications, removed Zeta/P.2 as a Variant of Interest',
      route: {
        name: "MutationReport",
        params: {
          alias: "zeta",
        }
      }
    },
    {
      date: new Date("2021-08-23 0:0"),
      category: "variants",
      title: "ECDC reclassified C.37/Lambda as Variants of Interest",
      description: 'Updated the <a href="https://www.ecdc.europa.eu/en/covid-19/variants-concern" target="_blank">ECDC</a> classification of lineage C.37 / Lambda from <b>Variant under Monitoring</b> to <b>Variant of Interest</b>.',
      route: {
        name: "MutationReport",
        params: {
          alias: "lambda"
        }
      }
    },
    {
      date: new Date("2021-08-31 0:0"),
      category: "variants",
      title: "WHO reclassified B.1.621/Mu as Variants of Interest",
      description: 'Updated the <a href="https://www.who.int/en/activities/tracking-SARS-CoV-2-variants/" target="_blank">WHO</a> classification of lineage B.1.621 as Variant of Interest Mu.',
      route: {
        name: "MutationReport",
        params: {
          alias: "lambda"
        }
      }
    },
    {
      date: new Date("2021-08-30 1:0"),
      category: "variants",
      title: "Released combined reports for Delta and other lineages",
      description: 'Based on the proliferation of sublineages associated with Variants of Concern and Interest, we created combined reports that provide aggregate statistics for variants and their descendants. These reports will be updated as new sublineages are classified by the Pango team. Read more about <a href="https://outbreak.info/situation-reports/caveats#delta">sublineages</a>.',
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-08-10 0:0"),
      category: "variants",
      title: "Added P.1 sublineages as VOCs",
      description: "Added P.1.3, P.1.4, P.1.5, P.1.6, and P.1.7 as Variants of Concern, sublineages of P.1.",
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-06-30 0:0"),
      category: "variants",
      title: "Added B.1.351.1, B.1.351.2, and B.1.351.3 as a VOCs",
      description: 'Added B.1.351.1, B.1.351.2, and B.1.351.3, sublineages of the Variant of Concern B.1.351, as Variants of Concern.',
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.351.2",
          selected: "Mayotte"
        }
      }
    },
    {
      date: new Date("2021-06-20 0:0"),
      category: "variants",
      title: "Added B.1.427/429 as a VOI",
      description: 'Based on the PANGO classification of lineages into B.1.427/429 (pangolin <i>v3.1.1</i>) in addition to B.1.427 and B.1.429, added B.1.427/429 as Variant of Interest.',
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.427/429",
          selected: "USA_US-CA"
        }
      }
    },
    {
      date: new Date("2021-07-16 0:0"),
      category: "variants",
      title: "Removed B.1.351.1 as a VOC",
      description: 'Based on reassignment of B.1.351.1 lineages by PANGO, resulting in no sequences assigned, removing B.1.351.1 as a Variant of Concern.',
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-07-21 0:0"),
      category: "variants",
      title: "Added AY.3 as a VOC",
      description: 'Based on the <a target="_blank" href="https://www.cdc.gov/coronavirus/2019-ncov/variants/variant-info.html">CDC classification</a> of AY.3 as a VOC.',
      route: {
        name: "MutationReport",
        query: {
          pango: "AY.3",
          loc: ["USA", "GBR"]
        }
      }
    },
    {
      date: new Date("2021-08-03 0:0"),
      category: "variants",
      title: "Added AY.3.1 as a VOC",
      description: 'Based on the split of Variant of Concern AY.3 into the AY.3.1 sublineage.',
      route: {
        name: "MutationReport",
        query: {
          pango: "AY.3.1"
        }
      }
    },
    {
      date: new Date("2021-08-03 0:0"),
      category: "variants",
      title: "Added B.1.621.1 as a VOI",
      description: 'Based on the split of Variant of Interest B.1.621 into the B.1.621.1 sublineage.',
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.621.1"
        }
      }
    },
    {
      date: new Date("2021-07-21 0:1"),
      category: "variants",
      title: "Removed P.2 as a VOI by CDC.",
      description: 'Based on the <a target="_blank" href="https://www.cdc.gov/coronavirus/2019-ncov/variants/variant-info.html">CDC report</a> removing P.2 as VOI'
    },
    {
      date: new Date("2021-07-23 0:0"),
      category: "variants",
      title: "Added B.1.621 as a VOI.",
      description: 'Based on <a target="_blank" href="https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1005517/Technical_Briefing_19.pdf">PHE Technical Briefing 19</a> adding B.1.621 as VOI',
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.621",
          loc: ["COL", "GBR"],
	  selected: "COL"
        }
      }
    },
    {
      date: new Date("2021-06-20 0:0"),
      category: "variants",
      title: "Removed B.1.526.1 and B.1.526.2 as VOIs due to PANGO reassignment into B.1.526",
      description: 'Based on the PANGO reassignment of lineages B.1.526.1 and B.1.526.2 as Variant of Interest B.1.526, removing B.1.526.1 and B.1.526.2 as VOIs.',
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.526",
          selected: "USA_US-NY"
        }
      }
    },
    {
      date: new Date("2021-06-18 0:0"),
      category: "variants",
      title: "Updated PHE classifications: AY.2 (VOC), B.1.1.7 with S:E484K and C.37 (VUMs)",
      description: 'Based on the weekly <a href="https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/994839/Variants_of_Concern_VOC_Technical_Briefing_16.pdf" target="_blank">PHE report</a>, added new classifications: AY.2 as a Variant of Concern as a sublineage to the B.1.617.2/Delta lineage and C.37 as a Variant Under Monitoring. B.1.1.7 with S:E484K was downgraded to a Variant Under Monitoring, since no new cases have been observed in England since 1 March 2021.',
      route: {
        name: "SituationReports",
        query: {
          voc: ["PHE"],
          voi: ["PHE"]
        }
      }
    },
    {
      date: new Date("2021-07-06 0:0"),
      category: "variants",
      title: "Updated WHO classifications: downgraded B.1.427, B.1.429, P.2, & P.3",
      description: 'Based on the <a href="https://www.who.int/en/activities/tracking-SARS-CoV-2-variants/" target="_blank">WHO report</a>, reclassified Variants of Interest as Variants Under Monitoring: B.1.427/Epsilon, B.1.429/Epsilon, P.2/Zeta, P.3/Theta, and added AV.1, B.1.1.318, and C.36.3 as WHO VUMs. Also updated P.1.1 and P.1.2 classifications to reflect its status as a sublineage of P.1.',
      route: {
        name: "SituationReports",
        query: {
          voc: ["WHO"],
          voi: ["WHO"]
        }
      }
    },
    {
      date: new Date("2021-07-06 0:0"),
      category: "variants",
      title: "Reclassified B.1.427/429 as B.1.427 or B.1.429",
      description: 'Removed B.1.427/429 as a VOI due to PANGO classification update as either B.1.427 or B.1.429.',
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-06-18 0:0"),
      category: "variants",
      title: "Added C.37 as a VUM by the ECDC",
      description: 'Based on the weekly <a href="https://www.ecdc.europa.eu/en/covid-19/variants-concern" target="_blank">ECDC update</a>, added C.37 as a Variant Under Monitoring',
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-06-29 0:0"),
      category: "variants",
      title: "B.1.427/429 downgraded by CDC to VOIs",
      description: 'Based on the <a href="https://www.cdc.gov/coronavirus/2019-ncov/variants/variant-info.html?CDC_AA_refVal=https%3A%2F%2Fwww.cdc.gov%2Fcoronavirus%2F2019-ncov%2Fcases-updates%2Fvariant-surveillance%2Fvariant-info.html" target="_blank">CDC update</a>, downgraded B.1.427/429/Epsilon from Variants of Concern to Variants of Interest.',
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-06-25 0:0"),
      category: "variants",
      title: "Added C.37 as a VOI by PHE",
      description: 'Based on the weekly <a href="https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/996740/Variants_of_Concern_VOC_Technical_Briefing_17.pdf" target="_blank">PHE update</a>, upgraded C.37 from a Variant Under Monitoring to a Variant of Interest',
      route: {
        name: "MutationReport",
        query: {
          pango: "C.37",
          selected: "PER"
        }
      }
    },
    {
      date: new Date("2021-06-07 0:0"),
      category: "variants",
      title: "Added P.1.1 and P.1.2 as Variants of Concern",
      description: 'Added P.1.1 and P.1.2, sublineages of the Variant of Concern P.1, as Variants of Concern.',
      route: {
        name: "MutationReport",
        query: {
          pango: "P.1.1"
        }
      }
    },
    {
      date: new Date("2021-06-11 0:0"),
      category: "variants",
      title: "Removed A.23.1 + S:E484K as a VUI",
      description: "Removed A.23.1 with S:E484K as a Variant of Interest, based on the 11 June 2021 Public Health England's <a href='https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/993198/Variants_of_Concern_VOC_Technical_Briefing.pdf' target='_blank'>Technical Briefing 15</a>.",
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-06-01 0:0"),
      category: "variants",
      title: "Added A23.1 + S:E484K, AV.1, B.1.1.318, B.1.525, C.36.3, and P.3 as Variants of Interest",
      description: 'Based on the <a href="https://www.gov.uk/government/publications/covid-19-variants-genomically-confirmed-case-numbers/variants-distribution-of-cases-data" target="_blank">PHE</a> classification, added A23.1 + S:E484K, AV.1, B.1.1.318, B.1.525, C.36.3, and P.3 as Variants of Interest (VOIs). Also removed B.1.617 as a VOI, due to the expansion of the B.1.617 sublineages.',
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-06-15 0:0"),
      category: "variants",
      title: "Updated the CDC classification of B.1.617.2/Delta to VOC",
      description: 'Updated the <a href="https://www.cdc.gov/coronavirus/2019-ncov/variants/variant-info.html" target="_blank">CDC</a> classification of B.1.617.2/Delta and AY.1/Delta to a Variant of Concern.',
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.617.2",
          loc: ["IND", "GBR"],
          selected: "IND"
        }
      }
    },
    {
      date: new Date("2021-06-15 0:1"),
      category: "variants",
      title: "Added C.37/Lambda as a VOI",
      description: 'Added C.37/Lambda as a Variant of Interest, based on the <a href="https://www.who.int/en/activities/tracking-SARS-CoV-2-variants/">WHO</a> classification',
      route: {
        name: "MutationReport",
        query: {
          pango: "C.37",
          loc: ["PER"],
          selected: "PER"
        }
      }
    },
    {
      date: new Date("2021-03-16 0:0"),
      category: "data",
      title: "Redefined characteristic mutations of a lineage",
      description: 'Redefined the characteristic mutations of a lineage to be any mutation occurring in at least 75% of all known sequences of that lineage.',
      route: {
        name: "MutationReport",
        query: {
          pango: "P.2",
          selected: "BRA"
        }
      }
    },
    {
      date: new Date("2021-03-16 0:0"),
      category: "data",
      title: "Refined color scale for Situation Report maps",
      description: 'Chnaged the color scale for all choropleth maps for Situation Reports from a continuous scale to a classified one.',
      route: {
        name: "MutationReport",
        query: {
          pango: "P.2",
          selected: "BRA"
        }
      }
    },
    {
      date: new Date("2020-06-12 0:0"),
      category: "data",
      title: "Added Harvard Dataverse",
      description: 'Added resource metadata from <a href="https://dataverse.harvard.edu/dataverse/covid19" target="_blank" rel="noreferrer">Harvard Dataverse</a>. <a href="/sources#resources">View more about sources</a>',
      route: {
        name: "Resources",
        query: {
          filter: 'curatedBy.name:"Dataverse"'
        }
      }
    }, {
      date: new Date("2020-05-28 0:0"),
      category: "data",
      title: "Added Figshare and protocols.io",
      description: 'Added resource metadata from <a href="https://covid19.figshare.com/" target="_blank" rel="noreferrer">Figshare</a> and protocols from <a href="https://www.protocols.io/groups/coronavirus-method-development-community" target="_blank" rel="noreferrer">protocols.io</a>. <a href="/sources#resources">View more about sources</a>',
      route: {
        name: "Resources",
        query: {
          filter: 'curatedBy.name:"Figshare,protocols.io"'
        }
      }
    }, {
      date: new Date("2021-04-01 0:0"),
      category: "variants",
      title: "Added B.1.526.1, B.1.526.2, and P.2 as Variants of Interest",
      description: "Based on the split of the B.1.526 lineage into B.1.526, B.1.526.1, and B.1.526.2 lineages, added the two new lineages as Variants of Interest, as well as the P.2 lineage circulating in Brazil.",
      route: {
        name: "SituationReports"
      }
    }, {
      date: new Date("2021-04-15 0:0"),
      category: "variants",
      title: "Added B.1.617 as a Variant of Interest",
      description: "Based on the expansion of B.1.617 in India, added B.1.617 as a Variant of Interest.",
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.617",
          loc: "IND",
          selected: "IND"
        }
      }
    }, {
      date: new Date("2021-06-08 0:0"),
      category: "variants",
      title: "Removed S:Y453F as a Mutation of Interest",
      description: "Removed S:Y453F as a Mutation of Interest.",
      route: {
        name: "MutationReport",
        query: {
          muts: "S:Y453F",
          loc: "DNK",
          selected: "DNK"
        }
      }
    }, {
      date: new Date("2021-06-10 0:0"),
      category: "feature",
      title: "Added Variant of Concern and Interest classifications from the CDC, ECDC, PHE, and WHO",
      description: "Added curated classifications of the Variants of Concern and Interest, based on data from the <a href='https://www.cdc.gov/coronavirus/2019-ncov/variants/variant-info.html?CDC_AA_refVal=https%3A%2F%2Fwww.cdc.gov%2Fcoronavirus%2F2019-ncov%2Fcases-updates%2Fvariant-surveillance%2Fvariant-info.html' target='_blank'>Centers for Disease Control and Prevention</a>, <a href='https://www.ecdc.europa.eu/en/covid-19/variants-concern' target='_blank'>European Centre for Disease Prevention and Cotnrol</a>, <a href='https://www.gov.uk/government/publications/investigation-of-novel-sars-cov-2-variant-variant-of-concern-20201201' target='_blank'>Public Health England</a>, and the <a href='https://www.who.int/en/activities/tracking-SARS-CoV-2-variants/' target='_blank'>World Health Organization</a>. Redesigned the Lineage | Mutation Tracker homepage, including adding new WHO nomenclature for VOCs and VOIs.",
      route: {
        name: "SituationReports"
      }
    }, {
      date: new Date("2021-06-10 0:0"),
      category: "feature",
      title: "Added buttons to select VOCs and VOIs in Lineage Comparison tool",
      description: "Added buttons to pre-select Variants of Concern and Interest to easily compare mutations within those lineages.",
      route: {
        name: "SituationReportComparison"
      }
    }, {
      date: new Date("2021-05-03 0:0"),
      category: "variants",
      title: "Added B.1.617.1 as a Variant of Interest",
      description: "Based on split of B.1.617 into sublineages, added B.1.617.1 as a Variant of Interest based on its expansion in India and presence of S:E484Q mutation.",
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.617.1",
          loc: "IND",
          selected: "IND"
        }
      }
    }, {
      date: new Date("2021-05-07 0:0"),
      category: "variants",
      title: "Added B.1.617.2 as a Variant of Concern, and B.1.617.3 as a Variant of Interest. B.1.427 and B.1.429 downgraded to VOI.",
      description: "Based on the report, <a href=\"https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/984274/Variants_of_Concern_VOC_Technical_Briefing_10_England.pdf\">Technical Briefing 10<a/> from PHE.",
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.617.2",
          loc: ["IND", "GBR"],
          selected: "IND"
        }
      }
    }, {
      date: new Date("2021-06-11 0:1"),
      category: "variants",
      title: "Added AY.1 as a VOC",
      description: 'Based on the reclassification of some B.1.617.2/Delta lineages with mutation S:K417N, the <a href="https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/993198/Variants_of_Concern_VOC_Technical_Briefing.pdf">PHE Technical Briefing 15<a/>, and its mutational similarity as a sublineage of B.1.617.2/Delta, added AY.1 as a Variant of Concern.',
      route: {
        name: "MutationReport",
        query: {
          pango: "AY.1",
          loc: ["IND", "GBR"]
        }
      }
    },
    {
      date: new Date("2021-01-21 0:0"),
      category: "data",
      title: "Added SARS-CoV-2 Mutation Situation Reports",
      description: 'Added situation reports describing the prevalence of certain sets of mutations in SARS-CoV-2 sequences from the <a href="https://www.gisaid.org/" target="_blank">GISAID Initiative</a>.',
      route: {
        name: "SituationReports"
      }
    },
    {
      date: new Date("2021-02-10 0:0"),
      category: "data",
      title: "Released customizable, interactive SARS-CoV-2 Lineage Situation Reports",
      description: 'Released customizable, interactive SARS-CoV-2 Lineage Situation Reports',
      route: {
        name: "MutationReport",
        query: {
          pango: "B.1.1.7"
        }
      }
    },
    {
      date: new Date("2021-02-23 0:0"),
      category: "data",
      title: "Released customizable, interactive SARS-CoV-2 Mutation & Variant Situation Reports",
      description: 'Released customizable, interactive SARS-CoV-2 Mutation & Variant Situation Reports',
      route: {
        name: "MutationReport",
        query: {
          muts: "S:E484K"
        }
      }
    },
    {
      date: new Date("2021-03-17 0:0"),
      category: "feature",
      title: "Released customizable, interactive SARS-CoV-2 Location Tracker",
      description: 'Released customizable, interactive SARS-CoV-2 Situation Reports for countries, states, and U.S. counties',
      route: {
        name: "LocationReport",
        query: {
          loc: "USA"
        }
      }
    },
    {
      date: new Date("2020-07-06 0:1"),
      category: "feature",
      title: "Copyable visualizations",
      description: 'All visualizations can now be copied to the clipboard (Chrome/Edge/Opera/Android/Samsung) and downloaded as .pngs',
      route: {
        name: "Maps",
      }
    },
    {
      date: new Date("2020-07-23 0:1"),
      category: "feature",
      title: "Added per capita normalization",
      description: 'Added normalization of case and death counts by population for countries and U.S. states, metropolitan areas, and counties.',
      route: {
        name: "Epidemiology",
        query: {
          location: "KOR;USA_US-CA;AUS",
          variable: "confirmed_rolling",
          percapita: "true"
        }
      }
    },
    {
      date: new Date("2020-07-14 0:0"),
      category: "data",
      title: "Access all data through our API",
      description: 'All of our data, including epidemiology data and resource metadata, can be accessed at <a href="https://api.outbreak.info/">api.outbreak.info</a>',
      route: {
        name: "Sources",
      }
    },
    {
      date: new Date("2020-05-19 0:0"),
      category: "data",
      title: "Added searchable resources",
      description: 'Added resource metadata for publications from <a href="https://www.ncbi.nlm.nih.gov/research/coronavirus/" target="_blank" rel="noreferrer">LitCovid</a> and <a href="https://connect.biorxiv.org/relate/content/181" target="_blank" rel="noreferrer">bioRxiv and medRxiv</a>; clinical trials from <a href="https://clinicaltrials.gov/ct2/results?cond=COVID-19" target="_blank" rel="noreferrer">ClinicalTrials.gov</a> and  <a href="https://www.who.int/ictrp/en/" target="_blank" rel="noreferrer">WHO International Clinical Trials Registry Platform</a>; and datasets from <a href="https://www.rcsb.org/news?year=2020&article=5e74d55d2d410731e9944f52&feature=true" target="_blank" rel="noreferrer">The Protein Data Bank</a> and <a href="https://zenodo.org/communities/covid-19/" target="_blank" rel="noreferrer">Zenodo</a>. <a href="/sources#resources">View more about sources</a>',
      route: {
        name: "Resource Summary",
      }
    },
    {
      date: new Date("2020-04-06 0:0"),
      category: "data",
      title: "Changed United States epidemiology data source",
      description: 'Switched the data source for U.S. epidemiological data from <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank" rel="noreferrer">Johns Hopkins</a> to the <a href="https://github.com/nytimes/covid-19-data" target="_blank" rel="noreferrer">New York Times</a>.',
      route: {
        name: "Epidemiology",
        query: {
          location: "USA;USA_US-CA;METRO_41940;USA_US-CA_06085",
          variable: "confirmed"
        }
      }
    },
    {
      date: new Date("2020-04-06 0:0"),
      category: "feature",
      title: "Added United States Metropolitan Areas aggregations",
      description: "Using the U.S. Census Bureau's Core Based Statistical Areas, calculated case and death totals for metropolitan areas, which are groups of U.S. counties.",
      route: {
        name: "Epidemiology",
        query: {
          location: "METRO_28140;METRO_41180",
          variable: "confirmed"
        }
      }
    },
    {
      date: new Date("2020-03-31 0:0"),
      category: "feature",
      title: "Added daily case and death counts",
      description: "Created daily histograms of confirmed cases or deaths pre day by location.",
      route: {
        name: "Epidemiology",
        query: {
          location: "METRO_35620;ITA;ESP;USA",
          variable: "dead"
        }
      }
    },
    {
      date: new Date("2020-03-31 0:0"),
      category: "feature",
      title: "Created iframe-embeddable summary boxes",
      description: "Added customizable summary boxes, which can be embedded within iframes. Locations should be specified by `location_id` (usually the ISO3 or FIPS code) and should be separated by semicolons.",
      route: {
        name: "Summary",
        query: {
          location: "USA;USA_US-CA;USA_US-CA_06037;USA_US-CA_06073"
        }
      }
    },
    {
      date: new Date("2020-03-24 0:0"),
      category: "feature",
      title: "Added doubling rates",
      description: "Created summary of the doubling rates for a location in the last five days compared to the previous five days.",
      route: {
        name: "Doubling Rates",
        query: {
          location: "USA"
        }
      }
    },
    {
      date: new Date("2021-07-14 0:0"),
      category: "feature",
      title: "Added outbreak.info in the media",
      description: "Press mentions of outbreak.info",
      route: {
        name: "Press"
      }
    },
    {
      date: new Date("2020-04-10 0:0"),
      category: "feature",
      title: "Normalize epidemiology plots by days since 100 cases, 10 deaths, or 50 deaths",
      description: "For epidemiology plots over time, allow the x-axis to shift to a normalized timepoint: when the location had 100 cumulative confirmed cases, 10 cumulative deaths, or 50 cumulative deaths.",
      route: {
        name: "Epidemiology",
        query: {
          location: "METRO_12060;METRO_35380;METRO_26420",
          log: "false",
          variable: "dead",
          xVariable: "daysSince10Deaths"
        }
      }
    },
    {
      date: new Date("2020-09-10 0:0"),
      category: "deprecation",
      title: "Removed the ability to normalize epidemiology plots by days since 100 cases, 10 deaths, or 50 deaths",
      description: "Given that the pandemic has spanned over a year and a half, removed the option to shift the x-axis of epidemiology plots for simplicity.",
      route: {
        name: "Epidemiology"
      }
    },
    {
      date: new Date("2020-04-21 0:0"),
      category: "data",
      title: "Add testing and hospitalization data for states in the United States",
      description: 'Incorporate testing and hospitalzation data from the <a href="https://covidtracking.com/" target="_blank" rel="noreferrer">The COVID Tracking Project</a>.',
      route: {
        name: "Epidemiology",
        query: {
          location: "USA_US-MA;USA_US-NY;USA_US-KS;USA_US-NJ",
          log: "false",
          variable: "testing_positivity",
          xVariable: "date"
        }
      }
    }
  ]
};

// getters
const getters = {};

// actions
const actions = {};

// mutations
const mutations = {
  setLoading(state, isLoading) {
    state.loading = isLoading;
  },

  setReportLoading(state, isLoading) {
    state.reportloading = isLoading;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
