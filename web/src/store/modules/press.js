const state = {
  press: [{
      url: "https://www.nytimes.com/2021/02/24/health/coronavirus-variant-nyc.html",
      img: "nyt.svg",
      title: "A New Coronavirus Variant Is Spreading in New York, Researchers Report",
      publisher: "The New York Times",
      date: "February 2021",
      order: 3
    },
    {
      url: "https://www.sciencemag.org/news/2021/02/coronavirus-strain-first-identified-california-may-be-more-infectious-and-cause-more",
      img: "science.svg",
      title: "California coronavirus strain may be more infectious—and lethal",
      publisher: "Science",
      date: "February 2021",
      order: 1
    },
    {
      url: "https://www.pressdemocrat.com/article/news/california-variant-of-the-coronavirus-identified-in-marin-lake-counties/",
      img: "press-democrat.svg",
      title: "California variant of the coronavirus identified in Marin, Lake counties",
      publisher: "The Press Democrat",
      date: "February 2021",
      order: 0
    },
    {
      url: "https://nymag.com/intelligencer/2021/02/new-york-city-coronavirus-variant-b-1-526-what-we-know.html",
      img: "nymag.svg",
      title: "Everything We Know About the Coronavirus Variant Spreading in New York City",
      publisher: "New York",
      date: "March 2021",
      order: 9
    },
    {
      url: "https://www.10news.com/news/coronavirus/scripps-research-offers-new-way-to-visualize-the-spread-of-variants",
      img: "10news.png",
      title: "Scripps Research offers new way to visualize the spread of variants",
      publisher: "ABC 10News",
      date: "February 2021",
      order: 0
    },
    {
      url: "https://www.theguardian.com/us-news/2021/feb/25/california-coronavirus-variant-covid-vaccine",
      img: "guardian.svg",
      title: "What we know about the California coronavirus variant",
      publisher: "The Guardian",
      date: "February 2021",
      order: 11
    },
    {
      url: "https://www.businessinsider.com.au/covid-variant-california-mutation-study-more-infectious-deady-2021-2",
      img: "business-insider.svg",
      title: "A coronavirus variant identified in California seems more infectious and deadly, a study found, with cases thought to be doubling every 18 days - but the scale of the threat is unclear",
      publisher: "Business Insider",
      date: "February 2021",
      order: 0
    },
    {
      url: "https://www.sandiegouniontribune.com/business/tourism/story/2021-01-25/san-diego-zoo-safari-park-gorillas-close-to-full-recovery-from-covid-19",
      img: "sd-union-tribune.svg",
      title: "San Diego Zoo Safari Park gorillas close to full recovery from COVID-19",
      publisher: "The San Diego Union-Tribune",
      date: "January 2021",
      order: 10
    },
    {
      url: "https://www.bloombergquint.com/quicktakes/is-news-of-u-s-virus-variants-too-much-too-soon-quicktake",
      img: "bloomberg-quint.png",
      title: "Is News of U.S. Virus Variants Too Much, Too Soon?",
      publisher: "BloombergQuint",
      date: "February 2021",
      order: 0
    },
    {
      url: "https://www.usnews.com/news/health-news/articles/2021-03-05/scientists-discover-mutation-of-uk-coronavirus-strain-in-oregon",
      img: "usnews.svg",
      title: "Scientists Discover Mutation of U.K. Coronavirus Strain in Oregon",
      publisher: "U.S. News & World Report",
      date: "March 2021",
      order: 15
    },
    {
      url: "https://www.usatoday.com/story/news/health/2021/03/03/covid-strain-what-know-brazil-new-york-california-variants/6884525002/",
      img: "usatoday.svg",
      title: "More COVID-19 variants emerge closer to home: What to know about the ones discovered in Brazil, New York, California",
      publisher: "USA Today",
      date: "March 2021",
      order: 0
    },
    {
      url: "https://www.oregonlive.com/coronavirus/2021/03/ohsu-researchers-find-uk-covid-variant-with-mutation-that-could-be-less-affected-by-vaccines.html",
      img: "oregonian.svg",
      title: "OHSU researchers find UK COVID variant with mutation that could be less affected by vaccines",
      publisher: "The Orgeonian",
      date: "March 2021",
      order: 14
    },
    {
      url: "https://www.scientificamerican.com/article/the-coronavirus-variants-dont-seem-to-be-highly-variable-so-far/",
      img: "scientific-american.svg",
      title: "The Coronavirus Variants Don’t Seem to Be Highly Variable So Far",
      publisher: "Scientific American",
      date: "March 2021",
      order: 2
    },
    {
      url: "https://theconversation.com/covid-19-variants-faq-how-did-the-u-k-south-africa-and-brazil-variants-emerge-are-they-more-contagious-how-does-a-virus-mutate-could-there-be-a-super-variant-that-evades-vaccines-159032",
      img: "conversation.svg",
      title: "COVID-19 variants FAQ: How did the U.K., South Africa and Brazil variants emerge? Are they more contagious? How does a virus mutate? Could there be a super-variant that evades vaccines?",
      publisher: "The Conversation",
      date: "April 2021",
      order: 0
    },
    {
      url: "https://www.pbs.org/newshour/health/could-enhanced-covid-tests-help-u-s-track-virus-variants",
      img: "pbs-newshour.svg",
      title: "Could enhanced COVID tests help U.S. track virus variants?",
      publisher: "PBS NewsHour",
      date: "April 2021",
      order: 12
    },
    {
      url: "https://www.theatlantic.com/science/archive/2021/06/coronavirus-tests-variants/619112/",
      img: "atlantic.svg",
      title: "Coronavirus Variants Have Nowhere to Hide",
      publisher: "The Atlantic",
      date: "June 2021",
      order: 4
    },
    {
      url: "https://www.cbsnews.com/news/covid-19-more-deaths-2021-than-2020/",
      img: "cbs.svg",
      title: "More COVID-19 deaths have already been reported in 2021 than in all of 2020",
      publisher: "CBS News",
      date: "June 2021",
      order: 13
    },
    {
      url: "https://www.statnews.com/2021/04/23/souped-up-existing-covid-tests-shortcut-tracking-variants/",
      img: "stat.svg",
      title: "Could a souped-up version of existing Covid-19 tests be our shortcut to tracking variants?",
      publisher: "Stat",
      date: "April 2021",
      order: 5
    },
    {
      url: "https://www.latimes.com/california/story/2021-01-27/san-diego-zoo-gorillas-close-to-full-recovery-from-covid-19",
      img: "latimes.svg",
      title: "Gorillas close to full recovery from COVID-19 at San Diego Zoo Safari Park",
      publisher: "The Los Angeles Times",
      date: "January 2021",
      order: 7
    },
    {
      url: "https://www.cnn.com/2021/06/15/health/delta-variant-of-concern-cdc-coronavirus/index.html",
      img: "cnn.svg",
      title: "CDC now calls coronavirus Delta variant a 'variant of concern'",
      publisher: "CNN",
      date: "June 2021",
      order: 8
    },
    {
      url: "https://www.nationalgeographic.com/science/article/the-delta-variant-is-serious-heres-why-its-on-the-rise",
      img: "nat-geo.svg",
      title: "The Delta variant is serious. Here’s why it's on the rise.",
      publisher: "National Geographic",
      date: "June 2021",
      order: 6
    }
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
