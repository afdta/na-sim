//main file

import {vega_build, vega_theme} from './vega-build.js';
import { select, selectAll, format } from 'd3';

//vega specification
let vspec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "Basic Economic Trends by State",
    "autosize": "fit-x",
    "width": 900,
    "padding": 15,
  
    "signals": [
        {
            "name":"selected_state",
            "value": "United States"
        },
        {
            "name":"panel_height",
            "value": 200
        },
        {
            "name": "container_width",
            "update": "containerSize()[0]",
            "on": [
                {
                    "events": {"source": "window", "type": "resize"},
                    "update": "containerSize()[0]"
                }
            ]
        },
        {
            "name": "window_width",
            "update": "windowSize()[0]",
            "on": [
                {
                    "events": {"source": "window", "type": "resize"},
                    "update": "windowSize()[0]"
                }
            ]
        },
        {
            "name":"width",
            "update": "container_width"
        },
    ],

    "layout":{ "columns": 1, "padding": {"row": 40, "column": 0}},
  
    "data": [
      {
        "name": "table_all",
        "url": "assets/bea-data.json"
      },
      {
        "name": "table",
        "source": "table_all",
        "transform": [
          {
            "type": "filter",
            "expr": "datum.geo == selected_state"
          }
        ]
      }
    ],
  
    "scales": [
      {
        "name": "x",
        "type": "point",
        "range": "width",
        "domain": {"data": "table", "field": "year"}
      },
    ],
  
    "marks": [
      {
        "type": "group",
        "from": {
          "facet": {
            "name": "series",
            "data": "table",
            "groupby": "varlabel"
          }
        },
        "scales": [
            {
                "name": "y",
                "type": "linear",
                "range": [{"signal": "panel_height"}, 0],
                "nice": true,
                "zero": false,
                "domain": {"data": "series", "field": "value"}
            }
        ],
        "encode":{
            "update":{
                "height": {"signal": "panel_height"}
            }   
        },
        "axes": [
            {"orient": "bottom", "scale": "x"},
            {"orient": "left", "scale": "y", "tickCount": 4, "grid": true}
          ],
        "marks": [
          {
            "type":"text",
            "encode":{
                "update":{
                    "x":{"value": 10},
                    "y":{"value": -10},
                    "fontSize":{"value": 16},
                    "fontWeight":{"value": "bold"},
                    "text":{"signal":"data('series')[0].varlabel + ': ' + data('series')[0].geo"},
                }
            }
          },
          {
            "type": "line",
            "from": {"data": "series"},
            "encode": {
              "update": {
                "x": {"scale": "x", "field": "year"},
                "y": {"scale": "y", "field": "value"},
                "stroke": {"value":"#2e96bf"},
                "defined": {"signal": "datum.value != null"},
                "strokeWidth": {"value": 2}
              }
            }
          },
            {
                "type": "symbol",
                "from": {"data": "series"},
                "encode": {
                  "update": {
                    "x": {"scale": "x", "field": "year"},
                    "y": {"scale": "y", "field": "value"},
                    "stroke": {"value":"#2e96bf"},
                    "strokeWidth": {"value": 2},
                    "fill": {"value":"#ffffff"},
                    "shape": {"value": "circle"},
                    "size": [
                        {"test":"datum.value == null", "value":0},
                        {"value": 100}
                    ],
                    "tooltip": [
                        {"test":"datum.value == null", "value":null},
                        {"signal":"[datum.varlabel, datum.value]"}
                    ]
                  },
                  "hover": {
                    "stroke": {"value": "orange"},
                    "fill": {"value": "orange"}
                  }
                }     
            }
        ]
      }
    ]
  }

window.addEventListener("DOMContentLoaded", function(){
    
    let V = vega_build({spec: vspec, container:"#na-sim"});
    let ttip = select(V.dom().tooltip);
    V.mouseover((vals) => {
        let f0 = format(",.0f");
        let f = (v) => {return v == null ? "N/A" : f0(v)};
        let label = vals[0].replace(/\(/, "<br>(");
        let h = "<p>" + label + "</p>" + "<p>" + f(vals[1]) + "</p>";
        ttip.html("<p>" + h + "</p>");
    });

    let dropdown = select("#na-control").append("select");
    let states = ["United States","Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
    let default_state = states[Math.floor(Math.random() * states.length)];

    dropdown.selectAll("option").data(states).join("option").attr("value", d=>d).text(d=>d).property("selected", d=>d==default_state);

    //initialize default state
    V.signal("selected_state", default_state);

    dropdown.on("change", function(){
        V.signal("selected_state", this.value);
    });

});

