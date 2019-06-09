// DrugVis
// By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
// License: BSD

// @Date    : 2018-07-15 18:55:01
// @Author  : Chao Ma (cma1@kent.edu)
// @Website : http://vis.cs.kent.edu/NeighborVis/
// @Link    : https://github.com/AlexMa1989
// @Version : $Id$

/*
    jquery.js
    Note: this file contains jquery functions
*/


$('#tweetMessageTable').on('mouseenter', 'tbody tr', function() {

    var tweet_id = this.id;
    var locationString = $(this).attr('class');
    var text = $(this).attr('value');

    var location = locationString.split(',');
    var latitude = parseFloat(location[0]);
    var longitude = parseFloat(location[1]);

    // Adding marker to current map;
    AREA.tweetMarker = L.marker([latitude, longitude]).addTo(MAP.map);
    AREA.tweetMarker.bindPopup('<strong>' + text + '</strong>').openPopup();
    //MAP.map.setView(new L.LatLng(latitude, longitude));
});

// Hover over tweet messages
$('#tweetMessageTable').on('mouseleave', 'tbody tr', function() {
    MAP.map.removeLayer(AREA.tweetMarker);
    AREA.tweetMarker = null;
});

$('#reportAll').unbind().on('click', function() {

    if (document.getElementById('reportAll').checked) {
        QUERY.showAllData();

        // MAP.map.addLayer(MAP.marker);
    } else {
        MAP.map.removeLayer(MAP.markerGlobal);
    }

});

$('#uploadFile').on('click', function() {

    $('#fileModal').modal('toggle');

});


$('#legendReport').unbind().on('click', function() {

    if (document.getElementById('legendReport').checked) {
        MAP.map.addLayer(MAP.marker);
    } else {
        MAP.map.removeLayer(MAP.marker);
    }

});

// $('#areaTable').on('click', '.area', function(event) {
//   console.log('#areaTable click area');

//     document.getElementById('loadingImage').style.display = 'block';

//     var area_id = this.id;

//     var length = $(this).closest('tr').children('td.call').text();

//     var name = $(this).closest('tr').find('td').eq(0).text();

//     $.ajax({
//         async: true,
//         success: function(result) {
//             MAP.clear();
//             AREA.clearFilters();
//             // Set every drawn layer back to default colors


//             var i = 0;
//             var len = AREA.List.length;

//             for (i; i < len; i++) {
//                 if (AREA.List[i].ID === area_id) {

//                     var tweet = AREA.List[i].Data;
//                     var layer = AREA.List[i].Layer;
//                     var collName = AREA.List[i].Name;
//                     var collColor = AREA.List[i].Color;
//                     var key = AREA.List[i].Key;
//                     var situ = AREA.List[i].Situ;
//                     var from = AREA.List[i].From;
//                     var to = AREA.List[i].To;
//                     var fromToFilter = from + " " + to;

//                     $('#keywordFilter').text(key);
//                     $('#situFilter').text(situ);
//                     $('#FromToFilter').text(fromToFilter.toString());

//                     var hasTimeOrNot;

//                     var queryLength = tweet.length;
//                     if (queryLength !== 0) {
//                         if (tweet[0].pdatetime !== undefined) {
//                             hasTimeOrNot = true;
//                         } else {
//                             hasTimeOrNot = false;
//                         }
//                     }

//                     if (hasTimeOrNot === true) {
//                         window[collName] = L.layerGroup();
//                         window[collName + "legend"] = L.control({
//                             position: 'bottomleft'
//                         });
//                         AREA.updateInfo(name, tweet, layer);
//                         MAP.drawMarker(tweet, collName, collColor);
//                         AREA.addNewFunctions(tweet, collName, collColor);
//                         AREA.tableOperation(tweet, collName, collColor);
//                     } else {
//                         window[collName] = L.layerGroup();
//                         window[collName + "legend"] = L.control({
//                             position: 'bottomleft'
//                         });
//                         AREA.updateInfo(name, tweet, layer);
//                         MAP.drawMarker(tweet, collName, collColor);
//                         AREA.addNewFunctionsNoTime(tweet, collName, collColor);
//                         AREA.tableOperation(tweet, collName, collColor);
//                     }


//                 }
//             }
//             document.getElementById('loadingImage').style.display = 'none';
//         },
//         error: function(XMLHttpRequest, textStatus, errorThrown) {
//             alert("Query failed ... " + "\nStatus: " + textStatus + "\nError Message: " + errorThrown);
//         }
//     });


// });

$('#areaTable').on('click', '.area', function(event) {
  console.log('#areaTable click area');
  document.getElementById('loadingImage').style.display = 'block';
  // console.log(this);
  // console.log(event);

  // get the query ID
  var idStr = this.id.split('-');
  var queryID_ = parseInt(idStr[1]);
  var collName_ = idStr[2];
  console.log(queryID_);
  console.log(collName_);

  // do nothing if it is current map
  if ((queryID_ === QUERY.activeQueryIndex) && (collName_ === QUERY.activeCollName)) {
    document.getElementById('loadingImage').style.display = 'none';
    return;
  }

  $.ajax({
    async: true,
    success: function(result) {
      console.log('inside ajax success')
      // hide currently displayed maps
      MAP.hideAggregatedHeatmap(QUERY.activeQueryIndex, QUERY.activeCollName);
      MAP.hideChoropleth(QUERY.activeQueryIndex, QUERY.activeCollName);
      MAP.hideQueryLayer(QUERY.activeQueryIndex);
      MAP.hideLegend();

      // switch to target query
      QUERY.activeQueryIndex = queryID_;
      console.log(QUERY.activeCollName);
      QUERY.activeCollName = collName_;
      console.log(QUERY.activeCollName);
      resultObj = QUERY.getAggregateQueryDataByID(QUERY.activeQueryIndex);
      queryParams = QUERY.getQueryParamsByID(QUERY.activeQueryIndex);
      // update sample display panel
      console.log(QUERY.activeCollName);
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
      AREA.updateWordCloud(QUERY.activeQueryIndex, 0, QUERY.activeCollName);

      // test category chart
      AREA.updateCategoryChart(QUERY.activeQueryIndex, 0, QUERY.activeCollName);

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
        AREA.addTimeChartData('year', QUERY.activeQueryIndex, 0, QUERY.activeCollName);
        AREA.addTimeChartData('month', QUERY.activeQueryIndex, 0, QUERY.activeCollName);
        AREA.addTimeChartData('day', QUERY.activeQueryIndex, 0, QUERY.activeCollName);
        AREA.addTimeChartData('week', QUERY.activeQueryIndex, 0, QUERY.activeCollName);
        AREA.addTimeChartData('hour', QUERY.activeQueryIndex, 0, QUERY.activeCollName);
        AREA.addTimeChartData('weekday', QUERY.activeQueryIndex, 0, QUERY.activeCollName);
      }

      // generate legend
      MAP.initLegend(breaks);
      MAP.showLegend();
      // check the choropleth option to display it
      $('#displayTypeChoropleth').prop('checked', true).trigger('change');

      document.getElementById('loadingImage').style.display = 'none';
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log('inside ajax error')
    }
  });
});

$('#areaTable').on('click', '.query', function(event) {
  console.log('#areaTable click query');

    document.getElementById('loadingImage').style.display = 'block';
    AREA.clearAllTables();

    var area_id = this.id;

    var length = $(this).closest('tr').children('td.call').text();

    var name = $(this).closest('tr').find('td').eq(0).text();

    $.ajax({
        async: true,
        success: function(result) {
            MAP.clear();
            AREA.clearFilters();
            // Set every drawn layer back to default colors


            var i = 0;
            var len = AREA.queryList.length;

            for (i; i < len; i++) {
                if (AREA.queryList[i].ID === area_id) {

                    var coll = AREA.queryList[i].Data;
                    var type = AREA.queryList[i].Type;
                    var layer = AREA.queryList[i].Layer;
                    var info = AREA.queryList[i].Info;
                    var id = AREA.queryList[i].ID;
                    var key = AREA.queryList[i].Key;
                    var situ = AREA.queryList[i].Situ;
                    var from = AREA.queryList[i].From;
                    var to = AREA.queryList[i].To;
                    var fromToFilter = from + " " + to;

                    $('#keywordFilter').text(key);
                    $('#situFilter').text(situ);
                    $('#FromToFilter').text(fromToFilter.toString());

                    AREA.updateInfo(id, coll, layer);

                    if (type === "circle") {
                        for (j = 0; j < coll.length; j++) {
                            var split = coll[j].split(",");
                            var collName = split[0];
                            var collColor = split[1];
                            QUERY.getCircleQueryResultS(info[0], info[1], info[2], layer, collName, collColor, id, key, situ, TOOL.parseDate(from), TOOL.parseDate(to));
                        }
                    }
                    if (type === "rectangle") {
                        for (j = 0; j < coll.length; j++) {
                            var split = coll[j].split(",");
                            var collName = split[0];
                            var collColor = split[1];
                            QUERY.getpolygonQueryResultS(info[0], layer, collName, collColor, id, key, situ, TOOL.parseDate(from), TOOL.parseDate(to));
                        }
                    }

                    if (type === "polygon") {
                        for (j = 0; j < coll.length; j++) {
                            var split = coll[j].split(",");
                            var collName = split[0];
                            var collColor = split[1];
                            QUERY.getpolygonQueryResultS(info[0], layer, collName, collColor, id, key, situ, TOOL.parseDate(from), TOOL.parseDate(to));
                        }
                    }


                }
            }
            document.getElementById('loadingImage').style.display = 'none';
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Query failed ... " + "\nStatus: " + textStatus + "\nError Message: " + errorThrown);
        }
    });


});

$('#areaTable').on('mouseover', '.area', function(event) {
  console.log('#areaTable mouseover area');
    var area_id = this.id;
    var i = 0;
    var len = AREA.List.length;
    for (i; i < len; i++) {
        if (AREA.List[i].ID === area_id) {

            var layer = AREA.List[i].Layer;

            layer.setStyle({
                fillOpacity: 0.5,
                opacity: 0.5
            });
        }
    }
});

$('#areaTable').on('mouseleave', '.area', function(event) {
  console.log('#areaTable mouseleave area');
    var area_id = this.id;

    var i = 0;
    var len = AREA.List.length;
    for (i; i < len; i++) {

        if (AREA.List[i].ID === area_id) {

            var layer = AREA.List[i].Layer;

            layer.setStyle({
                fillOpacity: 0.3,
                opacity: 0.3
            });
        }
    }


});

$('#areaTable').on('mouseover', '.query', function(event) {
  console.log('#areaTable mouseover query');
    var area_id = this.id;
    var i = 0;
    var len = AREA.queryList.length;
    for (i; i < len; i++) {
        if (AREA.queryList[i].ID === area_id) {

            var layer = AREA.queryList[i].Layer;

            layer.setStyle({
                fillOpacity: 0.5,
                opacity: 0.5
            });
        }
    }
});

$('#areaTable').on('mouseleave', '.query', function(event) {
    console.log('#areaTable mouseleave query');
    var area_id = this.id;

    var i = 0;
    var len = AREA.queryList.length;
    for (i; i < len; i++) {

        if (AREA.queryList[i].ID === area_id) {

            var layer = AREA.queryList[i].Layer;

            layer.setStyle({
                fillOpacity: 0.3,
                opacity: 0.3
            });

        }
    }


});




$('#removeAll').on('click', function() {
  console.log('#removeAll click');

    $('#areaTable > tbody  > tr').each(function() {
        $(this).removeClass("active111");
    });

    $("#updateInfo").unbind().click(function() {

    });

    AREA.CurrentIndex = 0;
    QUERY.globalQueryIndex = 0;

    var i = 0;
    var len = AREA.List.length;
    for (i; i < len; i++) {
        AREA.List[i].Layer.setStyle({
            fillOpacity: 0,
            opacity: 0
        });
    }

    AREA.List = [];
    AREA.queryList = [];

    MAP.clear();
    AREA.clearFilters();
    AREA.clearAllTables();

    $('#areaTable tbody').empty();

    var emptyTweets = [];
});

$('#pinView').on('click', function() {

    var latitude = parseFloat(document.getElementById('lat').value);
    var longitude = parseFloat(document.getElementById('long').value);

    MAP.map.setView(new L.LatLng(latitude, longitude), 13);

});



$('#areaTable').on('click', '.areaRemove', function(e) {
  console.log('#areaTable click areaRemove');

    $('#areaTable > tbody  > tr').each(function() {
        $(this).removeClass("active111");
    });

    $("#updateInfo").unbind().click(function() {

    });

    // Set every drawn layer back to default colors
    var area_id = this.id;

    var i = 0;
    var len = AREA.queryList.length;
    for (i; i < len; i++) {
        if (AREA.queryList[i].ID === area_id) {

            AREA.queryList[i].Layer.setStyle({
                fillOpacity: 0,
                opacity: 0
            });
            MAP.clear();
            $('.' + area_id).remove();
            $(this).closest('tr').remove();
            // Remove area attributes in the list
            AREA.queryList.splice(i, 1);
            // Update area table
            // AREA.updateTable();

            AREA.clearAllTables();
            AREA.clearFilters();


        }
    }

    e.stopPropagation();

});

$('#areaTable').on('click', 'tbody tr', function() {
  console.log('#areaTable click tbody tr');
  // Set every drawn layer back to default colors

  var allName = $(this).attr('class');
  var className = allName.split(" ");

  $(this).prevAll('tr').removeClass("active111");
  $(this).nextAll('tr').removeClass("active111");

  if (!className.includes("active111")) {
      $(this).toggleClass("active111");
  }

});

$(".multiSelect").multipleSelect({
    width: 215,
    multiple: true,
    multipleWidth: 55,
    placeholder: "Situations"
});




$("#datefrom").change(function() {
    var newDate = this.value;
    $('#getDateFrom').text(newDate);
});

$("#dateto").change(function() {
    var newDate = this.value;
    console.log(newDate);
    $('#getDateTo').text(newDate);
});

$("#searchKey").change(function() {
    var newKey = this.value;
    $('#getKeyword').text(newKey);
    $('#keywordShow').text(newKey);
});

$("#searchDec").change(function() {
    var newKey = this.value;
    $('#getSitu').text(newKey);
    $('#situShow').text(newKey);
});

$("#searchStr").change(function() {
    var newKey = this.value;
    $('#getStreet').text(newKey);
    $('#streetShow').text(newKey);
});


$('.collapse').on('shown.bs.collapse', function() {
    $(this).parent().find(".glyphicon-chevron-right").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
}).on('hidden.bs.collapse', function() {
    $(this).parent().find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
});

$("#datefrom,#dateto,#searchKey").bind("change paste keyup", function() {
    console.log('date changed requery and redraw map');
});

// Not printing
$('#areaSelect').hover(function() {
    console.log('select some area in table');
});


///////////////////layout modify///////////

$('#rightsideToggle').click(function(event) {
    $(this).find('span').toggleClass('glyphicon-chevron-left').toggleClass('glyphicon-chevron-right');
    event.preventDefault();
    $(this).toggleClass('toggled');
    if ($(this).hasClass("toggled")) {
        // pan to 34.0450948,-118.2377897

        $('div#rightside').width('340px');
        $('#queryPanel').css('margin-right', '340px');
        $('#footer').css('left', '100px');
    } else {

        $('div#rightside').width('0%');
        $('#queryPanel').css('margin-right', '0%');
        $('#footer').css('left', '350px');
    }
});


//$('#defaultOpen').click();

$('#helpButton').click(function() {
    // open user guilde modal
    $('#userguide-modal').modal('show');
});


// when collection group changed, update selected datasets
$("#collGroup").on('change', '.checkbox', function() {

    QUERY.collectionNameList = [];
    var collectionNames = [];
    $("#selectedData").empty();

    // add each selected checkbox into the QUERY.collectionNameList
    $('.checkbox input:checked').each(function() {
        // console.log($(this).attr('value'));
        QUERY.collectionNameList.push($(this).attr('value'));
        // window[$(this).attr('value')] = L.layerGroup();
    });

    console.log(QUERY.collectionNameList)

    for (i = 0; i < QUERY.collectionNameList.length; i++) {
        var split = QUERY.collectionNameList[i].split(",");
        var collName = split[0];

        collectionNames.push(collName);

        var newRow = '<span class = "label label-success ld-nb collNameHide" id = "filter' + collName + '">' + collName + '</span>';
        $("#selectedData").append(newRow);
    }

    if (QUERY.collectionNameList.length <= 0){
      $('#queryModalTitle').text('Perform Query on: No dataset selected.')
    } else{
      var collNames = "";
      QUERY.collectionNameList.forEach(function(value, index, array){
        collNames = collNames + value.split(",")[0] + ',';
      });
      $("#queryModalTitle").text("Perform Query on: " + collNames);
    }
    

});

$("#collGroup").on('change', '.colorCustom', function() {

    QUERY.collectionNameList = [];
    var collectionNames = [];


    $('.checkbox input:checked').each(function() {
        QUERY.collectionNameList.push($(this).attr('value'));
        // window[$(this).attr('value')] = L.layerGroup();
    });

    for (i = 0; i < QUERY.collectionNameList.length; i++) {
        var split = QUERY.collectionNameList[i].split(",");
        var collName = split[0];

        collectionNames.push(collName);
    }




});

$("#collGroup").on('click', '.showhideAll', function() {


    if (this.checked) {

        var collId = $(this).attr('value');
        var split = collId.split(",");

        var globalName = "global" + split[0];

        QUERY.showAllData(split[0], split[1], "marker");

        window[globalName].eachLayer(function(layer) {
            layer.bringToBack();
        });
    } else {
        var collId = $(this).attr('value');
        var split = collId.split(",");

        var globalName = "global" + split[0];

        window[globalName].clearLayers();
    }


});

// $("#collGroup").on('click', '.showhideHeat', function() {


//     if (this.checked) {

//         var collId = $(this).attr('value');
//         var split = collId.split(",");

//         var globalName = "heat" + split[0];

//         // QUERY.showAllData(split[0], split[1], "heat");
//         QUERY.showAggregatedHeatmap(split[0]);
//         MAP.map.removeLayer(MAP.ct_layer);

//     } else {
//         var collId = $(this).attr('value');
//         var split = collId.split(",");

//         var globalName = "heat" + split[0];

//         MAP.map.removeLayer(window[globalName]);
//         MAP.ct_layer.addTo(MAP.map);
//     }


// });



$('#collGroup').on('click', '.btn-info', function() {
    $(".btn-info").removeClass("activeMode");
    $(this).addClass("activeMode");

    var collId = this.id;
    var boxInfo = collId;
    $('#infoBox').text(boxInfo);

});

$('#dataManagement').on('click', '.dropdown-menu', function(e) {
    e.stopPropagation();
});

$("#dataTable").on('click', '.dataShow', function() {

    var allIds = [];

    $(".navScroll").map(function() {
        allIds.push(this.id);
    });

    var id = this.id.split("_");
    var idCompare = "obj_" + id[1];

    if (!allIds.includes(idCompare.toString())) {
        var collections = DataManager.getCollections(QUERY.userName);
        var collLen = collections.length;

        for (i = 0; i < collLen; i++) {
            if (collections[i] === id[1]) {
                window[collections[i] + "legend"] = L.control({
                    position: 'bottomleft'
                });

                var objecId = "obj_" + collections[i];

                $("#collGroup").append('<div id = "' + objecId + '" class = "navScroll multiselect' + collections[i] + '"><span class = "label label-default lb-md" id = "' + collections[i] + '"><div class="checkbox"><input type="checkbox" id = "box' + collections[i] + '" value="' + collections[i] + ',#f00" /><label for="box' + collections[i] + '"></label></div> </span></div>');

                // $("#collGroup").append('<div id = "' + objecId + '" class = "navScroll multiselect' + collections[i] + '"><span class = "label label-default lb-md" id = "' + collections[i] + '"><div class="checkbox"><input type="checkbox" id = "box' + collections[i] + '" value="' + collections[i] + ',#f00" /><label for="box' + collections[i] + '"></label></div> &nbsp;' + collections[i] + '&nbsp;<div class="showcheck"><input type="checkbox" id = "showhide' + collections[i] + '" class = "showhideAll" value="' + collections[i] + ',#f00" /><label for="showhide' + collections[i] + '">P</label></div><div class="showcheck"><input type="checkbox" id = "showhideH' + collections[i] + '" class = "showhideHeat" value="' + collections[i] + ',#f00" /><label for="showhideH' + collections[i] + '">H</label></div>&nbsp;<input type="text" class = "colorCustom" id="' + collections[i] + '" /></span></div>');
                // $(".colorCustom").spectrum({
                //     color: "#f00",
                //     change: function(color) {
                //         var colorHex = color.toHexString(); // #ff0000

                //         var boxId = "box" + this.id;
                //         var newColor = this.id + "," + colorHex;

                //         $('#' + boxId).val(newColor.toString());

                //         var showhide = "showhide" + this.id;
                //         var newColor1 = this.id + "," + colorHex;

                //         $('#' + showhide).val(newColor1.toString());
                //     }
                // });
            }
        }
    }

});

$("#dataTable").on('click', '.dataRemove', function() {

    var allIds = [];

    $(".navScroll").map(function() {
        allIds.push(this.id);
    });

    $("#selectedData").empty();

    var id = this.id.split("_");
    var idCompare = "obj_" + id[1];

    if (allIds.includes(idCompare.toString())) {

        $('#' + idCompare).remove();
    }

    var collectionNames = [];

    for (i = 0; i < QUERY.collectionNameList.length; i++)

    {
        var split = QUERY.collectionNameList[i].split(",");
        var collName = split[0];

        collectionNames.push(collName);
    }

    var index = collectionNames.indexOf(id[1]);


    if (index > -1) {
        QUERY.collectionNameList.splice(index, 1);
    }

    var collectionNames1 = [];

    for (i = 0; i < QUERY.collectionNameList.length; i++) {
        var split = QUERY.collectionNameList[i].split(",");
        var collName = split[0];

        collectionNames1.push(collName);

        var newRow = '<span class = "label label-success ld-nb collNameHide" id = "filter' + collName + '">' + collName + '</span>';
        $("#selectedData").append(newRow);
    }


});

$("#dataTable").on('click', '.dataDelete', function() {

    var id = this.id.split("_");
    var idCompare = "obj_" + id[1];
    var dataId = this.id;
    $("#selectedData").empty();

    $('#modalAsk').modal('show')

    $('#modalDelete').unbind().on('click', function() {

        var allIds = [];

        $(".navScroll").map(function() {
            allIds.push(this.id);
        });

        if (allIds.includes(idCompare.toString())) {

            $('#' + idCompare).remove();
            $('#' + dataId).remove();
            DataManager.removeDB(id[1], QUERY.userName);

            var collectionNames = [];

            for (i = 0; i < QUERY.collectionNameList.length; i++)

            {
                var split = QUERY.collectionNameList[i].split(",");
                var collName = split[0];

                collectionNames.push(collName);
            }

            var index = collectionNames.indexOf(id[1]);


            if (index > -1) {
                QUERY.collectionNameList.splice(index, 1);
            }

            var collectionNames1 = [];

            for (i = 0; i < QUERY.collectionNameList.length; i++) {
                var split = QUERY.collectionNameList[i].split(",");
                var collName = split[0];

                collectionNames1.push(collName);

                var newRow = '<span class = "label label-success ld-nb collNameHide" id = "filter' + collName + '">' + collName + '</span>';
                $("#selectedData").append(newRow);
            }

        }

    });


});