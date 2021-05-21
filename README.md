# Graph-Visualization
This repository contains the code of the Graph Visualization project from intern Ramon Dijkstra.

## From raw data to an interactive visualization
![image](https://user-images.githubusercontent.com/35725306/118948833-f4c8e800-b958-11eb-9c5b-2b01b11fa469.png)

The image above showcases how we get from data to visualization. To put it in text, we have the following steps:
  1) **Data:** can be found in Company.dat, Investor.dat, and InvestorInvestmentRelation.dat
  2) **Data pre-processing:**
     - Input: Company.dat, Investor.dat, and InvestorInvestmentRelation.dat
     - Code: processing_data.ipynb
     - Output: processed_company_data.csv, processed_investor_data.csv, and processed_relation_data.csv
  3) **Creation of the heterogeneous graph:**
     - Input: processed_company_data.csv, processed_investor_data.csv, and processed_relation_data.csv
     - Code: create_graph.ipynb
     - Output: dgl_graph
  4) **Applying the HGT:**
     - Input: processed_company_data.csv, processed_investor_data.csv, processed_relation_data.csv, and dgl_graph
     - Code: train_hgt.ipynb
     - Output: model.pth
  5) **UMAP on 256-D node embeddings:**
     - Input: processed_company_data.csv, processed_investor_data.csv, processed_relation_data.csv, and model.pth
     - Code: use_embeddings.ipynb
     - Output: json_company_id_with_embedding.json, json_investor_id_with_embedding.json, company_with_hgt_embedddings.csv, and investor_with_hgt_embedddings.csv

The code is thus build in a modular way. Each block can be adjusted to preferences. If we would e.g. use other embeddings, we need to change this in the use_embeddings.ipynb. There is example code in there how to integrate other embeddings.

## The interactive visualization
The interactive visualization contains three main files that need to be adjusted when other embeddings are used. 

  1) In the **sitedata directory**, the json_company_id_with_embedding.json, json_investor_id_with_embedding.json, company_with_hgt_embedddings.csv, and investor_with_hgt_embedddings.csv files need to be uploaded.
  2) In the **main.py**, the @app.route for the files need to be adjusted to work with new embddings.
  3) In the **api.js**, the get request needs to be adjusted.

For all the three adjustments, examples of how it exactly needs to adjusted are included in the files.
