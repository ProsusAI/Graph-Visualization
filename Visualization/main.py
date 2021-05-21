# pylint: disable=global-statement,redefined-outer-name
import argparse
import csv
import glob
import json
import os

import yaml
from flask import Flask, jsonify, redirect, render_template, send_from_directory
from flask_frozen import Freezer
from flaskext.markdown import Markdown
from flask_cors import CORS

site_data = {}
by_uid = {}


def main(site_data_path):
    global site_data, extra_files
    extra_files = ["README.md"]
    # Load all for your sitedata one time.
    for f in glob.glob(site_data_path + "/*"):
        extra_files.append(f)
        name, typ = f.split("/")[-1].split(".")
        if typ == "json":
            site_data[name] = json.load(open(f))
        elif typ in {"csv", "tsv"}:
            site_data[name] = list(csv.DictReader(open(f)))
        elif typ == "yml":
            site_data[name] = yaml.load(open(f).read(), Loader=yaml.SafeLoader)

    print("Data Successfully Loaded")
    return extra_files


# ------------- SERVER CODE -------------------->

app = Flask(__name__)
app.config.from_object(__name__)
freezer = Freezer(app)
markdown = Markdown(app)

app.config['CORS_HEADERS'] = 'Content-Type'


# MAIN PAGES


def _data():
    data = {}
    return data


@app.route("/")
def index():
    return redirect("/index.html")


@app.route("/favicon.ico")
def favicon():
    return send_from_directory(site_data_path, "favicon.ico")


# TOP LEVEL PAGES


@app.route("/index.html")
def home():
    data = _data()
    return render_template("index.html", **data)

@app.route("/visualization.html")
def paper_vis():
    data = _data()
    return render_template("visualization.html", **data)

def extract_list_field(v, key):
    value = v.get(key, "")
    if isinstance(value, list):
        return value
    else:
        return value.split("|")


# FRONT END SERVING

#Add routes for our jsons

#Carlo RGCN


@app.route("/rgcn_investor_with_embeddings_carlo.json")
def rgcn_investor_json_carlo():
    json = []
    for v in site_data["rgcn_investor_with_embeddings_carlo"]:
        json.append(v)
    return jsonify(json)

@app.route("/get_<path>.json")
def rgcn_investor_embedding_carlo(path):
     return jsonify(site_data[path])

@app.route("/rgcn_company_with_embeddings_carlo.json")
def rgcn_company_json_carlo():
    json = []
    for v in site_data["rgcn_company_with_embeddings_carlo"]:
        json.append(v)
    return jsonify(json)

@app.route("/get_<path>.json")
def rgcn_company_embedding_carlo(path):
     return jsonify(site_data[path])
    

#Carlo HGT


@app.route("/investor_with_embeddings_carlo.json")
def investor_json_carlo():
    json = []
    for v in site_data["investor_with_embeddings_carlo"]:
        json.append(v)
    return jsonify(json)

@app.route("/get_<path>.json")
def investor_embedding_carlo(path):
     return jsonify(site_data[path])

@app.route("/company_with_embeddings_carlo.json")
def company_json_carlo():
    json = []
    for v in site_data["company_with_embeddings_carlo"]:
        json.append(v)
    return jsonify(json)

@app.route("/get_<path>.json")
def company_embedding_carlo(path):
     return jsonify(site_data[path])
    
#Own HGT

    
@app.route("/processed_investor_data.json")
def investor_json():
    json = []
    for v in site_data["processed_investor_data"]:
        json.append(v)
    return jsonify(json)

@app.route("/get_<path>.json")
def investor_embedding(path):
     return jsonify(site_data[path])
    
@app.route("/processed_company_data.json")
def company_json():
    json = []
    for v in site_data["processed_company_data"]:
        json.append(v)
    return jsonify(json)

@app.route("/get_<path>.json")
def company_embedding(path):
     return jsonify(site_data[path])
    
    
#Own HGT small (for debugging)


@app.route("/small_company_data.json")
def small_company_json():
    json = []
    for v in site_data["small_company_data"]:
        json.append(v)
    return jsonify(json)

@app.route("/get_<path>.json")
def small_company_embedding(path):
     return jsonify(site_data[path])

@app.route("/small_investor_data.json")
def small_investor_json():
    json = []
    for v in site_data["small_investor_data"]:
        json.append(v)
    return jsonify(json)

@app.route("/get_<path>.json")
def small_investor_embedding(path):
     return jsonify(site_data[path])


# --------------- DRIVER CODE -------------------------->
# Code to turn it all static

def parse_arguments():
    parser = argparse.ArgumentParser(description="MiniConf Portal Command Line")

    parser.add_argument(
        "--build",
        action="store_true",
        default=False,
        help="Convert the site to static assets",
    )

    parser.add_argument(
        "-b",
        action="store_true",
        default=False,
        dest="build",
        help="Convert the site to static assets",
    )

    parser.add_argument("path", help="Pass the JSON data path and run the server")

    args = parser.parse_args()
    return args


if __name__ == "__main__":
    args = parse_arguments()

    site_data_path = args.path
    extra_files = main(site_data_path)

    if args.build:
        freezer.freeze()
    else:
        debug_val = False
        if os.getenv("FLASK_DEBUG") == "True":
            debug_val = True
            
        app.run(port=5002, debug=debug_val, extra_files=extra_files)