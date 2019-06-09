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
    Note: this file contain functions of Query to PHP
*/

var QUERY = QUERY || {};

// Queries php server uri
QUERY.circleQueryUri = "php/circleQuery.php";
QUERY.polygonQueryUri = "php/polygonQuery.php";
QUERY.rectangleQueryUri = "php/polygonQuery.php";
QUERY.selectAllQueryUri = "php/selectAll.php";

QUERY.collectionName;
QUERY.collectionNameList = [];

QUERY.availableStates = [
  "Alabama",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"
];
QUERY.selectedStates = [];

QUERY.locationMode = null;
QUERY.goDrawing = false;
QUERY.stagingGeoType = null;
QUERY.stagingGeoInfo = null;
QUERY.queryParams = null;

QUERY.mappingDataList = [];
QUERY.tweetsDataList = [];
QUERY.globalQueryIndex = 0;
// QUERY.globalQueryIndexList = [];

QUERY.activeQueryIndex = -1;
QUERY.activeCollName = '';

QUERY.mappingResultsList = [];
QUERY.tweetsResultsList = [];

QUERY.aggregateMappingResultsList = [];

// Get queries in circle
QUERY.getCircleQueryResult = function(latitude, longitude, radius, layer, collName, collColor, id, keywords, situation, datefrom, dateto) {

    document.getElementById('loadingImage').style.display = 'block';
    var request = QUERY.circleQueryUri + "?lat=" + latitude + "&lng=" + longitude + "&radi=" + radius + "&coll=" + collName;


    // Retrieve query data via AJAX
    $.ajax({
        url: request,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: true,
        success: function(circleQuery) {

            var hasTimeOrNot;

            var queryLength = circleQuery.length;
            if (queryLength !== 0) {
                if (circleQuery[0].pdatetime !== undefined) {
                    hasTimeOrNot = true;
                } else {
                    hasTimeOrNot = false;
                }
            }

            if (hasTimeOrNot === true) {
                var timeFilter = MAP.timeFilterTweets(circleQuery);

                var reportRes = MAP.lunrStoryRegion(keywords, situation, timeFilter);
                //console.log(circleQuery);
                // Create new area

                AREA.addNewArea(reportRes, layer, hasTimeOrNot, collName, collColor, keywords, situation, datefrom, dateto);
                AREA.updateTable(collName, id);
                // Draw a area on the map
                MAP.Initialize(reportRes, collName, collColor);
            } else {

                var reportRes = MAP.lunrStoryRegion(keywords, situation, circleQuery);
                //console.log(circleQuery);
                // Create new area
                AREA.addNewArea(reportRes, layer, hasTimeOrNot, collName, collColor, keywords, situation, datefrom, dateto);
                AREA.updateTable(collName, id);
                // Draw a area on the map
                MAP.Initialize(reportRes, collName, collColor);
            }


            document.getElementById('loadingImage').style.display = 'none';

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            queryResult = 0;
            alert("Query failed ... " + "\nStatus: " + textStatus + "\nError Message: " + errorThrown);
        }
    });

}

QUERY.getCircleQueryResultS = function(latitude, longitude, radius, layer, collName, collColor, id, keywords, situation, datefrom, dateto) {

    document.getElementById('loadingImage').style.display = 'block';
    var request = QUERY.circleQueryUri + "?lat=" + latitude + "&lng=" + longitude + "&radi=" + radius + "&coll=" + collName;


    // Retrieve query data via AJAX
    $.ajax({
        url: request,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: true,
        success: function(circleQuery) {

            var hasTimeOrNot;

            var queryLength = circleQuery.length;
            if (queryLength !== 0) {
                if (circleQuery[0].pdatetime !== undefined) {
                    hasTimeOrNot = true;
                } else {
                    hasTimeOrNot = false;
                }
            }

            if (hasTimeOrNot === true) {
                var timeFilter = [];

                for (var i = 0; i < circleQuery.length; i++) {
                    var datefromdata = TOOL.parseDate(circleQuery[i].pdatetime.replace(/-/g, "/"));
                    if (dateto >= datefromdata && datefrom <= datefromdata) {
                        timeFilter.push(circleQuery[i]);
                    }
                }

                var reportRes = MAP.lunrStoryRegion(keywords, situation, timeFilter);

                MAP.Initialize(reportRes, collName, collColor);
            } else {

                var reportRes = MAP.lunrStoryRegion(keywords, situation, circleQuery);

                MAP.Initialize(reportRes, collName, collColor);
            }


            document.getElementById('loadingImage').style.display = 'none';

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            queryResult = 0;
            alert("Query failed ... " + "\nStatus: " + textStatus + "\nError Message: " + errorThrown);
        }
    });

}


QUERY.getpolygonQueryResult = function(coordinates, layer, collName, collColor, id, keywords, situation, datefrom, dateto) {
    document.getElementById('loadingImage').style.display = 'block';

    var coordString = "";

    for (var i = coordinates.length - 1; i >= 0; i--) {
        coordString += coordinates[i].lat + "," + coordinates[i].lng + ",";
    }
    //Close the loop
    coordString += coordinates[coordinates.length - 1].lat + "," + coordinates[coordinates.length - 1].lng


    var request = QUERY.polygonQueryUri + '?coor=' + coordString + "&coll=" + collName;

    // Retrieve query data via AJAX
    $.ajax({
        url: request,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: true,
        success: function(rectangleQuery) {

            var hasTimeOrNot;

            var queryLength = rectangleQuery.length;
            if (queryLength !== 0) {
                if (rectangleQuery[0].pdatetime !== undefined) {
                    hasTimeOrNot = true;
                } else {
                    hasTimeOrNot = false;
                }
            }

            if (hasTimeOrNot === true) {
                var timeFilter = MAP.timeFilterTweets(rectangleQuery);

                var reportRes = MAP.lunrStoryRegion(keywords, situation, timeFilter);
                //console.log(circleQuery);
                // Create new area

                AREA.addNewArea(reportRes, layer, hasTimeOrNot, collName, collColor, keywords, situation, datefrom, dateto);
                AREA.updateTable(collName, id);
                // Draw a area on the map
                MAP.Initialize(reportRes, collName, collColor);
            } else {

                var reportRes = MAP.lunrStoryRegion(keywords, situation, rectangleQuery);
                //console.log(circleQuery);
                // Create new area
                AREA.addNewArea(reportRes, layer, hasTimeOrNot, collName, collColor, keywords, situation, datefrom, dateto);
                AREA.updateTable(collName, id);
                // Draw a area on the map
                MAP.Initialize(reportRes, collName, collColor);
            }


            document.getElementById('loadingImage').style.display = 'none';
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Query failed ... " + "\nStatus: " + textStatus + "\nError Message: " + errorThrown);
        }
    });

}

QUERY.getpolygonQueryResultS = function(coordinates, layer, collName, collColor, id, keywords, situation, datefrom, dateto) {
    document.getElementById('loadingImage').style.display = 'block';
    var coordString = "";

    for (var i = coordinates.length - 1; i >= 0; i--) {
        coordString += coordinates[i].lat + "," + coordinates[i].lng + ",";
    }
    //Close the loop
    coordString += coordinates[coordinates.length - 1].lat + "," + coordinates[coordinates.length - 1].lng


    var request = QUERY.polygonQueryUri + '?coor=' + coordString + "&coll=" + collName;

    // Retrieve query data via AJAX
    $.ajax({
        url: request,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: true,
        success: function(rectangleQuery) {

            var hasTimeOrNot;

            var queryLength = rectangleQuery.length;
            if (queryLength !== 0) {
                if (rectangleQuery[0].pdatetime !== undefined) {
                    hasTimeOrNot = true;
                } else {
                    hasTimeOrNot = false;
                }
            }

            if (hasTimeOrNot === true) {
                var timeFilter = [];

                for (var i = 0; i < rectangleQuery.length; i++) {
                    var datefromdata = TOOL.parseDate(rectangleQuery[i].pdatetime.replace(/-/g, "/"));
                    if (dateto >= datefromdata && datefrom <= datefromdata) {
                        timeFilter.push(rectangleQuery[i]);
                    }
                }

                var reportRes = MAP.lunrStoryRegion(keywords, situation, timeFilter);

                MAP.Initialize(reportRes, collName, collColor);
            } else {

                var reportRes = MAP.lunrStoryRegion(keywords, situation, rectangleQuery);

                MAP.Initialize(reportRes, collName, collColor);
            }


            document.getElementById('loadingImage').style.display = 'none';

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            queryResult = 0;
            alert("Query failed ... " + "\nStatus: " + textStatus + "\nError Message: " + errorThrown);
        }
    });

}

QUERY.getpolygonQueryResultShap = function(coordinates, layer) {
    document.getElementById('loadingImage').style.display = 'block';

}


QUERY.getAllData = function(collName) {
    document.getElementById('loadingImage').style.display = 'block';
    var request = QUERY.selectAllQueryUri + "?coll=" + collName;

    $.ajax({
        type: "GET",
        url: request,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: true,
        success: function(result) {
            var timeFilter = [];

            var datefrom = TOOL.parseDate(document.getElementById('datefrom').value);
            var dateto = TOOL.parseDate(document.getElementById('dateto').value);
            for (var i = 0; i < result.length; i++) {
                var datefromdata = TOOL.parseDate(result[i].date.replace(/-/g, "/"));
                if (dateto >= datefromdata && datefrom <= datefromdata) {
                    timeFilter.push(result[i]);
                }
            }

            var keywords = document.getElementsByName('searchKeys')[0].value;
            var situation = document.getElementsByName('searchSitu')[0].value;
            var street = document.getElementsByName('searchStreet')[0].value;

            var genderValue = document.getElementById("genderSelect");
            var gender = genderValue.options[genderValue.selectedIndex].value;

            var ageValue = document.getElementById("ageSelect");
            var age = ageValue.options[ageValue.selectedIndex].value;


            MAP.lunrStory(keywords.toString(), situation.toString(), street.toString(), gender.toString(), age.toString(), timeFilter);
            document.getElementById('loadingImage').style.display = 'none';

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Query failed ... " + "\nStatus: " + textStatus + "\nError Message: " + errorThrown);
        }
    });

}


QUERY.showAllData = function(collName, collColor, type) {
    document.getElementById('loadingImage').style.display = 'block';
    var request = QUERY.selectAllQueryUri + "?coll=" + collName;

    $.ajax({
        type: "GET",
        url: request,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: true,
        success: function(result) {

            if (type === "marker") {
                MAP.drawGlobalMarker(result, collName, collColor);

                var globalName = "global" + collName;

                window[globalName].eachLayer(function(layer) {
                    layer.bringToBack();
                });
            }

            if (type === "heat") {
                MAP.drawHeatmap(result, collName);
            }



            document.getElementById('loadingImage').style.display = 'none';

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Query failed ... " + "\nStatus: " + textStatus + "\nError Message: " + errorThrown);
        }
    });

}

QUERY.fireQuery = function(queryParams){
  console.log('inside QUERY.fireQuery')
  console.log(queryParams)
  document.getElementById('loadingImage').style.display = 'block';
  var xhr = $.ajax(
  {
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    async: true,
    method: "GET",
    url: "/DrugVis/cgi-bin/query_cgi.py",
    data: {data: JSON.stringify(queryParams)},
    // data: queryParams,
    success: function (resp, status, XHR)
    {
      console.log('ajax success');
      console.log(status);
      // console.log(XHR);
      // console.log(resp);
      QUERY.handleQueryResults(queryParams, resp);
      document.getElementById('loadingImage').style.display = 'none';
    },
    error: function(request, ajaxOptions, thrownError)
    {
      console.log('ajax error');
      console.log(request.responseText);
      var j = JSON.parse(request.responseText)
      console.log(j)
      console.log(ajaxOptions);
      console.log(thrownError);
      document.getElementById('loadingImage').style.display = 'none';
    }
  });
  return;
}

// first version, handles separate mapping and tweets data
// QUERY.handleQueryResults = function(resp){
//   // console.log(QUERY.globalQueryIndex);
//   // console.log(QUERY.collectionNameList);
//   console.log(resp);
//   // var response = JSON.parse(resp);
//   console.log(resp['type']);
//   // alert query error
//   if (resp['type'] === 'queryError'){
//     alert(resp['type'] + ': ' + resp['message']);
//   } else if (resp['type'] === 'queryResults'){
//     var currentQueryID = QUERY.globalQueryIndex;
//     // save query
//     AREA.queryList.push(QUERY.queryParams)
//     // save query results
//     var mappingData = {
//       queryID: QUERY.globalQueryIndex,
//       mappingResults: resp['mapping_data']
//     }
//     QUERY.mappingResultsList.push(mappingData);
//     // save tweets data
//     var tweetsSize = QUERY.queryParams.queryCollNames.length;
//     for (var i = 0; i < tweetsSize; i++){
//       var tweetsData = {
//         queryID: QUERY.globalQueryIndex,
//         queryCollName: QUERY.queryParams.queryCollNames[i],
//         queryResults: resp['tweets_data'][QUERY.queryParams.queryCollNames[i]]
//       }
//       QUERY.tweetsDataList.push(tweetsData)
//     }
//     // change some global values
//     QUERY.globalQueryIndex = QUERY.globalQueryIndex + 1;
//     // prepare sub query and data to draw
//     var tweetsID = AREA.simpleSubQuery(currentQueryID, 'tweets_100k');
//     var censusTractTweetData = MAP.countTweetsOnGeoid(currentQueryID, 'tweets_100k', tweetsID)
//     var mappingData = QUERY.getMappingDataByID(currentQueryID);
//     var displayGeoJson = MAP.buildDisplayGeoJson(mappingData, censusTractTweetData)
//     // call display function
//     MAP.drawCensusTractsLayer(displayGeoJson)
//   }
// }

// second version, only handles aggregated mapping data
QUERY.handleQueryResults = function(queryParams, resp){
  // console.log(QUERY.globalQueryIndex);
  // console.log(QUERY.collectionNameList);
  console.log(resp);
  // var response = JSON.parse(resp);
  console.log(resp['type']);
  // alert query error
  if (resp['type'] === 'queryError'){
    alert(resp['type'] + ': ' + resp['message']);
  } else if (resp['type'] === 'queryResults'){
    console.log('full query')
    // hide current query if present
    if (!(QUERY.activeQueryIndex === -1)) {
      console.log('hide current display');
      MAP.hideAggregatedHeatmap(QUERY.activeQueryIndex, QUERY.activeCollName);
      MAP.hideChoropleth(QUERY.activeQueryIndex, QUERY.activeCollName);
      MAP.hideQueryLayer(QUERY.activeQueryIndex);
      MAP.hideLegend();
    }
    // save the query results into a new slot
    QUERY.activeQueryIndex = resp.queryID;
    // now only supports one dataset
    QUERY.activeCollName = queryParams.queryCollNames[0];
    
    // save query
    AREA.queryList.push(queryParams);
    // save query results
    var resultObj = {
      queryID: resp.queryID,
      subqueryList: [],
      sampleList: {},
      mappingData: resp.mappingData,
      geoidList: resp.geoidList
    }
    resultObj.subqueryList.push(resp.tweetsData);
    resultObj.sampleList['fullSample'] = resp.sampleData;
    // resultObj.sampleList.push(resp.sampleData);
    // compute some extra data
    resultObj = QUERY.preprocessResults(resultObj, QUERY.activeCollName);
    // add to query list on left
    QUERY.addQueryToList(resultObj, QUERY.activeCollName);
    // save results to global list
    QUERY.aggregateMappingResultsList.push(resultObj);
    // change some global values
    QUERY.globalQueryIndex = resp['queryID'] + 1;

    // update sample display panel
    AREA.updateSampleDisplay(resultObj, 'fullSample', QUERY.activeCollName);

    // update query information panel
    AREA.updateQueryParamsDisplay(queryParams, resultObj)

    // prepare break points and data to draw
    var breaks = MAP.getBins(QUERY.activeQueryIndex);
    
    // draw choropleth and legend
    var displayGeoJson = MAP.buildDisplayGeoJson(resultObj, QUERY.activeCollName);
    MAP.drawChoropleth(displayGeoJson, breaks, QUERY.activeQueryIndex, QUERY.activeCollName);
    MAP.showChoropleth(QUERY.activeQueryIndex, QUERY.activeCollName);

    // test heatmap
    MAP.drawAggregatedHeatmap(QUERY.activeQueryIndex, QUERY.activeCollName);

    // test keyword chart
    AREA.updateWordCloud(resp.queryID, 0, QUERY.activeCollName);

    // test category chart
    AREA.updateCategoryChart(resp.queryID, 0, QUERY.activeCollName);
    
    // init time charts
    AREA.initTimeChart('year');
    AREA.initTimeChart('month');
    AREA.initTimeChart('week');
    AREA.initTimeChart('day');
    AREA.initTimeChart('hour');
    AREA.initTimeChart('weekday');
    var collName;
    for (collName of Object.values(queryParams.queryCollNames)){
      // test time chart
      AREA.addTimeChartData('year', resp.queryID, 0, collName);
      AREA.addTimeChartData('month', resp.queryID, 0, collName);
      AREA.addTimeChartData('day', resp.queryID, 0, collName);
      AREA.addTimeChartData('week', resp.queryID, 0, collName);
      AREA.addTimeChartData('hour', resp.queryID, 0, collName);
      AREA.addTimeChartData('weekday', resp.queryID, 0, collName);
    }

    // generate legend
    MAP.initLegend(breaks);
    MAP.showLegend();
    // check the choropleth option to display it
    $('#displayTypeChoropleth').prop('checked', true).trigger('change');

  } else if (resp['type'] === 'subqueryResults') {
    console.log('subquery')
    // save sub query results to its corresponding mapping data
    // var mappingData = QUERY.getAggregateMappingDataByID(queryParams.queryID)
    // for (var i=0; i < mappingData.geoidList.length; i++){
    //   mappingData.features
    // }
  } else if (resp['type'] === 'sampleResults') {
    console.log('sample query')
    if (resp['queryID'] != QUERY.activeQueryIndex) {
      console.log('Different query than active');
      // mabye switch to that query
    }
    // save sample results to its corrresponding mapping data
    var resultObj = QUERY.getAggregateQueryDataByID(resp['queryID']);
    resultObj.sampleList[resp.geoID] = resp.sampleData;
    // update sample display panel
    AREA.updateSampleDisplay(resultObj, resp.geoID, QUERY.activeCollName);
  }
}

// get some aggregate data from results
// can be put into python
QUERY.preprocessResults = function(resultObj, collName) {
  var l = resultObj.geoidList.length;
  // init some variables
  resultObj['extraData'] = {}
  resultObj.extraData['tweetCounts'] = [];
  resultObj.extraData['tweetNormCounts'] = [];
  resultObj.extraData['allPops'] = [];
  resultObj.extraData['totalTweetCounts'] = 0;
  // extract count of each block
  for (var i = 0; i < l; i++) {
    var GeoID = resultObj.geoidList[i];
    var count = resultObj.subqueryList[0][collName].count[GeoID];
    if (isNaN(count)) {
      count = 0;
    }
    var pop = resultObj.mappingData[GeoID]['POP'];
    if (pop < 1.0) {
      var countNorm = 0.0;
    } else {
      var countNorm = (count * 1.0) / pop;
    }
    resultObj.extraData['tweetCounts'].push(count);
    resultObj.extraData['allPops'].push(pop);
    resultObj.extraData['tweetNormCounts'].push(countNorm);
    resultObj.extraData['totalTweetCounts'] += count;
  }
  resultObj.extraData['totalTractCounts'] = l;
  return resultObj;
}

// update everythin of current showing
QUERY.showCurrentResults = function() {

}

// run after extra data is processed
QUERY.addQueryToList = function(resultObj, collName) {
  // AREA.clearFiltersNoInfo();

  var areaTableBody = $('#areaTable tbody');
  var queryID = resultObj.queryID;

  console.log('adding ' + queryID + '_' + collName + ' to query list');
  
  var newRow = '<tr id="queryRow-' + queryID + '-' + collName + '" class="sm-font active111 area collapse ' + queryID + '"><td class="active112 sm-align" contenteditable>' + collName + '</td><td class="call sm-align collNameHide">' + resultObj.extraData['totalTweetCounts'] + '</td><td class="call sm-align">' + resultObj.extraData['totalTractCounts'] + '</td><td><button  id="deleteQuery' + queryID + '" class="btn-xs areaRemove" type="button" ><span class="glyphicon glyphicon-trash red"></span></button></td></tr>';
  areaTableBody.append(newRow);
  // show and toggle highlight
  $('#queryRow-' + queryID + '-' + collName).show();
  $('#queryRow-' + queryID + '-' + collName).prevAll('tr').removeClass("active111");
  $('#queryRow-' + queryID + '-' + collName).nextAll('tr').removeClass("active111");
  var className = $('#queryRow-' + queryID + '-' + collName).attr('class').split(" ")
  if (!className.includes("active111")) {
    $(this).toggleClass("active111");
  }
}



QUERY.addSubqueryToList = function(subqueryResultObj, queryID, collName) {
  console.log('addSubqueryToList');
  var rowID = 'queryRow_' + queryID;
  var row = $(rowID);

}

QUERY.removeQueryFromList = function(queryID, collName) {
  console.log('removeQueryFromList');
}

QUERY.removeSubqueryFromList = function(queryID, subqueryID, collName) {
  console.log('removeSubqueryFromList');
}

// QUERY.getMappingDataByID = function(queryID){
//   var l = QUERY.mappingResultsList.length;
//   for (var i = 0; i < l; i++){
//     if (QUERY.mappingResultsList[i].queryID === queryID){
//       return QUERY.mappingResultsList[i]['mappingResults'];
//     }
//   }
// }

QUERY.getAggregateQueryDataByID = function(queryID){
  var l = QUERY.aggregateMappingResultsList.length;
  for (var i = 0; i < l; i++){
    if (QUERY.aggregateMappingResultsList[i].queryID === queryID){
      return QUERY.aggregateMappingResultsList[i];
    }
  }
}

QUERY.getQueryParamsByID = function(queryID) {
  var l = AREA.queryList.length;
  for (var i=0; i < l; i++) {
    if (AREA.queryList[i].queryID === queryID) {
      return AREA.queryList[i];
    }
  }
}

QUERY.selectTweetsResult = function(queryID, collName){
  var l = QUERY.tweetsDataList.length;
  for (var i=0; i < l; i++){
    if (QUERY.tweetsDataList[i].queryID === queryID && QUERY.tweetsDataList[i].queryCollName === collName){
      return QUERY.tweetsDataList[i]['queryResults'];
    }
  }
}

QUERY.resetQueryModal = function() {
  console.log('resetQueryModel');
  // clean drawing information
  QUERY.stagingGeoType = null;
  QUERY.stagingGeoInfo = null;
  QUERY.goDrawing = false;
  $("#queryDrawDoneTip").text("No area drawn.");
  $("#queryGoDraw").text("Go Draw");
  // reset query location type select
  // $('#queryLocTypeSelect').eq(0).attr('selected', true);
  $('#queryLocTypeSelect').val('');
  $('#queryLocTypeSelect').change();
  QUERY.selectedStates = [];
  $("#queryShowStateSelect").text("No state selected");
  // remove/hide current display if there is one
  console.log(QUERY.activeQueryIndex);
  console.log(!(QUERY.activeQueryIndex === -1));
  // modal is triggered in html settings
  // process collnames
  var collNames = "";
  QUERY.collectionNameList.forEach(function(value, index, array){
    collNames = collNames + value.split(",")[0] + ',';
  });
  if (collNames === ""){
    $("#queryModalTitle").text("Perform Query on: No dataset selected.");
  } else{
    $("#queryModalTitle").text("Perform Query on: " + collNames);
  }
  // set default date
  var now = new Date();
  var day = ("0" + now.getDate()).slice(-2);
  var month = ("0" + (now.getMonth() + 1)).slice(-2);
  var today = now.getFullYear()+"-"+(month)+"-"+(day);
  $("#queryDateFrom").val("2016-01-01");
  $("#queryDateTo").val(today);
}


QUERY.initQueryModal = function() {
  console.log('initQueryModel');
  // click the launch new query botton
  $("#launchNewQuery").click(function(e){
    if (QUERY.selectedStates.length > 0 || QUERY.stagingGeoInfo != null || QUERY.activeQueryIndex < 0) {
      QUERY.resetQueryModal();
    }
  });

  // hide/show panel according to selection
  $('#queryLocTypeSelect').change(function(e){
    var s = e.target.selectedIndex;
    var $queryStateSelectPanel = $('#queryStateSelectPanel')
    var $queryDrawAreaPanel = $('#queryDrawAreaPanel')
    console.log(s)
    switch(s){
      case(0):
        QUERY.locationMode = null;
        $queryStateSelectPanel.hide();
        $queryDrawAreaPanel.hide();
        break;
      case(1):
        QUERY.locationMode = 'states'
        $queryStateSelectPanel.show();
        $queryDrawAreaPanel.hide();
        break;
      case(2):
        QUERY.locationMode = 'draw'
        $queryStateSelectPanel.hide();
        $queryDrawAreaPanel.show();
        break;
    };
  });

  // add/remove input state
  $("#queryStateChange").click(function(e){
    var $queryStateInput = $("#queryStateInput");
    var state = $queryStateInput.val();
    if (state === ""){
      return;
    }
    var isValid = $.inArray(state, QUERY.availableStates);
    if (isValid === -1){
      alert(`Your input ${state} is not a valid state name.`);
    } else {
      var isIn = $.inArray(state, QUERY.selectedStates);
      if (isIn === -1){
        QUERY.selectedStates.push(state);
        $queryStateInput.val("");
      } else {
        QUERY.selectedStates.splice(isIn, 1);
        $queryStateInput.val("");
      }
      QUERY.selectedStates.sort();
      var displayStr = "Selected states: ".concat(QUERY.selectedStates.join(', '));
      $("#queryShowStateSelect").text(displayStr);
    }
  });
  
  // override enter key press
  $('#queryStateInput').keyup(function(e){
    var code = e.which;
    if (code === 13){
      $("#queryStateChange").click();
    }
  });
  
  // reset selected states
  $("#queryStateReset").click(function(e){
    QUERY.selectedStates = [];
    $("#queryShowStateSelect").text("No state selected");
  });

  // set autocomplete
  var $queryStateInput = $('#queryStateInput');
  $queryStateInput.val("");
  $queryStateInput.autocomplete({
    source: function(req, response) {
      var re = $.ui.autocomplete.escapeRegex(req.term);
      var matcher = new RegExp("^" + re, "i");
      response($.grep(QUERY.availableStates, function(item) {
          return matcher.test(item);
      }));
    },
    minLength: 0,
    appendTo: $("#queryStateSelectPanel")
  });

  // click to show show all states
  $("#queryShowAllState").click(function(e){
    $queryStateInput.trigger("focus");
    $queryStateInput.autocomplete("search", "");
  });

  // send user to draw area
  $("#queryGoDraw").click(function(e){
    if (QUERY.stagingGeoInfo != null){
      // if there is existing drawing
      MAP.deleteLayerFromGroupByID(MAP.queryLayers, QUERY.globalQueryIndex)
      MAP.deleteLayerFromGroupByID(MAP.queryLayersArchive, QUERY.globalQueryIndex)
      QUERY.stagingGeoType = null;
      QUERY.stagingGeoInfo = null;
      QUERY.goDrawing = true;
      $("#queryModal").modal('hide');
      $("#queryDrawDoneTip").text("No area drawn.");
      $("#queryGoDraw").text("Re-draw");
    } else if (QUERY.goDrawing === false){
      // not at drawing mode
      QUERY.goDrawing = true;
      $("#queryModal").modal('hide');
      $("#queryGoDraw").text("Re-draw");
    }
  });

  // add event to cancel button
  $('#cancelQuery').click(function(e){
    MAP.deleteLayerFromGroupByID(MAP.queryLayers, QUERY.globalQueryIndex)
    MAP.deleteLayerFromGroupByID(MAP.queryLayersArchive, QUERY.globalQueryIndex)
    MAP.removeQueryLayer(QUERY.globalQueryIndex);
    QUERY.stagingGeoType = null;
    QUERY.stagingGeoInfo = null;
    QUERY.goDrawing = false;
    $("#queryDrawDoneTip").text("No area drawn.");
    $("#queryModal").modal('hide');
    $("#queryGoDraw").text("Go Draw");
  });

  // actually fire a query
  $("#performQuery").click(function(e){
    // process collnames
    var collNames = [];
    QUERY.collectionNameList.forEach(function(value, index, array){
      collNames.push(value.split(",")[0]);
    });
    if (collNames.length === 0){
      alert("No data collection is selected");
      return;
    }
    // check for states/draw areas
    if (QUERY.locationMode === 'states') {
      var stateMode = $("#queryStateSelectPanel input[name=queryStateMode]:checked").val();
      if (stateMode === "include" && QUERY.selectedStates.length == 0) {
        alert('No states included');
        return;
      } else if (stateMode === "exclude" && QUERY.selectedStates.length == 49) {
        alert('All states are excluded');
        return;
      }
    } else if (QUERY.locationMode === 'draw') {
      if (QUERY.stagingGeoInfo === null){
        alert('No area drawn');
        return;
      }
    } else if (QUERY.locationMode === null) {
      alert('Query area not defined');
      return;
    }
    
    $("#queryModal").modal('hide');
    
    QUERY.queryParams = {
      queryID: QUERY.globalQueryIndex,
      queryMode: 'full',
      queryKeywords: $("#queryKeywords").val(),
      queryKeywordMode: $("#queryKeywordForm input[name=queryKeywordMode]:checked").val(),
      queryDateFrom: $("#queryDateFrom").val(),
      queryDateTo: $("#queryDateTo").val(),
      queryGeoMode: null,
      queryCensusYear: '2010',
      queryDateMode: 'local',
      queryCollNames: collNames,
      // queryPopLimit: $('#queryPopSlider').val()
      queryPopLimit: 10
    }
    // console.log(QUERY.locationMode)
    if (QUERY.locationMode === 'states' || QUERY.locationMode === null){
      QUERY.queryParams.queryGeoMode = 'states';
      QUERY.queryParams.queryGeoType = null;
      QUERY.queryParams.queryGeoInfo = null;
      QUERY.queryParams.queryLocation = QUERY.selectedStates;
      QUERY.queryParams.queryLocationMode = $("#queryStateSelectPanel input[name=queryStateMode]:checked").val();
    } else{
      QUERY.queryParams.queryGeoMode = 'geo';
      QUERY.queryParams.queryGeoType = QUERY.stagingGeoType,
      QUERY.queryParams.queryGeoInfo = QUERY.stagingGeoInfo,
      QUERY.queryParams.queryLocation = null;
      QUERY.queryParams.queryLocationMode =null;
    }
    // fire query
    QUERY.fireQuery(QUERY.queryParams);
  });
}

// $(window).on('load', function(){
//   // add auto complete to the state input
// });

// all kinds of inits happend here
$(document).ready(function() {
  // display value of slider
  // $('#queryPopSlider').val(50);
  // $('#queryPopSlider').on("input", function(e){
  //   $('#queryPopShowValue').text("Value = " + $(this).val().toString());
  // });

  // init the query modal
  QUERY.initQueryModal();
});