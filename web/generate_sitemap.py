# generate sitemap for outbreak.info, based on a static list of ROUTES
# and a dynamically pullled list of /resources/id
# USAGE: `python3 generate_sitemap.py`
# outputs: an xml file saved in SITEMAP_FILE
from datetime import datetime
print(f"Creating sitemap at {datetime.now()}")
from requests import get


SITEMAP_FILE = "/Users/laurahughes/GitHub/outbreak.info/web/public/sitemap"
ROUTES = [
"about",
 "citation",
 "compare",
 "contributing-data",
 "data",
 "doubling-rates",
 "epidemiology",
 "home",
 "latest",
 "license",
 "maps",
 "niaid",
 "privacy",
 "regions",
 "resources",
 "resources/search",
 "schema",
 "situation-reports",
 "situation-reports/methods",
 "situation-reports/caveats",
 "sources",
 "summary",
 "terms",
 "topics",
 "topics/definitions",
 "videos"]

# Probably static
# API url to grab all the resource IDs
API_URL = "https://api.outbreak.info/resources/query?fields=_id"
SITE_URL = "https://outbreak.info"

def fetchOne(url, scroll_id = None):
    if(scroll_id is not None):
        request_url = f"{url}&fetch_all=true&scroll_id={scroll_id}"
    else:
        request_url = f"{url}&fetch_all=true"
    resp = get(request_url)
    if(resp.status_code == 200):
        docs = resp.json()
        if("success" in docs.keys()):
            return(None)
        else:
            return({"scroll_id": docs["_scroll_id"], "hits": docs["hits"], "total": docs["total"]})

def fetchAll(url):
    results = []
    # first call
    result = fetchOne(url)

    results.extend(result["hits"])
    total = result["total"]
    while(result is not None):
        print(f"Fetched {len(results)} / {total}")
        scroll_id = result["scroll_id"]
        result = fetchOne(url, scroll_id)
        if(result is not None):
            results.extend(result["hits"])
    return(results)

def generate_sitemap(api_url= API_URL, site_url = SITE_URL, routes = ROUTES, filename = SITEMAP_FILE):
    # base file for non-resource-based routes
    route_urls = [f"<url><loc>{site_url}/{route}</loc></url>" for route in routes]
    counter = 0
    print("\nCreating non-resources sitemap file")
    create_sitemap(route_urls, f"{filename}{counter}.xml")

    print("Fetching indices of resources")
    ids = fetchAll(api_url)
    resource_urls = [f"<url><loc>{site_url}/resources/{id['_id']}</loc></url>" for id in ids]
    # Split sitemaps up into chunks of size 50,000:
    # Fixing error "Your Sitemap contains too many URLs. Please create multiple Sitemaps with up to 50000 URLs each and submit all Sitemaps."
    # As per https://support.google.com/webmasters/answer/75712?hl=en
    n = 50000
    for i in range(0, len(resource_urls), n):
        counter += 1
        print(f"Creating main sitemap chunk {counter}")
        create_sitemap(resource_urls[i:i + n],  f"{filename}{counter}.xml")

    # Main file for the sitemap:
    print("\nCreating main sitemap index file")
    resource_chunks = [f"<sitemap>\n<loc>{site_url}/sitemap{idx}.xml</loc>\n</sitemap>" for idx in range(counter+1)]
    resource_string = '\n'.join(resource_chunks)
    sitemap = f'<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{resource_string}\n</sitemapindex>'
    f = open(f"{filename}.xml", "w")
    f.write(sitemap)
    f.close()
    print("\nDONE!")



def create_sitemap(urls, filename):
    url_list = "\n".join(urls)
    sitemap = f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{url_list}\n</urlset>'

    # overwrite the file
    f = open(filename, "w")
    f.write(sitemap)
    f.close()

if __name__ == "__main__":
    generate_sitemap()
