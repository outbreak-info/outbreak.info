# Adding a resource to outbreak.info
[outbreak.info](https://outbreak.info/resources) is a central searchable index of resources related to COVID-19 and SARS-Cov-2, including analyses, clinical trials, datasets, protocols, publications, and software. In response to the COVID-19 outbreak, there's been an explosion of information in a multitude of locations and formats.

Our goal with outbreak.info is to accumulate metadata about these resources in a central location, and to standardize them to a [consistent schema](https://discovery.biothings.io/view/outbreak/) based off of [schema.org](http://schema.org/) to promote interoperability and reuse. While the outbreak.info team has built a number of [parsers](#examples) to crawl, query, and standardize resource metadata, we'd love to have help incorporating other source of information.

We also welcome [suggestions for new sources](https://github.com/SuLab/outbreak.info-resources/issues/new?assignees=&labels=&template=suggest-a-new-resource.md&title=%5BSOURCE%5D) in addition to helping write code to add new sources to the API.

There are two key steps: writing a parser to add the resource metadata to [api.outbreak.info](api.outbreak.info), and some minor adjustments on the front-end to display the resource on the front-end.

# Writing an outbreak.info parser
## Before you start
* Make sure the resource that you're adding allows redistribution of its metadata (check the Terms and Conditions page and/or User Agreements).

## Getting started / background
* Find your own resource to add, or choose from our [list of resources that we want to add](https://github.com/SuLab/outbreak.info-resources/labels/metadata).
* Each parser is built using the [Biothings SDK](https://docs.biothings.io/en/latest/) and imported into the outbreak.info API](http://api.outbreak.info/) using the [Biothings Hub](https://docs.biothings.io/en/latest/doc/hub_tutorial.html) written in Python.
* Review the outbreak.info schemas, which are derived from schema.org schemas: [website](https://discovery.biothings.io/view/outbreak/), [.json](https://github.com/SuLab/outbreak.info-resources/blob/master/yaml/outbreak.json), and [individual .yamls](https://github.com/SuLab/outbreak.info-resources/tree/master/yaml)

## Essential files that make up a parser project:

    __init__.py
    dump.py
    parser.py
    upload.py
    requirements.txt (if dependencies)

**Important:**
When naming your project: Don't use hyphens in repo/source names. These repos will ultimately become modules and module names do not support hyphens.  If you must please use underscores and lowercase only.

## General Process
### requirements.txt
* Create a file containing the package requirements for the parser.py file, including versions, which can be installed via `pip install -r requirements.txt`

## **Init**

Youʼll need an `__init__.py` , telling our manager interface (BioThings Studio) where to import our dump and upload classes.

All the init file should be is:

    from .upload import <nameOfUploaderClass>

    from .dump import <nameOfDumperClass>

## dump.py

The dumper is a file required by the outbreak Hub to download any required files by the parser.  However, when a file is not needed (eg. Using an API) The dumper still needs to be there but we will place a "dummy" version that provides the basic attributes needed to create a build.

**If your parser requires a file:**

Your class must inherit the class

```python
PDumper(biothings.hub.dataload.dumper.LastModifiedHTTPDumper):
```

**If your parser DOES NOT require a file:**

Your class must inherit the dummy class

```python
PDumper(biothings.hub.dataload.dumper.DummyDumper):
```

An example of a basic  dummy dumper is here:

    import os

	import biothings, config
	biothings.config_for_app(config)
	from config import DATA_ARCHIVE_ROOT

	import biothings.hub.dataload.dumper


	class PDumper(biothings.hub.dataload.dumper.DummyDumper):

    SRC_NAME = "<name of repo>"
    __metadata__ = {
        "src_meta": {
            "author":{
                "name": "Marco Cano",
                "url": "https://github.com/marcodarko"
            },
            "code":{
                "branch": "master",
                "repo": "https://github.com/marcodarko/protocolsio.git"
            },
            ....any other metadata you wish to include
        }
    }
    SRC_ROOT_FOLDER = os.path.join(DATA_ARCHIVE_ROOT, SRC_NAME)
	SCHEDULE = None  # crontab format schedule, if None, won't be scheduled

An example of a regular dumper is:

    import os

    import biothings, config
    biothings.config_for_app(config)
    from config import DATA_ARCHIVE_ROOT

    import biothings.hub.dataload.dumper


    class LitCovidDumper(biothings.hub.dataload.dumper.LastModifiedHTTPDumper):

        SRC_NAME = "litcovid"
        # override in subclass accordingly
        SRC_ROOT_FOLDER = os.path.join(DATA_ARCHIVE_ROOT, SRC_NAME)

        SCHEDULE = None  # crontab format schedule, if None, won't be scheduled
        # LitCovid will update docs daily on a schedule TODO

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

        SRC_URLS = [
            'https://ftp.ncbi.nlm.nih.gov/pub/lu/LitCovid/litcovid2BioCJSON.gz'
        ]

`SRC_NAME` corresponds to the name of the source and convention is to name your repo the same name as your source.

`__metadata__` corresponds to the information about that source's author, license, repo, url, etc..

`SRC_ROOT_FOLDER` is used by the hub when locating the downloaded file.

`SCHEDULE` is the cron job interval at which your parser will run automatically, ( we recommend adding this only after your parser has been thoroughly tested)

**IMPORTANT:**

**If your dump.py does not download a file (dummy dumper) you must add an additional attribute to your upload.py class:**

    main_source = "<name of repository>"

Since your parser will require a dummy dumper (See dump.py) we need to link it to the right plug-in.

Learn more about the BioThings Studio [here](https://docs.biothings.io/en/latest/doc/studio.html)


## parser.py
1. Pull all the metadata for the COVID-19 / SARS-CoV-2 sources.
2. Ensure that the field names align with the [outbreak.info schema](https://github.com/SuLab/outbreak.info-resources/blob/master/yaml/outbreak.json).
3. Check that the types are consistent with the schema. One way to check is using the [JSON Schema Validator](https://www.jsonschemavalidator.net/), pasting in the "$validation" object from the [schema](https://github.com/SuLab/outbreak.info-resources/blob/master/yaml/outbreak.json) and comparing to a sample record from your parser. You may have to convert stings to objects (like `author.affiliation.name`), force strings to be lists, etc.
4. Ensure as many of the [required fields](#required) and [recommended](#recommended) are present.
5. Convert all dates to YYYY-MM-DD format (e.g. 2020-05-29). If dates are approximate like "May 2020", they can remain as strings.
6. If there's extra metadata fields, you can include them if you think they're useful/important.
7. Your function should be generator and should yield a Python dictionary.

**Tip:**
Use the biothings logger to log any important steps of your parser. This is extremely useful when debugging errors on the Studio interface.

    from biothings import config
    logging = config.logger

    logging.warning("Exceeded request for ID '%s'", id)

Log things such as progress, errors, etc.

## upload.py
* Create a class which loads the data.
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

The uploader class will include the following attributes:

    name = "litcovid"
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
    idconverter = None
    storage_class = biothings.hub.dataload.storage.BasicStorage

`idconverter` is a utility function you can import from biothings if needed. You can leave it as is.
`name` is the name of the repo/source (must match)
`storage_class` is an internal setting for a temporary Mongo storage, you can leave this as is.


**IMPORTANT:**
the `upload.py` uploader class will require a load_data function:

    def load_data(self, data_folder):
        self.logger.info("Load data from directory: '%s'" % data_folder)
        return parser_func(data_folder)

Depending on whether your parser downloads a file to parse or not this function will take a `data_folder` argument.

This will be the folder path fed to the load_annotations function in your `parser.py` to locate the file and begin parsing:

    def load_annotations(data_folder):

    infile = os.path.join(data_folder,"litcovid2BioCJSON.gz")
    assert os.path.exists(infile)

IF your parser does not download a file via the dumper you must omit these arguments on both `load_data` and `load_annotations`.

## **Upload & Mapping**


We use a communal mapping file and specifies the fields we want to use. Take a look at this example of a complete `upload.py` file.

    import os
    import biothings.hub.dataload.uploader

    import requests
    import biothings
    import config
    import requests
    biothings.config_for_app(config)

    MAP_URL = "https://raw.githubusercontent.com/SuLab/outbreak.info-resources/master/outbreak_resources_es_mapping.json"
    MAP_VARS = ["@type", "abstract", "author", "citedBy", "curatedBy", "dateModified", "datePublished", "doi", "funding", "identifier", "isBasedOn", "issueNumber", "journalName", "journalNameAbbrev", "keywords", "license", "name", "pmid", "publicationType", "relatedTo", "url", "volumeNumber"]

    # when code is exported, import becomes relative
    try:
        from litcovid.parser import load_annotations as parser_func
    except ImportError:
        from .parser import load_annotations as parser_func


    class LitCovidUploader(biothings.hub.dataload.uploader.BaseSourceUploader):
    name = "litcovid"
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
    idconverter = None
    storage_class = biothings.hub.dataload.storage.BasicStorage

    def load_data(self, data_folder):
        self.logger.info("Load data from directory: '%s'" % data_folder)
        return parser_func(data_folder)
    @classmethod
    def get_mapping(klass):
        r = requests.get(MAP_URL)
        if(r.status_code == 200):
            mapping = r.json()
            mapping_dict = { key: mapping[key] for key in MAP_VARS }
            return mapping_dict




The data you parsed is structured to fit a schema and we need to tell Elastic Search how to index each field, we already did that so you just need to get the list of fields that are used in your data and add this method to your class.

**Note:**
If you must write your own you'll need to add an additional attribute `mapping` and it must include the mapping for each field you wish to be indexed/searchable

Learn more about [ElasticSearch mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html).

**Import behavior:**
The manager interface will try to import your parser as a module so keep this structure and the exception will be the fallback as you see here:

    try:
            from litcovid.parser import load_annotations as parser_func
        except ImportError:
            from .parser import load_annotations as parser_func

## Required fields
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



## Things that would be nice, in an ideal world
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
* The parser, uploader, and dumper Python files for a given resource should be stored in their own repository.
* Code should be submitted as an issue on [Github](https://github.com/SuLab/outbreak.info-resources/issues)

# Exposing a resource to the front-end website
1. Add a `curatedBy` object to the data parser (see above).  For Harvard Dataverse, this is the object:

```
"curatedBy": {
"@type": "Organization",
"curationDate": "2020-10-15", # Date that the data was accessed, in YYYY-MM-DD format
"name": "Harvard Dataverse", # Name used for display
"url": "https://doi.org/10.7910/DVN/0D1XX6" # URL of the particular resource where it can be found in the parent resource. This value will differ for every record.
}
```

2. In `src/store/modules/admin.js`: add an object to the `resources` variable, under the correct resource type (most prevalent resource type for that repository).  For instance, for Harvard Dataverse, this is the object, located under `dataset`:
```
{
    id: "dataverse",
    name: "Harvard Dataverse",
    img: "dataverse_icon.png",
    img_lg: "dataverse.png",
    url: "https://dataverse.harvard.edu/dataverse/covid19",
    license: {url: "https://dataverse.org/best-practices/harvard-dataverse-general-terms-use"},
    citation: '<a href="https://dataverse.org/best-practices/data-citation target="_blank"">Dataverse Citation Policies</a>',
    description: "This is a general collection of COVID-19 data deposited in the Harvard Dataverse repository. The list in this collection is maintained by the Harvard Dataverse data curation team (IQSS and Harvard Library). Researchers who deposit their related data into Harvard Dataverse will have their data linked to this collection, to increase discoverability of their data."
  }
```

`name` should match the `curatedBy.name` you added in step 1.  `img` is the file name for the resource logo and should be as small in width as possible; if you'd like a wider, more elaborate logo which is displayed at [outbreak.info Sources](https://outbreak.info/sources), that can be specified in `img_lg`.  `id` should be unique to other resources.

3. Add the image logo to `src/assets/resources` (and `img_lg` if you'd like)
4. Update the release notes in the `updates` variable in `src/store/modules/admin.js`, including an example to a link in `route`:
```
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
```
5. Pull the changes onto the outbreak.info server and rebuild the app.

### <a name="examples"></a>Parse Examples
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