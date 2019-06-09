// DrugVis
// By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
// License: BSD

/*
    DataManager.js
    Note: this file contain backend functions to upload data
*/

var DataManager = DataManager || {};
DataManager.currentDB = "";

DataManager.checkDatabase = "php/checkDatabase.php";

DataManager.createDatabase = "php/createDatabase.php";

DataManager.insertToDatabase = "php/insertData.php";

DataManager.geoindexing = "php/geoIndex.php";

DataManager.removeDatabse = "php/removeDatabase.php";

DataManager.createDB1 = function (dbname) {
	
	//if (DataManager.checkDBname (dbname))
	// Create database with given dbname
	DataManager.checkDBname(dbname)
		 
	
}

DataManager.checkDBname = function (name) {
	MAP.clear();
	MAP.clearGolobal();

	var createDatabase = DataManager.createDatabase + '?dbname=' + name;

     $.ajax({


            url: DataManager.checkDatabase,
            // Provide correct Content-Type, so that Flask will know how to process it.
            contentType: 'application/json',
            async: true,
			// Encode data as JSON.
            // data: JSON.stringify(obj),
            // This is the type of data expected back from the server.
            dataType: 'json',
            success: function(ret) {

            	var collNameList = [];

            	for (i = 0; i < ret.length; i++)
            	{
            		collNameList.push(ret[i].toLowerCase().replace(' ', '_'));
            	}

				

				if (!collNameList.includes(name)) {
					UI.error("");
					// Show loading message
					UI.creatingDB();
					// Disable
					// $("#dbname-input").prop("disabled",true);
					// // Disable button
					// $("#dbname-button").prop("disabled", true);
					
					$.ajax({
						// Provide correct Content-Type, so that Flask will know how to process it.
						contentType: 'application/json',
						async: true,
						// Encode data as JSON.
						// data: JSON.stringify(obj),
						// This is the type of data expected back from the server.
						dataType: 'json',
						url: createDatabase,
						success: function(ret) {
							// Successfully created database
							DataManager.currentDB = name;
							console.log(DataManager.currentDB)
							UI.next();
						}
					});
				} else {
					DataManager.currentDB = "";
					UI.error("This database already exists, please give another database name");
					// reset textbox value
					document.getElementById("dbname-input").value = "";
				}
            },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Query failed ... " + "\nStatus: " + textStatus + "\nError Message: " + errorThrown);
        }
    });
}

DataManager.insertToTable = function (data,tablename){
		/*if (TrajModel.defaultSpeed) {
			console.log ("set to Zero");
		} else {
			console.log ("modify data");
		}*/

		var dataAll = [];

		for (i = 0; i < data.length; i++)
		{
			var doc = data[i];

			var loc = {};
			loc.type = "Point";
			loc.coordinates = [ parseFloat(doc.longitude) , parseFloat(doc.latitude) ];
			doc.loc = loc;

			delete doc.latitude;
		    delete doc.longitude;

			dataAll.push(doc);
		}
		
		
        obj={};
		obj["Data"]=dataAll;
		obj["TableName"]=tablename;

		var myJSONText = JSON.stringify(obj);

        $.ajax({
            type: 'POST',
            // Provide correct Content-Type, so that Flask will know how to process it.
            async: false,
			// Encode data as JSON.
            data: { kvcArray : myJSONText },
            // This is the type of data expected back from the server.
            dataType: 'json',
            url: DataManager.insertToDatabase,
            success: function(ret) {
                console.log(ret);
                
            }
        });
    }


// Backend 5 -  get BBX
DataManager.AddGeoPoints = function(tablename) {

	var geoindexing = DataManager.geoindexing + '?dbname=' + tablename;


    $.ajax({
            url: geoindexing,
            // Provide correct Content-Type, so that Flask will know how to process it.
            contentType: 'application/json',
            async: true,
			// Encode data as JSON.
            // data: JSON.stringify(obj),
            // This is the type of data expected back from the server.
            dataType: 'json',
            success: function(ret) {
            	console.log(ret);
				// Hide loader
				$('#loaderRN').hide();
				UI.showAggregationPanel();
            }
    });
}

DataManager.getCollections = function () {

	var queryResult;

     $.ajax({


            url: DataManager.checkDatabase,
            // Provide correct Content-Type, so that Flask will know how to process it.
            contentType: 'application/json',
            async: false,
			// Encode data as JSON.
            // data: JSON.stringify(obj),
            // This is the type of data expected back from the server.
            dataType: 'json',
            success: function(ret) {

            	var collNameList = [];

            	for (i = 0; i < ret.length; i++)
            	{
            		collNameList.push(ret[i].toLowerCase().replace(' ', '_'));
            	}

            	queryResult = collNameList

				
            },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Query failed ... " + "\nStatus: " + textStatus + "\nError Message: " + errorThrown);
        }
    });

     return queryResult;
}

DataManager.removeDB = function (name) {
	MAP.clear();
	MAP.clearGolobal();

	var removeDatabase = DataManager.removeDatabse + '?dbname=' + name;

	$.ajax({
			// Provide correct Content-Type, so that Flask will know how to process it.
			contentType: 'application/json',
			async: true,
			// Encode data as JSON.
			// data: JSON.stringify(obj),
			// This is the type of data expected back from the server.
			dataType: 'json',
			url: removeDatabase,
			success: function(ret) {
				// Successfully created database
			}
		});

}



