// DrugVis
// By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
// License: BSD

/*
    TrajModel.js
    Note: contain main function and classes
*/

// TrajModel namespace
var TrajModel = TrajModel || {};

// Speed Default
TrajModel.defaultSpeed = false;
TrajModel.username = "";
TrajModel.dbname = "";



// Initialize TrajModel
TrajModel.initialize = function () {
    // Initialize user interface
    UI.init();
    // Reset selected file
    File.reset();
}

TrajModel.createUser = function () {
	var name=document.getElementById("username-input").value.toLowerCase();
	
	if (!TrajModel.CheckSpace(name))
	{	
		TrajModel.username = document.getElementById("username-input").value.toLowerCase().replace(' ', '_');
		console.log (TrajModel.username);
		//DataManager.addUsername(TrajModel.username);
		UI.next();	
	}
	
}
TrajModel.isValid=function(str) 
{ 
	return /^\w+$/.test(str);
	/*if (/^\w+$/.test(str))
		return true;
	if (/\S/.test(str))
		return true; */
}
TrajModel.CheckSpace=function (name)
{
	
	if (!TrajModel.isValid(name))
	{
		UI.errorMessage.html ("Please give another name and use only alphabet letters and numbers ");
		UI.errorDiv.removeClass( "alert alert-success" ).addClass( "alert alert-danger" );
		UI.errorDiv.show();
		document.getElementById("username-input").value = "";
		document.getElementById("dbname-input").value = "";
		return true;
	}
	else
	{
		UI.errorDiv.removeClass( "alert alert-danger" ).addClass( "alert alert-success" );
		UI.errorDiv.hide();
		return false;
	}
}


// Step.0 - Create Database
TrajModel.createDB = function () {
	var name=document.getElementById("dbname-input").value.toLowerCase();
	
	if (!TrajModel.CheckSpace(name))
	{	
		dbnameInput = document.getElementById("dbname-input").value.toLowerCase().replace(' ', '_');
		console.log (dbnameInput);

        TrajModel.dbname = dbnameInput;
		
		DataManager.checkDBname(dbnameInput);
	}
}


// Step.1 - Read file and validate file type
TrajModel.readFile = function (file) {
    // Set current file
    File.currentFile = file.files[0];
    // Check select file
    if ( File.currentFile != undefined ) {
        // Check support file type
        if ( File.isSupportFileType(File.currentFile) ) {
            // Set File information
            UI.setFileInfo(File.getFileName(), File.getFileSize(), File.getFileLastModify());
            // Show complete selection file
            UI.showCompleteSelectionFile();
            // Initialize data model
            DataModel.Initialize();
        } else {
            // Set error message
            var errorMsg = "Upload Failed : TrajModel currently not support ." + File.extension + " file type. Please try again";
            // Show error message
            UI.error(errorMsg);
        }
    }
}

// Step.2 - Initialize attributes selection
// Parse headers to user for selection (e.g., tripid, datetime, lat,long)
TrajModel.initializeAttrSelection = function (file, extension) {
    if (extension === 'csv') {
        Parser.parseHeaders(file);
    } else {
        console.log ("TODO: Need to add for geojson data");
    }
}

// Step.3 - Create attirubte for user to select
// This create group of button elements
// call after Step. 2
TrajModel.setUserModel = function () {

    UI.clearUserAttribute();

    var i = 0;
    var len = DataModel.userList.length;

    var id = DataModel.systemList[0]['oldKey'];
    var datetime = DataModel.systemList[1]['oldKey'];
    var latitude = DataModel.systemList[2]['oldKey'];
    var longitude = DataModel.systemList[3]['oldKey'];
	// Add speed
	var speed = DataModel.systemList[4]['oldKey'];
    var category = DataModel.systemList[5]['oldKey'];


    var user_element = "<div class=\"list-group\">";

    for (i; i < len; i++) {
        //console.log (DataModel.userList[i]["key"]);
        if (id === DataModel.userList[i]["key"] || datetime === DataModel.userList[i]["key"] || latitude === DataModel.userList[i]["key"] || longitude === DataModel.userList[i]["key"] || speed === DataModel.userList[i]["key"]) {

        } else {
            user_element += "<button type\"button\" id=\"" + DataModel.userList[i]["key"] + "\" class=\"list-group-item\" onclick=\"TrajModel.selectAttribute(this)\" style=\"test-align: center;\">" + DataModel.userList[i]["key"] + "</button>";
        }
    }
    user_element += "</div>";
    // Add all user attribute to user model body
    UI.displayUserAttribute(user_element);

    // Check current status and document id
    if (id && TrajModel.currentStatusId === "tripid-tab") {
        var selected_element = "<button type\"button\" id=\"" + id + "\" class=\"list-group-item active\" onclick=\"TrajModel.selectAttribute(this)\" style=\"test-align: center;\">" + id + "</button>"
        // display selected attribute
        UI.selectedAttribute(selected_element);
    } else if (datetime && TrajModel.currentStatusId === "time-tab" ) {
        var selected_element = "<button type\"button\" id=\"" + datetime + "\" class=\"list-group-item active\" onclick=\"TrajModel.selectAttribute(this)\" style=\"test-align: center;\">" + datetime + "</button>"
        // display selected attribute
        UI.selectedAttribute(selected_element);
    } else if (latitude && TrajModel.currentStatusId === "latitude-tab" ) {
        var selected_element = "<button type\"button\" id=\"" + latitude + "\" class=\"list-group-item active\" onclick=\"TrajModel.selectAttribute(this)\" style=\"test-align: center;\">" + latitude + "</button>"
        // display selected attribute
        UI.selectedAttribute(selected_element);
    } else if (longitude && TrajModel.currentStatusId === "longitude-tab") {
        var selected_element = "<button type\"button\" id=\"" + longitude + "\" class=\"list-group-item active\" onclick=\"TrajModel.selectAttribute(this)\" style=\"test-align: center;\">" + longitude + "</button>"
        // display selected attribute
        UI.selectedAttribute(selected_element);
    } else if (speed && TrajModel.currentStatusId === "text-tab") {
		// Add speed
        var selected_element = "<button type\"button\" id=\"" + speed + "\" class=\"list-group-item active\" onclick=\"TrajModel.selectAttribute(this)\" style=\"test-align: center;\">" + speed + "</button>"
        // display selected attribute
        UI.selectedAttribute(selected_element);
    } else if (category && TrajModel.currentStatusId === "category-tab") {
        // Add speed
        var selected_element = "<button type\"button\" id=\"" + category + "\" class=\"list-group-item active\" onclick=\"TrajModel.selectAttribute(this)\" style=\"test-align: center;\">" + category + "</button>"
        // display selected attribute
        UI.selectedAttribute(selected_element);
    } else {
        UI.clearSelectedAttribute();
    }
}

// Step.4 - Call when user select attribute
// Remove the current selected attribute and set the system model
TrajModel.selectAttribute = function (element) {

    // get all attribute in user attributes panel
    var userAttributes = $('#user-model-body :button');
    var i = 0;
    var len = userAttributes.length;

    var element_id = $(element).attr('id');

    // remove the current selection
    for (i; i < len; i++) {
        if ( $(userAttributes[i]).hasClass('active')) {
            $(userAttributes[i]).removeClass('active');
            // Remove selected attribute
            TrajModel.removeKey($(userAttributes[i]));
        }
    }

    // check current tab to insert a tripid, time, lat, long
    if (TrajModel.currentStatusId === "tripid-tab") {
        TrajModel.setSystemModel(0,element_id);
        TrajModel.setUserModel();
    }

    if (TrajModel.currentStatusId === "time-tab") {
        TrajModel.setSystemModel(1,element_id);
        TrajModel.setUserModel();
    }

    if (TrajModel.currentStatusId === "latitude-tab") {
        TrajModel.setSystemModel(2,element_id);
        TrajModel.setUserModel();
    }

    if (TrajModel.currentStatusId === "longitude-tab") {
        TrajModel.setSystemModel(3,element_id);
        TrajModel.setUserModel();
    }
	
	if (TrajModel.currentStatusId === "text-tab") {
        TrajModel.setSystemModel(4,element_id);
        TrajModel.setUserModel();
    }

    if (TrajModel.currentStatusId === "category-tab") {
        TrajModel.setSystemModel(5,element_id);
        TrajModel.setUserModel();
    }
}

// Step.4.1 - Remove current selected attribute
TrajModel.removeKey = function (attribute) {
    var i = 0;
    var len = DataModel.systemList.length;
    for (i; i < len; i++) {
        if (DataModel.systemList[i]['oldKey'] === $(attribute).attr("id")) {
            DataModel.systemList[i]['oldKey'] = "";
        }
    }
}

// Step 5- Validate format and set tripid, datetime, latitude, and longitude
// to the system model
TrajModel.setSystemModel = function (index, key) {

    // validate data format
    if (DataModel.validateFormat(index, key)) {
        DataModel.systemList[index]['oldKey'] = key;
        UI.showValidatedFormat();
    } else {
        var message = "Match failed: data type mismatch require "+ DataModel.systemList[index]['type'] + " data type";
        UI.error(message);
    }
}

// Step 6 - insert to postgresql database
TrajModel.insertToDB = function () {
	// Hide loader
	$('#loaderRN').hide();
	
    console.log ("Start Insert Data To Postgresql Database");
    TrajModel.createSystemModel();
    // Debug system model
    console.log (DataModel.systemList);
    // After we created all system attributes
    // All backend start from here
    Parser.parseToInsert(File.currentFile, TrajModel.dbname);
}

// Step 6.1 - Take all user seleted attributes and create a system model
TrajModel.createSystemModel = function () {
    var i = 0;
    var u_len = DataModel.userList.length;

    var id = DataModel.systemList[0]['oldKey'];
    var datetime = DataModel.systemList[1]['oldKey'];
    var latitude = DataModel.systemList[2]['oldKey'];
    var longitude = DataModel.systemList[3]['oldKey'];
	// Add speed
	var speed = DataModel.systemList[4]['oldKey'];

    // Add all attribute to the system
    for (i; i < u_len; i++) {
        var key = DataModel.userList[i]['key'];
        var type = DataModel.userList[i]['dataType']
        if (key === id || key === datetime || key === latitude || key === longitude || key === speed) {
        } else {
            // Add all key to the system model
            DataModel.addSystemModel(key, type, key);
        }
    }
}

// Step 7 - Aggregation Functions
TrajModel.InitMakePoint = function () {
	
	// Disable add geometry point button
	$('#makepoint').hide();
	
	// Change message
	$('#forGeometry').html("Please be patient, we are building geo");
	
	// Hide progressbar
	$('#progressbar-bg').hide();
	
	// Show loader
	$('#loaderRN').show();
	
    // Table name
    
    DataManager.AddGeoPoints(TrajModel.dbname);
}



// Directly call for open and close uploading modal
$(document).ready(function() {
    // Detect closed modal
    $('#fileModal').on('hidden.bs.modal', function () {
        // TODO: have to reset everything here
        TrajModel.exit();
    });

    $('#fileModal').on('shown.bs.modal', function () {
        // TrajModel.initialize();
    });
});

// Exit TrajModel
TrajModel.exit = function () {
    console.log ("Exit TrajModel");
    UI.nextButton.prop('disabled', false);
    // hide selection info
    $('#complete-select-file').hide();
}


// Add set to default function
TrajModel.setToDefault = function () {
	if (TrajModel.currentStatusId === "time-tab") {
		console.log ("set speed to default");
		TrajModel.defaultSpeed = true;
		// Enable next button
		UI.enableNextButton();
		
    }

	if (TrajModel.currentStatusId === "category-tab") {
		console.log ("set street name to default");
		// Enable next button
		UI.enableNextButton();
    }
}

