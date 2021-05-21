let size_company = 'medium'
let hq_region = 'Europe'
let display_nodes = 'companies'

const summaryBy = "keywords"; // or: "description"

let currentTippy = null;
let brush = null;
let list_keywords = [];

const sizes = {
  margins: {l: 20, b: 20, r: 20, t: 20},
};

const explain_text_plot = d3.select("#explain_text_plot");
const summary_selection = d3.select("#summary_selection");
const sel_nodes = d3.select("#sel_nodes");
const detailed_summary_company = d3.select("#detailed_summary_company");
const detailed_summary_investor = d3.select("#detailed_summary_investor");
const search_words_company = d3.select("#search_words_com");
const search_words_investor = d3.select("#search_words_inv");

const plot_size = () => {
  const cont = document.getElementById("container");
  const wh = Math.max(window.innerHeight - 220, 300);
  let ww = Math.max(cont.offsetWidth - 210, 300);
  if (cont.offsetWidth < 768) ww = cont.offsetWidth - 10.0;

  if (wh / ww > 1.3) {
    const min = Math.min(wh, ww);
    return [min, min];
  }
    
  return [ww, wh];
};

const xS = d3.scaleLinear().range([0, 500]);
const yS = d3.scaleLinear().range([0, 500]);
const plot = d3.select(".plot");
const l_bg = plot.append("g");
const l_main = plot.append("g");
const l_fg = plot.append("g");

const brush_start = () => {
  currentTippy.forEach((t) => t.disable());
  brushed();
};
const brushed = () => {
  let [[x0, y0], [x1, y1]] = d3.event.selection;
  (x0 = Math.round(x0)), (y0 = Math.round(y0));
  (x1 = Math.round(x1)), (y1 = Math.round(y1));

  l_main.selectAll(".dot")
    .classed("rect_selected", d => {
      return (
        x0 <= d.posCola[0] &&
        x1 >= d.posCola[0] && // Check X coordinate
        y0 <= d.posCola[1] &&
        y1 >= d.posCola[1] // Check Y
      );
    });
};

function brush_ended() {
  currentTippy.forEach((t) => t.enable());

  const all_sel = [];
  l_main.selectAll(".dot.rect_selected").each((d) => all_sel.push(d));

  const words_abstract = new Map();
  let parts = null;
  let count = 0;
    
  if (display_nodes == 'companies') {
        descriptions = []
        all_sel.forEach((company) => {
            if (company.Description) {
                descriptions.push(company.Description)
            }
        })                 

        sorted_results = tfidf(descriptions)

  }
  else {
        descriptions = []
        all_sel.forEach((investor) => {
            if (investor.Description) {
                descriptions.push(investor.Description)
            }
        })                 

        sorted_results = tfidf(descriptions)

  }
    
  abstract_words = sorted_results

  search_words_company.style("display", "none");
  search_words_investor.style("display", "none");
  detailed_summary_company.style("display", "none");
  detailed_summary_investor.style("display", "none");
  summary_selection.style("display", "block");
  
  if (abstract_words.length > 0) {
    explain_text_plot.style("display", "none");
    const f_scale = d3
      .scaleLinear()
      .domain([1, abstract_words[0][1]])
      .range([10, 16]);
    summary_selection
      .selectAll(".topWords")
      .data(abstract_words)
      .join("div")
      .attr("class", "topWords")
      .style("font-size", (d) => `${f_scale(d[1])}px`)
      .text((d) => d[0])
      .on("click", (d) => {
        
          if (!list_keywords.includes(d[0])) {
              summary_selection
                .selectAll(".topWords")
                .filter((dd) => dd[0] === d[0])
                .attr("class", "sel_key")
        
              l_main
                .selectAll(".dot")
                .filter(function(f) { return f.Description.toLowerCase().includes(d[0]) })
                .classed("highlight_sel", true)
              
              list_keywords.push(d[0])
          }
        
          else {
             summary_selection
                .selectAll(".sel_key")
                .filter((dd) => dd[0] === d[0])
                .attr("class", "topWords")
        
              l_main
                .selectAll(".dot")
                .filter(function(f) { return f.Description.toLowerCase().includes(d[0]) })
                .classed("highlight_sel", false) 
              
              index_key = list_keywords.indexOf(d[0]);
              if (index_key > -1) {
                  list_keywords.splice(index_key, 1);
              }
          } 
        })
      
  } else {
    summary_selection.selectAll(".topWords").remove();
    summary_selection.selectAll(".sel_key").remove();
    explain_text_plot.style("display", null);
  }

  if (display_nodes == 'companies') {
      sel_nodes
        .selectAll(".sel_node")
        .data(all_sel)
        .join("div")
        .attr("class", "sel_node")
        .html(
          (d) =>
            `<div class="p_title">${
                  d.CompanyName
            }</div>
            <div class="p_authors">${d.HQLocation}  <br /> 
                   ${d.Universe} <br /> 
                   ${d.BusinessStatus}
            </div>`
        )
        .on("click", (d) => showdetails_company(d))
        .on("mouseenter", (d) => {
          l_main
            .selectAll(".dot")
            .filter((dd) => dd.CompanyID === d.CompanyID)
            .classed("highlight_sel", true)
            .each(function () {
              if (this._tippy) this._tippy.show();
            });
        })
        .on("mouseleave", (d) => {
          l_main
            .selectAll(".dot")
            .filter((dd) => dd.CompanyID === d.CompanyID)
            .classed("highlight_sel", false)
            .each(function () {
              if (this._tippy) this._tippy.hide();
            });
        });
  }
  else {
      sel_nodes
        .selectAll(".sel_node")
        .data(all_sel)
        .join("div")
        .attr("class", "sel_node")
        .html(
          (d) =>
            `<div class="p_title">${
                  d.InvestorName
            }</div>
            <div class="p_authors">${d.HQLocation}  <br /> 
                   ${d.PrimaryInvestorType} <br /> 
                   ${d.InvestorStatus}
            </div>`
        )
        .on("click", (d) => showdetails_investor(d))
        .on("mouseenter", (d) => {
          l_main
            .selectAll(".dot")
            .filter((dd) => dd.InvestorID === d.InvestorID)
            .classed("highlight_sel", true)
            .each(function () {
              if (this._tippy) this._tippy.show();
            });
        })
        .on("mouseleave", (d) => {
          l_main
            .selectAll(".dot")
            .filter((dd) => dd.InvestorID === d.InvestorID)
            .classed("highlight_sel", false)
            .each(function () {
              if (this._tippy) this._tippy.hide();
            });
        });  
  }
       l_main
          .selectAll(".dot")
          .classed("highlight_sel", false)
    
       list_keywords = [];
}

const showdetails_company = d => {    
    summary_selection.style("display", "none");
    explain_text_plot.style("display", "none");
    detailed_summary_investor.style("display", "none");
    detailed_summary_company.style("display", "block");
    
    if (list_keywords.length > 0) {
        search_words_company.style("display", "block");
        document.querySelector(".search_words_com").innerHTML = "<b>Search on: </b>" + list_keywords
    }
        
    document.querySelector(".company_name").innerHTML = d.CompanyName
    document.querySelector(".keywords_company").innerHTML = "<b>Keywords: </b>" + d.Keywords
    document.querySelector(".hq_location_company").innerHTML = "<b>HQ location: </b>" + d.HQLocation
    document.querySelector(".universe").innerHTML = "<b>Universe: </b>" + d.Universe
    document.querySelector(".company_status").innerHTML = "<b>Business Status: </b>" + d.BusinessStatus
    document.querySelector(".ownership_status").innerHTML = "<b>Ownership Status: </b>" + d.OwnershipStatus
    document.querySelector(".description_company").innerHTML = "<b>Description: </b>" + d.Description
    document.querySelector(".link_website_company").href = "https://" + d.Website

}

const showdetails_investor = d => {
    summary_selection.style("display", "none");
    explain_text_plot.style("display", "none");
    detailed_summary_company.style("display", "none");
    detailed_summary_investor.style("display", "block");
    search_words_company.style("display", "none");
    
    if (list_keywords.length > 0) {
        search_words_investor.style("display", "block");
        document.querySelector(".search_words_inv").innerHTML = "<b>Search on: </b>" + list_keywords
    }
        
    document.querySelector(".investor_name").innerHTML = d.InvestorName
    document.querySelector(".hq_location_investor").innerHTML = "<b>HQ location: </b>" + d.HQLocation
    document.querySelector(".primary_investor_type").innerHTML = "<b>Primary Investor Type: </b>" + d.PrimaryInvestorType
    document.querySelector(".other_investor_types").innerHTML = "<b>Other Investor Types: </b>" + d.OtherInvestorTypes
    document.querySelector(".investor_status").innerHTML = "<b>Investor Status: </b>" + d.InvestorStatus
    document.querySelector(".description_investor").innerHTML = "<b>Description: </b>" + d.Description
    document.querySelector(".link_website_investor").href = "https://" + d.Website
}

const filter_companies = () => {
    if (size_company === 'small') {
          displayed_companies = all_companies.filter(function(d){ 
              return d.ActiveInvestors <= 1
          })
      }
      
    if (size_company === 'medium') {
          displayed_companies = all_companies.filter(function(d){ 
              return d.ActiveInvestors > 1 & d.ActiveInvestors < 5
          })
    }

    if (size_company === 'large') {
          displayed_companies = all_companies.filter(function(d){ 
              return d.ActiveInvestors >= 5
          })
    }
    
    if (hq_region === 'America') {
        displayed_companies = displayed_companies.filter(function(d){  
              return d.HQGlobalRegion == 'Americas'
          })
    }
    
    if (hq_region === 'Europe') {
        displayed_companies = displayed_companies.filter(function(d){  
              return d.HQGlobalRegion == 'Europe'
          })
    }
    
    if (hq_region === 'Asia') {
        displayed_companies = displayed_companies.filter(function(d){  
              return d.HQGlobalRegion == 'Asia'
          })
    }
    
    if (hq_region === 'Middle East') {
        displayed_companies = displayed_companies.filter(function(d){  
              return d.HQGlobalRegion == 'Middle East'
          })
    }
    
    if (hq_region === 'Oceania') {
        displayed_companies = displayed_companies.filter(function(d){  
              return d.HQGlobalRegion == 'Oceania'
          })
    }
    
    if (hq_region === 'Africa') {
        displayed_companies = displayed_companies.filter(function(d){  
              return d.HQGlobalRegion == 'Africa'
          })
    }
        
    
    return displayed_companies
}

const filter_investors = () => {
    if (size_company === 'small') {
          displayed_investors = all_investors.filter(function(d){ 
              return d.TotalInvestments <= 10
          })
      }
      
    if (size_company === 'medium') {
          displayed_investors = all_investors.filter(function(d){ 
              return d.TotalInvestments > 10 & d.TotalInvestments < 50
          })
    }

    if (size_company === 'large') {
          displayed_investors = all_investors.filter(function(d){ 
              return d.TotalInvestments >= 50
          })
    }
    
    if (hq_region === 'America') {
        displayed_investors = displayed_investors.filter(function(d){  
              return d.HQGlobalRegion == 'Americas'
          })
    }
    
    if (hq_region === 'Europe') {
        displayed_investors = displayed_investors.filter(function(d){  
              return d.HQGlobalRegion == 'Europe'
          })
    }
    
    if (hq_region === 'Asia') {
        displayed_investors = displayed_investors.filter(function(d){  
              return d.HQGlobalRegion == 'Asia'
          })
    }
    
    if (hq_region === 'Middle East') {
        displayed_investors = displayed_investors.filter(function(d){  
              return d.HQGlobalRegion == 'Middle East'
          })
    }
    
    if (hq_region === 'Oceania') {
        displayed_investors = displayed_investors.filter(function(d){  
              return d.HQGlobalRegion == 'Oceania'
          })
    }
    
    if (hq_region === 'Africa') {
        displayed_investors = displayed_investors.filter(function(d){  
              return d.HQGlobalRegion == 'Africa'
          })
    }
    
    
    return displayed_investors
}

const updateVis = () => {    
      if (display_nodes == 'companies') {
          xS.domain(d3.extent(com_projection.map((c) => c.Embedding[0])));
          yS.domain(d3.extent(com_projection.map((c) => c.Embedding[1])));
          
          displayed_companies = filter_companies()
          name = 'CompanyName'
          displayed_nodes = displayed_companies
      }
          
      else {
          xS.domain(d3.extent(inv_projection.map((c) => c.Embedding[0])));
          yS.domain(d3.extent(inv_projection.map((c) => c.Embedding[1])));
          
          displayed_investors = filter_investors()
          name = 'InvestorName'
          displayed_nodes = displayed_investors
      }
          
      const [pW, pH] = plot_size();

      plot.attr("width", pW).attr("height", pH);
      d3.select("#table_info").style("height", `${pH}px`);

      xS.range([sizes.margins.l, pW - sizes.margins.r]);
      yS.range([sizes.margins.t, pH - sizes.margins.b]);

      brush.extent([
        [0, 0],
        [pW, pH],
      ]);
      l_bg.call(brush);

      all_pos = displayed_nodes.map((d) => {
        const r2 = d.is_selected ? 8 : 4;
        const [x, y] = [xS(d.pos[0]), yS(d.pos[1])];
        return new cola.Rectangle(x - r2, x + r2, y - r2, y + r2);
      });
       

      cola.removeOverlaps(all_pos);

      l_main
        .selectAll(".dot")
        .data(displayed_nodes, (d) => d[name])
        .join("circle")
        .attr("class", "dot")
        .attr("r", (d) => (d.is_selected ? 8 : 6))
        .attr('transform', (d, i) => {
          const pos = [all_pos[i].cx(), all_pos[i].cy()];
          d.posCola = pos;
          return `translate(${pos.join(',')})`;
        })
        .classed("highlight", (d) => d.is_selected)
        .on("click", function (d) {
          if (display_nodes == 'companies') {
              showdetails_company(d);
          }
          else {
              showdetails_investor(d);
          } 
          d3.select(this).classed("read", true);
        });
    
      currentTippy = tippy(".dot", {
        onShow(instance) {
          const d = d3.select(instance.reference).datum();
          if (display_nodes == 'companies') {
              instance.setContent(tooltip_template_company(d));
          }
          else {
              instance.setContent(tooltip_template_investor(d));
          } 
          
        },
        allowHTML: true,
      });
};

const tooltip_template_company = (d) => `
    <div>
        <div class="tt-title">${d.CompanyName}</div>
        <p>HQ Location: ${d.HQLocation} <br /> 
           Universe: ${d.Universe} <br /> 
           Business Status: ${d.BusinessStatus}</p></div>   
`;

const tooltip_template_investor = (d) => `
    <div>
        <div class="tt-title">${d.InvestorName}</div>
        <p>HQ Location: ${d.HQLocation} <br /> 
           Primary Investor Type: ${d.PrimaryInvestorType} <br /> 
           Investor Status: ${d.InvestorStatus}</p></div>   
`;

const start = () => {
  API.getCompaniesAndProjection()
    .then(([companies, com_proj]) => {
      
      const Com_projMap = new Map();
      com_proj.forEach((c) => Com_projMap.set(c.CompanyID, c.Embedding));

      companies.forEach((c) => {
        c.pos = Com_projMap.get(c.CompanyID);
      });

      all_companies = companies;
      com_projection = com_proj;

      updateVis();
    })
    .catch((e) => console.error(e));
    
  API.getInvestorsAndProjection()
    .then(([investors, inv_proj]) => {
      
      const Inv_projMap = new Map();
      inv_proj.forEach((i) => Inv_projMap.set(i.InvestorID, i.Embedding));

      investors.forEach((i) => {
        i.pos = Inv_projMap.get(i.InvestorID);
      });

      all_investors = investors;
      inv_projection = inv_proj
      
    })
    .catch((e) => console.error(e));

  brush = d3
    .brush()
    .on("start", brush_start)
    .on("brush", brushed)
    .on("end", brush_ended);
};

/**
 *  EVENTS
 * */
const updateFilterDisplayBtn = (value) => {
  d3.selectAll(".display_type label").classed("active", function () {
    const v = d3.select(this).select("input").property("value");
    return v === value;
  });
};

d3.selectAll(".display_type input").on("click", function () {
  const me = d3.select(this);

  const filter_size = me.property("value");
    
  updateFilterDisplayBtn(filter_size);
  display_nodes = filter_size

  updateVis();
});


const updateFilterSizeBtn = (value) => {
  d3.selectAll(".filter_size label").classed("active", function () {
    const v = d3.select(this).select("input").property("value");
    return v === value;
  });
};

d3.selectAll(".filter_size input").on("click", function () {
  const me = d3.select(this);

  const filter_size = me.property("value");
   
  updateFilterSizeBtn(filter_size);
  size_company = filter_size

  updateVis();
});

const updateFilterRegionBtn = (value) => {
  d3.selectAll(".filter_region label").classed("active", function () {
    const v = d3.select(this).select("input").property("value");
    return v === value;
  });
};

d3.selectAll(".filter_region input").on("click", function () {
  const me = d3.select(this);

  const filter_region = me.property("value");
   
  updateFilterRegionBtn(filter_region);
  hq_region = filter_region

  updateVis();
});

$(window).on("resize", _.debounce(updateVis, 150));