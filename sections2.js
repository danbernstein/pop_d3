
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function () {
  
  var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
  };
  

  // constants to define the size
  // and margins of the vis area.
  var width = 720;
  var height = 520;
  var margin = { top: 0, left: 20, bottom: 40, right: 10 };
  

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // Sizing for the grid visualization
  var squareSize = 10;
  var squarePad = 2;
  var numPerRow = width / (squareSize + squarePad);

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // @v4 using new scale names
  var xBarScale = d3.scaleLinear()
    .range([0, width]);

  // The bar chart display is horizontal
  // so we can use an ordinal scale
  // to get width and y locations.
  // @v4 using new scale type
  var yBarScale = d3.scaleBand()
    .paddingInner(0.08)
    .domain([0, 1, 2])
    .range([0, height - 50], 0.1, 0.1);

  // Color is determined just by the index of the bars
  var barColors = { 0: '#008080', 1: '#399785', 2: '#5AAF8C' };

  // The histogram display shows the
  // first 30 minutes of data
  // so the range goes from 0 to 30
  // @v4 using new scale name
  
   var xbeeScale = d3.scaleLinear()
     .domain([20, 40])
     .range([margin.left, width -  margin.right - 10]);
     
    var xbeeAxisBar = d3.axisBottom()
      .scale(xbeeScale);
      
   var xsingleScale = d3.scaleLinear()
     .domain([1, 4])
     .range([margin.left, width -  margin.right - 10]);
     
    var xsingleAxisBar = d3.axisBottom()
      .scale(xsingleScale)
      .tickValues([1,2,3,4]);

      
    var bee_total = [[28.7, 26.9] , [29.5, 30.6]];
    

  var revxbeeScale = d3.scalePow()
    .domain([-1000, 1000])
    .range([28, 40]);

    
  var xHistScale = d3.scaleLinear()
    .domain([0, 30])
    .range([0, width - 20]);

  var xScale = d3.scaleLinear()
    .domain([0, 6])
    .range([0, width - 20]);


  // @v4 using new scale name
  var yHistScale = d3.scaleLinear()
    .range([height, 0]);

  // The color translation uses this
  // scale to convert the progress
  // through the section into a
  // color value.
  // @v4 using new scale name
  var coughColorScale = d3.scaleLinear()
    .domain([0, 1.0])
    .range(['#008080', 'red']);

  // You could probably get fancy and
  // use just one axis, modifying the
  // scale, but I will use two separate
  // ones to keep things easy.
  // @v4 using new axis name
  var xAxisBar = d3.axisBottom()
    .scale(xBarScale);

  // @v4 using new axis name
  var xAxisHist = d3.axisBottom()
    .scale(xHistScale)
    .tickFormat(function (d) { return d + ' min'; });

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function (selection) {
    selection.each(function (rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data([wordData]);
      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');


      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // perform some preprocessing on raw data
      var wordData = getWords(rawData);
      // filter to just include filler words
      var fillerWords = getFillerWords(wordData);

// total rating    
      total_control_x = d3.mean(wordData.filter(function(d) { return d.Status == "Control"}), function(d) { return d.total_rating_x}).toPrecision(3);
      
      total_treatment_x = d3.mean(wordData.filter(function(d) { return d.Status == "Treatment"}), function(d) { return d.total_rating_x}).toPrecision(3);


      total_control_y = d3.mean(wordData.filter(function(d) { return d.Status == "Control" && d.total_rating_y != "0"}), function(d) { return d.total_rating_y}).toPrecision(3);
      
      total_treatment_y = d3.mean(wordData.filter(function(d) { return d.Status == "Treatment" && d.total_rating_y != "0"}), function(d) { return d.total_rating_y}).toPrecision(3);

// Q7
      q7_control_x = d3.mean(wordData.filter(function(d) { return d.Status == "Control"}), function(d) { return d.Q7Rating_x}).toPrecision(3);
      
      q7_treatment_x = d3.mean(wordData.filter(function(d) { return d.Status == "Treatment"}), function(d) { return d.Q7Rating_x}).toPrecision(3);


      q7_control_y = d3.mean(wordData.filter(function(d) { return d.Status == "Control" && d.Q7Rating_y != "0"}), function(d) { return d.Q7Rating_y}).toPrecision(3);
      
      q7_treatment_y = d3.mean(wordData.filter(function(d) { return d.Status == "Treatment" && d.Q7Rating_y != "0"}), function(d) { return d.Q7Rating_y}).toPrecision(3);

// Q1
      q1_control_x = d3.mean(wordData.filter(function(d) { return d.Status == "Control"}), function(d) { return d.Q1Rating_x}).toPrecision(3);
      
      q1_treatment_x = d3.mean(wordData.filter(function(d) { return d.Status == "Treatment"}), function(d) { return d.Q1Rating_x}).toPrecision(3);

      q1_control_y = d3.mean(wordData.filter(function(d) { return d.Status == "Control" && d.Q1Rating_y != "0"}), function(d) { return d.Q1Rating_y}).toPrecision(3);
      
      q1_treatment_y = d3.mean(wordData.filter(function(d) { return d.Status == "Treatment" && d.Q1Rating_y != "0"}), function(d) { return d.Q1Rating_y}).toPrecision(3);



      // get the counts of filler words for the
      // bar chart display
      var fillerCounts = groupByWord(fillerWords);
      // set the bar scale's domain
      var countMax = d3.max(fillerCounts, function (d) { return d.value;});
      xBarScale.domain([0, countMax]);

      // get aggregated histogram data

      var histData = getHistogram(fillerWords);
      // set histogram's domain
      var histMax = d3.max(histData, function (d) { return d.length; });
      yHistScale.domain([0, histMax]);

      setupVis(wordData, fillerCounts, histData);

      setupSections(wordData);
    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  var setupVis = function (wordData, fillerCounts, histData) {
    // axis
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')');

    g.select('.x.axis').style('opacity', 0);

    // count openvis title
    g.append('text')
      .attr('class', 'sub-title openvis-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text('');

    g.selectAll('.openvis-title')
      .attr('opacity', 0);

    // count filler word count title
    g.append('text')
      .attr('class', 'title count-title highlight')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('187 teachers');

    g.append('text')
      .attr('class', 'sub-title count-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 8))
      .text('in four countries');

    g.selectAll('.count-title')
      .attr('opacity', 0);

    // square grid
    // @v4 Using .merge here to ensure
    // new and old data have same attrs applied
    var squares = g.selectAll('.square').data(wordData, function (d) { return d.word; });
    var squaresE = squares.enter()
      .append('rect')
      .classed('square', true);
    squares = squares.merge(squaresE)
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', '#fff')
      .classed('fill-square', function (d) { return d.Grade; })
      .attr('x', function (d) { return d.x;})
      .attr('y', function (d) { return d.y + 350;})
      .attr('opacity', 0);
      
    g.append('text')
      .attr('class', 'teachers-status control')
      .attr('x', width / 4 )
      .attr('y', 20)
      .text(String("Control group"))
      .attr('opacity', 0);

    g.append('text')
      .attr('class', 'teachers-status treatment')
      .attr('x', width / 4 )
      .attr('y', (height / 2) - 20)
      .text(String("Treatment group"))
      .attr('opacity', 0);
      
    g.append('text')
      .attr('class', 'teachers-grade')
      .attr('x', width / 3 )
      .attr('y', height / 9)
      .text(String("first grade"))
      .attr('opacity', 0);
      
    g.append('text')
      .attr('class', 'teachers-grade')
      .attr('x', width / 3 )
      .attr('y', (height / 5) + 5)
      .text(String("second grade"))
      .attr('opacity', 0);

    g.append('text')
      .attr('class', 'teachers-grade')
      .attr('x', width / 3 )
      .attr('y', (height / 3)  - 10)
      .text(String("third grade"))
      .attr('opacity', 0);

    g.append('text')
      .attr('class', 'teachers-grade')
      .attr('x', width / 3 )
      .attr('y', (height / 3) + 38)
      .text(String("fourth grade"))
      .attr('opacity', 0);

    g.append('text')
      .attr('class', 'teachers-grade')
      .attr('x', width / 3 )
      .attr('y', height / 2)
      .text(String("fifth grade"))
      .attr('opacity', 0);

    g.append('text')
      .attr('class', 'teachers-grade')
      .attr('x', width / 3 )
      .attr('y', (height / 2) + 50)
      .text(String("sixth grade"))
      .attr('opacity', 0);
      
//  var node = path.node()

 
    var circles = g.selectAll('.circle').data(wordData, function (d) { return d.word});
    var circlesE = circles.enter()
      .append('circle')
      .classed('circle', true);
    circles = circles.merge(circlesE)
      .attr('cx', function (d) { return xbeeScale(parseFloat(d.total_rating_x) + Math.random() * 0.2)})
      .attr('cy', function(d) { return height / 10 + Math.random() * 20 } )
      .attr('fill', function(d) { if (d.Status == "Control") { 
        return "red"} else {
          return "blue"}
      })
      .attr('r', 3)
      .attr('opacity', 0);
      
      
    g.append('text')
      .attr('class', 'total-rating-control')
      .attr('x', xbeeScale(total_control_x))
      .attr('y', (height / 6) - 5)
      .text(String(total_control_x))
      .attr('fill', 'red')
      .attr('text-anchor', "middle")
      .attr('opacity', 0);
      
    g.append('line')
      .attr('class', 'line total-rating-control')
      .attr('x1', xbeeScale(bee_total[0][0]))
      .attr('x2', xbeeScale(bee_total[0][0]))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .attr('stroke', 'red')
      .attr('opacity', 0);
      
    g.append('text')
      .attr('class', 'total-rating-treatment')
      .attr('x', xbeeScale(total_treatment_x))
      .attr('y', (height / 6) - 5)
      .text(String(total_control_x))
      .attr('fill', 'blue')
      .attr('text-anchor', "middle")
      .attr('opacity', 0);
      
    g.append('line')
      .attr('class', 'total-rating-treatment')
      .attr('x1', xbeeScale(bee_total[1][0]))
      .attr('x2', xbeeScale(bee_total[1][0]))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .attr('stroke', 'blue')
      .attr('opacity', 0);

  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  var setupSections = function () {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showTeachers;
    activateFunctions[1] = showGridByGrade;
    activateFunctions[2] = showGridByStatus;
    activateFunctions[3] = showCircle;
    activateFunctions[4] = showCircleByStatus;
    activateFunctions[5] = ShowCirclesByRound2;
    activateFunctions[6] = showQ7before;
    activateFunctions[7] = showQ7after;
    activateFunctions[8] = showOthers;
    activateFunctions[9] = showOthersY;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for (var i = 0; i < 20; i++) {
      updateFunctions[i] = function () {};
    }
    updateFunctions[7] = updateCough;
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */

  /**
   * showTeachers - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function showTeachers() {
    g.selectAll('.openvis-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.count-title')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);
      
    g.selectAll('.square')
      .transition()
      .duration(1000)
      .delay(function (d) {
        return 50 * d.row;
      })
      .attr('opacity', 1.0)
      .attr('fill', '#ddd')
      .attr('x', function (d) { return d.x;})
      .attr('y', function (d) { return d.y + 300;});
      
    g.selectAll('.teachers-grade')
      .transition()
      .duration(1000)
      .attr('opacity', 0);



    
  }

  /**
   * showGridByGrade - square grid
   *
   * hides: filler count title
   * hides: filler highlight in grid
   * shows: square grid
   *
   */
   
   // split tiles by grade
  function showGridByGrade() {
    
    g.selectAll('.count-title')
      .transition()
      .duration(600)
      .attr('opacity', 0.0);

    g.selectAll('.fill-square')
      .transition()
      .duration(800)
      .attr('x', function (d, i) {
        return d.x ;
      })
      .attr('y', function (d) {
        return d.y + 150;
      })
      .transition()
      .duration(800)
      .attr('opacity', 1.0)
      .attr('x', function (d, i) {
        return d.grade_index * 5 ;
      })
      .attr('y', function (d) {
        return d.Grade * 50 ;
      })
      .attr('fill', function (d) { if (d.Grade == "1") {
        return '#a6cee3'} else if (d.Grade == "2") {
        return '#1f78b4'} else if (d.Grade == "3") {
        return '#b2df8a'} else if (d.Grade == "4") {
        return '#33a02c'} else if (d.Grade == "5") {
        return "#fb9a99"} else if ( d.Grade == "6") {
        return "#e31a1c"} else {
        return "red";
            }
      });
      
    g.selectAll('.teachers-status')
      .transition()
      .duration(1000)
      .attr('opacity', 0);

    g.selectAll('.teachers-grade')
      .transition()
      .duration(1000)
      .attr('opacity', 1);



  }

  /**
   * showGridByStatus - show fillers in grid
   *
   * hides: barchart, text and axis
   * shows: square grid and highlighted
   *  filler words. also ensures squares
   *  are moved back to their place in the grid
   */
   
   // split tiles by Status (control vs. treatment)
  function showGridByStatus() {
    hideAxis(xbeeAxisBar);

    g.selectAll('circle')
      .transition()
      .duration(1000)
      .attr('cx', function (d) { return xbeeScale(parseFloat(d.total_rating_x) + Math.random())})
      .attr('cy', function(d) { return height / 10 + Math.random() * 20 } )
      .attr('opacity', 0.0);

    g.selectAll('.fill-square')
      .transition()
      .duration(1000)
      .attr('x', function (d) { return d.x;})
      .attr('y', function (d) { return d.y + 150;})
      .attr('fill', "#ddd")
      .transition()
      .duration(800)
      .attr('x', function (d, i) { return d.x;})
      .attr('y', function (d) {
        if (d.Status == "Control"){
          return d.y + 50} else{
            return d.y + 250;
          }
      })
      .attr('opacity', 1.0)
      .attr('fill', function (d) { if (d.Status == "Control"){
        return "red"} else {
          return "blue";}
      });

    g.selectAll('.teachers-status')
      .transition()
      .duration(1000)
      .attr('opacity', 1);
      
    g.selectAll('.teachers-grade')
      .transition()
      .duration(1000)
      .attr('opacity', 0);


    // use named transition to ensure
    // move happens even if other
    // transitions are interrupted.

        }
        
        
        /**
   * showCircle - barchart
   *
   * hides: square grid
   * hides: histogram
   * shows: barchart
   *
   */
  function showCircle() {
    showAxis(xbeeAxisBar);
    
    g.selectAll('.fill-square')
      .transition()
      .duration(1000)
      .attr('opacity', 0);
     
    g.selectAll('circle')
      .transition()
      .duration(1000)
      .attr('opacity', 1);
      
    g.selectAll('.total-rating-treatment')
      .transition()
      .duration(1000)
      .attr('opacity', 0);

    g.selectAll('.total-rating-control')
      .transition()
      .duration(1000)
      .attr('opacity', 0);
      
    g.selectAll('.teachers-status')
      .transition()
      .duration(1000)
      .attr('opacity', 0);


  }

  /**
   * showCircleByStatus - shows the first part
   *  of the histogram of filler words
   *
   * hides: barchart
   * hides: last half of histogram
   * shows: first half of histogram
   *
   */
  function showCircleByStatus() {
    showAxis(xbeeAxisBar);
    
    g.selectAll('circle')
      .transition()
      .duration(1000)
      .delay(function(d,i){
        return i * 5;
      })
      .attr('cx', function (d) { return xbeeScale(parseFloat(d.total_rating_x) + Math.random())})
      .attr('cy', function(d) { if (d.Status == "Control") {return (height / 10 + Math.random() * 20 ) + 50;} else {
        return (height / 10 + Math.random() * 20 ) + 100;
      }})
      .attr('opacity', 1);
      
    g.selectAll('.total-rating-control')
      .transition()
      .duration(1000)
      .attr('x',  xbeeScale(total_control_x))
      .attr('x1', xbeeScale(total_control_x))
      .attr('x2', xbeeScale(total_control_x))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .text(total_control_x)
      .attr('opacity', 1);
      
    g.selectAll('.total-rating-treatment')
      .transition()
      .duration(1000)
      .attr('x',  xbeeScale(total_treatment_x))
      .attr('x1', xbeeScale(total_treatment_x))
      .attr('x2', xbeeScale(total_treatment_x))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .text(total_treatment_x)
      .attr('opacity', 1);

    

  }

  /**
   * ShowCirclesByRound2 - show all histogram
   *
   * hides: cough title and color
   * (previous step is also part of the
   *  histogram, so we don't have to hide
   *  that)
   * shows: all histogram bars
   *
   */
  function ShowCirclesByRound2() {
    showAxis(xbeeAxisBar);
    // ensure the axis to histogram one
    g.selectAll('circle')
      .transition()
      .duration(1000)
      .delay(function(d,i){
        return i * 5;
      })
      .attr('cx', function (d) { return xbeeScale(parseFloat(d.total_rating_y) + Math.random())})
      .attr('cy', function(d) { if (d.Status == "Control") {return (height / 10 + Math.random() * 20 ) + 50;} else {
        return (height / 10 + Math.random() * 20 ) + 100;
      }});
      
    g.selectAll('.total-rating-control')
      .transition()
      .duration(1000)
      .attr('x',  xbeeScale(total_control_y))
      .attr('x1', xbeeScale(total_control_y))
      .attr('x2', xbeeScale(total_control_y))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .text(total_control_y)
      .attr('opacity', 1);
      
    g.selectAll('.total-rating-treatment')
      .transition()
      .duration(1000)
      .attr('x',  xbeeScale(total_treatment_y))
      .attr('x1', xbeeScale(total_treatment_y))
      .attr('x2', xbeeScale(total_treatment_y))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .text(total_treatment_y)
      .attr('opacity', 1);


  }

  /**
   * showQ7before
   *
   * hides: nothing
   * (previous and next sections are histograms
   *  so we don't have to hide much here)
   * shows: histogram
   *
   */
  function showQ7before() {
    // ensure the axis to histogram one
    showAxis(xsingleAxisBar)
    
    g.selectAll('circle')
      .transition()
      .duration(1000)
      .delay(function(d,i){
        return i * 5;
      })
      .attr('cx', function (d) { return xsingleScale(parseFloat(d.Q7Rating_x) + Math.random() * .1)})
      .attr('cy', function(d) { if (d.Status == "Control") {return (height / 10 + Math.random() * 20 ) + 50;} else {
        return (height / 10 + Math.random() * 20 ) + 100;
      }});
      
    g.selectAll('.total-rating-treatment')
      .transition()
      .duration(1000)
      .attr('x',  xsingleScale(q7_treatment_x))
      .attr('x1', xsingleScale(q7_treatment_x))
      .attr('x2', xsingleScale(q7_treatment_x))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .text(String(q7_treatment_x));
      
    g.selectAll('.total-rating-control')
      .transition()
      .duration(1000)
      .attr('x',  xsingleScale(q7_control_x))
      .attr('x1', xsingleScale(q7_control_x))
      .attr('x2', xsingleScale(q7_control_x))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .text(String(q7_control_x));

  }
  
  
  function showQ7after() {
    // ensure the axis to histogram one
    showAxis(xsingleAxisBar)
    
    g.selectAll('circle')
      .transition()
      .duration(1000)
      .delay(function(d,i){
        return i * 5;
      })
      .attr('cx', function (d) { return xsingleScale(parseFloat(d.Q7Rating_y) + Math.random() * 0.2)})
      .attr('cy', function(d) { if (d.Status == "Control") {return (height / 10 + Math.random() * 20 ) + 50;} else {
        return (height / 10 + Math.random() * 20 ) + 100;
      }});
      
    g.selectAll('.total-rating-treatment')
      .transition()
      .duration(1000)
      .attr('x',  xsingleScale(q7_treatment_y))
      .attr('x1', xsingleScale(q7_treatment_y))
      .attr('x2', xsingleScale(q7_treatment_y))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .text(String(q7_treatment_y));
      
    g.selectAll('.total-rating-control')
      .transition()
      .duration(1000)
      .attr('x',  xsingleScale(q7_control_y))
      .attr('x1', xsingleScale(q7_control_y))
      .attr('x2', xsingleScale(q7_control_y))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .text(String(q7_control_y));

  }
  
  function showOthers() {
    // ensure the axis to histogram one
    showAxis(xsingleAxisBar)
    
    g.selectAll('circle')
      .transition()
      .duration(1000)
      .delay(function(d,i){
        return i * 5;
      })
      .attr('cx', function (d) { return xsingleScale(parseFloat(d.Q1Rating_x) + Math.random() * 0.2)})
      .attr('cy', function(d) { if (d.Status == "Control") {return (height / 10 + Math.random() * 20 ) + 50;} else {
        return (height / 10 + Math.random() * 20 ) + 100;
      }});
      
    g.selectAll('.total-rating-treatment')
      .transition()
      .duration(1000)
      .attr('x',  xsingleScale(q1_treatment_x))
      .attr('x1', xsingleScale(q1_treatment_x))
      .attr('x2', xsingleScale(q1_treatment_x))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .text(String(q7_treatment_x));
      
    g.selectAll('.total-rating-control')
      .transition()
      .duration(1000)
      .attr('x',  xsingleScale(q1_control_x))
      .attr('x1', xsingleScale(q1_control_x))
      .attr('x2', xsingleScale(q1_control_x))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .text(String(q7_control_x));

  }

  function showOthersY() {
    // ensure the axis to histogram one
    showAxis(xsingleAxisBar)
    
    g.selectAll('circle')
      .transition()
      .duration(1000)
      .delay(function(d,i){
        return i * 5;
      })
      .attr('cx', function (d) { return xsingleScale(parseFloat(d.Q1Rating_y) + Math.random() * 0.2)})
      .attr('cy', function(d) { if (d.Status == "Control") {return (height / 10 + Math.random() * 20 ) + 50;} else {
        return (height / 10 + Math.random() * 20 ) + 100;
      }});
      
    g.selectAll('.total-rating-treatment')
      .transition()
      .duration(1000)
      .attr('x',  xsingleScale(q1_treatment_y))
      .attr('x1', xsingleScale(q1_treatment_y))
      .attr('x2', xsingleScale(q1_treatment_y))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .text(String(q1_treatment_y));
      
    g.selectAll('.total-rating-control')
      .transition()
      .duration(1000)
      .attr('x',  xsingleScale(q1_control_y))
      .attr('x1', xsingleScale(q1_control_y))
      .attr('x2', xsingleScale(q1_control_y))
      .attr('y1', (height / 6))
      .attr('y2', (height / 3) + 20)
      .text(String(q1_control_y));

  }



  /**
   * showAxis - helper function to
   * display particular xAxis
   *
   * @param axis - the axis to show
   *  (xAxisHist or xAxisBar)
   */
  function showAxis(axis) {
    g.select('.x.axis')
      .call(axis)
      .transition().duration(500)                          
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style('opacity', 1);
      
  }

  /**
   * hideAxis - helper function
   * to hide the axis
   *
   */
  function hideAxis() {
    g.select('.x.axis')
      .transition().duration(500)
      .style('opacity', 0);
  }

  /**
   * UPDATE FUNCTIONS
   *
   * These will be called within a section
   * as the user scrolls through it.
   *
   * We use an immediate transition to
   * update visual elements based on
   * how far the user has scrolled
   *
   */

  /**
   * updateCough - increase/decrease
   * cough text and color
   *
   * @param progress - 0.0 - 1.0 -
   *  how far user has scrolled in section
   */
  function updateCough(progress) {
    g.selectAll('.cough')
      .transition()
      .duration(0)
      .attr('opacity', progress);

    g.selectAll('.hist')
      .transition('cough')
      .duration(0)
      .style('fill', function (d) {
        return (d.x0 >= 14) ? coughColorScale(progress) : '#008080';
      });
  }

  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

  /**
   * getWords - maps raw data to
   * array of data objects. There is
   * one data object for each word in the speach
   * data.
   *
   * This function converts some attributes into
   * numbers and adds attributes used in the visualization
   *
   * @param rawData - data read in from file
   */
  function getWords(rawData) {
    return rawData.map(function (d, i) {
      // is this word a filler word?
      // positioning for square visual
      // stored here to make it easier
      // to keep track of.
      d.col = i % numPerRow;
      d.x = d.col * (squareSize + squarePad);
      d.row = Math.floor(i / numPerRow);
      d.y = d.row * (squareSize + squarePad);
      
  //    console.log(groupBy(rawData, 'Grade'));

      return d;
    });
  }

  /**
   * getFillerWords - returns array of
   * only filler words
   *
   * @param data - word data from getWords
   */
  function getFillerWords(data) {
    return data.filter(function (d) {return d.filler; });
  }

  /**
   * getHistogram - use d3's histogram layout
   * to generate histogram bins for our word data
   *
   * @param data - word data. we use filler words
   *  from getFillerWords
   */
  function getHistogram(data) {
    // only get words from the first 30 minutes
    var thirtyMins = data.filter(function (d) { return d.min < 30; });
    // bin data into 2 minutes chuncks
    // from 0 - 31 minutes
    // @v4 The d3.histogram() produces a significantly different
    // data structure then the old d3.layout.histogram().
    // Take a look at this block:
    // https://bl.ocks.org/mbostock/3048450
    // to inform how you use it. Its different!
    return d3.histogram()
      .thresholds(xHistScale.ticks(10))
      .value(function (d) { return d.min; })(thirtyMins);
  }

  /**
   * groupByWord - group words together
   * using nest. Used to get counts for
   * barcharts.
   *
   * @param words
   */
  function groupByWord(words) {
    return d3.nest()
      .key(function (d) { return d.word; })
      .rollup(function (v) { return v.length; })
      .entries(words)
      .sort(function (a, b) {return b.value - a.value;});
  }

  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index, data) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function (index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  
  console.log(data)
  // create a new plot and
  // display it
  var plot = scrollVis();
  
  d3.select('#vis')
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
}

// load data and display
d3.csv('data/test_d3_all.csv', display);
