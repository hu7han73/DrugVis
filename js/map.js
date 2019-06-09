// DrugVis
// By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
// License: BSD

// @Date    : 2018-07-15 18:55:01
// @Author  : Chao Ma (cma1@kent.edu)
// @Website : http://vis.cs.kent.edu/NeighborVis/
// @Link    : https://github.com/AlexMa1989
// @Version : $Id$

/*
    map.js
    Note: this file contain functions of Map View
*/

var MAP = MAP || {};



MAP.tweetIDs;
MAP.tweets;
MAP.timeFilter;
MAP.shapeFiles = L.layerGroup();
MAP.marker = L.layerGroup();
MAP.markerGlobal = L.layerGroup();

MAP.customLayers = {};
MAP.legend = null;

//map layers
MAP.map = L.map('map',{renderer: L.canvas()}).setView([40.646722, -73.933333], 11); // current leaflet map

var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicGFybmRlcHUiLCJhIjoiY2l6dXZ5OXVkMDByZDMycXI2NGgyOGdyNiJ9.jyTchGQ8N1gjPdra98qRYg'
});

var google = L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
    attribution: 'google'
});

var googleLayer = L.tileLayer('http://mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    attribution: 'google'
});

var drawnItems = L.featureGroup();

MAP.lc = L.control.layers({
    "Map": osm,
    "Google Map": googleLayer.addTo(MAP.map),
    "Satellite": google
}, {
    'drawlayer': drawnItems
}, {
    position: 'topleft',
    collapsed: true
}).addTo(MAP.map);

MAP.queryLayers = new L.FeatureGroup();
MAP.map.addLayer(MAP.queryLayers);
// layers not for display but need to keep goes here
MAP.queryLayersArchive = new L.FeatureGroup();

MAP.heatLayer = null;


//leaflet draw options
var options = {
    position: 'topleft',
    draw: {
        polyline: false,// Turns off this drawing tool
        polygon: {
            metric: true,
            showArea: true,
            allowIntersection: true,
            drawError: {
                color: '#b00b00',
                timeout: 1000
            },
            shapeOptions: {
                color: '#315f96',
                fillOpacity: 0.2,
                weight: 0,
                clickable: true
            }
        },
        circle: {
            showArea: true,
            metric: true,
            allowIntersection: true,
            drawError: {
                color: 'red',
                message: '<strong>Drawing shape error<strong>'
            },
            shapeOptions: {
                color: '#c4a125',
                fillOpacity: 0.3,
                weight: 0.5,
                clickable: true
            }
        },
        rectangle: {
            metric: true,
            showArea: true,
            allowIntersection: true,
            drawError: {
                color: '#b00b00',
                timeout: 1000
            },
            shapeOptions: {
                color: '#b65fe2',
                fillOpacity: 0.2,
                weight: 0,
                clickable: true
            }
        },
        marker: false// Turns off this drawing tool
    },
    edit: {
        featureGroup: MAP.queryLayers, //REQUIRED!!
        remove: false
    }
};

var drawControl = new L.Control.Draw(options);
drawControl.addTo(MAP.map);

MAP.popup = L.popup({
    maxWidth: 330
});


//leaflet draw methods
// MAP.map.on('draw:created', function(e) {
//     var type = e.layerType,
//         layer = e.layer;
//     console.log(e);
//     // Add drawing layer to map
//     MAP.queryLayers.addLayer(layer);
//     switch (type) {
//         case 'circle':
//             MAP.clear();
//             var index = MAP.QueryIndex + 1;
//             var id = 'query' + index; //****************
//             var collLengh = QUERY.collectionNameList.length;
//             var type = "circle"
//             var geoInfo = [layer._latlng.lat, layer._latlng.lng, layer._mRadius];
//             var keywords = document.getElementsByName('searchKeysReg')[0].value;
//             var situation = document.getElementsByName('searchSituReg')[0].value;
//             var datefrom = document.getElementById('datefrom').value;
//             var dateto = document.getElementById('dateto').value;
//             var fromToFilter = datefrom + " " + dateto;

//             $('#keywordFilter').text(keywords);
//             $('#situFilter').text(situation);
//             $('#FromToFilter').text(fromToFilter.toString());

//             var attribute = new AREA.eachQuery(id, QUERY.collectionNameList, type, geoInfo, layer, keywords, situation, datefrom, dateto);
//             AREA.queryList.push(attribute);

//             // get result in circle
//             for (i = 0; i < QUERY.collectionNameList.length; i++) {
//                 var split = QUERY.collectionNameList[i].split(",");
//                 var collName = split[0];
//                 var collColor = split[1];
//                 QUERY.getCircleQueryResult(layer._latlng.lat, layer._latlng.lng, layer._mRadius, layer, collName, collColor, id, keywords, situation, datefrom, dateto);
//             }

//             AREA.updateQueryTable(id, collLengh);
//             AREA.updateInfo(id, QUERY.collectionNameList, layer);

//             MAP.QueryIndex = index;
//             break;
//         case 'rectangle':
//             MAP.clear();
//             var index = MAP.QueryIndex + 1;
//             var id = 'query' + index; //****************
//             var collLengh = QUERY.collectionNameList.length;
//             var type = "rectangle"
//             var geoInfo = [layer._latlngs[0]];
//             var keywords = document.getElementsByName('searchKeysReg')[0].value;
//             var situation = document.getElementsByName('searchSituReg')[0].value;
//             var datefrom = document.getElementById('datefrom').value;
//             var dateto = document.getElementById('dateto').value;
//             var fromToFilter = datefrom + " " + dateto;

//             $('#keywordFilter').text(keywords);
//             $('#situFilter').text(situation);
//             $('#FromToFilter').text(fromToFilter.toString());

//             var attribute = new AREA.eachQuery(id, QUERY.collectionNameList, type, geoInfo, layer, keywords, situation, datefrom, dateto);
//             AREA.queryList.push(attribute);

//             // get result in circle
//             for (i = 0; i < QUERY.collectionNameList.length; i++) {
//                 var split = QUERY.collectionNameList[i].split(",");
//                 var collName = split[0];
//                 var collColor = split[1];
//                 QUERY.getpolygonQueryResult(layer._latlngs[0], layer, collName, collColor, id, keywords, situation, datefrom, dateto);
//             }

//             AREA.updateQueryTable(id, collLengh);
//             AREA.updateInfo(id, QUERY.collectionNameList, layer);

//             MAP.QueryIndex = index;

//             break;
//         case 'polygon':
//             MAP.clear();
//             var index = MAP.QueryIndex + 1;
//             var id = 'query' + index; //****************
//             var collLengh = QUERY.collectionNameList.length;
//             var type = "polygon"
//             var geoInfo = [layer._latlngs[0]];
//             var keywords = document.getElementsByName('searchKeysReg')[0].value;
//             var situation = document.getElementsByName('searchSituReg')[0].value;
//             var datefrom = document.getElementById('datefrom').value;
//             var dateto = document.getElementById('dateto').value;
//             var fromToFilter = datefrom + " " + dateto;

//             $('#keywordFilter').text(keywords);
//             $('#situFilter').text(situation);
//             $('#FromToFilter').text(fromToFilter.toString());

//             var attribute = new AREA.eachQuery(id, QUERY.collectionNameList, type, geoInfo, layer, keywords, situation, datefrom, dateto);
//             AREA.queryList.push(attribute);


//             // get result in circle
//             for (i = 0; i < QUERY.collectionNameList.length; i++) {
//                 var split = QUERY.collectionNameList[i].split(",");
//                 var collName = split[0];
//                 var collColor = split[1];
//                 QUERY.getpolygonQueryResult(layer._latlngs[0], layer, collName, collColor, id, keywords, situation, datefrom, dateto);
//             }

//             AREA.updateQueryTable(id, collLengh);
//             AREA.updateInfo(id, QUERY.collectionNameList, layer);

//             MAP.QueryIndex = index;

//             break;
//     }
// });

// when area is drawn, send data back to modal and open the modal
MAP.map.on('draw:created', function(e) {
  // when not fired from query panel, make a geo-only query
  if (QUERY.goDrawing != true){
    alert("Please launch a new query first")
    return;
  }
  var type = e.layerType,
      layer = e.layer;
  console.log(e);
  switch (type) {
      case 'circle':
          var geoInfo = [layer._latlng.lat, layer._latlng.lng, layer._mRadius];
          break;
      case 'rectangle':
          var geoInfo = [layer._latlngs[0]];
          break;
      case 'polygon':
          var geoInfo = [layer._latlngs[0]];
          break;
  }
  // get an layerID
  layer.layerID = QUERY.globalQueryIndex;
  // Add drawing layer to map
  MAP.queryLayers.addLayer(layer);
  // save current area info
  QUERY.stagingGeoType = type;
  QUERY.stagingGeoInfo = geoInfo;
  // show query modal and show info
  var showStr = ["Type: ", type, "; ", geoInfo.toString()]
  $("#queryDrawDoneTip").text(showStr.join(""));
  $("#queryModal").modal('show');
  // QUERY.goDrawing = false;
  $("#queryGoDraw").text("Re-draw");
});

// delete a layer from a feature group
MAP.deleteLayerFromGroupByID = function (group, ID) {
  group.eachLayer(function(layer) {
    if (layer.layerID === ID) {
      group.removeLayer(layer);
    }
  });
}

// move layer from one group to another group
// layers in QUERY.
MAP.moveLayerByID = function(from, to, ID){
  from.eachLayer(function(layer){
    if (layer.layerID === ID){
      to.addLayer(layer);
      from.removeLayer(layer);
    }
  });
}

MAP.hideLayerByID = function(group, ID){
  group.eachLayer(function(layer) {
    if (layer.layerID === ID) {
      MAP.map.removeLayer(layer);
    }
  });
}


MAP.showQueryLayer = function(ID) {
  MAP.queryLayersArchive.eachLayer(function(layer){
    if (layer.layerID === ID){
      MAP.queryLayers.addLayer(layer);
      MAP.queryLayersArchive.removeLayer(layer);
    }
  });
}

MAP.hideQueryLayer = function(ID) {
  MAP.queryLayers.eachLayer(function(layer){
    if (layer.layerID === ID){
      MAP.queryLayersArchive.addLayer(layer);
      MAP.queryLayers.removeLayer(layer);
    }
  });
}

MAP.removeQueryLayer = function(ID) {
  MAP.deleteLayerFromGroupByID(MAP.queryLayers, ID);
  MAP.deleteLayerFromGroupByID(MAP.queryLayersArchive, ID);
}

MAP.getLayerName = function(type, queryID, collName) {
  var name = type + '_' + queryID + '_' + collName;
  return name;
}

// Initailize map
// MAP.Initialize = function(tweets, collName, collColor) {
//     // MAP.clear();

//     window[collName] = L.layerGroup();
//     window[collName + "legend"] = L.control({
//         position: 'bottomleft'
//     });

//     MAP.drawMarker(tweets, collName, collColor);
// }



// Clear all layers
// MAP.clear = function() {
//     console.log('Clear all map layers');

//     var collections = DataManager.getCollections();
//     console.log(collections);
//     var collLen = collections.length;
//     MAP.shapeFiles.clearLayers();

//     for (i = 0; i < collLen; i++) {
//         var collName = collections[i];
//         // MAP.map.removeLayer(window[collName]);
//         window[collName].clearLayers();
//         MAP.map.removeControl(window[collName + "legend"]);

//     }

// }

// MAP.clearGolobal = function() {

//     var collections = DataManager.getCollections();
//     var collLen = collections.length;

//     for (i = 0; i < collLen; i++) {
//         var collName = collections[i];
//         var globalMarker = "global" + collName;
//         var globalHeat = "heat" + collName;
//         window[globalMarker].clearLayers();
//         MAP.map.removeLayer(window[globalHeat]);


//     }

// }

// Draw marker layers
// MAP.drawMarker = function(tweets, collName, collColor) {

//     // Clear all marker layers

//     var markerPos = [];
//     var locationStr = [];

//     // Adding the position of marker (no duplicate)
//     var i = 0;
//     var len = tweets.length;
//     for (i; i < len; i++) {
//         var latitude = tweets[i].loc.coordinates[1];
//         var longitude = tweets[i].loc.coordinates[0];
//         var time = tweets[i].pdatetime;
//         var situation = tweets[i].pcategory;
//         var description = tweets[i].ptext;

//         var locationString = latitude + ',' + longitude;
//         if (!locationStr.includes(locationString)) {
//             var tweets_count = 1;
//             var position = [situation, latitude, longitude, time, description, tweets_count];
//             locationStr.push(locationString);
//             markerPos.push(position);
//         } else {
//             // Increase tweet count at the same location
//             var j = 0;
//             var j_len = markerPos.length;
//             for (j; j < j_len; j++) {
//                 if (markerPos[j][1] === latitude && markerPos[j][2] === longitude) {
//                     markerPos[j][5] = markerPos[j][5] + 1;
//                 }
//             }

//         }
//     }


//     var n = 0;
//     var n_len = markerPos.length;

//     var count_list = [];

//     for (k = 0; k < n_len; k++) {
//         var tweet_count = markerPos[k][5];
//         count_list.push(tweet_count);
//     }

//     var max = Math.max(...count_list);
//     var min = 1;

//     var max_1 = Math.round(max * 0.25);
//     var max_2 = Math.round(max * 0.5);
//     var max_3 = Math.round(max * 0.75);


//     window[collName + "legend"].onAdd = function(map) {

//         var div = L.DomUtil.create('div', 'info legend'),
//             labels = ['<strong> ' + collName + ' </strong> <br /> <br />'];

//         // loop through our density intervals and generate a label with a colored square for each interval
//         div.innerHTML = labels.join('<br />');
//         div.innerHTML += '<i style="background:' + collColor + '"></i> ' + tweets.length + '<br>' + '<br>';

//         return div;
//     };

//     window[collName + "legend"].addTo(MAP.map);


//     for (n; n < n_len; n++) {
//         var situation = markerPos[n][0];
//         var lat = parseFloat(markerPos[n][1]); // latitude
//         var lng = parseFloat(markerPos[n][2]); // longitude
//         var time = markerPos[n][3];
//         var description = markerPos[n][4];
//         var tweet_count = markerPos[n][5];


//         if (tweet_count === min) {
//             window[collName].addLayer(L.circleMarker([lat, lng], {
//                 fillColor: collColor.toString(),
//                 color: '#000',
//                 fillOpacity: 0.3,
//                 weight: 1,
//                 radius: 5
//             }).bindPopup("<span class = 'popFont'> Date:" + time + "<br />" + "Category:" + situation + "<br />" + "Text:" + description + "<br /> </span>").on('click', markerClick));
//         } else if (tweet_count > min && tweet_count <= max_1) {

//             window[collName].addLayer(L.circleMarker([lat, lng], {
//                 fillColor: collColor.toString(),
//                 color: '#000',
//                 fillOpacity: 0.5,
//                 weight: 1,
//                 radius: 5
//             }).on('click', markerClick));

//         } else if (tweet_count > max_1 && tweet_count <= max_2) {

//             window[collName].addLayer(L.circleMarker([lat, lng], {
//                 fillColor: collColor.toString(),
//                 color: '#000',
//                 fillOpacity: 0.7,
//                 weight: 1,
//                 radius: 5
//             }).on('click', markerClick));

//         } else if (tweet_count > max_2 && tweet_count <= max_3) {

//             window[collName].addLayer(L.circleMarker([lat, lng], {
//                 fillColor: collColor.toString(),
//                 color: '#000',
//                 fillOpacity: 0.9,
//                 weight: 1,
//                 radius: 5
//             }).on('click', markerClick));

//         } else if (tweet_count > max_3 && tweet_count <= max) {

//             window[collName].addLayer(L.circleMarker([lat, lng], {
//                 fillColor: collColor.toString(),
//                 color: '#000',
//                 fillOpacity: 1,
//                 weight: 1,
//                 radius: 5
//             }).on('click', markerClick));

//         }

//     }

//     MAP.map.addLayer(window[collName]);

//     function markerClick(e) {
//         var resultList = [];

//         var lat = this.getLatLng().lat;
//         var lng = this.getLatLng().lng;

//         var len = tweets.length;
//         for (w = 0; w < len; w++) {
//             var latitude = tweets[w].loc.coordinates[1];
//             var longitude = tweets[w].loc.coordinates[0];

//             if (lat === latitude && lng === longitude) {
//                 resultList.push(tweets[w]);
//             }
//         }

//         var streetLat = resultList[0].loc.coordinates[1];
//         var streetLon = resultList[0].loc.coordinates[0];

//         var streetInfo = streetLat.toString() + "  " + streetLon.toString();


//         if (resultList.length !== 1) {
//             var content = '<div class="panel panel-default labelPanelSize"> <div class="panel-heading"><span>' + streetInfo + '</span> <button id="markerinfoButton" class="btn btn-sm btn-primary" title="update" data-toggle="collapse" data-target="#markerinfoPanel" aria-hidden="true"> <span class="glyphicon glyphicon-question-sign customGlyphicon"></span></button> </div><ul class="nav nav-tabs nav-billBoard" style="display: none;"><li class="leftNav active"><a data-toggle="tab" href="#labelTime">Timeline</a></li><li class="leftNav"><a data-toggle="tab" href="#labelKey">Keywords</a></li></ul><div class="panel-body"><div class="tab-content"><div id="labelTime" class="tab-pane fade in active"> <div id="markerinfoPanel" class="panel panel-collapse collapse"><div class="panel-body"><center><strong>User could zoom-in, zoom-out and drag on time-line panel to interact with timeline, to click each pin get the report information </strong></center></div></div> <div id="markerTime"></div><div id = "timeLineInfo"></div><div id="labelKey" class="tab-pane fade"><div id="markerKey"></div></div><div id="labelSitu" class="tab-pane fade"><div id="markerSitu"></div></div><div id="labelInfo" class="tab-pane fade"><div id="area-marker"><table id="area-marker-table" class="table table-hover table-condensed"><thead><tr><th>Time</th><th>Category</th><th>Streets</th></tr></thead><tbody></tbody></table></div></div></div></div></div>';

//             MAP.popup.setLatLng(e.latlng).setContent(content).openOn(MAP.map);
//             // MAP.popup.setLatLng(e.latlng).setContent('<div class = "popupCustom"> <span> This place at <font color="red">' + streetInfo.toString() + '</font> contains <font color="red">' + resultList.length + '</font> reports </span></div> <div id="markerTime"></div> <div><button id="clickAdd" class="clickAdd btn-success" type="button"><span class="fontSize glyphicon glyphicon-ok-sign">&nbsp;ToQueryManager</span></button></div>').openOn(MAP.map);
//             AREA.updateStoryLineChart(resultList);

//             $('#clickAdd').unbind().on('click', function() {

//                 var layer = '';

//                 var timeFilter = MAP.timeFilterTweets(resultList);
//                 MAP.markerInitialize(timeFilter);


//             });


//         }


//     }


// }


// MAP.drawGlobalMarker = function(tweets, collName, collColor) {

//     var globalName = "global" + collName;

//     MAP.map.removeLayer(window[globalName]);


//     // Adding the position of marker (no duplicate)

//     if (tweets !== undefined) {

//         var markerPos = [];
//         var locationStr = [];

//         var i = 0;
//         var len = tweets.length;
//         for (i; i < len; i++) {
//             var latitude = tweets[i].loc.coordinates[1];
//             var longitude = tweets[i].loc.coordinates[0];

//             var locationString = latitude + ',' + longitude;
//             if (!locationStr.includes(locationString)) {
//                 var tweets_count = 1;
//                 var position = [latitude, longitude, tweets_count];
//                 locationStr.push(locationString);
//                 markerPos.push(position);
//             } else {
//                 // Increase tweet count at the same location
//                 var j = 0;
//                 var j_len = markerPos.length;
//                 for (j; j < j_len; j++) {
//                     if (markerPos[j][0] === latitude && markerPos[j][1] === longitude) {
//                         markerPos[j][2] = markerPos[j][2] + 1;
//                     }
//                 }

//             }
//         }


//         var n = 0;
//         var n_len = markerPos.length;

//         for (n; n < n_len; n++) {
//             var lat = parseFloat(markerPos[n][0]); // latitude
//             var lng = parseFloat(markerPos[n][1]); // longitude


//             window[globalName].addLayer(L.circleMarker([lat, lng], {
//                 fillColor: collColor,
//                 color: '#000',
//                 weight: 0.1,
//                 fillOpacity: 0.6,
//                 radius: 3
//             }));
//         }

//         MAP.map.addLayer(window[globalName]);

//     }


// }

// MAP.getHeatMapData = function(tweets) {
//     // extract location from each tweet
//     var data = [];
//     var dateSeries = [];
//     for (var i = 0; i < tweets.length; i++) {
//         var latitude = tweets[i].loc.coordinates[1];
//         var longitude = tweets[i].loc.coordinates[0];
//         var location = latitude.toString() + ',' + longitude.toString();
//         dateSeries.push(location);
//     }
//     // combine tweets at same location.
//     dateSeries.sort();
//     var k = 0;
//     var k_len = dateSeries.length;
//     var date = [],
//         tweetCount = [],
//         prev;
//     for (k; k < k_len; k++) {
//         if (dateSeries[k] != prev) {
//             date.push(dateSeries[k]);
//             tweetCount.push(1);
//         } else {
//             tweetCount[tweetCount.length - 1]++;
//         }
//         prev = dateSeries[k];
//     }
//     // structure the data
//     var j = 0;
//     var j_len = date.length;
//     for (j; j < j_len; j++) {
//         var member = {
//             x: date[j],
//             y: tweetCount[j]
//         }
//         data.push(member);
//     }
//     return data;
// }

// MAP.drawHeatmap = function(tweets, collName) {

//     // Clear all heatmap layers
//     var heatName = "heat" + collName;

//     MAP.map.removeLayer(window[heatName]);

//     var heatData = MAP.getHeatMapData(tweets);

//     var i = 0;
//     var len = heatData.length;
//     var heatmapList = [];
//     for (i; i < len; i++) {
//         var location = heatData[i].x.split(",");
//         var latitude = parseFloat(location[0]);
//         var longitude = parseFloat(location[1]);
//         var count = parseInt(heatData[i].y);
//         heatmapList.push([latitude, longitude, count]);
//     }

//     console.log(tweets)

//     // Create heatmap layer

//     if (tweets.length < 2000) {
//         window[heatName] = L.heatLayer(heatmapList, {
//             radius: 100,
//             blur: 15,
//             maxZoom: 20,
//             minOpacity: 0.7
//         });

//         MAP.map.addLayer(window[heatName]);
//     } else if (tweets.length >= 2000 && tweets.length < 5000) {
//         window[heatName] = L.heatLayer(heatmapList, {
//             radius: 80,
//             blur: 15,
//             maxZoom: 20,
//             minOpacity: 0.7
//         });

//         MAP.map.addLayer(window[heatName]);
//     } else if (tweets.length >= 5000 && tweets.length < 10000) {
//         window[heatName] = L.heatLayer(heatmapList, {
//             radius: 60,
//             blur: 15,
//             maxZoom: 20,
//             minOpacity: 0.7
//         });

//         MAP.map.addLayer(window[heatName]);
//     } else if (tweets.length >= 10000 && tweets.length < 20000) {
//         window[heatName] = L.heatLayer(heatmapList, {
//             radius: 40,
//             blur: 15,
//             maxZoom: 20,
//             minOpacity: 0.7
//         });

//         MAP.map.addLayer(window[heatName]);
//     } else if (tweets.length >= 20000 && tweets.length < 40000) {
//         window[heatName] = L.heatLayer(heatmapList, {
//             radius: 20,
//             blur: 15,
//             maxZoom: 20,
//             minOpacity: 0.7
//         });

//         MAP.map.addLayer(window[heatName]);
//     } else if (tweets.length >= 40000 && tweets.length < 80000) {
//         window[heatName] = L.heatLayer(heatmapList, {
//             radius: 15,
//             blur: 15,
//             maxZoom: 20,
//             minOpacity: 0.7
//         });

//         MAP.map.addLayer(window[heatName]);
//     } else if (tweets.length >= 80000) {
//         window[heatName] = L.heatLayer(heatmapList, {
//             radius: 10,
//             blur: 15,
//             maxZoom: 20,
//             minOpacity: 0.7
//         });

//         MAP.map.addLayer(window[heatName]);
//     }

// }


MAP.getAggregatedHeatMapData = function(resultObj, collName) {
  var data = [];
  var j = 0;
  var tweetsData = resultObj.subqueryList[0];
  for (j; j < resultObj.geoidList.length; j++){
    var GeoID = resultObj.geoidList[j];
    var longitude = resultObj.mappingData[GeoID]['center']['coordinates'][0];
    var latitude = resultObj.mappingData[GeoID]['center']['coordinates'][1];
    var count = tweetsData[collName].count[GeoID];
    var member = [latitude, longitude, count];
    data.push(member)
  }
  return data;
}

// draw heatmap, not necessary show it
MAP.drawAggregatedHeatmap = function(queryID, collName){
  var heatName = MAP.getLayerName('heat', queryID, collName);

  // get mapping data
  var aggregateMappingData = QUERY.getAggregateQueryDataByID(queryID);
  var heatmapData = MAP.getAggregatedHeatMapData(aggregateMappingData, collName);

  console.log(heatmapData);
  MAP.customLayers[heatName] = L.heatLayer(heatmapData, {
    radius: 30,
    blur: 30,
    maxZoom: 5,
    minOpacity: 0.5,
    max: 3000
  });
}

// hide heatmap (remove from active map layers)
MAP.hideAggregatedHeatmap = function(queryID, collName) {
  var heatName = MAP.getLayerName('heat', queryID, collName);
  if (MAP.map.hasLayer(MAP.customLayers[heatName])) {
    MAP.map.removeLayer(MAP.customLayers[heatName]);
  }
}

// show heatmap (add to active map layers)
MAP.showAggregatedHeatmap = function(queryID, collName) {
  var heatName = MAP.getLayerName('heat', queryID, collName);
  if (!MAP.map.hasLayer(MAP.customLayers[heatName])) {
    MAP.map.addLayer(MAP.customLayers[heatName]);
  } 
}

// update heatmap with new options
MAP.updateAggregatedHeatmap = function(options, queryID, collName) {
  var heatName = MAP.getLayerName('heat', queryID, collName);
  MAP.customLayers[heatName].setOptions(options);
}

// old testing function for drawing choropleth
// MAP.onChangeShape = function(event) {

//     // var shapeTable = $('#area-shape-table tbody');

//     var file = event.target.files[0];
//     // var reader = new FileReader();

//     require(['bower_components/catiline/catiline'], function(cw) {
//       var worker = cw({
//           init: function(scope) {
//               // importScripts('js/require.js');
//               // require.config({
//               //     baseUrl: this.base
//               // });
//               scope.shp = shp;
//               // require(['bower_components/shapeFile/shp'], function(shp) {
//               //     scope.shp = shp;
//               // });
//           },
//           data: function(data, cb, scope) {
//               this.shp(data).then(function(geoJson){
//                   if(Array.isArray(geoJson)){
//                       geoJson.forEach(function(geo){
//                           scope.json([geo, geo.fileName, true],true,scope);
//                       });
//                   }else{
//                       scope.json([geoJson, geoJson.fileName, true],true,scope);
//                   }
//               }, function(e) {
//                   console.log('shit', e);
//               });
  
//           },
//           color:function(s){
//               //from http://stackoverflow.com/a/15710692
//               // importScripts('bower_components/colorbrewer/colorbrewer.js');
//               return colorbrewer.Spectral[11][Math.abs(JSON.stringify(s).split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % 11];
//           },
//           makeString:function(buffer) {
//                   var array = new Uint8Array(buffer);
//                   var len = array.length;
//                   var outString = "";
//                   var i = 0;
//                   while (i < len) {
//                       outString += String.fromCharCode(array[i++]);
//                   }
//                   return outString;
//               },
//           json: function(data, cb, scope) {
//               var name = data[1];
//               //console.log(name);
//               var json = data.length === 2 ? JSON.parse(scope.makeString(data[0])) : data[0];
//               var nom;
//               scope.layer(json, name, scope);
//           },layer:function(json,name,scope){
              
//               json.features.forEach(function(feature){
//                   feature.properties.__color__ = scope.color(feature);
//               });
//               scope.fire('json',[json,name]);
//           },
//           base: cw.makeUrl('.')
//       });
      
//       function readerLoad() {
//           if (this.readyState !== 2 || this.error) {
//               return;
//           }
//           else {
//               worker.data(this.result, [this.result]);
//           }
//       }
  
//       function handleZipFile(file) {
          
//           var reader = new FileReader();
//           reader.onload = readerLoad;
//           reader.readAsArrayBuffer(file);
//       }
  
//       function handleFile(file) {
  
//           // MAP.map.spin(true);
//           if (file.name.slice(-3) === 'zip') {
//               return handleZipFile(file);
//           }
//           var reader = new FileReader();
//           reader.onload = function() {
//               var ext;
//               if (reader.readyState !== 2 || reader.error) {
//                   return;
//               }
//               else {
//                   ext = file.name.split('.');
//                   ext = ext[ext.length - 1];
  
  
//                   worker.json([reader.result, file.name.slice(0, (0 - (ext.length + 1)))], [reader.result]);
//               }
//           };
//           reader.readAsArrayBuffer(file);
//       }
  
//       // function makeDiv() {
//       //     var div = L.DomUtil.create('form', 'bgroup');
//       //     div.id = "dropzone";
//       //     return div;
//       // }
  
//       // function makeUp(div, handleFile) {
//       //     var upButton = L.DomUtil.create('input', 'upStuff', div);
//       //     upButton.type = "file";
//       //     upButton.id = "input";
//       //     upButton.onchange = function() {
//       //         var file = document.getElementById("input").files[0];
  
//       //         handleFile(file);
//       //     };
//       //     return upButton;
//       // }
  
//       function setWorkerEvents() {
//           worker.on('json', function(e) {
//               // MAP.map.spin(false);
//               MAP.lc.addOverlay(L.geoJson(e[0], options).addTo(MAP.map), e[1]);
//           });
//           worker.on('error', function(e) {
//               console.warn(e);
//           });
//       }
  
//       setWorkerEvents()
//       setTimeout(function(){
//         handleFile(file)
//       }, 50)
//       // handleFile(file)
  
//       // function makeDone(div, upButton) {
//       //     var doneButton = L.DomUtil.create('button', "btn  btn-primary span3", div);
//       //     doneButton.type = "button";
//       //     doneButton.innerHTML = "Upload File<br />(or Drag and Drop Anywhere)<br />GeoJSON, TopoJSON, or Zipped Shapefile Work";
//       //     L.DomEvent.addListener(doneButton, "click", function() {
//       //         upButton.click();
//       //     });
//       //     return doneButton;
//       // }
  
//       // function addFunction(map) {
//       //     // create the control container with a particular class name
//       //     // var div = makeDiv();
//       //     // var upButton = makeUp(div, handleFile);
//       //     setWorkerEvents()
//       //     // var doneButton = makeDone(div, upButton);
  
//       //     var dropbox = document.getElementById("map");
//       //     dropbox.addEventListener("dragenter", dragenter, false);
//       //     dropbox.addEventListener("dragover", dragover, false);
//       //     dropbox.addEventListener("drop", drop, false);
//       //     dropbox.addEventListener("dragleave", function() {
//       //         m.scrollWheelZoom.enable();
//       //     }, false);
  
//       //     function dragenter(e) {
//       //         e.stopPropagation();
//       //         e.preventDefault();
//       //         m.scrollWheelZoom.disable();
//       //     }
  
//       //     function dragover(e) {
//       //         e.stopPropagation();
//       //         e.preventDefault();
//       //     }
  
//       //     function drop(e) {
//       //         e.stopPropagation();
//       //         e.preventDefault();
//       //         m.scrollWheelZoom.enable();
//       //         var dt = e.dataTransfer;
//       //         var files = dt.files;
  
//       //         var i = 0;
//       //         var len = files.length;
//       //         if (!len) {
//       //             return
//       //         }
//       //         while (i < len) {
//       //             handleFile(files[i]);
//       //             i++;
//       //         }
//       //     }
//       //     return div;
//       // }
//       // var NewButton = L.Control.extend({ //creating the buttons
//       //     options: {
//       //         position: 'topleft'
//       //     },
//       //     onAdd: addFunction
//       // });
      
//       // //add them to the map
//       // m.addControl(new NewButton());
  
//     });
  


//     // shapeTable.empty();

//     // reader.onload = function(progressEvent) {
//     //   // maybe? add lines to shpfile list when loading shpfiles
//     //     // By lines
//     //     shp(this.result).then(function(data) {

//     //         for (var i = 0; i < data.length; i++) {
//     //             var shapeName = "Shape" + (i + 1);
//     //             var shapeInfo = data[i].fileName;
//     //             var newRow = '<tr id="' + i + '"><td>' + shapeName + '</td><td class = "shapeSlider" id="' + i + '">' + shapeInfo + '</td></tr>';
//     //             shapeTable.append(newRow);
//     //         }

//     //         $('#area-shape-table').unbind().on('click', 'tbody tr', function() {


//     //             $(this).prevAll('tr').removeClass("active111");
//     //             $(this).nextAll('tr').removeClass("active111");
//     //             $(this).toggleClass("active111");

//     //             var id = this.id;
//     //             var shapeList = [];

//     //             var ac_shpfile = new L.Shapefile(data[id], {
//     //                 onEachFeature: function(feature, layer) {
//     //                     /* Add some colors based on shapefile features */

//     //                     var latLng = layer._latlngs[0];
//     //                     var layer = layer;

//     //                     var list = [latLng, layer];
//     //                     shapeList.push(list);


//     //                 }
//     //             });

//     //             var latLng = shapeList[2][0];
//     //             var layer = shapeList[2][1];

//     //             MAP.clear();

//     //             var index = MAP.QueryIndex + 1;
//     //             var id = 'query' + index; //****************
//     //             var collLengh = QUERY.collectionNameList.length;
//     //             var type = "polygon";
//     //             var geoInfo = [layer._latlngs[0]];
//     //             var keywords = document.getElementsByName('searchKeysReg')[0].value;
//     //             var situation = document.getElementsByName('searchSituReg')[0].value;
//     //             var datefrom = TOOL.parseDate(document.getElementById('datefrom').value);
//     //             var dateto = TOOL.parseDate(document.getElementById('dateto').value);

//     //             var attribute = new AREA.eachQuery(id, QUERY.collectionNameList, type, geoInfo, layer, keywords, situation, datefrom, dateto);
//     //             AREA.queryList.push(attribute);

//     //             // get result in circle
//     //             for (i = 0; i < QUERY.collectionNameList.length; i++) {
//     //                 var split = QUERY.collectionNameList[i].split(",");
//     //                 var collName = split[0];
//     //                 var collColor = split[1];
//     //                 QUERY.getpolygonQueryResult(latLng, layer, collName, collColor, id, keywords, situation);
//     //             }

//     //             AREA.updateQueryTable(id, collLengh);
//     //             AREA.updateInfo(id, QUERY.collectionNameList, layer);

//     //             MAP.QueryIndex = index;


//     //             MAP.shapeFiles = ac_shpfile;
//     //             MAP.map.addLayer(MAP.shapeFiles);


//     //         });


//     //     });

//     // };

//     // reader.readAsArrayBuffer(file);
// }



// MAP.lunrFilter = function(getInputKey, getInputCategory, getTimeFrom, getTimeTo, tweets, collName, collColor) {
//     MAP.clear();

//     window[collName] = L.layerGroup();
//     window[collName + "legend"] = L.control({
//         position: 'bottomleft'
//     });

//     if (getInputKey === "" && getInputCategory === "" && getTimeFrom === "" && getTimeTo === "") {

//         MAP.drawMarker(tweets, collName, collColor);
//         AREA.addNewFunctions(tweets, collName, collColor);

//     } else {

//         var idxKey = lunr(function() {
//             this.ref('id')
//             this.field('ptext')

//             tweets.forEach(function(doc) {
//                 this.add(doc)
//             }, this)
//         })

//         var idxDes = lunr(function() {
//             this.ref('id')
//             this.field('pcategory')

//             tweets.forEach(function(doc) {
//                 this.add(doc)
//             }, this)
//         })


//         var idResultKey = idxKey.search(getInputKey);
//         var idResultDes = idxDes.search(getInputCategory);

//         var lenKey = idResultKey.length;
//         var lenDes = idResultDes.length;

//         var idListKey = [];
//         var idListDes = [];
//         var idListTime = [];


//         var tweetsList = [];
//         var resultList = [];

//         for (i = 0; i < lenKey; i++) {
//             var idValue = parseInt(idResultKey[i]['ref']);
//             idListKey.push(idValue);
//         }
//         for (i = 0; i < lenDes; i++) {
//             var idValue = parseInt(idResultDes[i]['ref']);
//             idListDes.push(idValue);
//         }


//         if ((getTimeFrom.match(new RegExp("/", "g")) || []).length === 2) {
//             var datefrom = TOOL.parseDate(getTimeFrom);
//             var dateto = TOOL.parseDate(getTimeTo);


//             for (var i = 0; i < tweets.length; i++) {
//                 var dateAll = tweets[i].pdatetime;
//                 var date = dateAll.split(" ");
//                 var datefromdata = TOOL.parseDate(date[0].replace(/-/g, "/"));

//                 if (dateto >= datefromdata && datefrom <= datefromdata) {
//                     idListTime.push(parseInt(tweets[i].id));
//                 }
//             }
//         } else if ((getTimeFrom.match(new RegExp("/", "g")) || []).length === 1) {
//             var datefrom = TOOL.parseDate(getTimeFrom);
//             var dateto = TOOL.parseDate(getTimeTo);

//             for (var i = 0; i < tweets.length; i++) {
//                 if (tweets[i].pdatetime === undefined) {
//                     idListTime = [];
//                 } else {
//                     var date_splited = tweets[i].pdatetime.split(" ");
//                     var date = date_splited[0];
//                     var month = date.substring(0, date.lastIndexOf('-'));
//                     var datefromdata = TOOL.parseDate(month.replace(/-/g, "/"));

//                     if (dateto >= datefromdata && datefrom <= datefromdata) {
//                         idListTime.push(parseInt(tweets[i].id));
//                     }
//                 }
//             }
//         } else if ((getTimeFrom.match(new RegExp("/", "g")) || []).length === 0) {
//             var datefrom = TOOL.parseDate(getTimeFrom);
//             var dateto = TOOL.parseDate(getTimeTo);
//             for (var i = 0; i < tweets.length; i++) {
//                 if (tweets[i].pdatetime === undefined) {
//                     idListTime = [];
//                 } else {
//                     var date_splited = tweets[i].pdatetime.split(" ");
//                     var date = date_splited[0];
//                     var year = date.substring(0, date.indexOf('-'));
//                     var datefromdata = TOOL.parseDate(year.replace(/-/g, "/"));

//                     if (dateto >= datefromdata && datefrom <= datefromdata) {
//                         idListTime.push(parseInt(tweets[i].id));
//                     }
//                 }
//             }
//         }


//         if (idListKey.length !== 0) {
//             tweetsList.push(idListKey);
//         }

//         if (idListDes.length !== 0) {
//             tweetsList.push(idListDes);
//         }

//         if (idListTime.length !== 0) {
//             tweetsList.push(idListTime);
//         }

//         var result = tweetsList.shift().filter(function(v) {
//             return tweetsList.every(function(a) {
//                 return a.indexOf(v) !== -1;
//             });
//         });

//         for (i = 0; i < tweets.length; i++) {
//             var id = parseInt(tweets[i].id);
//             if (result.includes(id)) {
//                 resultList.push(tweets[i]);
//             }
//         }

//         MAP.drawMarker(resultList, collName, collColor);
//         AREA.addNewFunctions(resultList, collName, collColor);

//     }
// }

// MAP.timeFilterTweets = function(tweets) {

//     MAP.timeFilter = [];

//     var datefrom = TOOL.parseDate(document.getElementById('datefrom').value);
//     var dateto = TOOL.parseDate(document.getElementById('dateto').value);
//     for (var i = 0; i < tweets.length; i++) {
//         var datefromdata = TOOL.parseDate(tweets[i].pdatetime.replace(/-/g, "/"));
//         if (dateto >= datefromdata && datefrom <= datefromdata) {
//             MAP.timeFilter.push(tweets[i]);
//         }
//     }

//     return MAP.timeFilter

// }


// MAP.lunrStory = function(getInputKey, getInputDes, tweets) {
//     MAP.clear();
//     MAP.markerNarr.clearLayers();
//     MAP.markerNarr1.clearLayers();
//     var tweetsNarr = QUERY.getAllNarrData();
//     var tweetsNarr1 = QUERY.getAllNarrData1();


//     if (getInputKey === "" && getInputDes === "" && getInputStr === "" && getGender === "" && getAge === "") {

//     } else {

//         var idxKey = lunr(function() {
//             this.ref('id')
//             this.field('ptext')

//             tweets.forEach(function(doc) {
//                 this.add(doc)
//             }, this)
//         })

//         var idxDes = lunr(function() {
//             this.ref('id')
//             this.field('pcategory')

//             tweets.forEach(function(doc) {
//                 this.add(doc)
//             }, this)
//         })


//         var idResultKey = idxKey.search(getInputKey);
//         var idResultDes = idxDes.search(getInputDes);
//         // var idResultGen = idxGender.search(getGender);

//         var lenKey = idResultKey.length;
//         var lenDes = idResultDes.length;
//         // var lenGen = idResultGen.length;

//         var idListKey = [];
//         var idListDes = [];


//         var tweetsList = [];
//         var resultList = [];

//         for (i = 0; i < lenKey; i++) {
//             var idValue = parseInt(idResultKey[i]['ref']);
//             idListKey.push(idValue);
//         }
//         for (i = 0; i < lenDes; i++) {
//             var idValue = parseInt(idResultDes[i]['ref']);
//             idListDes.push(idValue);
//         }



//         if (idListKey.length !== 0) {
//             tweetsList.push(idListKey);
//         }

//         if (idListDes.length !== 0) {
//             tweetsList.push(idListDes);
//         }

//         var merged = [].concat.apply([], tweetsList);

//         if (merged.length === 0) {
//             var empty = [];
//             return empty;
//         } else {
//             var result = tweetsList.shift().filter(function(v) {
//                 return tweetsList.every(function(a) {
//                     return a.indexOf(v) !== -1;
//                 });
//             });

//             for (t = 0; t < tweets.length; t++) {
//                 var id = parseInt(tweets[t].id);
//                 if (result.includes(id)) {
//                     resultList.push(tweets[t]);
//                 }
//             }

//         }

//         var layer = '';

//         var timeFilter = MAP.timeFilterTweets(resultList);


//     }
// }

// MAP.lunrStoryRegion = function(getInputKey, getInputDes, tweets) {


//     if (getInputKey === "" && getInputDes === "") {

//         return tweets;

//     } else {

//         var idxKey = lunr(function() {
//             this.ref('id')
//             this.field('ptext')

//             tweets.forEach(function(doc) {
//                 this.add(doc)
//             }, this)
//         })

//         var idxDes = lunr(function() {
//             this.ref('id')
//             this.field('pcategory')

//             tweets.forEach(function(doc) {
//                 this.add(doc)
//             }, this)
//         })


//         var idResultKey = idxKey.search(getInputKey);
//         var idResultDes = idxDes.search(getInputDes);

//         var lenKey = idResultKey.length;
//         var lenDes = idResultDes.length;

//         var idListKey = [];
//         var idListDes = [];

//         var tweetsList = [];
//         var resultList = [];

//         for (i = 0; i < lenKey; i++) {
//             var idValue = parseInt(idResultKey[i]['ref']);
//             idListKey.push(idValue);
//         }
//         for (i = 0; i < lenDes; i++) {
//             var idValue = parseInt(idResultDes[i]['ref']);
//             idListDes.push(idValue);
//         }


//         if (idListKey.length !== 0) {
//             tweetsList.push(idListKey);
//         }

//         if (idListDes.length !== 0) {
//             tweetsList.push(idListDes);
//         }

//         var merged = [].concat.apply([], tweetsList);

//         if (merged.length === 0) {
//             var empty = [];
//             return empty;
//         } else {
//             var result = tweetsList.shift().filter(function(v) {
//                 return tweetsList.every(function(a) {
//                     return a.indexOf(v) !== -1;
//                 });
//             });

//             for (t = 0; t < tweets.length; t++) {
//                 var id = parseInt(tweets[t].id);
//                 if (result.includes(id)) {
//                     resultList.push(tweets[t]);
//                 }
//             }

//         }

//         return resultList;

//     }
// }

// this function is now done in python
// MAP.countTweetsOnGeoid = function(queryID, collName, tweetsID){
//   // go through tweets and filter tweetsID
//   var tweetsResults = QUERY.selectTweetsResult(queryID, collName);
//   // log each tweet to each GEOID
//   var censusTractTweetCount = {};
//   var l = tweetsID.length;
//   var geoIDList = [];
//   for (var i = 0; i < l; i++){
//     var GeoID = tweetsResults[tweetsID[i]]['GeoID'];
//     if (!censusTractTweetCount.hasOwnProperty(GeoID)){
//       censusTractTweetCount[GeoID] = 1;
//       geoIDList.push(GeoID);
//     } else {
//       censusTractTweetCount[GeoID] = censusTractTweetCount[GeoID] + 1;
//     }
//   }
//   var r = {
//     data: censusTractTweetCount,
//     IDList: geoIDList
//   };
//   return r;
// }

// first version, takes tweets count made in js
// MAP.buildDisplayGeoJson = function(mappingData, censusTractTweetCount){
//   // prepare variables
//   var countData = censusTractTweetCount.data;
//   var IDList = censusTractTweetCount.IDList;
//   var displayJsonObj = {
//     type: "FeatureCollection",
//     features: []
//   };
//   var countNormList = []
//   // iter list of geoid and aggregate features
//   var l = IDList.length;
//   for (var i = 0; i < l; i++){
//     var GeoID = IDList[i];
//     var countNorm = countData[GeoID] / mappingData[GeoID]['POP'];
//     countNormList.push(countNorm)
//     var f = {
//       type: "Feature",
//       geometry: mappingData[GeoID]['geo'],
//       properties: {
//         name: mappingData[GeoID]['NAME'], 
//         state: mappingData[GeoID]['STATE'],
//         county: mappingData[GeoID]['COUNTY'],
//         pop: mappingData[GeoID]['POP'],
//         center: mappingData[GeoID]['center'],
//         count: countData[GeoID],
//         countNorm: countNorm
//       }
//     };
//     displayJsonObj['features'].push(f);
//   }
//   // do minmax normalization
//   var minC = Math.min.apply(null, countNormList);
//   var maxC = Math.max.apply(null, countNormList);
//   for (var i = 0; i < l; i++){
//     var originalNorm = displayJsonObj['features'][i]['properties']['countNorm'];
//     displayJsonObj['features'][i]['properties']['countNorm'] = (originalNorm - minC) / (maxC - minC);
//   }
//   return displayJsonObj
// }

// get bins from data with classification options
MAP.getBins = function(queryID){
  var resultObj = QUERY.getAggregateQueryDataByID(queryID);
  var tweetCounts = resultObj.extraData['tweetCounts'];
  // console.log(tweetCounts);
  var geoSeries = new geostats(tweetCounts);
  var classOption = $('#choroplethMapBinning').val();
  var nbClass = $('#choroplethMapNumBin').val();
  // console.log(geoSeries);
  // console.log(classOption);
  // console.log(nbClass);
  if (classOption === 'eqInterval') {
    var breaks = geoSeries.getClassEqInterval(nbClass);
  } else if (classOption === 'quantile') {
    var breaks = geoSeries.getClassQuantile(nbClass);
  } else if (classOption === 'natBreaks') {
    var breaks = geoSeries.getClassJenks(nbClass);
  } else if (classOption === 'std') {
    var breaks = geoSeries.getClassStdDeviation(nbClass);
  }
  console.log(breaks);
  return breaks;
}

// update the global color scale
MAP.updateColorScale = function(breaks) {
  MAP.colorScale = chroma.scale(['#befc94', '#ff0000']).classes(breaks);
}

// update style of choropleth
MAP.updateChoroplethStyle = function(opacity, queryID, collName) {
  var choroName = MAP.getLayerName('choro', queryID, collName);
  // build new style
  var newStyle = function(feature) {
    var styleOptions = {
      color: "#000000", // line color
      weight: 0.5, // line weight
      opacity: 0.2, // line opacity
      stroke: false,
      fill: true, // fill true
      fillColor: "#8a8b8c", // default fill color
      fillOpacity: 0.8 // fille opacity
    };
    // const x = feature.properties.countNorm;
    // use colorscale to get actual color
    const x = feature.properties.count;
    styleOptions.fillColor = MAP.colorScale(x);
    // change opacity option
    if (isNaN(opacity)){
      styleOptions.fillOpacity = (0.0 + x)/1.1;
    } else {
      styleOptions.fillOpacity = opacity;
    }
    return styleOptions;
  };
  // apply style
  MAP.customLayers[choroName].setStyle(newStyle);
}

// turn query result to geojson obj for mapping
// second version, takes aggregated mapping data
MAP.buildDisplayGeoJson = function(resultObj, collName){
  // prepare variables
  var displayJsonObj = {
    type: "FeatureCollection",
    features: []
  };
  var countNormList = [];
  var countList = [];
  // iter list of geoid and aggregate features
  var l = resultObj.geoidList.length;
  for (var i = 0; i < l; i++){
    var GeoID = resultObj.geoidList[i];
    // var countNorm = mappingData.features[GeoID] / mappingData[GeoID]['POP'];
    countNormList.push(resultObj.subqueryList[0][collName].count[GeoID])
    countList.push(resultObj.subqueryList[0][collName].count[GeoID])
    var f = {
      type: "Feature",
      geometry: resultObj.mappingData[GeoID]['geo'],
      properties: {
        geoID: GeoID,
        name: resultObj.mappingData[GeoID]['NAME'], 
        state: resultObj.mappingData[GeoID]['STATE'],
        county: resultObj.mappingData[GeoID]['COUNTY'],
        pop: resultObj.mappingData[GeoID]['POP'],
        center: resultObj.mappingData[GeoID]['center'],
        count: resultObj.subqueryList[0][collName].count[GeoID],
        countNorm: resultObj.subqueryList[0][collName].count[GeoID],
        countMinMax: 0.0,
        countNormMinMax: 0.0
      }
    };
    displayJsonObj['features'].push(f);
  }
  // do minmax normalization
  var minCN = Math.min.apply(null, countNormList);
  var maxCN = Math.max.apply(null, countNormList);
  var minC = Math.min.apply(null, countList);
  var maxC = Math.max.apply(null, countList);
  for (var i = 0; i < l; i++){
    var originalNorm = displayJsonObj['features'][i]['properties']['countNorm'];
    var original = displayJsonObj['features'][i]['properties']['count'];
    displayJsonObj['features'][i]['properties']['countMinMax'] = (original - minC) / (maxC - minC);
    displayJsonObj['features'][i]['properties']['countNormMinMax'] = (originalNorm - minCN) / (maxCN - minCN);
  }
  return displayJsonObj
}

// draw choropleth but not necessary show it
MAP.drawChoropleth = function(displayGeoJsonObj, breaks, queryID, collName){
  // update color scale
  MAP.updateColorScale(breaks);
  // create geojson layer
  choroName = MAP.getLayerName('choro', queryID, collName);
  MAP.customLayers[choroName] = L.geoJson(displayGeoJsonObj, {
    // bind popups and click functions for each feature
    onEachFeature: function(feature, layer) {
      // bind popup showing tweet count and population
      layer.bindPopup('<p1>'+"tweet count: "+feature.properties.count+'</p1>'+'<br>'+'<p1>'+"population: "+feature.properties.pop+'</p1>');
      
      // bind click event on each feature that display some tweet samples
      layer.on('click', function(e) {
        // get geoID
        var geoID = feature.properties.geoID;
        // first find if sample data in cache
        var resultObj = QUERY.getAggregateQueryDataByID(QUERY.activeQueryIndex);
        if (resultObj.sampleList.hasOwnProperty(geoID)) {
          AREA.updateSampleDisplay(result, geoID, QUERY.activeCollName);
        } else {
          // not in cache, fire query to get sample data
          var baseQueryParams = QUERY.getQueryParamsByID(QUERY.activeQueryIndex);
          var queryParams = {
            queryID: baseQueryParams.queryID,
            queryCollNames: [QUERY.activeCollName],
            queryGeoID: feature.properties.geoID,
            queryMode: 'sample',
            queryKeywords: baseQueryParams.queryKeywords,
            queryKeywordMode: baseQueryParams.queryKeywordMode,
            queryDateFrom: baseQueryParams.queryDateFrom,
            queryDateTo: baseQueryParams.queryDateTo,
            queryGeoMode: null,
            queryCensusYear: '2010',
            queryDateMode: 'local',
            queryPopLimit: baseQueryParams.queryPopLimit
          }
          // firequery takes of reading results
          QUERY.fireQuery(queryParams);
        }
      });
    },
    // set the style function
    style: function(feature) {
      var styleOptions = {
        color: "#000000", // line color
        weight: 0.5, // line weight
        opacity: 0.2, // line opacity
        stroke: false,
        fill: true, // fill true
        fillColor: "#8a8b8c", // default fill color
        fillOpacity: 0.8 // fille opacity
      };
      // const x = feature.properties.countNorm;
      const x = feature.properties.count;
      styleOptions.fillColor = MAP.colorScale(x);
      // styleOptions.fillOpacity = (0.5 + x)/1.1;
      styleOptions.fillOpacity = 0.5;
      return styleOptions;
    }
  });
  // add the choropleth to active map layer
  // MAP.ct_layer.addTo(MAP.map)
}

// show selected choropleth
MAP.showChoropleth = function(queryID, collName) {
  var choroName = MAP.getLayerName('choro', queryID, collName);
  if (!MAP.map.hasLayer(MAP.customLayers[choroName])) {
    MAP.map.addLayer(MAP.customLayers[choroName]);
  }
}

// hide selected choropleth/
MAP.hideChoropleth = function(queryID, collName) {
  var choroName = MAP.getLayerName('choro', queryID, collName);
  if (MAP.map.hasLayer(MAP.customLayers[choroName])) {
    MAP.map.removeLayer(MAP.customLayers[choroName]);
  }
}

// init legend when a choropleth is drawn
MAP.initLegend = function(breaks) {
  console.log('init legend')
  MAP.legend = L.control({position: 'bottomleft'});
  MAP.legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'mapInfo mapLegend')
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < breaks.length; i++) {
      div.innerHTML +=
        '<i style="background:' + MAP.colorScale(breaks[i]) + '"></i> ' +
        breaks[i] + (!isNaN(breaks[i + 1]) ? '&ndash;' + breaks[i + 1] + '<br>' : '+');
    }
    return div;
  };
}

// update the existing legend
MAP.updateLegend = function(breaks) {
  console.log('update legend')
  var newHTML = '';
  for (var i = 0; i < breaks.length; i++) {
    newHTML +=
      '<i style="background:' + MAP.colorScale(breaks[i]) + '"></i> ' +
      breaks[i] + (!isNaN(breaks[i + 1]) ? '&ndash;' + breaks[i + 1] + '<br>' : '+');
  }
  MAP.legend.getContainer().innerHTML = newHTML;
}

MAP.showLegend = function() {
  MAP.legend.addTo(MAP.map);
}

MAP.hideLegend = function() {
  MAP.map.removeControl(MAP.legend);
}

// test code for showing census tracts
// MAP.colorScale = chroma.scale(['#befc94', '#ff0000']).classes([0,10,50,100,500,1000]);


// $(window).on('load', function(){
//   var xhr = new XMLHttpRequest();
//   xhr.open('GET', '/NeighborVis/temp/jersey_census_tract_pos_count_pop_norm.json', true);
//   xhr.responseType = 'json';

//   xhr.onload = function(e) {
//     var respondJson = this.response;
//     // handleFile(file)
//     MAP.ct_layer = L.geoJson(respondJson, {
//       style: function(feature) {
//         var styleOptions = {
//           color: "#000000", // line color
//           weight: 1, // line weight
//           opacity: 0.3, // line opacity
//           fill: true, // fill true
//           fillColor: "#8a8b8c", // default fill color
//           fillOpacity: 0.3 // fille opacity
//         };
//         const x = feature.properties.pop_norm_count;
//         styleOptions.fillColor = MAP.colorScale(x);
//         styleOptions.fillOpacity = (0.1 + x)/1.1;
//         return styleOptions;
//         // switch (true) {
//         //   case (x < 1):
//         //     styleOptions.color = "#5ff900";
//         //     return styleOptions;
//         //   case (x < 5):
//         //     styleOptions.color = "#f9a100";
//         //     return styleOptions;
//         //   default:
//         //     styleOptions.color = "#f90000";
//         //     return styleOptions;
//         // };
//       }
//     });
//     MAP.ct_layer.addTo(MAP.map)
//     // MAP.lc.addOverlay(.addTo(MAP.map), 'NJ_CT_pos_count');
//   };
  
//   xhr.send();
  
// })

// MAP.map.on('zoomend', function () {
//   var currentZoom = MAP.map.getZoom();
//   if (currentZoom > 6.0) {
//     MAP.ct_layer.setStyle({weight: 1});
//   }
//   else {
//     MAP.ct_layer.setStyle({weight: 0.5});
//   }
// });

// $(window).on('load', function(){
//   var xhr = new XMLHttpRequest();
//   xhr.open('GET', '/NeighborVis/shpfiles/census_tracts_simple_2017/cb_2017_34_tract_500k.zip', true);
//   xhr.responseType = 'arraybuffer';

//   var worker = cw({
//     init: function(scope) {
//       // importScripts('bower_components/shapeFile/shp.js');
//       scope.shp = shp;
//         // importScripts('js/require.js');
//         // require.config({
//         //     baseUrl: this.base
//         // });
//         // require(['bower_components/shapeFile/shp'], function(shp) {
//         //     scope.shp = shp;
//         // });
//     },
//     data: function(data, cb, scope) {
//         this.shp(data).then(function(geoJson){
//           console.log(geoJson)
//             if(Array.isArray(geoJson)){
//                 geoJson.forEach(function(geo){
//                     scope.json([geo, geo.fileName, true],true,scope);
//                 });
//             }else{
//                 scope.json([geoJson, geoJson.fileName, true],true,scope);
//             }
//         }, function(e) {
//             console.log('shit', e);
//         });

//     },
//     color:function(s) {
//         //from http://stackoverflow.com/a/15710692
//         // importScripts('bower_components/colorbrewer/colorbrewer.js');
//         return colorbrewer.Spectral[11][Math.abs(JSON.stringify(s).split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % 11];
//     },
//     makeString:function(buffer) {
//       var array = new Uint8Array(buffer);
//       var len = array.length;
//       var outString = "";
//       var i = 0;
//       while (i < len) {
//           outString += String.fromCharCode(array[i++]);
//       }
//       return outString;
//     },
//     json: function(data, cb, scope) {
//       var name = data[1];
//       //console.log(name);
//       var json = data.length === 2 ? JSON.parse(scope.makeString(data[0])) : data[0];
//       var nom;
//       scope.layer(json, name, scope);
//     },
//     layer:function(json,name,scope){
//       json.features.forEach(function(feature){
//           feature.properties.__color__ = scope.color(feature);
//       });
//       scope.fire('json',[json,name]);
//     },
//       base: cw.makeUrl('.')
//     });
  
//   function fireData(d){
//     worker.data(d, [d]);
//   }
    
//   function setWorkerEvents() {
//       worker.on('json', function(e) {
//           // MAP.map.spin(false);
//           MAP.lc.addOverlay(L.geoJson(e[0], options).addTo(MAP.map), e[1]);
//       });
//       worker.on('error', function(e) {
//           console.warn(e);
//       });
//   }

//   setWorkerEvents();
  
//   xhr.onload = function(e) {

//     var responseArray = this.response;
//     // handleFile(file)
//     fireData(responseArray);
//   };
  
//   xhr.send();
// })

$(document).ready(function() {
  // init some values
  var choroplethMapControl = $('#choroplethMapControl');
  var heatmapControl = $('#heatmapControl');
  choroplethMapControl.hide();
  heatmapControl.hide();
  
  var choroplethOpacity = $('#choroplethMapOpacity');
  var choroplethMapBinning = $('#choroplethMapBinning');
  var choroplethMapNumBin = $('#choroplethMapNumBin');
  choroplethMapBinning.val('natBreaks');
  choroplethMapNumBin.val('5');
  choroplethOpacity.val(0.5);
  
  var heatmapRadius = $('#heatmapRadius');
  var heatmapBlur = $('#heatmapBlur');
  var heatmapZoom = $('#heatmapZoom');
  var heatmapOpacity = $('#heatmapOpacity');
  heatmapRadius.val(30);
  heatmapBlur.val(30);
  heatmapZoom.val(5);
  heatmapOpacity.val(0.5);
  $('#displayTypeNone').prop('checked', true);

  // change event of normalization selector
  $('#mapControlNorm').change(function(e) {
    if (this.checked) {
      console.log('norm true');
    } else {
      console.log('norm false');
    }
  });

  // change event of map selector
  $('#mapTypeControl input[type=radio][name=displayTypeControl]').change(function() {
    if (this.value == 'choropleth') {
      console.log('choropleth')
      // show choropleth map if there is one
      choroplethMapControl.show();
      heatmapControl.hide();
      MAP.hideAggregatedHeatmap(QUERY.activeQueryIndex, QUERY.activeCollName);
      MAP.showChoropleth(QUERY.activeQueryIndex, QUERY.activeCollName);
      MAP.hideQueryLayer(QUERY.activeQueryIndex);
      MAP.showLegend();
    } else if (this.value == 'heatmap') {
      console.log('heatmap')
      // show heatmap if there is one
      choroplethMapControl.hide();
      heatmapControl.show();
      MAP.hideChoropleth(QUERY.activeQueryIndex, QUERY.activeCollName);
      MAP.showAggregatedHeatmap(QUERY.activeQueryIndex, QUERY.activeCollName);
      MAP.hideQueryLayer(QUERY.activeQueryIndex);
      MAP.hideLegend();
    } else if (this.value == 'none') {
      console.log('none')
      // remove maps
      choroplethMapControl.hide();
      heatmapControl.hide();
      MAP.hideAggregatedHeatmap(QUERY.activeQueryIndex, QUERY.activeCollName);
      MAP.hideChoropleth(QUERY.activeQueryIndex, QUERY.activeCollName);
      MAP.removeQueryLayer(QUERY.activeQueryIndex);
      MAP.hideLegend();
    }
  });

  // $('#choroplethMapShowEmpty').change(function(e) {
  //   if (this.checked) {
  //     console.log('show empty');
  //   } else {
  //     console.log('hide empty')
  //   }
  // });

  $('#choroplethMapOpacity').change(function(e) {
    var select = this.value;
    console.log(select);
    MAP.updateChoroplethStyle(choroplethOpacity.val());
  });

  var updateChoropleth = function(e) {
    var select = this.value;
    console.log(select);
    var breaks = MAP.getBins(QUERY.activeQueryIndex);
    MAP.updateColorScale(breaks);
    MAP.updateChoroplethStyle(choroplethOpacity.val(), QUERY.activeQueryIndex, QUERY.activeCollName);
    MAP.updateLegend(breaks);
  }

  // binning method change triggers update
  $('#choroplethMapBinning').change(updateChoropleth);

  // bin size change triggers update
  $('#choroplethMapNumBin').change(updateChoropleth);

  // to be triggered for each heatmap option change
  var updateHeatmap = function(e) {
    var v = this.value;
    console.log('Radius' + v);
    options = {
      radius: parseFloat(heatmapRadius.val()),
      blur: parseFloat(heatmapBlur.val()),
      maxZoom: parseFloat(heatmapZoom.val()),
      minOpacity: parseFloat(heatmapOpacity.val()),
      max: 3000
    };
    console.log(options);
    MAP.updateAggregatedHeatmap(options, QUERY.activeQueryIndex, QUERY.activeCollName);
  };

  // heatmap radius change
  $('#heatmapRadius').change(updateHeatmap);

  // heatmap blur change
  $('#heatmapBlur').change(updateHeatmap);

  // heatmap zoom change
  $('#heatmapZoom').change(updateHeatmap);

  // heatmap opacity change
  $('#heatmapOpacity').change(updateHeatmap);
});