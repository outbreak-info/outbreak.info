from flask import Flask, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/download_gadm")
def helloWorld():
    return send_from_directory(directory='/home/chrissy/outbreak.info/web/src/assets/geo', \
    filename='gadm36_USA_2.gpkg')

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=3030)
