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
var myObj;

$.getJSON('https://raw.githubusercontent.com/deshike22/grafana-scripted/master/applications.json', function(result) {
	console.log(result);
});
console.log(result.business[0].name);

var business_name = "Business1";
// Grab business name from url param
if(!_.isUndefined(ARGS.business)) {
   business_name = ARGS.business;
//   console.log("Set business name to " + business_name);  
}
var index = myObj.business.findIndex(obj => obj.name==business_name);


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
      rows : []
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
  

    for (var i in myObj.business[index].apps){
      var new_panels = [];
      var app_row = make_row(myObj.business[index].apps[i].name);
    
      for (var j in myObj.business[index].apps[i].envs){
        new_panels.push(make_panel(myObj.business[index].apps[i].envs[j].name,myObj.business[index].name,myObj.business[index].apps[i].name));        
      }

      app_row.panels = new_panels;
      dashboard.rows.push(app_row); 
          
    }


      // when dashboard is composed call the callback
      // function and pass the dashboard      
      callback(dashboard);
  });
}
