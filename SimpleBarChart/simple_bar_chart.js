/*
 * Copyright (C) Zoomdata, Inc. 2012-2018. All rights reserved.
 */
/* global controller */

// Create Chart Container
var chartContainer = d3.select(controller.element)
    .append('div')
    .attr('class', 'chart-container')
    .style('width', '100%')
    .style('height', '100%')
    .node();

// initialize the chart and associate it with a variable.    
var chart = echarts3.init(chartContainer);  

// These parameters set the basic configuration for the ECharts chart.
// We won't update these parameters when new data arrives.
var option = {
    grid: {
        top: '1%',
        left: '1%',
        right: '1%',
        bottom: '7%',
        containLabel: true
    },
    xAxis: {},
    yAxis: {},
    series: [
        {
            type: 'bar'
        }
    ]
};
  
// Data 

console.log("controller: ", controller);
var groupAccessor = controller.dataAccessors['Group By'];
var metricAccessor = controller.dataAccessors['Metric'];

// Zoomdata calls this method whenever new data is available for the chart.
// * data - an array of data items
// * progress - is a number from 0-100 indicating the percent completion
// of data transmission
controller.update = function(data, progress) {
    console.log("data: ", data);
    // Receiving Data
    chart.setOption(
        {
            xAxis: {
                type: 'category',
                data: categoryAxisData(data),
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    type: 'bar',
                    data: valueAxisData(data)
                }
            ]
        }
    );
    
};

// ECharts's event handler is used to call controller.menu's show method
chart.on('click', function(param) {
    controller.menu.show(
        {
            event: param.event.event,
            data: function() {
                return param.data.model;
            }
        }
    );
});

// ECharts's event handler is used to call controller.tooltip's show method
chart.on('mousemove', function(param) {
    controller.tooltip.show(
        {
            event: param.event.event,
            data: function() {
                return param.data.model;
            },
            color: function() {
                return param.color;
            }
        }
    );
});

// ECharts's event handler is used to call controller.tooltip's hide method
chart.on('mouseout', function(param) {
    controller.tooltip.hide();
});

// new height and width are passed to controller.resize when the DOM
// element changes size
controller.resize = function(newWidth, newHeight) {
    chart.resize();
};

// we create this method to repackage data provided by Zoomdata into
// a format that ECharts expects
function categoryAxisData(data) {
    return data.map(function(d) {
        return groupAccessor.raw(d);
    });
}

// we create this method to repackage data provided by Zoomdata into
// a format that ECharts expects
function valueAxisData(data) {
    return data.map(function(d) {
        return {
            name: groupAccessor.raw(d),
            value: metricAccessor.raw(d),
            model: d
        };
    });
}

// Group and Metric Pickers
controller.createAxisLabel(
    {
        picks: 'Group By',
        position: 'bottom',
        orientation: 'horizontal',
        popoverTitle: 'Attribute'
    }
);

controller.createAxisLabel(
    {
        picks: 'Metric',
        position: 'left',
        orientation: 'vertical',
        popoverTitle: 'Metric'
    }
);