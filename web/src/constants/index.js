export const resources = [
  {
    category: 'Publications',
    id: 'Publication',
    sources: [
      {
        id: 'litcovid',
        api_id: 'litcovid',
        name: 'LitCovid / PubMed',
        query: 'litcovid',
        img: 'litcovid_pubmed.png',
        img_lg: 'litcovid_pubmed_lg.png',
        url: 'https://www.ncbi.nlm.nih.gov/research/coronavirus/',
        description:
          'LitCovid is a curated literature hub for tracking up-to-date scientific information about the 2019 novel Coronavirus. It is the most comprehensive resource on the subject, providing a central access to 4929 (and growing) relevant articles in PubMed. The articles are updated daily and are further categorized by different research topics and geographic locations for improved access. You can read more at <a href="https://www.nature.com/articles/d41586-020-00694-1" target="_blank" rel="noreferrer">Chen et al. Nature (2020)</a> and download their data <a href="https://www.ncbi.nlm.nih.gov/research/coronavirus/#data-download" rel="noreferrer" target="_blank">here</a>.',
        license: {
          url: 'https://www.ncbi.nlm.nih.gov/home/about/policies/',
        },
        citation:
          'Chen Q, Allot A, Lu Z. <i>Keep up with the latest coronavirus research</i>. Nature. 2020;579(7798):193.',
      },
      {
        id: 'biorxiv',
        api_id: 'biorxiv',
        query: 'bioRxiv',
        name: 'bioRxiv',
        img: 'biorxiv.png',
        url: 'https://connect.biorxiv.org/relate/content/181',
        description:
          'bioRxiv (pronounced "bio-archive") is a free online archive and distribution service for unpublished preprints in the life sciences. It is operated by Cold Spring Harbor Laboratory, a not-for-profit research and educational institution. By posting preprints on bioRxiv, authors are able to make their findings immediately available to the scientific community and receive feedback on draft manuscripts before they are submitted to journals.',
        license: {
          url: 'https://www.biorxiv.org/about-biorxiv',
        },
        citation:
          '<a href="https://www.biorxiv.org/about-biorxiv target="_blank"">How to cite a bioRxiv preprint</a>',
      },
      {
        id: 'medrxiv',
        api_id: 'biorxiv',
        query: 'medRxiv',
        name: 'medRxiv',
        img: 'medrxiv.png',
        url: 'https://connect.biorxiv.org/relate/content/181',
        description:
          'medRxiv (pronounced "med-archive") is a free online archive and distribution server for complete but unpublished manuscripts (preprints) in the medical, clinical, and related health sciences. Preprints are preliminary reports of work that have not been certified by peer review. They should not be relied on to guide clinical practice or health-related behavior and should not be reported in news media as established information.',
        license: {
          url: 'https://www.medrxiv.org/about/FAQ',
        },
        citation:
          '<a href="https://www.medrxiv.org/about/FAQ" target="_blank">How to cite a medRxiv preprint</a>',
      },
      {
        id: 'imperial',
        api_id: 'covid_imperial_college',
        query: 'MRC Centre for Global Infectious Disease Analysis',
        name: 'MRC Centre for Global Infectious Disease Analysis',
        img: 'imperial.png',
        url: 'https://www.imperial.ac.uk/mrc-global-infectious-disease-analysis/covid-19/',
        description:
          'Since the emergence of the new coronavirus (COVID-19) in December 2019, we have adopted a policy of immediately sharing research findings on the developing pandemic. These pages provide all output from the Imperial College COVID-19 Response Team, including publicly published online reports, planning tools, scientific resources, publications and video updates.',
        license: {
          url: 'https://www.imperial.ac.uk/research-and-innovation/support-for-staff/scholarly-communication/open-access/oa-policy/',
        },
        citation:
          'Imperial College London. <i>MRC Centre for Global Infectious Disease Analysis COVID-19</i>. Available online: <a href="https://www.imperial.ac.uk/mrc-global-infectious-disease-analysis/covid-19/" target="_blank">https://www.imperial.ac.uk/mrc-global-infectious-disease-analysis/covid-19/</a> (2020)',
      },
      {
        id: 'covid19LST',
        api_id: 'covid19_LST_reports',
        query: 'COVID-19 Literature Surveillance Team',
        name: 'COVID-19 Literature Surveillance Team',
        img: 'covid19_lst.png',
        url: 'https://web.archive.org/web/20211020140102/https://www.covid19lst.org/copy-of-about',
        description:
          "<i>[inactive]</i> COVID-19 LST was a non-profit composed of medical students, PhDs, physicians and other passionate individuals. They kept up with the latest research on COVID-19/SARS-CoV-2, found the newest articles, read them, graded their level of evidence, and brought you the bottom line. Their goal was to empower you to take the best care of yourself and those in your care. The COVID-19 LST Project was completed on <a href='https://web.archive.org/web/20211020084652/https://www.covid19lst.org/post/new-projects-ahead-for-covid-19-lst' target='_blank'>3 July 2021</a>.",
        license: {
          url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
          name: 'CC BY-NC-SA 4.0',
        },
        citation:
          'COVID-19 Literature Surveillance Team. <i>Daily COVID-19 LST Reports</i>. Available online: <a href="https://web.archive.org/web/20211020140102/https://www.covid19lst.org" target="_blank">https://www.covid19lst.org/reports</a> (2020)',
      },
    ],
  },
  {
    category: 'Clinical Trials',
    id: 'ClinicalTrial',
    sources: [
      {
        id: 'nct',
        api_id: 'clinical_trials',
        name: 'ClinicalTrials.gov',
        query: 'ClinicalTrials.gov',
        img: 'clinicaltrialsgov.png',
        url: 'https://clinicaltrials.gov/ct2/results?cond=COVID-19',
        description:
          'ClinicalTrials.gov is a database of privately and publicly funded clinical studies conducted around the world. Some modifications were made to the data to standardize how metadata are reported and to align to our <a href=""',
        license: {
          url: 'https://clinicaltrials.gov/ct2/about-site/terms-conditions#Use',
        },
        citation:
          'ClinicalTrials.gov. <i>Clinical studies related to the coronavirus disease (COVID-19)</i>. Available online: <a href="https://clinicaltrials.gov/ct2/results?cond=COVID-19" target="_blank">https://clinicaltrials.gov/ct2/results?cond=COVID-19</a> (2020)',
      },
      {
        id: 'who',
        api_id: 'covid_who_clinical_trials',
        name: 'WHO International Clinical Trials Registry Platform',
        query: 'WHO International Clinical Trials Registry Platform',
        img: 'who.svg',
        url: 'https://www.who.int/ictrp/en/',
        description:
          'The main aim of the WHO ICTRP is to facilitate the prospective registration of the WHO Trial Registration Data Set on all clinical trials, and the public accessibility of that information. Clinical trials are sourced from the Australian New Zealand Clinical Trials Registry (ANZCTR), Brazilian Clinical Trials Registry (ReBec), Chinese Clinical Trial Register (ChiCTR), Clinical Research Information Service (CRiS), Republic of Korea, Clinical Trials Registry - India (CTRI), Cuban Public Registry of Clinical Trials (RPCEC), EU Clinical Trials Register (EU-CTR), German Clinical Trials Register (DRKS), Iranian Registry of Clinical Trials (IRCT), ISRCTN, Japan Primary Registries Network (JPRN), Netherlands National Trial Register (NTR), Pan African Clinical Trial Registry (PACTR), Peruvian Clinical Trials Registry (REPEC), Sri Lanka Clinical Trials Registry (SLCTR), and Thai Clinical Trials Register (TCTR). Note that clinical trials also listed in ClinicalTrials.gov have been excluded from this source.',
        license: {
          url: 'https://www.who.int/about/who-we-are/publishing-policies/copyright',
        },
        citation:
          '<a href="https://www.who.int/ictrp/How_to_cite.pdf?ua=1" target="_blank">WHO Citation Policy</a>',
      },
    ],
  },
  {
    category: 'Datasets',
    id: 'Dataset',
    sources: [
      {
        id: 'dde',
        api_id: 'dde',
        name: 'Data Discovery Engine',
        query: 'Data Discovery Engine',
        img: 'dde.svg',
        img_lg: 'dde_full.svg',
        url: 'https://discovery.biothings.io/dataset',
        description:
          'The CTSA Data Discovery Engine is a website that provides guidance for reserachers on how to make their data discoverable and reusable, and bring the practical benefits of data sharing to researcher’s own research projects, as well as the research community as a whole.',
        license: {
          url: 'https://discovery.biothings.io/about',
          name: 'CC-BY',
        },
        citation:
          'Data Discovery Engine. <i>Data Discovery Engine Data Registry</i>. Available online: <a href="https://discovery.biothings.io/dataset" target="_blank">https://discovery.biothings.io/dataset</a> (2020)',
      },
      {
        id: 'figshare',
        api_id: 'covid_figshare',
        name: 'Figshare',
        query: 'Figshare',
        img: 'figshare_icon.svg',
        img_lg: 'figshare.svg',
        url: 'https://covid19.figshare.com/',
        description:
          'figshare is a repository where users can make all of their research outputs available in a citable, shareable and discoverable manner.',
        license: {
          url: 'https://knowledge.figshare.com/articles/item/data-access-policy',
        },
        citation:
          'Figshare. <i>COVID-19 Open Research Data</i>. Available online: <a href="https://covid19.figshare.com/" target="_blank">https://covid19.figshare.com/</a> (2020)',
      },
      {
        id: 'dataverse',
        api_id: 'dataverses',
        name: 'Harvard Dataverse',
        query: 'Harvard Dataverse',
        img: 'dataverse_icon.png',
        img_lg: 'dataverse.png',
        url: 'https://dataverse.harvard.edu/dataverse/covid19',
        license: {
          url: 'https://dataverse.org/best-practices/harvard-dataverse-general-terms-use',
        },
        citation:
          '<a href="https://dataverse.org/best-practices/data-citation target="_blank"">Dataverse Citation Policies</a>',
        description:
          'This is a general collection of COVID-19 data deposited in the Harvard Dataverse repository. The list in this collection is maintained by the Harvard Dataverse data curation team (IQSS and Harvard Library). Researchers who deposit their related data into Harvard Dataverse will have their data linked to this collection, to increase discoverability of their data.',
      },
      {
        id: 'immport',
        api_id: 'immport',
        name: 'ImmPort',
        query: 'ImmPort',
        img: 'immport.png',
        img_lg: 'immport_lg.png',
        url: 'https://www.immport.org/shared/search?filters=study_2_condition_or_disease.condition_preferred:COVID-19%20-%20DOID:0080600&utm_source=COVID-19&utm_medium=banner&utm_campaign=COVID-19',
        license: {
          url: 'https://www.immport.org/agreement',
        },
        citation:
          '<a href="https://www.immport.org/cite target="_blank"">Citing ImmPort</a>',
        description:
          'The Immunology Database and Analysis Portal (ImmPort) provides an open access platform for research data sharing, ontaining experimental data and metadata describing the purpose of the study and the methods of data generation.  To better understand the COVID-19 pandemic, ImmPort presents an opportunity to leverage legacy studies on infectious diseases, including Influenza (over 100 studies) and other respiratory-like illnesses from diverse cohorts (e.g., age, race, gender) sourced from NIAID-sponsored programs and beyond.',
      },
      {
        id: 'pdb',
        api_id: 'covid_pdb_datasets',
        name: 'The Protein Data Bank',
        query: 'The Protein Data Bank',
        img: 'pdb.png',
        url: 'https://www.rcsb.org/news?year=2020&article=5e74d55d2d410731e9944f52&feature=true',
        description:
          'Since 1971, the Protein Data Bank archive (PDB) has served as the single repository of information about the 3D structures of proteins, nucleic acids, and complex assemblies.',
        license: {
          url: 'https://www.rcsb.org/pages/usage-policy',
          name: 'CC0',
        },
        citation:
          '<a href="https://www.rcsb.org/pages/policies#References target="_blank"">PDB Citation Policies</a>',
      },
      {
        id: 'zenodo',
        api_id: 'zenodo',
        name: 'Zenodo',
        query: 'Zenodo',
        img: 'zenodo.svg',
        url: 'https://zenodo.org/communities/covid-19/',
        description:
          'This community collects research outputs that may be relevant to the Coronavirus Disease (COVID-19) or the SARS-CoV-2. Scientists are encouraged to upload their outcome in this collection to facilitate sharing and discovery of information. Although Open Access articles and datasets are recommended, also closed and restricted access material are accepted. All types of research outputs can be included in this Community (Publication, Poster, Presentation, Dataset, Image, Video/Audio, Software, Lesson, Other).',
        license: {
          url: 'https://about.zenodo.org/policies/',
        },
        citation:
          'Zenodo. <i>Coronavirus Disease Research Community - COVID-19</i>. Available online: <a href="https://zenodo.org/communities/covid-19/" target="_blank">https://zenodo.org/communities/covid-19/</a> (2020)',
      },
    ],
  },
  {
    category: 'Computational Tools',
    id: 'Computational Tools',
    sources: [
      {
        id: 'biotools',
        api_id: 'biotools',
        name: 'bio.tools',
        query: 'Biotools',
        img: 'biotools.png',
        url: 'https://covid-19.bio.tools',
        description:
          'The use of bioinformatics is ubiquitous within the life sciences. In bio.tools, we are striving to provide a comprehensive registry of software and databases, facilitating researchers from across the spectrum of biological and biomedical science to find, understand, utilise and cite the resources they need in their day-to-day work. Everything from simple command-line tools and online services, through to databases and complex, multi-functional analysis workflows is included. Resources are described in a rigorous semantics and syntax, providing end-users with the convenience of concise, consistent and therefore comparable information.',
        license: {
          name: 'CC-BY 4.0',
          url: 'https://biotools.readthedocs.io/en/latest/license.html',
        },
        citation:
          'Ison, J. et al. (2015). Tools and data services registry: a community effort to document bioinformatics resources. <i>Nucleic Acids Research</i>. doi: <a href="https://doi.org/10.1093/nar/gkv1116" target="_blank">10.1093/nar/gkv1116</a>',
      },
      {
        id: 'dockstore',
        api_id: 'dockstore',
        name: 'Dockstore',
        query: 'Dockstore',
        img: 'dockstore.svg',
        url: 'https://dockstore.org/search?categories.name.keyword=COVID-19&entryType=workflows&searchMode=files',
        description:
          'Dockstore’s mission is to enable researchers and developers to share and reuse analytical workflows and tools in a way that makes them machine readable and runnable in a variety of environments.',
        license: {
          url: 'https://zenodo.org/record/7072576',
        },
        citation:
          'Denis Yuen, Louise Cabansay, Andrew Duncan, Gary Luu, Gregory Hogue, Charles Overbeck, Natalie Perez, Walt Shands, David Steinberg, Chaz Reid, Nneka Olunwa, Richard Hansen, Elizabeth Sheets, Ash O’Farrell, Kim Cullion, Brian D O’Connor, Benedict Paten, Lincoln Stein, The Dockstore: enhancing a community platform for sharing reproducible and accessible computational protocols, <i>Nucleic Acids Research<i>, Volume 49, Issue W1, 2 July 2021, Pages W624–W632, <a href="https://doi.org/10.1093/nar/gkab346" target="_blank">https://doi.org/10.1093/nar/gkab346</a>',
      },
      {
        id: 'zenodo',
        api_id: 'zenodo',
        name: 'Zenodo',
        query: 'Zenodo',
        img: 'zenodo.svg',
        url: 'https://zenodo.org/communities/covid-19/',
        description:
          'This community collects research outputs that may be relevant to the Coronavirus Disease (COVID-19) or the SARS-CoV-2. Scientists are encouraged to upload their outcome in this collection to facilitate sharing and discovery of information. Although Open Access articles and datasets are recommended, also closed and restricted access material are accepted. All types of research outputs can be included in this Community (Publication, Poster, Presentation, Dataset, Image, Video/Audio, Software, Lesson, Other).',
        license: {
          url: 'https://about.zenodo.org/policies/',
        },
        citation:
          'Zenodo. <i>Coronavirus Disease Research Community - COVID-19</i>. Available online: <a href="https://zenodo.org/communities/covid-19/" target="_blank">https://zenodo.org/communities/covid-19/</a> (2020)',
      },
    ],
  },
  {
    category: 'Protocols',
    id: 'Protocol',
    sources: [
      {
        id: 'protocolsio',
        api_id: 'protocolsio',
        name: 'protocols.io',
        query: 'Protocols.io',
        img: 'protocolsio.png',
        img_lg: 'protocolsio_lg.png',
        url: 'https://www.protocols.io/groups/coronavirus-method-development-community',
        description:
          'protocols.io is a platform for sharing for science methods, assays, clinical trials, operational procedures and checklists.',
        license: {
          name: 'CC BY',
          url: 'https://www.protocols.io/terms#tos1',
        },
        citation:
          'protocols.io. <i>Coronavirus Method Development Community</i>. Available online: <a href="https://www.protocols.io/groups/coronavirus-method-development-community" target="_blank">https://www.protocols.io/groups/coronavirus-method-development-community</a> (2020)',
      },
    ],
  },
];
