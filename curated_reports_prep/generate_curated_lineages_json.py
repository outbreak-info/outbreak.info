"""
Function to read in the `curated_lineage.yaml`, pull in all the Pango sublineages
for each curated linage, and calculate a few derived properties for the
outbreak.info front-end.

Usage: `python3 generate_curated_lineages_json.py`
"""

# required packages
import yaml
import json
import pandas as pd
from urllib import request
import requests
import logging
from datetime import datetime

# --- LOGGING ---
logging.basicConfig(filename = "curated_lineages_json.log", filemode="a", format="%(asctime)s : %(name)s - %(levelname)s - %(message)s", datefmt='%d-%b-%y %H:%M:%S', level=logging.INFO)
logging.info("Generating curated_lineages.json")

# --- CONSTANTS: file locations ---
# location where the Pango sublineages are stored

# lineage_url = "https://raw.githubusercontent.com/cov-lineages/lineages-website/master/data/lineages.yml"
lineage_url = "lineages.yml"


# location where the Pango recombinants lineage definitions are stored.
recombinants_url = "https://raw.githubusercontent.com/cov-lineages/pango-designation/master/pango_designation/alias_key.json"

# yaml containing list of lineages to curate
curated_filename = "curated_lineages.yaml"
# where to save the resulting .json
output_file = "../web/src/assets/genomics/curated_lineages.json"
output_file_examples = "../web/src/assets/examples/genomics_examples.json"

# --- IMPORT CURATED list ---
# load the curated list
curated_data = yaml.load(open(curated_filename), Loader=yaml.BaseLoader)

# Append the Variant of Concern / Interest tag to the lineages
# VOCs / VOIs are nested within the yaml to avoid having to type this every time.
try:
    vocs = pd.DataFrame(curated_data["VOC"])
except:
    print("No Variants of Concern found")
    vocs = pd.DataFrame()

try:
    vois = pd.DataFrame(curated_data["VOI"])
except:
    print("No Variants of Interest found")
    vois = pd.DataFrame()

try:
    vums = pd.DataFrame(curated_data["VUM"])
except:
    print("No Variants under Monitoring found")
    vums = pd.DataFrame()

previous = pd.DataFrame(curated_data["previous_voc"])
deescalated = pd.DataFrame(curated_data["deescalated"])
vocs["variantType"] = "Variant of Concern"
vocs["showOnHomepage"] = True
vois["variantType"] = "Variant of Interest"
vois["showOnHomepage"] = True
vums["variantType"] = "Variant under Monitoring"
vums["showOnHomepage"] = True
previous["variantType"] = "Previously Circulating Variant of Concern"
previous["showOnHomepage"] = False
deescalated["variantType"] = "De-escalated"
deescalated["showOnHomepage"] = False
# merge the two back together
curated = pd.concat([vocs, vois, vums, previous, deescalated])


# --- RECOMBINANTS ---
recombinants_json = requests.get(recombinants_url)
recombinant_lineages = json.loads(recombinants_json.content)

# return the PANGO lineage of the recombinants which are composed solely of that VOC.
def findRecombinants(voc, recombinants):
    voc_recombinants = dict(filter(lambda elem: idRecombinants(voc, elem[1]), recombinants.items()))
    return(voc_recombinants.keys())

# first, map "does this recombinant exist as a sublineage of the VOC?" to each recombinant origin strain
# then collapse to a single True/False value (all recombined strains are from that particular VOC, or not)
def idRecombinants(voc, recombinants):
    if(recombinants != ""):
        return(all([recombinant.replace("*", "") in voc for recombinant in recombinants]))
    return(False)



# --- DESCENDANTS ---
# pull out the sublineages / descendants for all of the parent lineages
def getDescendants(row):
    lineage = row.pangolin_lineage
    if((row.include_sublineages is None) | ((row.include_sublineages  != "False") & (row.include_sublineages  != "false"))):
        if(isinstance(lineage, str)):
            # list the parent first
            descendants = [lineage]
            descendants.extend(lineage_descendants[lineage])
            # de-duplicate
            unique_desc = list(dict.fromkeys(descendants))
            # add in any recombinant lineages where all the recombined lineages belong to that VOC/VOI.
            if((row.include_recombinants  == "True") | (row.include_recombinants  == "true")):
                recombs = list(findRecombinants(unique_desc, recombinant_lineages))
                # now add any descendants of recombinants (e.g., XBB.1)
                recomb_descendants = []
                for r in recombs:
                    if len(lineage_descendants[r])>1:
                        recomb_descendants.extend([ld for ld in lineage_descendants[r] if ld!= r])
                if len(recomb_descendants)>0:
                    recombs.extend(recomb_descendants)
                unique_desc.extend(recombs)
            return(unique_desc)
        else:
            descendants = lineage.copy()
            # dealing with the B.1.427/B.1.429 case
            sublineages = [item for sublist in lineage for item in lineage_descendants[sublist]]
            descendants.extend(sublineages)
            return(list(dict.fromkeys(descendants)))
    else:
        return([lineage])

# Pull the Pango lineages, reshape the descendants into a dict
with open('lineages.yml') as f:
    lineages = yaml.safe_load(f)
# lineage_file = request.urlopen(lineage_url)
# lineages = yaml.load(open(lineage_url), Loader=yaml.BaseLoader)

lineage_descendants = {}
for lineage in lineages:
    lineage_descendants[lineage["name"]] = lineage["children"]
curated["pango_descendants"] = curated.apply(getDescendants, axis = 1)
curated["pango_sublineages"] = curated.apply(lambda row: list(filter(lambda x: (x != row.pangolin_lineage) & (x not in row.pangolin_lineage), row.pango_descendants)), axis=1)


# --- CALCULATED ---
def getLabel(row):
    if(row.who_name == row.who_name):
        return(row.who_name)
    elif(len(row.pango_descendants) > 1):
        return(f"{row.pangolin_lineage}-related")
    elif (isinstance(row.pangolin_lineage, str)):
        return(row.pangolin_lineage)
    else:
        return(", ".join(row.pangolin_lineage))

def getSynonyms(row):
    if(row.mutation_synonyms == row.mutation_synonyms):
        synonyms = row.mutation_synonyms
    else:
        synonyms = []
    if(row.who_name == row.who_name):
        synonyms.append(row.who_name)
    if(row.pangolin_lineage == row.pangolin_lineage):
        if (isinstance(row.pangolin_lineage, str)):
            synonyms.append(row.pangolin_lineage)
        else:
            synonyms.extend(row.pangolin_lineage)
    if(row.nextstrain_clade == row.nextstrain_clade):
        synonyms.extend(row.nextstrain_clade.split(","))
    if(row.gisaid_clade == row.gisaid_clade):
        synonyms.extend(row.gisaid_clade.split(","))
    if(row.phe_name == row.phe_name):
        synonyms.extend(row.phe_name.split(","))
    synonyms.sort()
    return(synonyms)

# combines synonyms and descendant names:
def getSearchTerms(row):
    terms = row.mutation_synonyms.copy()
    terms.extend(row.pango_descendants)
    terms = list(dict.fromkeys(terms)) # uniqueify
    return(terms)

# Returns query string for the combined
def getCharMutQuery(row):
    queries = [row.label]
    queries.extend(row.pango_descendants)
    queries = list(dict.fromkeys(queries))
    return(queries)

# Converts array of classification items to a dict with some calculated values for display in table
# 1. Adds outbreak.info classification
# 2. Calculates for each: label, tooltip, url
def formatClassifications(row):
    formatted_classifications = {}
    # Add outbreak.info classification:
    if(row.variantType == "Variant of Concern"):
        formatted_classifications = {"VOC": {"outbreak": {"label": row.dateModifiedFormatted, "ttip":"<b>Variant of Concern</b> classification by <b>outbreak.info</b>"}}}
    elif(row.variantType == "Variant of Interest"):
        formatted_classifications = {"VOI": {"outbreak": {"label": row.dateModifiedFormatted, "ttip":"<b>Variant of Interest</b> classification by <b>outbreak.info</b>"}}}
    elif(row.variantType == "Variant under Monitoring"):
        formatted_classifications = {"VUM": {"outbreak": {"label": row.dateModifiedFormatted, "ttip":"<b>Variant under Monitoring</b> classification by <b>outbreak.info</b>"}}}

    if(row.classifications == row.classifications):
        # loop over the classifications and reformat:
        for classification in row.classifications:
            if("url" in classification.keys()):
                if("dateModified" in classification.keys()):
                    label = f'<a href={classification["url"]} target="_blank">{datetime.strptime(classification["dateModified"], "%Y-%m-%d").strftime("%d %b %Y")}</a>'
                else:
                    label = f'<a href={classification["url"]} target="_blank">report</a>'
            else:
                if("dateModified" in classification.keys()):
                    label = datetime.strptime(classification["dateModified"], "%Y-%m-%d").strftime("%d %b %Y")
                else:
                    label = "report"

            if(classification["variantType"] == "VOC"):
                variantType = "Variant of Concern"
            elif(classification["variantType"] == "VOI"):
                variantType = "Variant of Interest"
            elif(classification["variantType"] == "VUM"):
                variantType = "Variant under Monitoring"
            else:
                variantType = "none"

            ttip = f"View <b>{variantType}</b> classification by <b>{classification['author']}</b>"
            to_add = {"label": label, "ttip": ttip}

            if(classification["variantType"] in formatted_classifications.keys()):
                formatted_classifications[classification["variantType"]][classification["author"]] = to_add
            else:
                formatted_classifications[classification["variantType"]] = { classification["author"]: to_add }

    return(formatted_classifications)

curated["label"] = curated.apply(lambda x: getLabel(x), axis = 1)
curated["reportQuery"] = curated.pango_descendants.apply(lambda x: {"pango": x})
curated["char_muts_parent_query"] = curated.pango_descendants.apply(lambda x: " OR ".join(x))
curated["char_muts_query"] = curated.apply(lambda x: getCharMutQuery(x), axis = 1)
curated["mutation_synonyms"] = curated.apply(lambda x: getSynonyms(x), axis = 1)
curated["searchTerms"] = curated.apply(lambda x: getSearchTerms(x), axis = 1)
curated["dateModifiedFormatted"] = curated.dateModified.apply(lambda x: datetime.strptime(x, "%Y-%m-%d").strftime("%d %b %Y"))
curated["classificationTable"] = curated.apply(lambda x: formatClassifications(x), axis = 1)
# Remove variables that aren't needed
curated.drop(["dateModified", "dateModifiedFormatted"], axis = 1, inplace=True)

# --- EXPORT ---
curated.to_json(output_file, orient="records")
vocs[["who_name", "pangolin_lineage", "short_name"]].to_json(output_file_examples, orient="records")

# --- Write to log file ---
def getName(row):
    if(isinstance(row.pangolin_lineage, str)):
        if(row.who_name == row.who_name):
            return(f"{row.who_name} ({row.pangolin_lineage})")
        else:
            return(row.pangolin_lineage)
    else:
        if(row.who_name == row.who_name):
            return(f"{row.who_name} ({', '.join(row.pangolin_lineage)})")
        else:
            return(", ".join(row.pangolin_lineage))

curated["name"] = curated.apply(lambda row: getName(row), axis=1)
log_msg = curated.groupby("variantType").name.value_counts()

logging.info(f"{curated.shape[0]} Variants of Concern/Interest added:")
logging.info(log_msg)
logging.info("-"*50)
