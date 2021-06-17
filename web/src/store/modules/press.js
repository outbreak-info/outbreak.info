const state = {
press: [
  {url: "https://www.nytimes.com/2021/02/24/health/coronavirus-variant-nyc.html", img:"nyt.svg", order: 0},
  "https://www.sciencemag.org/news/2021/02/coronavirus-strain-first-identified-california-may-be-more-infectious-and-cause-more",
  "https://www.pressdemocrat.com/article/news/california-variant-of-the-coronavirus-identified-in-marin-lake-counties/",
  "https://nymag.com/intelligencer/2021/02/new-york-city-coronavirus-variant-b-1-526-what-we-know.html",
  "https://www.10news.com/news/coronavirus/scripps-research-offers-new-way-to-visualize-the-spread-of-variants",
  "https://www.theguardian.com/us-news/2021/feb/25/california-coronavirus-variant-covid-vaccine",
  "https://www.yahoo.com/lifestyle/know-california-homegrown-coronavirus-variant-232100057.html",
  "https://www.geekwire.com/2021/south-african-covid-19-variant-found-washington-state/",
  "https://www.eurekalert.org/pub_releases/2020-06/sri-dsi061120.php",
  "https://www.businessinsider.com.au/covid-variant-california-mutation-study-more-infectious-deady-2021-2",
  "https://www.sandiegouniontribune.com/business/tourism/story/2021-01-25/san-diego-zoo-safari-park-gorillas-close-to-full-recovery-from-covid-19",
  "https://www.bloombergquint.com/quicktakes/is-news-of-u-s-virus-variants-too-much-too-soon-quicktake",
  "https://financeusamagazine.com/2021/02/new-york-city-coronavirus-variant-b-1-526-what-we-know/",
  "https://www.usnews.com/news/health-news/articles/2021-03-05/scientists-discover-mutation-of-uk-coronavirus-strain-in-oregon",
  "https://www-nytimes-com.cdn.ampproject.org/c/s/www.nytimes.com/2021/03/05/health/virus-oregon-variant.amp.html",
  "https://www.usatoday.com/story/news/health/2021/03/03/covid-strain-what-know-brazil-new-york-california-variants/6884525002/",
  "https://www.oregonlive.com/coronavirus/2021/03/ohsu-researchers-find-uk-covid-variant-with-mutation-that-could-be-less-affected-by-vaccines.html",
  "https://www.poder360.com.br/coronavirus/pesquisadores-identificam-nova-variante-do-coronavirus-em-nova-york/",
  "https://www.ilsussidiario.net/news/nuovo-dpcm-e-piano-draghi-100milioni-di-dosi-italiane-per-fermare-le-varianti/2136225/",
  "https://www.republicworld.com/world-news/rest-of-the-world-news/scientists-in-us-oregon-find-b-dot-11-dot-7-variant-with-e484k-mutation-also-found-in-india.html",
  "https://www.hindustantimes.com/india-news/variant-of-concern-uk-raises-vigil-on-india-linked-mutations-101620435497724-amp.html",
  "https://www.dhakatribune.com/health/coronavirus/2021/04/23/bangladesh-in-dark-about-two-indian-coronavirus-variants",
  "https://www.tribuneindia.com/news/nation/second-coronavirus-lineage-found-in-india-with-immune-escape-mutation-scientists-242691",
  "https://www.ndtv.com/india-news/coronavirus-vaccine-covaxin-double-mutant-strain-research-body-vs-bharat-biotech-on-covaxin-against-double-mutant-strain-2418785",
  "https://www.newsclick.in/Explainer-COVID-19-Mutant-Strains-Behind-Current-Second-Wave",
  "https://www.indiatoday.in/coronavirus-outbreak/story/coronavirus-india-new-immune-escape-covid-variant-found-west-bengal-1793286-2021-04-21",
  "https://www.wtsp.com/article/news/health/coronavirus/double-mutant-covid-19-variant-first-discovered-in-india-now-found-in-the-us/77-20358356-f150-4bae-9417-aa2798f1f47d",
  "https://theprint.in/health/india-has-a-double-mutant-covid-virus-variant-heres-everything-you-need-to-know-about-it/641257/",
  "https://labmedicineblog.com/tag/variants/",
  "https://www.scientificamerican.com/article/the-coronavirus-variants-dont-seem-to-be-highly-variable-so-far/",
  "https://nymag.com/intelligencer/2021/03/new-york-city-coronavirus-variant-b-1-526-what-we-know.html",
  "https://www.lemonde.fr/planete/article/2021/04/19/b-1-617-le-double-mutant-indien-qui-commence-a-inquieter-les-scientifiques_6077245_3244.html",
  "https://theconversation.com/covid-19-variants-faq-how-did-the-u-k-south-africa-and-brazil-variants-emerge-are-they-more-contagious-how-does-a-virus-mutate-could-there-be-a-super-variant-that-evades-vaccines-159032",
  "https://www.corriere.it/esteri/21_maggio_01/rebus-india-crollo-contagi-passa-tremila-morti-giorno-8bf2c06c-aa67-11eb-8d36-3c9924df67f4.shtml",
  "https://www.lexpress.fr/actualite/monde/avec-92-variants-detectes-la-situation-bresilienne-doit-elle-alerter-le-monde-entier_2148594.html",
  "https://www.pbs.org/newshour/health/could-enhanced-covid-tests-help-u-s-track-virus-variants",
  "https://actualidad.rt.com/actualidad/385537-eeuu-oregon-nueva-mutacion-coronavirus",
  "https://news.yahoo.com/coronavirus-variants-partly-blame-surging-125514632.html",
  "https://jyllands-posten.dk/international/asien/ECE12909017/b1617-i-indien-er-en-dobbelt-mutation-ved-at-vinde-over-alle-andre-varianter/",
  "https://www.bfmtv.com/sante/tout-comprendre-qu-est-ce-que-le-variant-indien-ce-double-mutant-qui-inquiete_AN-202104200211.html",
  "https://www.elfinanciero.com.mx/salud/2021/04/18/la-india-tiene-una-variante-de-covid-con-doble-mutacion-que-tanto-debe-preocuparnos/",
  "https://medicalxpress.com/news/2021-04-covid-variants-faq-strains-sars-cov-.html",
  "https://www.allodocteurs.fr/maladies/covid/covid-cinq-choses-a-savoir-sur-le-variant-indien_31095.html",
  "https://www.10news.com/news/coronavirus/double-mutant-covid-variant-emerges-in-the-u-s-heres-what-that-means",
  "https://www.businessinsider.in/science/news/indias-harrowing-coronavirus-surge-is-a-global-problem-new-variants-and-slow-vaccine-rollouts-are-a-threat-to-countries-everywhere/articleshow/82223055.cms",
  "https://www.pennmedicine.org/news/news-releases/2021/march/penn-medicine-finds-viral-variants-of-concern-in-over-a-third-of-latest-covid19-samples",
  "https://penntoday.upenn.edu/news/penn-medicine-finds-viral-variants-concern-over-third-latest-covid-19-samples-philadelphia",
  "https://penntoday.upenn.edu/news/penn-medicine-finds-viral-variants-concern-over-third-latest-covid-19-samples-philadelphia",
  "https://penntoday.upenn.edu/news/penn-medicine-finds-viral-variants-concern-over-third-latest-covid-19-samples-philadelphia",
  "https://www.nextbigfuture.com/2021/03/world-covid-mostly-uk-variant-in-march.html",
  "https://www.derstandard.at/consent/tcf/story/2000125963316/nee-variante-b1-617-infektionstsunami-ueberrollt-indien",
  "https://nyheder.tv2.dk/samfund/2021-04-19-indisk-mutation-fundet-i-danmark-derfor-bliver-vi-ved-med-at-finde-nye-varianter"

],
publications: [
    "https://doi.org/10.1101/2020.07.15.20154823",
    "https://doi.org/10.1186/s12915-020-00940-y"
  ]
}

// getters
const getters = {};

// actions
const actions = {};

// mutations
const mutations = {};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
