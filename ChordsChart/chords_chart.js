/*
 * Copyright (C) Zoomdata, Inc. 2012-2018. All rights reserved.
 */
/* Chords Chart */

/** README
 * 
 * The chords chart accepts a data source that:
 *  - is square
 *  - first column lists attribute name and items (ex. "Origin")
 *  - first row of each other column is the name of the recipient/destination 
 *  - each other column lists the relationship of each item to another item
 *      (ex. as number of migrants to a destination)
 *  - items of attribute (first column) must match the names of metrics in
 *      spelling and order (all following columns, the name of each
 *      filling the first row)
 * 
 * Origin   Md  DC  Va
 * Md       0   50  10
 * DC       100 0   10       
 * Va       200 50  0
 * 
 * In item and metric names, spaces and dashes are converted to underscores
 * All capitals are reduced to lower case for computation (but not presentation)
 * purposes, so your data cannot have both "Maryland" and "maryland" as attributes.
 * 
 * The visualization must be configured with two variables in the Zoomdata
 * Chart Studio environment:
 *  - "Group By", type = group, group type = attribute
 *  - "Metrics", type = multi-metric, metric type = general, color attribute selected
 * After configuring the variables, you must configure each data source that
 * will use the chart to do so:
 * 1. Navigate to Settings > Sources > [Your Source] > Charts
 * 2. Select Custom > [The Chords Chart]
 * 3. Select all relevant variables
 * 4. Select Save.
 * 
 * 
 * Interpret the chart:
 *  Each item is connected to all the others by chords. Each chord has
 *  two ends: one end touches each of the two items that it connects. The width
 *  of the base indicates the strength or volume of that item's relationship to
 *  the item on the other end of the chord.
 * 
 *  Ex:
 *      A chord might connect two businesses: Acme Co. and Imperial Co. If the
 *      chord has a wide base on Acme's end, that might mean that Acme gives a
 *      buys a lot of widgets from Imperial. If Imperial's end of the arc is
 *      thin, that would mean that Imperial doesn't buy many cogs from Acme.
 * 
 **/

    /*---------------------------------------*/
    /*-------- Initial global setup ---------*/
    /*---------------------------------------*/
    

var groupAccessors = controller['dataAccessors']['Group By'];

controller.createAxisLabel({
    picks: 'Group By',
    orientation: 'horizontal',
    position: 'bottom',
    popoverTitle: 'Group'
});

// controller.element is populated by Zoomdata with
// whichever HTML element will hold the visualization.
// In the client studio, this value is '#widgetBody'.
// In embedded contexts, this value is populated on the value
// provided to visualize()'s {element: } key
var widgetContent = d3.select(controller.element);

var width = $(controller.element).width();
    height = $(controller.element).height();

var innerRadius = Math.min(width, height) * .31,
    outerRadius = innerRadius * 1.1;

var colors = groupAccessors.getColorRange('active');

var fill = d3.scale.ordinal()
    .domain(d3.range(4))
    .range(colors);

// Size and location of the SVG element that will hold the
// chord diagram within controller.element
var svg = widgetContent.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var datas = [];


    /*---------------------------------------*/
    /*-------- Render the chord chart -------*/
    /*---------------------------------------*/

function drawDiagram() {

    /*---------------------------------------*/
    /*-------- Load datas into matrix -------*/
    /*-------- expected by D3 ---------------*/
    /*---------------------------------------*/
    
    var tableOfData = [];
    var currentResidenceList = [];

    // Get list of attribute items from the first column of each row    
    datas.forEach( function(groupPacket) {
       currentResidenceList.push(groupPacket["group"][0]) 
    });

    // Regularize item names to make them match standard data source format
    var newStates = [];
   
    // First, replace spaces and dashes with underscores
    currentResidenceList.forEach( function(stateName) {
        var newName = stateName.replaceAll(" ", "_");
        newName = newName.replaceAll("-", "_");
        newStates.push(newName); 
    });

    // then make them all lowercase
    var lowerCaseStates = newStates.map(function(state) {
        return state.toLowerCase(); 
    });
    
    // now use list of items to gather metric values from datas and
    // produce a matrix
    datas.forEach( function(origin) {
        var stateRow = [];
        
        lowerCaseStates.forEach( function(stateName) {
            stateRow.push(origin["current"]["metrics"][stateName]["sum"]);
        });

        tableOfData.push(stateRow);

    });
    
    /*----------------------------------*/
    /*-------- Remove old diagram ------*/
    /*----------------------------------*/

    svg.selectAll("*").remove();

    /*----------------------------------*/
    /*-------- Build new diagram -------*/
    /*----------------------------------*/

    var chord = d3.layout.chord()
        .padding(.01)
        .sortSubgroups(d3.descending)
        .matrix(tableOfData);

    // build the circle edge
            
    colors = groupAccessors.getColorRange('active');
    
    var fill = d3.scale.ordinal()
    .domain(d3.range(4))
    .range(colors);
    
    svg.append("g").selectAll("path")
        .data(chord.groups)
        .enter().append("path")
        .style("fill", function(d) { return fill(d.index); })
        .style("stroke", function(d) { return fill(d.index); })
        .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
        .on("mouseover", fade(.05))
        .on("mouseout", fade(1));

    // determine position of labels
    var ticks = svg.append("g").selectAll("g")
        .data(chord.groups)
        .enter().append("g").selectAll("g")
        .data(groupTicks)
        .enter().append("g")
        .attr("transform", function(d) {
            var rotation = (d.angle) * 180 / Math.PI - 90;
            return "rotate(" + rotation + ")"
                    + "translate(" + outerRadius + ",0)";
        });
    
    // define label text
    ticks.append("text")
        .attr("x", 8)
        .attr("dy", ".35em")
        .text( function(d) { return d.label; } );
    
            //return 100; });
    
    // create chords
    svg.append("g")
        .attr("class", "chord")
        .selectAll("path")
        .data(chord.chords)
        .enter().append("path")
        .attr("d", d3.svg.chord().radius(innerRadius))
        .style("fill", function(d) { return fill(d.target.index); })
        .style("opacity", 1);
    
    
    // Returns an array of tick angles and labels, given a group.
    function groupTicks(d) {
    
      var retval = d3.range(0, d.value, 100000).map(function(v, i) {
        return {
          angle: ((d.endAngle - d.startAngle)/2) + d.startAngle,
          label: currentResidenceList[d.index]  //listOfStates
        };
      });
      
      return retval;
    }
    
    // Returns an event handler for fading a given chord group.
    function fade(opacity) {
        
      return function(g, i) {
        svg.selectAll(".chord path")
            .filter(function(d) { return d.source.index != i && d.target.index != i; })
            .transition()
            .style("opacity", opacity);
      };
    }

}


    /*---------------------------------------*/
    /*-------- Called upon data update ------*/
    /*---------------------------------------*/

controller.update = function(data, progress) {
    //load new data into the datas object
    datas = data;
    
    //render the diagram again
    drawDiagram();
};


    /*---------------------------------------*/
    /*-- Called upon resizing of container --*/
    /*---------------------------------------*/

controller.resize = function(w, h, size) {
    //set global width and height
    width = w;
    height = h;
    
    //recalculate new radii    
    innerRadius = Math.min(width, height) * .31,
    outerRadius = innerRadius * 1.1;
    
    //set new visualization center point
    svg = svg.attr("transform", "translate(" + width/2 + "," + height/2 + ")");

    //render the diagram again
    drawDiagram();
};
