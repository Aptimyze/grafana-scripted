/* global _ */

/*
 * Complex scripted dashboard
 * This script generates a dashboard object that Grafana can load. It also takes a number of user
 * supplied URL parameters (in the ARGS variable)
 *
 * Return a dashboard object, or a function
 *
 * For async scripts, return a function, this function must take a single callback function as argument,
 * call this callback function with the dashboard object (look at scripted_async.js for an example)
 */

'use strict';

// accessible variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;
let json = require('./applications.json');
var myObj = JSON.stringify(json);
/*
var myObj = {
"business": [
  {
    "name": "Business1",
    "apps": [
      {
        "name": "BUS1-APP1",
        "envs": [
          {
            "name": "BUS1-APP1-ENV1"
          },
          {
            "name": "BUS1-APP1-ENV2"
          },
          {
            "name": "BUS1-APP1-ENV3"
          }
        ]
      },
      {
        "name": "BUS1-APP2",
        "envs": [
          {
            "name": "BUS1-APP2-ENV1"
          },
          {
            "name": "BUS1-APP2-ENV2"
          },
          {
            "name": "BUS1-APP2-ENV3"
          }
        ]       
      }
    ]
  }
]
}
*/

/*
var host_regex = ".*";
var client_name = "";

// Grab host name from url param
if(!_.isUndefined(ARGS.host)) {
  host_regex = ARGS.host;
  console.log("Set host regex to "+host_regex);  
}
// Grab full 'human readable' client name from url param
if(!_.isUndefined(ARGS.client)) {
  client_name = ARGS.client;
  console.log("Set host regex to "+host_regex);  
}
var host_re = new RegExp(host_regex);
*/
/*
   make_panel
      Return a panel with the hostname
      populated in strategic places

*/
/*

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.response);
        }
    }
    rawFile.send(null);
}

//usage:

function init(){
   readTextFile("applications.json", function(text){
    var myObj = JSON.parse(text);
    
    
});
}
*/

function make_panel (env,business,app) {
return {
    title: env,
    type: 'singlestat',
    thresholds: '0.1,4.9',
    height: '5px',
    colorBackground: true,
    colorValue: false,
    colors: ['#299c46','rgba(237, 129, 40, 0.89)','#d44a3a'],
    datasource: 'default',
    maxDataPoints: 1,
    valueFontSize: "50%",
    format: "none",
    gauge: {
      maxValue: 100,
      minValue: 0,
      show: false,
      thresholdLabels: false,
      thresholdMarkers: false
    },
    targets: [
      {
        application: {
          filter: ''
        },
        functions: [],
        group: {
          filter: ''
        },
        host: {
          filter: ''
        },
        itServiceFilter: business + '/' + app + '/' + env,
        item: {
          filter: ''
        },
        mode: 1,
        options: {
          showDisabledItems: false
        },
        refId: 'A',
        slaProperty: {
          name: 'Status',
          property: 'status'
        },
        triggers: {
          acknowledged: 2,
          count: true,
          minSeverity: 3
        }
      }
    ]
  }

}


function make_row(name) {
  return {
    title: name,    
    height: '200px',
    showTitle: true,
    panels: [],
  }
}



return function(callback) {
   // Setup some variables
   var dashboard;



   // Intialize a skeleton with some deisred defaults and an empty rows array
   dashboard = {
      rows : [],
   };

   var app_row = {};
   // Set a title
   dashboard.title = 'Scripted Templated dashboard';

   // Set default time
   // time can be overriden in the url using from/to parameters, but this is
   // handled automatically in grafana core during dashboard initialization
   dashboard.time = {
     from: "now-7d",     // Last 7 days
     to: "now"
   };

   var rows = 1;


   // Send the query
   $.ajax({
     method: 'GET',
     url: '/'
   })
   // When the query returns, it sends back JSON which is
   // automatically parsed by the ajax code.
    .done(function(resp) {
      
    for (var i in myObj.business[0].apps){
      var new_panels = [];
      var app_row = make_row(myObj.business[0].apps[i].name);
    
      for (var j in myObj.business[0].apps[i].envs){
        new_panels.push(make_panel(myObj.business[0].apps[i].envs[j].name,myObj.business[0].name,myObj.business[0].apps[i].name));        
      }

      app_row.panels = new_panels;
      dashboard.rows.push(app_row); 
          
    }

      // when dashboard is composed call the callback
      // function and pass the dashboard      
      callback(dashboard);
  });
}
