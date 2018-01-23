/*
 * Copyright (C) Zoomdata, Inc. 2012-2017. All rights reserved.
 */

/*
 * Sample Imported Chart
 *
 * This sample builds on chartImportedFromGoogle-2-of-1.
 *
 * The sample:
 *    1. Shows adding an additional selectable label to pick an
 *       additional chart variable, in this casem Metric.
 *    2. Shows using data accessors to identify group and metric
 *       currently selected.
 *    3. Shows using currently selected group and metric to populate
 *       data, whereas sample chartImportedFromGoogle-2-of-2 doesn't
 *       allow the user to select a metric variable.
 *    4. Use of data accessors to identify colors selected in the app or
 *       by API and use them for the chart
 * 
 * Dependencies: loader.js, available from Google and linked in original sample
 * Source of imported chart: https://google-developers.appspot.com/chart/interactive/docs/gallery/piechart
 * 
 */

// Works with Grouped variables (remove if using UnGrouped)
// Provides the metadata that Zoomdata app needs to render selectable
// labels. These labels appear only in the Zoomdata application. They
// do not appear if the chart is embedded in a custom application.

controller.createAxisLabel({
    picks: 'Group By', // Variable Name
    orientation: 'horizontal',
    position: 'bottom',
    popoverTitle: 'Group'
});

controller.createAxisLabel({
    picks: 'Metric', // Variable Name
    orientation: 'horizontal',
    position: 'bottom',
    popoverTitle: 'Metric'
});

// controller.element stores the element where Zoomdata will
// render the chart. controller.element should be treated as read-only.

console.log(controller.element);


// Google Charts loads specific chart packages at runtime.
// This approach causes an issue of asynchronicity which we solve below
// and in the controller.update() method.

var googleLoaded = false;
google.charts.load('current', {'packages':['corechart']});

google.charts.setOnLoadCallback( function() {
    googleLoaded = true;
});


// Global variables to store current data and progress so that
// we can access them in the event of a controller.resize() call.

var resizeData, resizeProgress;

// Zoomdata calls this method whenever new data becomes available.
// We will use it to transform our Zoomdata-provided data into the
// format wanted by the Google charts and then to call the Google
// chart rendering methods.

controller.update = function(data, progress) {

    // Stop update if Google chart package hasn't finished loading yet.
    if (!googleLoaded) return;
    
    // Store current data and progress in the event of a resize
    resizeData = data;
    resizeProgress = progress;

    // Reshape our data to fit the format that Google charts wants:
    // two columns - one for the pie slices and one for the slice data
    var dataForGoogleChart = [];
    dataForGoogleChart.push(["wedge","quantity"]);

    // Identify the chart variable used for grouping
    var groupsList = controller.dataAccessors.getDimensionAccessors();
    var theGroup;
    for (var group in groupsList[0]) {
        theGroup = group;
    }
    var groupAccessor = controller.dataAccessors[theGroup];
    
    // Identify the chart variable used for metric value
    var metricsList = controller.dataAccessors.getMetricAccessors();
    var theMetric;
    for (var metric in metricsList[0]) {
        theMetric = metric;
    }
    var metricAccessor = controller.dataAccessors[theMetric];
    
    // Build from our data the table that the Google chart library expects 
    data.forEach( function(datum) {
        var metricName;
        var groupName = groupAccessor.raw(datum);
        
        // Google charts don't convert null value to string, so we must        
        var row = [
                    groupName !== null ? groupName : "null / unknown",
                    metricAccessor.raw(datum)
        ];
        dataForGoogleChart.push(row);
    });
    
    // Feed our reshaped data to Google's transform to get Google's
    // internal format
    var googledData = google.visualization.arrayToDataTable(dataForGoogleChart);
        
    // Identify our currently selected color accessor; we happen to know
    // that it's the group accessor, but that is not necessarily true.
    var theDataAccessors = controller.dataAccessors;
    var theColorAccessor;
    for (var accessor in theDataAccessors) {
        if (controller.dataAccessors[accessor].isColor) {
            theColorAccessor = controller.dataAccessors[accessor];
        }
    }

    // Set our Google chart formatting options
    var options = {
        // use the color set selected by the user
        colors: theColorAccessor.getColorRange(),
        pieSliceTextStyle: {
            color: 'black',
        }
    };    

    // Create the chart    
    var theGoogleChart = new google.visualization.PieChart(controller.element);

    // Render the chart
    theGoogleChart.draw(googledData, options);
};

// Called when the widget is resized
controller.resize = function(width, height, size) {
    
    // use the global variables to reload the same existing data
    controller.update(resizeData, resizeProgress);
};