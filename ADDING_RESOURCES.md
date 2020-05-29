# Writing outbreak.info parsers
[outbreak.info](https://outbreak.info/resources) is a central searchable index of resources related to COVID-19 and SARS-Cov-2, including analyses, clinical trials, datasets, protocols, publications, and software. In response to the COVID-19 outbreak, there's been an explosion of information in a multitude of locations and formats.

Our goal with outbreak.info is to accumulate metadata about these resources in a central location, and to standardize them to a [consistent schema](https://discovery.biothings.io/view/outbreak/) based off of [schema.org](http://schema.org/) to promote interoperability and reuse. While the outbreak.info team has built a number of [parsers](#examples) to crawl, query, and standardize resource metadata, we'd love to have help incorporating other source of information.

We also welcome [suggestions for new sources](https://github.com/SuLab/outbreak.info-resources/issues/new?assignees=&labels=&template=suggest-a-new-resource.md&title=%5BSOURCE%5D) in addition to helping write code to add new sources to the API.

## Before you start
* Make sure the resource that you're adding allows redistribution of its metadata (check the Terms and Conditions page and/or User Agreements).

## Getting started / background
* Find your own resource to add, or choose from our [list of resources that we want to add](https://github.com/SuLab/outbreak.info-resources/labels/metadata).
* Each parser is built using the [Biothings SDK](https://docs.biothings.io/en/latest/) and imported into the outbreak.info API](http://api.outbreak.info/) using the [Biothings Hub](https://docs.biothings.io/en/latest/doc/hub_tutorial.html) written in Python.
* Review the outbreak.info schemas, which are derived from schema.org schemas: [website](https://discovery.biothings.io/view/outbreak/), [.json](https://github.com/SuLab/outbreak.info-resources/blob/master/yaml/outbreak.json), and [individual .yamls](https://github.com/SuLab/outbreak.info-resources/tree/master/yaml)


## General Process
# requirements.txt
* Create a file containing the package requirements for the parser.py file, including versions, which can be installed via `pip install -r requirements.txt`

### parser.py
1. Pull all the metadata for the COVID-19 / SARS-CoV-2 sources.
2. Ensure that the field names align with the [outbreak.info schema](https://github.com/SuLab/outbreak.info-resources/blob/master/yaml/outbreak.json).
3. Check that the types are consistent with the scheam. One way to check is using the [JSON Schema Validator](https://www.jsonschemavalidator.net/), pasting in the "$validation" object from the [schema](https://github.com/SuLab/outbreak.info-resources/blob/master/yaml/outbreak.json) and comparing to a sample record from your parser. You may have to convert stings to objects (like `author.affiliation.name`), force strings to be lists, etc.
4. Ensure as many of the [required fields](#required) and [recommended](#recommended) are present.
5. Convert all dates to YYYY-MM-DD format (e.g. 2020-05-29). If dates are approximate like "May 2020", they can remain as strings.
6. If there's extra metadata fields, you can include them if you think they're useful/important.
7. Your function should return a Python dictionary.

### upload.py
* Create a claass which loads the data.
* Create a mapping file for Elasticsearch indexing. You're highly encouraged to reuse our [Communal Elasticsearch mapping file](https://github.com/SuLab/outbreak.info-resources/blob/master/outbreak_resources_es_mapping.json) to ensure consistency with the rest of the API.
* Add metadata to indicate the source of the resource and authorship info for the parser like:
```
__metadata__ = {
    "src_meta": {
        "author":{
            "name": "Marco Cano",
            "url": "https://github.com/marcodarko"
        },
        "code":{
            "branch": "master",
            "repo": "https://github.com/marcodarko/litcovid.git"
        },
        "url": "https://www.ncbi.nlm.nih.gov/research/coronavirus/ ",
        "license": "https://www.ncbi.nlm.nih.gov/home/about/policies/"
    }
}
```

### dumper.py


## <a name="required"></a>Required fields
At a minimum, each resource should have the following information:
* `_id`: a unqiue ID for each record. These IDs are used in the url of each metadata page (example: [pdb6WVN](https://outbreak.info/resources/pdb6WVN)), so they should be as concise as possible while still being unique. It may be useful to add a short source identifier like "pdb" to ensure the ID remains unique when combined with other sources.
* `@type`: Analysis, ClinicalTrial, Dataset, Protocol, Publication, SoftwareSourceCode. If the @type is `ScholarlyArticle`, `Book`, or similar, force them to be `"@type": "Publication"`.
* `name`: title
* `url`: location of the resource
* `author` or `creator`
* `curatedBy`: an object containing the provenance of the information:
```
"curatedBy": {
  "@type": "Organization" or "WebSite",
  "name": <name of the Organization/Website where you got the information>
  "url": <link to the page on said Organization/Website which contains the info>,
  "versionDate": <if available, version date for the record from the Organization/Website>,
  "curationDate": <date when you accessed the info, in YYYY-MM-DD format
},
```



## <a name="recommended"></a>Things that would be nice, in an ideal world
A subset of general fields we think are useful. Note that there are other fields within the schema too.
* `description` or `abstract`
* dates: `dateModified`, `dateCreated`, and/or `datePublished`
* `keywords`: should be a list, not a string
* [`topicCategory`](https://outbreak.info/topics/definitions): map to our [enumerated values](https://github.com/SuLab/outbreak.info-resources/blob/master/covid_topic_categories.tsv)
* [`protocolCategory`](https://github.com/SuLab/outbreak.info-resources/blob/master/protocolCategories.tsv) and [`protocolSettings`](https://github.com/SuLab/outbreak.info-resources/blob/master/protocolSettings.tsv): map to our enumerated values
* `funding`: should ideally include `funder.name` (Organization/Person that supplies the money) and `identifier`: grant number
* `identifier`: can be a DOI or unique ID from the repository
* `doi`: should NOT include `https://doi.org/`
* `measurementTechnique` / `variableMeasured`, for Datasets
* `distribution`: list of `contentUrl`s where data can be downloaded

## Notes
* The parser, uploader, and dumper Python files for a given resource should be stored in their own repository. **Don't use hyphens in repo names.**
* Code should be submitted as an issue on [Github](https://github.com/SuLab/outbreak.info-resources/issues)

### <a name="examples"></a>Examples
- [Litcovid](https://github.com/marcodarko/litcovid)
- [Biorxiv](https://github.com/marcodarko/biorxiv)
- [Figshare](https://github.com/SuLab/covid_figshare)
- [PDB](https://github.com/SuLab/covid_pdb_datasets)
- [ClinicalTrials](https://github.com/flaneuse/clinical-trials)

## Useful links
* [outbreak.info API](http://api.outbreak.info/)
* [outbreak.info resources Github repo](https://github.com/SuLab/outbreak.info-resources)
* [Resources that we want to add](https://github.com/SuLab/outbreak.info-resources/labels/metadata)
* [Suggestion form for new resources](https://github.com/SuLab/outbreak.info-resources/issues/new?assignees=&labels=&template=suggest-a-new-resource.md&title=%5BSOURCE%5D)
* [Biothings SDK](https://docs.biothings.io/en/latest/)
* [Biothings Hub](https://docs.biothings.io/en/latest/doc/hub_tutorial.html)
* outbreak.info resource schema: [website](https://discovery.biothings.io/view/outbreak/), [.json](https://github.com/SuLab/outbreak.info-resources/blob/master/yaml/outbreak.json), and [individual .yamls](https://github.com/SuLab/outbreak.info-resources/tree/master/yaml)
* [Website to manually add single datasets](https://discovery.biothings.io/guide/outbreak/dataset)
* [Communal Elasticsearch mapping file](https://github.com/SuLab/outbreak.info-resources/blob/master/outbreak_resources_es_mapping.json) for upload.py
* [enumerated `topicCategory`](https://outbreak.info/topics/definitions), [.json](https://github.com/SuLab/outbreak.info-resources/blob/master/covid_topic_categories.tsv)
* [enumerated `protocolCategory`](https://github.com/SuLab/outbreak.info-resources/blob/master/protocolCategories.tsv) and [`protocolSettings`](https://github.com/SuLab/outbreak.info-resources/blob/master/protocolSettings.tsv)
