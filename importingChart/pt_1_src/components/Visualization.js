/*
 * Copyright (C) Zoomdata, Inc. 2012-2017. All rights reserved.
 */

/*
 * Sample Imported Chart
 *
 * This sample shows the importation of a chart from an third-party
 * library. In this case, the chart come from Google Charts. This sample
 * the first of two (1 of 2).
 *
 * The sample illustrates:
 *    1. Data transformation from the format provided
 *       by Zoomdata to the controller.update() method to
 *       the format expected by the Google chart
 *    2. The use of controller.update() to invoke chart
 *       rendering rather than using the trigger expected
 *       by the third party library
 *    3. The use of controller.element to identify the designated
 *       DOM element for rendering
 *    4. Simple handling of an asynchronicity problem that arises
 *       because the Google chart library loads at runtime
 *    5. Simple handling of DOM element resizing
 * 
 * Dependencies: loader.js, available from Google and linked in original sample
 * Source of imported chart: https://google-developers.appspot.com/chart/interactive/docs/gallery/piechart
 * 
 * The second sample will show the use of color dataAccessors to
 * coordinate colors based on user selections.
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
    
    data.forEach( function(datum) {
        var row = [datum.group[0],datum.current.count];
        dataForGoogleChart.push(row);
    });
    
    // Feed our reshaped data to Google's transform to get Google's
    // internal format

    var googledData = google.visualization.arrayToDataTable(dataForGoogleChart);
    
    // Set our Google chart formatting options

    var options = {
        colors: ['red','green','blue'],
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
