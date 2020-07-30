# generate sitemap for outbreak.info, based on a static list of ROUTES
# and a dynamically pullled list of /resources/id
# USAGE: `python3 generate_sitemap.py`
# outputs

import requests

SITEMAP_FILE = "/Users/laurahughes/GitHub/outbreak.info/web/public/sitemap.xml"
ROUTES = [
"about",
 "citation",
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
 "resources",
 "resources/search",
 "sources",
 "summary",
 "terms",
 "topics/definitions"]

# Probably static
# API url to grab all the resource IDs
API_URL = "https://api.outbreak.info/resources/query?fields=_id"
SITE_URL = "https://outbreak.info"

def fetchOne(url, scroll_id = None):
    if(scroll_id is not None):
        request_url = f"{url}&fetch_all=true&scroll_id={scroll_id}"
    else:
        request_url = f"{url}&fetch_all=true"
    resp = requests.get(request_url)
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
    route_urls = [f"<url><loc>{site_url}/{route}</loc></url>" for route in routes]
    route_list = "\n".join(route_urls)

    ids = fetchAll(api_url)
    resource_urls = [f"<url><loc>{site_url}/resources/{id['_id']}</loc></url>" for id in ids]
    resource_list = "\n".join(resource_urls)

    sitemap = f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{route_list}\n{resource_list}\n</urlset>'
    # overwrite the file
    f = open(filename, "w")
    f.write(sitemap)
    f.close()

    return(sitemap)

if __name__ == "__main__":
    generate_sitemap()
