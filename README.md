# outbreak.info
During outbreaks of emerging diseases such as COVID-19, efficiently collecting, sharing, and integrating data is critical to scientific research.

outbreak.info is a project from the [Su lab](http://sulab.org/) at Scripps Research to aggregate all this information into a single location.

*Disclaimer: This project is a work-in progress. Please submit an [issue](https://github.com/SuLab/outbreak.info/issues) if you notice any bugs or want to suggest features.* 

# Data sources
- [Johns Hopkins University Center for Systems Science and Engineering](https://github.com/CSSEGISandData/COVID-19)

# Related projects
- [Outbreak.api](https://github.com/biothings/outbreak.api) -- repo for the back-end API
- [outbreak.info-resources](https://github.com/SuLab/outbreak.info-resources) -- data schemas and harvesters for COVID-19 resources

# Deploying a local version of the site
1. Clone the repository
2. Make sure you have [node & npm] (https://nodejs.org/en/) and [Vue & Vue CLI](https://cli.vuejs.org/guide/installation.html) installed.
3. In terminal, navigate to the `src` directory of this repository.
4. Install **node_modules** by running `npm install`.
5. Launch a local server with hot-reloads by running `npm run serve`.
