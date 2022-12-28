import { formatRIS } from '@/js/citationConverter';

describe('CitationConverter test', () => {
  const mockData = {
    '@context': {
      outbreak: 'https://discovery.biothings.io/view/outbreak/',
      schema: 'http://schema.org/',
    },
    '@type': 'Publication',
    _id: 'pmid35460221',
    author: [
      {
        '@type': 'outbreak:Person',
        familyName: 'Sookaromdee',
        givenName: 'Pathum',
        name: 'Pathum Sookaromdee',
      },
      {
        '@type': 'outbreak:Person',
        familyName: 'Wiwanitkit',
        givenName: 'Viroj',
        name: 'Viroj Wiwanitkit',
      },
    ],
    curatedBy: {
      '@type': 'schema:WebSite',
      curationDate: '2022-08-06',
      name: 'litcovid',
      url: 'https://www.ncbi.nlm.nih.gov/research/coronavirus/publication/35460221',
    },
    date: '2022-08-05',
    dateCompleted: '2022-08-05',
    dateCreated: '2022-04-24',
    dateModified: '2022-08-05',
    datePublished: '2022-08-04',
    doi: '10.1093/ajcp/aqac050',
    identifier: '35460221',
    issueNumber: '1943-7722',
    journalAbbreviation: 'Am J Clin Pathol',
    journalName: 'American journal of clinical pathology',
    name: 'Lymphohistiocytic Myocarditis and Moderna mRNA-1273 Vaccine.',
    pmid: '35460221',
    publicationType: ['Journal Article'],
    url: 'https://www.doi.org/10.1093/ajcp/aqac050',
    volumeNumber: '158',
  };
  const resultMock =
    'TY  - JOUR\n' +
    'A1  - Pathum Sookaromdee\n' +
    'A1  - Viroj Wiwanitkit\n' +
    'AN  - 35460221\n' +
    'DA  - 2022-08-04\n' +
    'DO  - 10.1093/ajcp/aqac050\n' +
    'IS  - 1943-7722\n' +
    'JO  - American journal of clinical pathology\n' +
    'JA  - 1943-7722\n' +
    'L2  - https://www.doi.org/10.1093/ajcp/aqac050\n' +
    'UR  - https://www.ncbi.nlm.nih.gov/research/coronavirus/publication/35460221\n' +
    'TI  - Lymphohistiocytic Myocarditis and Moderna mRNA-1273 Vaccine.\n' +
    'VL  - 158\n' +
    'ER  - ';

  it('should return proper data with converted format with give data', () => {
    const result = formatRIS(mockData);
    expect(result).toEqual(resultMock);
  });
});
