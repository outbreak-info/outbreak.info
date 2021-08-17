"""
Function to read in the `curated_lineage.yaml`, pull in all the Pango sublineages
for each curated linage, and calculate a few derived properties for the
outbreak.info front-end.
"""

# required packages
import yaml
import pandas as pd
from urllib import request
import logging

# --- LOGGING ---
logging.basicConfig(filename = "curated_lineages_json.log", filemode="a", format="%(asctime)s : %(name)s - %(levelname)s - %(message)s", datefmt='%d-%b-%y %H:%M:%S', level=logging.INFO)
logging.info("Generating curated_lineages.json")

# --- CONSTANTS: file locations ---
# location where the Pango sublineages are stored
lineage_url = "https://raw.githubusercontent.com/cov-lineages/lineages-website/master/data/lineages.yml"
# yaml containing list of lineages to curate
curated_filename = "curated_lineages.yaml"
# where to save the resulting .json
output_file = "../web/src/assets/genomics/curated_lineages.json"

# --- IMPORT CURATED list ---
# load the curated list
curated_data = yaml.load(open(curated_filename), Loader=yaml.BaseLoader)

# Append the Variant of Concern / Interest tag to the lineages
# VOCs / VOIs are nested within the yaml to avoid having to type this every time.
vocs = pd.DataFrame(curated_data["VOC"])
vois = pd.DataFrame(curated_data["VOI"])
vocs["variantType"] = "Variant of Concern"
vois["variantType"] = "Variant of Interest"
# merge the two back together
curated = pd.concat([vocs, vois])

# calculated values
curated["reportQuery"] = curated.pangolin_lineage.apply(lambda x: {"pango": x})


# --- DESCENDANTS ---
# pull out the sublineages / descendants for all of the parent lineages
def getDescendants(lineage):
    if(isinstance(lineage, str)):
        return(lineage_descendants[lineage])
    else:
        # dealing with the B.1.427/B.1.429 case
        return([item for sublist in lineage for item in lineage_descendants[sublist]])

# Pull the Pango lineages, reshape the descendants into a dict
lineage_file = request.urlopen(lineage_url)
lineages = yaml.load(lineage_file, Loader=yaml.BaseLoader)
lineage_descendants = {}
for lineage in lineages:
    lineage_descendants[lineage["name"]] = lineage["children"]

curated["pango_descendants"] = curated.pangolin_lineage.apply(lambda x: getDescendants(x))
curated["pango_sublineages"] = curated.apply(lambda row: list(filter(lambda x: x != row.pangolin_lineage, row.pango_descendants)), axis=1)


# --- EXPORT ---
curated.to_json(output_file, orient="records")

# --- Write to log file ---
def getName(row):
    if(isinstance(row.pangolin_lineage, str)):
        if(row.who_name == row.who_name):
            return(f"{row.who_name} | {row.pangolin_lineage}")
        else:
            return(row.pangolin_lineage)
    else:
        if(row.who_name == row.who_name):
            return(f"{row.who_name} | {', '.join(row.pangolin_lineage)}")
        else:
            return(", ".join(row.pangolin_lineage))

curated["name"] = curated.apply(lambda row: getName(row), axis=1)
log_msg = curated.groupby("variantType").name.value_counts()

logging.info(f"{curated.shape[0]} Variants of Concern/Interest added:")
logging.info(log_msg)
