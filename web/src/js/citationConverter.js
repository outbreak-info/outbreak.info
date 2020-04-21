// RIS format based off of Wikipedia:
// https://en.wikipedia.org/wiki/RIS_(file_format)
// two letters, two spaces and a hyphen
export function formatRIS(data) {
  const type = getFormat(data["@type"]);

  const authors = data.author ? data.author.map(d => d.name ? `A1  - ${d.name}` : `A1  - ${d.familyName}, ${d.givenName}`).join("\n") : null;
  const abstract = data.abstract ? `AB  - ${data.abstract}` : null;
  const accession = data.pmid ? `AN  - ${data.pmid}` : null;
  const date = data.datePublished ? `DA  - ${data.datePublished}` : null;

  const doi = data.doi ? `DO  - ${data.doi}` : null;

  const issue = data.issueNumber ? `IS  - ${data.issueNumber}` : null;
  const journal = data.journalName ? `JO  - ${data.journalName}` : null;
  const journalAbbrev = data.journalAbbreviation ? `JA  - ${data.issueNumber}` : null;
  const keywords = data.keywords ? data.keywords.map(d => `KW  - ${d}`).join("\n") : null;
  const url = data.url ? `L2  - ${data.url}` : null;
  const link = data.curatedBy.url ? `UR  - ${data.curatedBy.url}` : null;
  const title = data.name ? `TI  - ${data.name}` : null;
  const volume = data.volumeNumber ? `VL  - ${data.volumeNumber}` : null;
  const accessed = data.versionDate ? `Y2  - ${data.versionDate}` : null;
  const end = `ER  - `;

  return ([type, authors, abstract, accession, date, doi, issue, journal, journalAbbrev, keywords, url, link, title, volume, accessed, end].filter(d => d).join("\n"))
}

function getFormat(type) {
  if (type == "Publication") {
    return "TY  - JOUR";
  } else if (type == "Dataset") {
    return "TY  - DATA";
  } else if (type == "Protocol") {
    return "TY  - ELEC";
  } else if (type == "Analysis") {
    return "TY  - ELEC";
  } else {
    return "TY  - GEN"
  }
}
