// DrugVis
// By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
// License: BSD

// @Date    : 2018-07-15 18:55:01
// @Author  : Chao Ma (cma1@kent.edu)
// @Website : http://vis.cs.kent.edu/NeighborVis/
// @Link    : https://github.com/AlexMa1989
// @Version : $Id$

/*
    area.js
    Note: this file contain functions of Query Front-End
*/

var AREA = AREA || {};

AREA.CurrentIndex = 0;
AREA.List = [];
AREA.queryList = [];
AREA.tweetMarker;

AREA.chartWidth;
AREA.chartHeight;

AREA.ifTime;

AREA.chartWidth = $('#chartContainer').width();
AREA.chartHeight = $('#chartContainer').height();

AREA.wordCloudClick;

AREA.charts = {};

AREA.eachQuery = function(query_id, query_coll, query_type, query_info, query_layer, query_keyword, query_situ, query_from, query_to) {

    this.ID = query_id;
    this.Data = query_coll;
    this.Type = query_type;
    this.Info = query_info;
    this.Layer = query_layer;
    this.Key = query_keyword;
    this.Situ = query_situ;
    this.From = query_from;
    this.To = query_to;

}

AREA.attribute = function(area_id, area_data, area_layer, area_collName, area_collColor, area_keywords, area_situation, area_datefrom, area_dateto) {
    this.ID = area_id;
    this.Data = area_data;
    this.Layer = area_layer;
    this.Name = area_collName;
    this.Color = area_collColor;
    this.Key = area_keywords;
    this.Situ = area_situation;
    this.From = area_datefrom;
    this.To = area_dateto;
}

// Add new area attibute
AREA.addNewArea = function(tweets, leafletEvent, ifTime, collName, collColor, keywords, situation, datefrom, dateto) {

    AREA.clearAllTables();
    // Set a new index
    var index = AREA.CurrentIndex + 1;

    // Set new area attribute
    var id = 'data ' + index; //****************
    var data = tweets;
    var layer = leafletEvent;
    var collName = collName;
    var collColor = collColor;
    var keywords = keywords;
    var situation = situation;
    var datefrom = datefrom;
    var dateto = dateto;

    AREA.ifTime = ifTime;



    var attribute = new AREA.attribute(id, data, layer, collName, collColor, keywords, situation, datefrom, dateto);
    // Store new area in the collection
    AREA.List.push(attribute);

    // Update area current index
    AREA.CurrentIndex = index;


}

AREA.addNewFunctions = function(tweet, collName, collColor) {

    AREA.clearAllTables();

    AREA.updateTweetMessages(tweet);
    // Update top keywords
    AREA.updateTopCategory(tweet, collName, collColor);
    // Update top usernames

    AREA.updateCategoryChart(tweet, collName, collColor);

    AREA.updateWordCloud(tweet, collName, collColor);

    AREA.updateTimeChart(tweet, collName, collColor);

    AREA.updateYearChart(tweet, collName, collColor);

    AREA.updateMonthChart(tweet, collName, collColor);

}

AREA.addNewFunctionsNoTime = function(tweet, collName, collColor) {

    AREA.clearAllTables();
    AREA.clearFiltersNoInfo();

    AREA.updateTweetMessages(tweet);
    // Update top keywords
    AREA.updateTopCategory(tweet, collName, collColor);
    // Update top usernames

    AREA.updateCategoryChart(tweet, collName, collColor);

    AREA.updateWordCloud(tweet, collName, collColor);

}



// Update area table in the area panel
// this adds a subquery row
AREA.updateTable = function(dbName, id) {

    AREA.clearFiltersNoInfo();

    $('#areaTable > tbody  > tr').each(function() {
        $(this).removeClass("active111");
    });

    //var areaTable = $('#areaTable');
    var areaTableBody = $('#areaTable tbody');
    // clear all row in area table
    var queryId = id.toString();

    console.log(queryId);

    var len = AREA.List.length;
    // Update shown area
    for (i = len - 1; i < len; i++) {

        var area_id = AREA.List[i].ID;

        if (area_id.charAt(0) === 'd') {
            var tweets = AREA.List[i].Data;
            var tweetCount = tweets.length;
            var userCount = AREA.getEventCount(tweets);
            var newRow = '<tr id="' + area_id + '" class="sm-font active111 area collapse ' + queryId + '"><td class="active112 sm-align" contenteditable>' + area_id + '</td><td class="call sm-align collNameHide">' + dbName + '</td><td class="call sm-align">' + tweetCount + '</td><td></td></tr>';
            areaTableBody.append(newRow);
        }

    }


}

// this adds a query row
AREA.updateQueryTable = function(id, collLengh) {

    AREA.clearFiltersNoInfo();

    //var areaTable = $('#areaTable');
    var areaTableBody = $('#areaTable tbody');
    // clear all row in area table
    var queryId = id.toString();
    var queryLength = collLengh + " Data"

    var allRow = '<tr id="' + queryId + '" class="active111 clickable query" data-toggle="collapse" data-target=".' + queryId + '" ><td  class="active116" contenteditable> ' + queryId + ' </td><td class="call">' + queryLength.toString() + '</td><td>......</td><td><button  id="' + queryId + '" class="btn-xs areaRemove" type="button" ><span class="glyphicon glyphicon-trash red"></span></button></td></tr>';
    areaTableBody.append(allRow);

}

// update the sample display area
AREA.updateSampleDisplay = function(resultObj, geoID, collName) {
  console.log('updateSampleDisplay')
  console.log(geoID)
  console.log(collName)
  var tweetTable = $('#tableTweetsSample tbody');
  tweetTable.empty();
  var samples = resultObj.sampleList[geoID][collName];
  for (var i=0; i < samples.length; i++) {
    var newRow = '<tr><td>' + samples[i].localTime + '</td><td>' + samples[i].tweetNorm + '</td></tr>';
    tweetTable.append(newRow);
  }
}

// update the query params display area
AREA.updateQueryParamsDisplay = function(queryParams, resultObj) {
  // build str to display
  var dateStr = "\nFrom: " + queryParams.queryDateFrom + "\nTo: " + queryParams.queryDateTo;
  var keywordsStr = "\nKeywords: " + queryParams.queryKeywords + "\nMode: " + queryParams.queryKeywordMode;
  if (queryParams.queryGeoMode === 'states') {
    var geoStr = "\nGeo-type: States, Mode: " + queryParams.queryLocationMode + "\nStates: " + queryParams.queryLocation + "\n# of Census Tracts: " + resultObj.geoidList.length;
  } else {
    var geoStr = "\nGeo-type: Area, " + queryParams.queryGeoType + "\n# of Census Tracts: " + resultObj.geoidList.length;
  }
  // modify html tags
  $('#queryParamsDate').text(dateStr);
  $('#queryParamsKeywords').text(keywordsStr);
  $('#queryParamsGeo').text(geoStr);
}


// AREA.updateTweetMessages = function(tweets) {
//     // Get all tweets that shown on map
//     var tweetTable = $('#tweetMessageTable tbody');
//     // clear all tweets in tweet table
//     tweetTable.empty();

//     var i = 0;
//     var len = tweets.length;
//     for (i; i < len; i++) {
//         // Need to add some location to this!
//         var tweet_id = tweets[i]._id['$id'];
//         var id = tweets[i].id;
//         var message = tweets[i].ptext;
//         var situation = tweets[i].pcategory;
//         var date = tweets[i].pdatetime;
//         // Store location of the message
//         var latitude = tweets[i].loc.coordinates[1];
//         var longitude = tweets[i].loc.coordinates[0];
//         var newRow = '<tr class="' + latitude + ',' + longitude + '" id="' + tweet_id + '" value="' + message + '"><td>' + id + '</td><td>' + date + '</td><td>' + situation + '</td></tr>'

//         tweetTable.append(newRow);
//     }
// }


// Update top keywords table
AREA.updateTopCategory = function(tweets, collName, collColor) {

    var keywordsTable = $('#area-keywords-table tbody');

    // Clear keyword table
    keywordsTable.empty();
    var top = AREA.getTopCategory(100, tweets);
    var i = 0;
    var len = top.length;
    for (i; i < len; i++) {
        // Check valid keywords
        if (top[i]['keyword_name'] !== '' && top[i]['keyword_name'] !== undefined) {
            var newRow = '<tr id="' + top[i]['keyword_name'] + '"><td>' + (i + 1) + '</td><td>' + top[i]['keyword_name'] + '</td><td>' + top[i]['frequency_count'] + '</td></tr>';
            keywordsTable.append(newRow);
        }
    }
}


AREA.updateStoryLineChart = function(tweets) {
    var container = document.getElementById('markerTime');

    var storyData = [];


    for (i = 0; i < tweets.length; i++) {
        var id = tweets[i].id;
        var date = tweets[i].pdatetime;
        var situation = tweets[i].pcategory;

        var data1 = {
            id: id,
            content: situation,
            start: date
        };

        storyData.push(data1);
    }

    // Create a DataSet (allows two way data-binding)
    var items = new vis.DataSet(storyData);

    // Configuration for the Timeline
    var options = {
        width: '100%',
        height: '180px',
        margin: {
            item: 5
        }
    };

    // Create a Timeline
    var timeline = new vis.Timeline(container, items, options);

    timeline.on('click', function(properties) {

        var timeLineInfo = $('#timeLineInfo');

        timeLineInfo.html("");

        for (i = 0; i < tweets.length; i++) {
            var id = tweets[i].id;
            var time = tweets[i].pdatetime.split(" ");
            var date = time[0];
            var description = tweets[i].ptext;

            if (id === properties.item) {

                var option = '<span class = "timeLineClick">' + date + '</span> <span>' + description + '</span> ';

                timeLineInfo.append(option);

            }
        }
    });

}

AREA.filterFunction = function(tweets, collName, collColor) {

    var keywords = $('#getKeyword').text();
    var situation = $('#getSitu').text();
    var time = $('#getTime').text();


    MAP.lunrFilter(keywords.toString(), situation.toString(), time.toString(), time.toString(), tweets, collName, collColor);
}


// AREA.updateCategoryChart = function(tweets, collName, collColor) {

//     var top = AREA.getTopForCategoryChart(10, tweets);

//     var chart = new CanvasJS.Chart("chartContainer", {
//         width: AREA.chartWidth,
//         height: AREA.chartHeight,
//         animationEnabled: true,
//         responsive: true,
//         theme: "light2", // "light1", "light2", "dark1", "dark2"
//         title: {
//             text: "Top Category"
//         },
//         axisY: {
//             title: "Frequency"
//         },
//         backgroundColor: "white",
//         data: [{
//             type: "column",
//             click: onClick,
//             dataPoints: top
//         }]
//     });
//     chart.render();

//     function onClick(e) {
//         var keyword = e.dataPoint.label;
//         $('#area-keywords-table > tbody > tr').removeClass("active111");

//         var fromSpan = $('#getSitu').text();

//         $('#getSitu').text(keyword);
//         $('#situShow').text(keyword);


//         AREA.filterFunction(tweets, collName, collColor);

//     }

// }

AREA.updateCategoryChart = function(queryID, subqueryID, collName) {

  var top = AREA.getTopCategoryChartData(10, queryID, subqueryID, collName);

  var chart = new CanvasJS.Chart("chartContainer", {
      width: AREA.chartWidth,
      height: AREA.chartHeight,
      animationEnabled: true,
      responsive: true,
      theme: "light2", // "light1", "light2", "dark1", "dark2"
      title: {
          text: "Top Drug Category"
      },
      axisY: {
          title: "Frequency"
      },
      backgroundColor: "white",
      data: [{
          type: "column",
          // click: onClick,
          dataPoints: top
      }]
  });
  chart.render();
  // function onClick(e) {
  //     var keyword = e.dataPoint.label;
  //     $('#area-keywords-table > tbody > tr').removeClass("active111");
  //     var fromSpan = $('#getSitu').text();
  //     $('#getSitu').text(keyword);
  //     $('#situShow').text(keyword);
  //     AREA.filterFunction(tweets, collName, collColor);
  // }
}



AREA.initTimeChart = function(timeType){
  // console.log(data);
  // setup chart
  var htmlIDList = {
    'year': 'chartYear',
    'month': 'chartMonth',
    'week': 'chartWeek',
    'day': 'chartDay',
    'hour': 'chartHour',
    'weekday': 'chartWeekday'
  }
  var titleList = {
    'year': 'By Year',
    'month': 'By Month',
    'week': 'By Week',
    'day': 'By Day',
    'hour': 'By Hour in day',
    'weekday': 'By Weekday'
  }
  var chart = new CanvasJS.Chart(htmlIDList[timeType], {
    width: 240,
    height: AREA.chartHeight,
    animationEnabled: true,
    zoomEnabled: true,
    theme: "light2", // "light1", "light2", "dark1", "dark2"
    title: {
      text: titleList[timeType]
    },
    backgroundColor: "white",
    axisX: {
      labelAngle: -30
    },
    data: []
  });

  // chart._creditLink.hide();
  $('a.canvasjs-chart-credit').hide();
  // chart.render();
  AREA.charts[timeType] = chart;
}

AREA.addTimeChartData = function(timeType, queryID, subqueryID, collName){
  var typeList = {
    'year': 'column',
    'month': 'line',
    'week': 'line',
    'day': 'line',
    'hour': 'line',
    'weekday': 'line'
  }
  var data = AREA.getTimeChartData(timeType, queryID, subqueryID, collName);
  if (AREA.charts[timeType].options.data === null){
    AREA.charts[timeType].options.data = [];
  }
  var chartData = {
    name: collName+'.'+String(queryID)+'.'+String(subqueryID),
    type: typeList[timeType],
    xValueType: "number",
    // click: onClick,
    dataPoints: data
  }
  AREA.charts[timeType].options.data.push(chartData);
  AREA.charts[timeType].render();
}

AREA.removeTimeChartData = function(timeType, queryID, subqueryID, collName){
  var l = AREA.charts[timeType].options.data.length;
  for (var i=0; i<l; i++){
    if (AREA.charts[timeType].options.data[i].name === collName+'.'+String(queryID)+'.'+String(subqueryID)){
      AREA.charts[timeType].options.data.splice(i, 1)
    }
  }
  AREA.charts[timeType].render();
}


AREA.updateWordCloud = function(queryID, subqueryID, collName) {
    $("#wordcloud-container").html("");
    // d3 wordcloud
    // AREA.drawWordCloud('#wordcloud-container', 10, 260, 180, tweets, collName, collColor);
    AREA.drawWordCloud('#wordcloud-container', 260, 180, queryID, subqueryID, collName)
}


AREA.clearFilters = function() {


    $('#getKeyword').empty();

    $('#getSitu').empty();

    $('#getTime').empty();

    $('#infoShow').empty();

    $('#timeShow').empty();

    $('#keywordShow').empty();

    $('#situShow').empty();



    $('#getKeyword').html("");
    $('#getTime').html("");
    $('#getSitu').html("");
    $('#infoShow').html("");

    $('#searchKey').val('');
    $('#searchDec').val('');
    $('#searchKey').val('');

};

AREA.clearFiltersNoInfo = function() {


    $('#getKeyword').empty();

    $('#getSitu').empty();

    $('#getTime').empty();

    $('#timeShow').empty();

    $('#keywordShow').empty();

    $('#situShow').empty();


    $('#getKeyword').html("");
    $('#getTime').html("");
    $('#getSitu').html("");

    $('#searchKey').val('');
    $('#searchDec').val('');
    $('#searchKey').val('');

};

AREA.clearAllTables = function() {

    $('#domain-keyword-table tbody').empty();
    $('#area-keywords-table tbody').empty();
    $('#tweetMessageTable tbody').empty();
    $("#chartContainer").html("");
    $("#wordcloud-container").html("");
    $("#chartYear").html("");
    $("#chartMonth").html("");
    $("#chartWeek").html("");
    $("#chartDay").html("");
    $("#chartWeekday").html("");
    $("#chartHour").html("");

};


AREA.tableOperation = function(tweets, collName, collColor) {
    $('#area-keywords-table').unbind().on('click', 'tbody tr', function() {

        $(this).prevAll('tr').removeClass("active111");
        $(this).nextAll('tr').removeClass("active111");
        $(this).toggleClass("active111");

        var keyword = this.id;

        var fromSpan = $('#getSitu').text();

        if (fromSpan.includes(keyword)) {
            var replaced = fromSpan.replace(keyword, '');
            $('#getSitu').text(replaced);
        } else {
            $('#getSitu').text(keyword);
        }

        if (fromSpan.includes(keyword)) {
            var replaced = fromSpan.replace(keyword, '');
            $('#situShow').text(replaced);
        } else {
            $('#situShow').text(keyword);
        }


        AREA.filterFunction(tweets, collName, collColor);


    });

    $('#getSitu').unbind().on('click', function() {


        var keyword = this.id;

        console.log(keyword);

        $('#getSitu').text("");
        $('#situShow').text("");

        AREA.filterFunction(tweets, collName, collColor);


    });


    $('#getKeyword').unbind().on('click', function() {

        var keyword = this.id;

        $('#getKeyword').text("");
        $('#keywordShow').text("");

        AREA.filterFunction(tweets, collName, collColor);


    });

    $('#getTime').unbind().on('click', function() {


        var keyword = this.id;

        $('#getTime').text("");
        $('#timeShow').text("");


        AREA.filterFunction(tweets, collName, collColor);


    });


    $('#situClick').unbind().on('click', function() {

        var getkeyword = $('#searchDec').val();

        var keyword = getkeyword.toUpperCase();

        var fromSpan = $('#getSitu').text();

        $('#getSitu').text(keyword);

        $('#situShow').text(keyword);


        AREA.filterFunction(tweets, collName, collColor);


    });

    $('#keyClick').unbind().on('click', function() {

        var getkeyword = $('#searchKey').val();

        var keyword = getkeyword.toUpperCase();

        var fromSpan = $('#getKeyword').text();

        $('#getKeyword').text(keyword);


        $('#keywordShow').text(keyword);

        AREA.filterFunction(tweets, collName, collColor);


    });


    $("#keyclear").click(function() {
        $("#searchKey").val('');
        $('#getKeyword').text('');
        $('#keywordShow').text('');

        AREA.filterFunction(tweets, collName, collColor);


    });

    $("#sitclear").click(function() {
        $("#searchDec").val('');
        $('#getSitu').text('');
        $('#situShow').text('');

        AREA.filterFunction(tweets, collName, collColor);


    });


    $("#keywordSubmit").unbind().click(function() {

        $("#wordcloud-container").html("");
        // AREA.updateDomainNonus();

        var wordcloudDiv = '#wordcloud-container';


        // d3 wordcloud
        AREA.drawWordCloud(wordcloudDiv, 10, 260, 180, tweets, collName, collColor);
    });

    $("#swithButton").unbind().click(function() {

        if ($('#area-keywords').css('display') == 'none') {

            $('#area-keywords').show().siblings('#chartContainer').hide();
        } else if ($('#chartContainer').css('display') == 'none') {

            $('#chartContainer').show().siblings('#area-keywords').hide();
            $('a.canvasjs-chart-credit').hide();
        }
    });

}


AREA.updateInfo = function(IDS, data, layer) {


    var id = IDS;

    var length = data.length;

    var info = id;

    $('#infoShow').text(info);

}




// Find top n of keywords
AREA.getTopCategory = function(n, tweets) {
    var topKeywords = [];
    var listofKeywords = [];
    var i = 0;
    var len = tweets.length;
    if (len > 0) {
        // Put keywords into the list
        for (i; i < len; i++) {
            listofKeywords.push(tweets[i].pcategory);
        }
        // Sort keywords
        listofKeywords.sort();
        var k = 0;
        var k_len = listofKeywords.length;
        var keywords = [],
            frequency = [],
            prev;
        // Find keywords and its frequency
        for (k; k < k_len; k++) {
            if (listofKeywords[k] != prev) {
                keywords.push(listofKeywords[k]);
                frequency.push(1);
            } else {
                frequency[frequency.length - 1]++;
            }
            prev = listofKeywords[k];
        }
        // Set n to show top n keywords
        while (topKeywords.length < n) {
            var max = frequency[0];
            var maxIndex = 0;
            for (var m = 1; m < frequency.length; m++) {
                if (frequency[m] > max) {
                    maxIndex = m;
                    max = frequency[m];
                }
            }

            var keyword = {
                keyword_name: keywords[maxIndex],
                frequency_count: frequency[maxIndex]
            };

            // Store keyword and frequency
            topKeywords.push(keyword);
            // Delete array element
            keywords.splice(maxIndex, 1);
            frequency.splice(maxIndex, 1);
        }
    }

    //console.log (topKeywords);
    return topKeywords;
}


AREA.getTopCategoryChartData = function(n, queryID, subqueryID, collName) {
  var sortable = [];
  var queryData = QUERY.getAggregateQueryDataByID(queryID);
  var cats = queryData.subqueryList[subqueryID][collName].drugCategory;
  var w;
  for (w of Object.keys(cats)){
    sortable.push([w, cats[w]]);
  }
  sortable.sort(function(a, b) {
    return b[1] - a[1];
  });
  var topCats = [];
  if (n > sortable.length){
    var x = sortable.length;
  } else{
    var x = n;
  }
  for (var i = 0; i < x; i++) {
    var cat = {
      label: sortable[i][0],
      y: sortable[i][1]
    };
    topCats.push(cat);
  }
  return topCats;
}


// type should be: 'year', 'month', 'week', 'day', 'weekday', 'hour'
AREA.getTimeChartData = function(timeType, queryID, subqueryID, collName){
  var data = [];
  var queryData = QUERY.getAggregateQueryDataByID(queryID);
  var t;
  var c = 0;
  // some entries of 'timeList' may not be in 'time'
  for (t of Object.values(queryData.subqueryList[subqueryID][collName].timeList[timeType])){
    if (queryData.subqueryList[subqueryID][collName].time[timeType].hasOwnProperty(t)){
      var p = {
        x: c,
        y: queryData.subqueryList[subqueryID][collName].time[timeType][t],
        label: t
      };
    } else{
      var p = {
        x: c,
        y: 0,
        label: t
      };
    }
    data.push(p);
    c = c + 1;
  }
  // var pair;
  // for (pair of Object.entries(queryData.subqueryList[subqueryID][collName].time[timeType])){
  //   var p = {
  //     x: pair[0],
  //     y: pair[1]
  //   }
  //   data.push(p)
  // }
  return data;
}


AREA.getEventCount = function(tweets) {
    var users = [];
    var i = 0;
    var len = tweets.length;

    for (i; i < len; i++) {
        if (!users.includes(tweets[i].street)) {
            users.push(tweets[i].street);
        }
    }
    return users.length;
}



// Draw and Display wordcloud
// AREA.drawWordCloud = function(id, rescale, w, h, data, collName, collColor) {
AREA.drawWordCloud = function(elementID, w, h, queryID, subqueryID, collName) {
    // width = w;
    // height = h;
    var fontFamily = "Arial";

    // get word and frequency
    // var words = AREA.wordCloudKeywords(data);
    // words = AREA.wordCloudNormal(words);
    var words = AREA.getWordCloudData(queryID, subqueryID, collName)
    words = AREA.wordCloudNormal(words);

    var fill = d3.scale.category20c();
    d3.layout.cloud().size([w, h])
        .words(Object.keys(words).map(function(d) {
            return {
                text: d,
                // normalize word frequency value to 0:1
                size: words[d]
            };
        }))
        .padding(1)
        .rotate(function() {
            // return ~~(Math.random() * 2) * 90;
            return 0;
        })
        .font(fontFamily)
        .fontSize(function(d) {
            return d.size;
        })
        .on("end", draw)
        .start();

    function draw(words) {
        var svg = d3.select(elementID).append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("background-color", "black")
            .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

        var wordcloud = svg.selectAll("text")
            .data(words);
        console.log(wordcloud);

        wordcloud.enter()
            .append("text")
            .style("font-family", fontFamily)
            .style("font-size", 1)
            .style("fill", function(d, i) {
                return fill(i);
            })
            .attr("text-anchor", "middle")
            .text(function(d) {
                return d.text;
            })
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .on("click", onClick)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)

        wordcloud.transition()
            .duration(600)
            .style("font-size", function(d) {
                return d.size + "px";
            })
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("fill-opacity", 1);

        wordcloud.exit()
            .transition()
            .duration(200)
            .style('fill-opacity', 1e-6)
            .attr('font-size', 1)
            .remove();

        // Click event
        function onClick(d, i) {
            console.log(d.text);

            var keyword = d.text;

            $('#getKeyword').text(keyword);
            $('#keywordShow').text(keyword);

            // AREA.filterFunction(data, collName, collColor);
            // maybe launch a sub query to filter the words

            d3.selectAll("text").style({

                "fill": function(d, i) {
                    return fill(i);
                },
                "fill-opacity": 1,
                "font-size": function(d, i) {
                    return d.size;
                },
                "text-decoration": "none"

            });

            d3.select(this).style({
                "fill": "#283142",
                "fill-opacity": 0.8,
                // "text-decoration": "underline"

            });
        }
        // Mouseover event
        function mouseover(d, i) {
            d3.select(this).style({
                //"fill-opacity": 1
                "font-weight": "bold",
                "text-shadow": "0 0 1px rgba(0,0,0, 1)"
            });
        }

        // Mouseout event
        function mouseout(d, i) {
            d3.selectAll("text").style({
                //"fill-opacity": 0.6
                "font-weight": "normal",
                "text-shadow": ""
            });
        };
    }
}

// Normalize words frequency
AREA.wordCloudNormal = function(words) {
    var min = words[Object.keys(words)[Object.keys(words).length - 1]];
    var max = words[Object.keys(words)[0]];

    var norm = function(value, r1, r2) {
        return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
    };

    for (var word in words) {
        words[word] = norm(words[word], [min, max], [8, 36]);
    }

    //var normalized = (val - min) / (max - min);
    return words;
}


AREA.getWordCloudData = function(queryID, subqueryID, collName){
  var sortable = [];
  var queryData = QUERY.getAggregateQueryDataByID(queryID);
  var keywords = queryData.subqueryList[subqueryID][collName].keyword;
  var w;
  for (w of Object.keys(keywords)){
    sortable.push([w, keywords[w]]);
  }
  sortable.sort(function(a, b) {
    return b[1] - a[1];
  });
  var words = {};
  for (var i = 0; i < sortable.length; i++) {
    var word = sortable[i][0];
    var freq = sortable[i][1];
    words[word] = freq;
  }
  return words;
}

// Getting keyword and remove all stop words
// AREA.wordCloudKeywords = function(data) {
//     var words = {};
//     var word;
//     var i = 0;
//     var len = data.length;
//     console.log(len);
//     for (i; i < len; i++) {

//         var description = data[i].ptext;

//         // Remove stop word from the sentence
//         if (typeof description === "string") {
//             var sentence = description.removeStopWords();
//             sentence = sentence.replace(/[0-9]/g, '');
//             word = sentence.split(" ");
//             var j = 0;
//             var j_len = word.length;
//             for (j; j < j_len; j++) {
//                 if (!(word[j] in words) && word[j] != "") {
//                     words[word[j]] = 1;
//                 } else {
//                     words[word[j]] += 1;
//                 }
//             }
//         }
//     }

//     var sortable = [];
//     for (var word in words) {
//         sortable.push([word, words[word]]);
//     }

//     sortable.sort(function(a, b) {
//         return b[1] - a[1];
//     });

//     console.log(sortable.slice(0, 20));

//     var data2 = {};
//     for (var i = 0; i < sortable.length; i++) {
//         var word = sortable[i][0];
//         var freq = sortable[i][1];
//         data2[word] = freq;
//     }

//     console.log(data2);


//     return data2;
// }

// simply select all tweetIDs 
AREA.simpleSubQuery = function(queryID, collName){
  var tweetsData = QUERY.selectTweetsResult(queryID, collName);
  var tweetsIDs = Object.getOwnPropertyNames(tweetsData);
  return tweetsIDs
}