// DrugVis
// By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
// License: BSD

// @Date    : 2018-07-15 18:55:01
// @Author  : Chao Ma (cma1@kent.edu)
// @Website : http://vis.cs.kent.edu/NeighborVis/
// @Link    : https://github.com/AlexMa1989
// @Version : $Id$

/*
    loginCheck.js
    Note: this file contains functions when system initializatoin
*/

function passwordCheck() {
    var password = prompt("Please enter your User Name");

    while (password === "") {
        password = prompt("Please enter your User Name");
    }

    QUERY.userName = password;
    $('#userShow').text(password);
}

function getAllCollections() {

    var collections = DataManager.getCollections();
    var collLen = collections.length;
    var dataTableBody = $('#dataTable tbody');

    for (i = 0; i < collLen; i++) {
        window[collections[i]] = L.layerGroup();
        window[collections[i] + "legend"] = L.control({
            position: 'bottomleft'
        });

        var globalMarker = "global" + collections[i];

        window[globalMarker] = L.layerGroup();

        var globalHeat = "heat" + collections[i];

        window[globalHeat] = L.heatLayer([0, 0], {
            radius: 25
        });

        var objecId = "obj_" + collections[i];

        $("#collGroup").append('<div id = "' + objecId + '" class = "navScroll multiselect' + collections[i] + '"><span class = "label label-default lb-md" id = "' + collections[i] + '"><div class="checkbox"><input type="checkbox" id = "box' + collections[i] + '" value="' + collections[i] + ',#f00" /><label for="box' + collections[i] + '"></label></div> &nbsp;<span>' + collections[i] + '</span>&nbsp;')

        // $("#collGroup").append('<div id = "' + objecId + '" class = "navScroll multiselect' + collections[i] + '"><span class = "label label-default lb-md" id = "' + collections[i] + '"><div class="checkbox"><input type="checkbox" id = "box' + collections[i] + '" value="' + collections[i] + ',#f00" /><label for="box' + collections[i] + '"></label></div> &nbsp;<span>' + collections[i] + '</span>&nbsp;<div class="showcheck"><input type="checkbox" id = "showhide' + collections[i] + '" class = "showhideAll" value="' + collections[i] + ',#f00" /><label for="showhide' + collections[i] + '">P</label></div><div class="showcheck"><input type="checkbox" id = "showhideH' + collections[i] + '" class = "showhideHeat" value="' + collections[i] + ',#f00" /><label for="showhideH' + collections[i] + '">H</label></div>&nbsp;<input type="text" class = "colorCustom" id="' + collections[i] + '" /></span></div>');
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

        var data_id = "data_" + collections[i];


        var newRow = '<tr id="' + data_id + '" class="sm-font"><td class="collNameHide"><strong>' + collections[i] + '</strong></td><td class=""><button  id="' + data_id + '" class="btn-xs dataShow" type="button" ><span class="glyphicon glyphicon-ok"></span></button></td><td class=""><button  id="' + data_id + '" class="btn-xs dataRemove" type="button" ><span class="glyphicon glyphicon-remove"></span></button></td><td><button  id="' + data_id + '" class="btn-xs dataDelete" type="button" ><span class="glyphicon glyphicon-trash"></span></button></td></tr>';
        dataTableBody.append(newRow);

    }

}


window.onload = function() {
    TrajModel.initialize();
    getAllCollections();
    // passwordCheck();
}