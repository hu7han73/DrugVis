// DrugVis
// By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
// License: BSD

/*
    DataModel.js
    Note: this class contain all user and system data model
*/

var DataModel = DataModel || {};

// Array of multiple data objects
DataModel.userList = [];
DataModel.systemList = [];
DataModel.AttributeCount = 1;


// User attributes
DataModel.user = function (key, val) {
    this.key = key;
    this.exval = val;
    this.dataType = DataModel.formatType(val);
}

// System attributes
DataModel.system = function (key, type, oldKey) {
    this.key = key;
    this.type = type;
    this.oldKey = oldKey;
}

// Set up system model
DataModel.Initialize = function () {

    // Clear all system attributes
    DataModel.systemList = [];

    // Add required attributes to system list
    DataModel.addSystemModel("id", "int", ""); 
	DataModel.addSystemModel("pdatetime", "timestamp without time zone", "");
    DataModel.addSystemModel("latitude", "double precision", "");
    DataModel.addSystemModel("longitude", "double precision", "");
	// Add speed
	DataModel.addSystemModel("ptext", "text", "");
    DataModel.addSystemModel("pcategory", "text", "");
	
}

// Add attributes to system model and push into the list
DataModel.addSystemModel = function (key, type, oldkey) {
    var attribute = new DataModel.system(key, type, oldkey);
    DataModel.systemList.push(attribute);
}

// Create user attributes and store it to user array
DataModel.setUserAttributes = function (key, val) {
    //console.log (key + ": " + val);
    var attribute = new DataModel.user (key, val);
    DataModel.userList.push(attribute);
}

// Remove selected attributes
DataModel.removeExistAttribute = function () {

    console.log (DataModel.userList);
    console.log (DataModel.systemList);
    var i = 0, j = 0;
    var u_len = DataModel.userList.length;
    var s_len = DataModel.systemList.length;

    for (i; i < u_len ; i++) {
        for (j; j < s_len; j++) {
            if (DataModel.systemList[j]['oldKey'] === DataModel.userList[i]['key']) {
                DataModel.userList.slice(i,1);
            }
        }
    }
}

// Check data type
// Requires: ID is integer
// Requires: Latitude and Longitude is double or float
// Requires: Datetime format YYYY-MM-DD hh:mm:ss
// Requires: other variables is text or number
// Identify data type for CREATE TABLE command

DataModel.formatType = function (val) {

    // T denote data types
    var T;

    // Require format YYYY-MM-DD hh:mm:ss
    dateTime_regex = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01]) (00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/;

    // check if value meet the date time format
    if (dateTime_regex.test(val)){
        T = "timestamp without time zone";
        return T;
    } else {
        // check for integer, double, and string
        var E = parseFloat(val);
        //console.log (E);
        if (isNaN(E)) {
            T = "text";
            return T;
        } else {
            if (E % 1 != 0) {
                T = "double precision";
                return T;
            } else {
                T = "int";
                return T;
            }
        }
    }
}

// Precede South latitudes and West longitudes with a minus sign.
// Latitudes range from -90 to 90.
// Longitudes range from -180 to 180.

// Check if value is Latitude
DataModel.isLatitude = function (val) {
    // Parse value to floating point
    var E = parseFloat(val);

    if (isNaN(E)) {
        return false;
    } else {
        if ( val >= -90 && val <= 90 ) {
            return true;
        } else {
            return false;
        }
    }
}

// Check if value is Longitude
DataModel.isLongitude = function (val) {
    // Parse value to floating point
    var E = parseFloat(val);

    if (isNaN(E)) {
        return false;
    } else {
        if ( val >= -180 && val <= 180 ) {
            return true;
        } else {
            return false;
        }
    }
}

// Check user type match to our format
DataModel.validateFormat = function (index, id) {

    var i = 0;
    var len = DataModel.userList.length;
    for (i; i < len ; i++) {
        if (DataModel.userList[i]['key'] === id) {
            if (DataModel.userList[i]['dataType'] === DataModel.systemList[index]['type']) {
                return true;
            } else {
                return false;
            }
        }
    }
}
