# required packages
import yaml
import json
import pandas as pd
from urllib import request
import requests
import logging
from datetime import datetime
import os


recombinants_url = "https://raw.githubusercontent.com/cov-lineages/pango-designation/master/pango_designation/alias_key.json"

lineages_url = "https://raw.githubusercontent.com/cov-lineages/pango-designation/master/lineage_notes.txt"

# --- RECOMBINANTS ---
recombinants_json = requests.get(recombinants_url)
recombinant_lineages = json.loads(recombinants_json.content)

### borrowing the sort_lineages function from the cov-lineages repo
def sort_lineages(lin_list):
    splitted = [i.split(".") for i in lin_list]
    numeric = []
    for i in splitted:
        lin = [i[0]]
        for j in i[1:]:
            lin.append(int(j))
        numeric.append(lin)
    sorted_list = sorted(numeric)
    stringed = []
    for i in sorted_list:
        lin = [i[0]]
        for j in i[1:]:
            lin.append(str(j))
        stringed.append(lin)
    finished_list = ['.'.join(i) for i in stringed]
    return finished_list


# Pull the Pango lineages, reshape the descendants into a dict
lineage_file = request.urlopen(lineages_url)
# lineages = yaml.load(lineage_file, Loader=yaml.BaseLoader)

lineages_df = pd.read_csv(lineage_file,sep='\t',header=0)

### also load in the lineages aliases 
alias_dict = dict(recombinant_lineages)

#drop recombinants from alias dict 
recomb_dict = alias_dict.copy()
for k in list(recomb_dict.keys()):
    if not k.startswith('X'):
        recomb_dict.pop(k)

for k in list(alias_dict.keys()):
    if k.startswith('X'):
        alias_dict.pop(k)
alias_dict.pop('A')
alias_dict.pop('B')

#flipped aliases and long names
flipped_dict = dict((v,k) for k,v in alias_dict.items())

### convert all lineage names to their "complete name"
lineages_df = lineages_df.loc[~lineages_df['Lineage'].str.contains('\*')]
lineages_df['complete'] = lineages_df['Lineage'].apply(lambda x: x if x.split('.')[0] not in alias_dict.keys() else x.replace(x.split('.')[0],alias_dict[x.split('.')[0]]))
lineages_df = lineages_df.set_index('complete')
all_completes = list(lineages_df.index)
all_lins = list(lineages_df['Lineage'])

lineage_info = {}
for i,(lineage,complete) in enumerate(zip(all_lins,all_completes)):
    children_inds = [i]+[j for j,comp0 in enumerate(all_completes) if comp0.startswith(complete+'.')]
    children_names= [all_lins[j] for j in children_inds]
    if lineage == 'A' or lineage =='B':
        lineage_info[lineage] = {'children':children_names,'alias':complete}
    elif lineage not in recomb_dict.keys():
        split0 = complete.split('.')
        parent_ind = all_completes.index('.'.join(split0[0:(len(split0)-1)]))
        lineage_info[lineage] = {'children':children_names,'alias':complete, 'parent':all_lins[parent_ind]}
    else:
        lineage_info[lineage] = {'children':children_names,'alias':complete, 'recombinant_parents':recomb_dict[lineage]}

### now go back and sort the lineage lists
for lin in lineage_info.keys():
    lineage_info[lin]['children'] = sort_lineages(lineage_info[lin]['children'])


# also write a copy of the fixed yaml file
# borrowed from cov-lineages/grinch
with open("lineages.yml", "w") as lineage_file:
    for lineage in lineage_info.keys():
        if not lineage.startswith("*"):
            if lineage == "A" or lineage =="B":
                lineage_file.write("- name: " + lineage + "\n")
                lineage_file.write("  alias: " + lineage_info[lineage]['alias'] + "\n")
                lineage_file.write("  children:\n")

                for child in sort_lineages(lineage_info[lineage]['children']):
                    lineage_file.write("      - " + child + "\n")
            elif lineage in recomb_dict.keys():
                lineage_file.write("- name: " + lineage + "\n")
                lineage_file.write("  alias: " + lineage_info[lineage]['alias'] + "\n")
                lineage_file.write("  children:\n")
                for child in sort_lineages(lineage_info[lineage]['children']):
                    lineage_file.write("      - " + child + "\n")
                if 'recombinant_parents' in lineage_info[lineage].keys():
                    lineage_file.write("  recombinant_parents: " + ','.join(lineage_info[lineage]['recombinant_parents']) + "\n")
            else:
                lineage_file.write("- name: " + lineage + "\n")
                lineage_file.write("  alias: " + lineage_info[lineage]['alias'] + "\n")
                lineage_file.write("  children:\n")

                for child in sort_lineages(lineage_info[lineage]['children']):
                    lineage_file.write("      - " + child + "\n")
                if 'parent' in lineage_info[lineage].keys():
                    if lineage_info[lineage]['parent'] is not None:
                        lineage_file.write("  parent: " + lineage_info[lineage]['parent'] + "\n")


