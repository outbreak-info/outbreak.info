# outbreak.info
During outbreaks of emerging diseases such as COVID-19, efficiently collecting, sharing, and integrating data is critical to scientific research.

outbreak.info is a standardized, searchable platform to discover and explore COVID-19 and SARS-CoV-2 data from the [Center for Viral Systems Biology](http://cvisb.org/) at Scripps Research. It contains three parts: a standardized searchable database of COVID-19 research; customizable real-time surveillance reports on SARS-CoV-2 variants and mutations; and an explorable interface to examine changes in epidemiological data.

*Disclaimer: This project is a work-in progress. Please submit an [issue](https://github.com/SuLab/outbreak.info/issues) if you notice any bugs or want to suggest features.*

# Data sources
- See [outbreak.info sources](https://outbreak.info/sources)

# Related projects
- [Outbreak.api](https://github.com/biothings/outbreak.api) -- repo for the back-end API
- [outbreak.info-resources](https://github.com/SuLab/outbreak.info-resources) -- data schemas and harvesters for COVID-19 resources

# Deploying a local version of the site
1. Clone the repository
2. Make sure you have [node & npm] (https://nodejs.org/en/) and [Vue & Vue CLI](https://cli.vuejs.org/guide/installation.html) installed.
3. In terminal, navigate to the `src` directory of this repository.
4. Install **node_modules** by running `npm install`.
5. Launch a local server with hot-reloads by running `npm run serve`.
