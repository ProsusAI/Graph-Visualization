/* eslint-disable no-underscore-dangle */
class API {
  static getCompanies() {
    if (API.companyCache == null) {
//         API.companyCache = $.get("small_company_data.json");
//         API.companyCache = $.get("company_with_embeddings_carlo.json");
           API.companyCache = $.get("rgcn_company_with_embeddings_carlo.json");
//         API.companyCache = $.get("processed_company_data.json");
    }
    return API.companyCache;
  }

  static getCompaniesAndProjection() {
    return Promise.all([
      API.getCompanies(),
//          $.get("get_small_company_embeddings.json")
//          $.get("get_company_id_with_embedding_carlo.json")
            $.get("get_rgcn_company_id_with_embedding_carlo.json")
//          $.get("get_company_id_with_embedding.json")
   
    ]);
  }
    
  static getInvestors() {
    if (API.investorCache == null) {
//         API.investorCache = $.get("small_investor_data.json");
//         API.investorCache = $.get("investor_with_embeddings_carlo.json");
           API.investorCache = $.get("rgcn_investor_with_embeddings_carlo.json");
//         API.investorCache = $.get("processed_investor_data.json");
        
    }
    return API.investorCache;
  }

  static getInvestorsAndProjection() {
    return Promise.all([
      API.getInvestors(),
//         $.get("get_small_investor_embeddings.json"),
//         $.get("get_investor_id_with_embedding_carlo.json")
           $.get("get_rgcn_investor_id_with_embedding_carlo.json")
//         $.get("get_investor_id_with_embedding.json")
    ]);
  }
}

API.companyCache = null;
API.investorCache = null;