import { defineStore } from 'pinia';

export const pressStore = defineStore('press', {
  state: () => ({
    press: [
      {
        url: 'https://www.nytimes.com/2021/02/24/health/coronavirus-variant-nyc.html',
        img: 'nyt.svg',
        title:
          'A New Coronavirus Variant Is Spreading in New York, Researchers Report',
        publisher: 'The New York Times',
        date: 'February 2021',
        order: 24,
      },
      {
        url: 'https://www.sciencemag.org/news/2021/02/coronavirus-strain-first-identified-california-may-be-more-infectious-and-cause-more',
        img: 'science.svg',
        title:
          'California coronavirus strain may be more infectious—and lethal',
        publisher: 'Science',
        date: 'February 2021',
        order: 25,
      },
      {
        url: 'https://www.pressdemocrat.com/article/news/california-variant-of-the-coronavirus-identified-in-marin-lake-counties/',
        img: 'press-democrat.svg',
        title:
          'California variant of the coronavirus identified in Marin, Lake counties',
        publisher: 'The Press Democrat',
        date: 'February 2021',
        order: 26,
      },
      {
        url: 'https://nymag.com/intelligencer/2021/02/new-york-city-coronavirus-variant-b-1-526-what-we-know.html',
        img: 'nymag.svg',
        title:
          'Everything We Know About the Coronavirus Variant Spreading in New York City',
        publisher: 'New York',
        date: 'March 2021',
        order: 19,
      },
      {
        url: 'https://www.10news.com/news/coronavirus/scripps-research-offers-new-way-to-visualize-the-spread-of-variants',
        img: '10news.png',
        title:
          'Scripps Research offers new way to visualize the spread of variants',
        publisher: 'ABC 10News',
        date: 'February 2021',
        order: 27,
      },
      {
        url: 'https://www.theguardian.com/us-news/2021/feb/25/california-coronavirus-variant-covid-vaccine',
        img: 'guardian.svg',
        title: 'What we know about the California coronavirus variant',
        publisher: 'The Guardian',
        date: 'February 2021',
        order: 28,
      },
      {
        url: 'https://www.businessinsider.com.au/covid-variant-california-mutation-study-more-infectious-deady-2021-2',
        img: 'business-insider.svg',
        title:
          'A coronavirus variant identified in California seems more infectious and deadly, a study found, with cases thought to be doubling every 18 days - but the scale of the threat is unclear',
        publisher: 'Business Insider',
        date: 'February 2021',
        order: 29,
      },
      {
        url: 'https://www.sandiegouniontribune.com/business/tourism/story/2021-01-25/san-diego-zoo-safari-park-gorillas-close-to-full-recovery-from-covid-19',
        img: 'sd-union-tribune.svg',
        title:
          'San Diego Zoo Safari Park gorillas close to full recovery from COVID-19',
        publisher: 'The San Diego Union-Tribune',
        date: 'January 2021',
        order: 31,
      },
      {
        url: 'https://www.bloombergquint.com/quicktakes/is-news-of-u-s-virus-variants-too-much-too-soon-quicktake',
        img: 'bloomberg-quint.png',
        title: 'Is News of U.S. Virus Variants Too Much, Too Soon?',
        publisher: 'BloombergQuint',
        date: 'February 2021',
        order: 30,
      },
      {
        url: 'https://www.usnews.com/news/health-news/articles/2021-03-05/scientists-discover-mutation-of-uk-coronavirus-strain-in-oregon',
        img: 'usnews.svg',
        title:
          'Scientists Discover Mutation of U.K. Coronavirus Strain in Oregon',
        publisher: 'U.S. News & World Report',
        date: 'March 2021',
        order: 20,
      },
      {
        url: 'https://www.usatoday.com/story/news/health/2021/03/03/covid-strain-what-know-brazil-new-york-california-variants/6884525002/',
        img: 'usatoday.svg',
        title:
          'More COVID-19 variants emerge closer to home: What to know about the ones discovered in Brazil, New York, California',
        publisher: 'USA Today',
        date: 'March 2021',
        order: 21,
      },
      {
        url: 'https://www.oregonlive.com/coronavirus/2021/03/ohsu-researchers-find-uk-covid-variant-with-mutation-that-could-be-less-affected-by-vaccines.html',
        img: 'oregonian.svg',
        title:
          'OHSU researchers find UK COVID variant with mutation that could be less affected by vaccines',
        publisher: 'The Orgeonian',
        date: 'March 2021',
        order: 22,
      },
      {
        url: 'https://www.scientificamerican.com/article/the-coronavirus-variants-dont-seem-to-be-highly-variable-so-far/',
        img: 'scientific-american.svg',
        title:
          'The Coronavirus Variants Don’t Seem to Be Highly Variable So Far',
        publisher: 'Scientific American',
        date: 'March 2021',
        order: 23,
      },
      {
        url: 'https://theconversation.com/covid-19-variants-faq-how-did-the-u-k-south-africa-and-brazil-variants-emerge-are-they-more-contagious-how-does-a-virus-mutate-could-there-be-a-super-variant-that-evades-vaccines-159032',
        img: 'conversation.svg',
        title:
          'COVID-19 variants FAQ: How did the U.K., South Africa and Brazil variants emerge? Are they more contagious? How does a virus mutate? Could there be a super-variant that evades vaccines?',
        publisher: 'The Conversation',
        date: 'April 2021',
        order: 18,
      },
      {
        url: 'https://www.pbs.org/newshour/health/could-enhanced-covid-tests-help-u-s-track-virus-variants',
        img: 'pbs-newshour.svg',
        title: 'Could enhanced COVID tests help U.S. track virus variants?',
        publisher: 'PBS NewsHour',
        date: 'April 2021',
        order: 17,
      },
      {
        url: 'https://www.theatlantic.com/science/archive/2021/06/coronavirus-tests-variants/619112/',
        img: 'atlantic.svg',
        title: 'Coronavirus Variants Have Nowhere to Hide',
        publisher: 'The Atlantic',
        date: 'June 2021',
        order: 15,
      },
      {
        url: 'https://www.cbsnews.com/news/covid-19-more-deaths-2021-than-2020/',
        img: 'cbs.svg',
        title:
          'More COVID-19 deaths have already been reported in 2021 than in all of 2020',
        publisher: 'CBS News',
        date: 'June 2021',
        order: 14,
      },
      {
        url: 'https://www.statnews.com/2021/04/23/souped-up-existing-covid-tests-shortcut-tracking-variants/',
        img: 'stat.svg',
        title:
          'Could a souped-up version of existing Covid-19 tests be our shortcut to tracking variants?',
        publisher: 'Stat',
        date: 'April 2021',
        order: 16,
      },
      {
        url: 'https://www.latimes.com/california/story/2021-01-27/san-diego-zoo-gorillas-close-to-full-recovery-from-covid-19',
        img: 'latimes.svg',
        title:
          'Gorillas close to full recovery from COVID-19 at San Diego Zoo Safari Park',
        publisher: 'The Los Angeles Times',
        date: 'January 2021',
        order: 32,
      },
      {
        url: 'https://www.cnn.com/2021/06/15/health/delta-variant-of-concern-cdc-coronavirus/index.html',
        img: 'cnn.svg',
        title: "CDC now calls coronavirus Delta variant a 'variant of concern'",
        publisher: 'CNN',
        date: 'June 2021',
        order: 13,
      },
      {
        url: 'https://www.nationalgeographic.com/science/article/the-delta-variant-is-serious-heres-why-its-on-the-rise',
        img: 'nat-geo.svg',
        title: "The Delta variant is serious. Here’s why it's on the rise.",
        publisher: 'National Geographic',
        date: 'June 2021',
        order: 12,
      },
      {
        url: 'https://www.nature.com/articles/d41586-021-01696-3',
        img: 'nature.svg',
        title: 'Delta coronavirus variant: scientists brace for impact',
        publisher: 'Nature',
        date: 'June 2021',
        order: 11,
      },
      {
        url: 'https://www.bostonglobe.com/2022/05/13/metro/new-omicron-variant-ba2121-has-taken-over-massachusetts-heres-what-you-need-know/',
        img: 'bostonglobe.svg',
        title:
          'A new Omicron variant, BA.2.12.1, has taken over in Massachusetts. Here’s what you need to know.',
        publisher: 'The Boston Globe',
        date: 'May 2022',
        order: 3,
      },
      {
        url: 'https://www.newsweek.com/stealth-omicron-ba-2-covid-sub-variant-all-us-states-latest-1683097',
        img: 'newsweek.svg',
        title:
          "Stealth Omicron BA.2 Now in All U.S. States—Here's What We Know About COVID Sub-Variant",
        publisher: 'Newsweek',
        date: 'February 2022',
        order: 9,
      },
      {
        url: 'https://fortune.com/2022/08/04/ba-4-6-omicron-subvariant-covid-ba-5-booster-vaccine/',
        img: 'fortune.svg',
        title:
          'What is BA.4.6? The CDC is tracking a new COVID ‘variant of concern’ that’s overtaking earlier Omicron strains in at least 4 U.S. states',
        publisher: 'Fortune',
        date: 'August 2022',
        order: 1,
      },
      {
        url: 'https://www.nature.com/articles/d41586-022-00471-2',
        img: 'nature.svg',
        title:
          'Why does the Omicron sub-variant spread faster than the original?',
        publisher: 'Nature',
        date: 'February 2022',
        order: 5,
      },
      {
        url: 'https://www.cbsnews.com/news/covid-ba2-omicron-sub-variant-cases-cdc/',
        img: 'cbs.svg',
        title:
          'Omicron BA.2 subvariant now nearly a quarter of new COVID cases in U.S., CDC estimates',
        publisher: 'CBS',
        date: 'March 2022',
        order: 7,
      },
      {
        url: 'https://www.cnbc.com/amp/2022/03/23/covid-omicron-bapoint2-subvariant-will-soon-dominate-in-us-but-fauci-doesnt-expect-another-surge.html',
        img: 'cnbc.svg',
        title:
          "Omicron BA.2 subvariant will soon dominate in U.S., but Fauci doesn't expect another surge",
        publisher: 'CNBC',
        date: 'March 2022',
        order: 5,
      },
      {
        url: 'https://www.cnn.com/2022/01/27/health/omicron-sublineage-ba2/index.html',
        img: 'cnn.svg',
        title:
          'BA.2, the newly detected version of Omicron, is not a cause for alarm, scientists say',
        publisher: 'CNN',
        date: 'January 2022',
        order: 10,
      },
      {
        url: 'https://www.theatlantic.com/health/archive/2022/03/omicron-subvariant-new-covid-wave/627094/',
        img: 'atlantic.svg',
        title: 'Another COVID Wave Is Looming',
        publisher: 'The Atlantic',
        date: 'March 2022',
        order: 4,
      },
      {
        url: 'https://www.nytimes.com/interactive/2022/07/07/us/ba5-covid-omicron-subvariant.html/',
        img: 'nyt.svg',
        title: 'What the BA.5 Subvariant Could Mean for the United States',
        publisher: 'The New York Times',
        date: 'July 2022',
        order: 2,
      },
      {
        url: 'https://www.latimes.com/opinion/story/2022-02-21/omicron-variants-covid-pandemic-vaccines',
        img: 'latimes.svg',
        title:
          "Op-Ed: Omicron won't be the last coronavirus variant to haunt us",
        publisher: 'The Los Angeles Times',
        date: 'February 2022',
        order: 8,
      },
      {
        url: 'https://www.eurekalert.org/news-releases/980636',
        img: 'eurekalert.svg',
        title:
          'Two new papers demonstrate use of Outbreak.info as one-stop online source for COVID data',
        publisher: 'EurekAlert!',
        date: 'February 2023',
      },
      {
        url: 'https://fortune.com/well/2023/01/27/meet-orthus-ch11-new-omcrion-covid-variant-delta-mutation-deltacron-convergent-evolution/',
        img: 'fortune.svg',
        title:
          'What’s CH.1.1? Meet ‘Orthrus,’ a new wildcard Omicron strain with a concerning Delta mutation',
        publisher: 'Fortune',
        date: 'January 2023',
      },
      {
        url: 'https://www.news-medical.net/news/20220125/COVID-19-research-made-easier-with-outbreakinfo.aspx/',
        img: 'newsmedical.png',
        title: 'COVID-19 research made easier with outbreak.info',
        publisher: 'News Medical',
        date: 'January 2022',
      },
      {
        url: 'https://www.advisory.com/daily-briefing/2023/02/13/ch-variant',
        img: 'advisoryboard.svg',
        title: "Could 'orthrus' be the next dominant omicron subvariant?",
        publisher: 'Advisory Board',
        date: 'February 2023',
      },
      {
        url: 'https://www.nationalworld.com/health/omicron-xbb15-covid-variant-most-transmissible-who-3972475',
        img: 'nationalworld.png',
        title:
          'Omicron XBB.1.5: new Covid variant nicknamed ‘Kraken’ is ‘most transmissible yet’, WHO warns',
        publisher: 'National World',
        date: 'January 2023',
      },
      {
        url: 'https://www.freep.com/story/news/local/michigan/2022/03/18/coronavirus-omicron-ba-2-subvariant-detected-michigan/7093197001/',
        img: 'detroitfp.png',
        title: 'Coronavirus subvariant omicron BA.2 detected in Michigan',
        publisher: 'Detroit Free Press',
        date: 'March 2022',
      },
      {
        url: 'https://www.cnn.com/2022/06/01/health/covid-new-omicron-variants/index.html',
        img: 'cnn.svg',
        title:
          'New variants are poised to keep Covid-19 circulating at high levels throughout the summer',
        publisher: 'CNN',
        date: 'June 2022',
      },
      {
        url: 'https://www.cnn.com/2022/05/04/world/coronavirus-newsletter-intl-05-04-22/index.html',
        img: 'cnn.svg',
        title: 'The US is closely watching this Covid surge for clues',
        publisher: 'CNN',
        date: 'May 2022',
      },
      {
        url: 'https://www.firstpost.com/explainers/orthrus-ch11-omircon-variant-us-china-kraken-12089702.html',
        img: 'firstpost.png',
        title:
          'First Kraken, now Orthrus: What’s this highly transmissible COVID variant that US, China are tracking?',
        publisher: 'Firstpost',
        date: 'February 2023',
      },
      {
        url: 'https://indianexpress.com/article/world/two-omicron-sub-variants-behind-fresh-covid-surge-in-china-who-8361770/',
        img: 'indianexpress.svg',
        title:
          'Two omicron sub-variants behind fresh Covid surge in China: WHO',
        publisher: 'Indian Express',
        date: 'January 2023',
      },
      {
        url: 'https://www.financialexpress.com/lifestyle/health/explainer-india-and-omicron-bf-7-covid-risk/2927326/',
        img: 'financialexpress.svg',
        title: 'Explainer: India and Omicron BF.7 Covid risk',
        publisher: 'Financial Express',
        date: 'December 2022',
      },
      {
        url: 'https://www.forbes.com/sites/brucelee/2023/02/04/ch11-orthrus-how-concerning-is-this-new-covid-19-subvariant/?sh=1a4b52984bd6',
        img: 'forbes.png',
        title:
          'CH.1.1 ‘Orthrus’: How Concerning Is This New Covid-19 Subvariant?',
        publisher: 'Forbes',
        date: 'February 2023',
      },
    ],
  }),
  getters: {},
  actions: {},
});
