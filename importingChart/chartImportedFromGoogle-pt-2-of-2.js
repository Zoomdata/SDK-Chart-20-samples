

controller.createAxisLabel({
    picks: 'Group By', // Variable Name
    orientation: 'horizontal',
    position: 'bottom',
    popoverTitle: 'Group'
});

// Add an additional picker label so that users can pick a metric
// rather than using a hardcoded one.
controller.createAxisLabel({
    picks: 'Metric', // Variable Name
    orientation: 'horizontal',
    position: 'bottom',
    popoverTitle: 'Metric'
});

console.log(controller.element);

var googleLoaded = false;
google.charts.load('current', {'packages':['corechart']});

google.charts.setOnLoadCallback( function() {
    googleLoaded = true;
});


// global variables to store last data and progress values
// between update() calls.
var resizeData, resizeProgress;

controller.update = function(data, progress) {

    if (!googleLoaded) {return;}
    
    resizeData = data;
    resizeProgress = progress;

    var dataForGoogleChart = [];
    dataForGoogleChart.push(["wedge","quantity"]);
    
    var colorList = [];
    
    data.forEach( function(datum) {

        // get the data packet's dimension accessor
        // dimensions is the new name for groups in the Zoomdata JS client library
        // but don't worry - 'groups' still works
        var dimensionAccessors = controller.dataAccessors.getDimensionAccessors()[0];
        var selectedDimension = dimensionAccessors[ Object.keys(dimensionAccessors)[0] ];

        // get the data packet's metric accessor
        var metricAccessors = controller.dataAccessors.getMetricAccessors()[0];
        var selectedMetric = metricAccessors[ Object.keys(metricAccessors)[0]];

        // in each row:
        //    first item is always the pie wedge
        //    second item is the metric's value
        var row = [selectedDimension.raw(datum), selectedMetric.raw(datum)];
        // handle nulls in the data because Google Charts doesn't like that
        if (row[0] === null) {row[0]="Null";}
        if (row[1] === null) {row[1]="Null";}

        // at the row of curated data to the data table
        // that we will give to Google
        dataForGoogleChart.push(row);

        // Google's chart wants the colors passed as a single list
        // so we'll build that as we build the data table
        colorList.push(selectedDimension.color(datum));
    });
    
    var googledData = google.visualization.arrayToDataTable(dataForGoogleChart);
    
    // rather than hard coding colors, we'll use the list of colors
    // that we built while building the table of values.
    // Zoomdata picks the colors based on the color settings selected.
    // Colors are selected via UI in the app or via API in an embedded setting.
    var options = {
        colors: colorList,
        pieSliceTextStyle: {
            color: 'black',
        }
    };    
    
    var theGoogleChart = new google.visualization.PieChart(controller.element);

    theGoogleChart.draw(googledData, options);
};

controller.resize = function(width, height, size) {
    // Called when the widget is resized
    
    controller.update(resizeData, resizeProgress);
};
