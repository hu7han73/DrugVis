// DrugVis
// By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
// License: BSD

/*
    Parser.js
    Currently implement to support .csv file
*/

var Parser = Parser || {};

// Parser utilities
Parser.startTime = 0;
Parser.endTime = 0;
Parser.percent = 0;
Parser.filesize = 0;
Parser.loading = true;
Parser.rows = 0;

// Default parser settings
Parser.config;
Parser.delimeter = "";
Parser.newline = "";
Parser.header = true;
Parser.dynamicTyping = false;
Parser.preview = 0;
Parser.encoding = "";
Parser.worker = true;
Parser.comments = false;
Parser.fastMode = false;
Parser.beforeFirstChunk = undefined;
Parser.skipEmptyLines = true;
Parser.chunk = undefined;
Parser.step = undefined;

// Track current table name
Parser.tablename = "";

// Parse for headers and value using streaming method
Parser.parseHeaders = function (file) {

    // Start timer
    Parser.startTime = performance.now();
    //console.log ("Start parsing: " + file.name + " (" + file.size + ")");

    // parse only headers and first rows
    Parser.preview = 1;
    Parser.filesize = file.size;

    // Define step function and configuration
    Parser.chunk = undefined;
    Parser.beforeFirstChunk = undefined;

    Parser.step = Parser.processStep;
    Parser.config = Parser.buildConfig();
    //console.log (Parser.config);
    // Start parsing
    Papa.parse(file, Parser.config);
}

Parser.parseToInsert = function (file, tableName) {
	
    // Set current table name
    Parser.tablename = tableName;
    // Start timer
    Parser.startTime = performance.now();
    // Parse all data set preview to ZERO
    Parser.preview = 0;
    Parser.filesize = file.size;

    // Define chunk function and add some configuration
    Parser.step = undefined;
    Parser.beforeFirstChunk = Parser.setHeader;
    Parser.chunk = Parser.processChunk;
	Papa.LocalChunkSize = 1024;
	FileSize=File.getFileByte()
	IterationNo=FileSize/Papa.LocalChunkSize;
	while(IterationNo>=99)
	{
		Papa.LocalChunkSize*=2;
		IterationNo=FileSize/Papa.LocalChunkSize;
		console.log("I",IterationNo)
	}	
	
	
    // Disable worker
    Parser.worker = false;
    Parser.config = Parser.buildConfig();
    // Start parsing
    Papa.parse(file, Parser.config);
}

// Parse csv rows by streaming (line by line)
Parser.processStep = function (results) {

    // Build progress bar
    var progress = Parser.filesize;
    var newPercent = Math.round(( progress / Parser.filesize ) * 100);
    if (newPercent === Parser.percent) { return; }
    Parser.percent = newPercent;
    console.log ("Percent: ", Parser.percent, '%');

    // Set all user attributes
    if (results != undefined) {
        // reset userlist
        DataModel.userList = [];
        var obj = results.data[0];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Set user attribute with keys and values
                DataModel.setUserAttributes (key, obj[key]);
            }
        }
    }
}

// Parse csv rows by chunk size (multiple line)
Parser.processChunk = function (results) {

    Parser.rows += results.data.length;
	console.log (Parser.rows);
    var progress = results.meta.cursor;
    var newPercent = Math.round(( progress / Parser.filesize ) * 100);
    //console.log (newPercent + " " + Parser.percent);
	DataManager.insertToTable(results.data, Parser.tablename, QUERY.userName);
    if (newPercent === Parser.percent) { return; }
    Parser.percent = newPercent;

    // Insert data
    // This take csv data divided by chunk and
    // Backend 3
    

    console.log ("Percent: ", Parser.percent, '%');
    Parser.updateProgressbar(Parser.percent);
}

// Rename header with system attribute
Parser.setHeader = function (chunk) {
    // Get system model and user model

    var index = chunk.match( /\r\n|\r|\n/ ).index;
    var headings = chunk.substr(0, index).split( ',' );

    var i = 0;
    var h_len = headings.length;
    // Rename csv headers with system model headers
    for (i; i < h_len; i++) {

        for (j=0; j < DataModel.systemList.length; j++) {
            if (headings[i] === DataModel.systemList[j]['oldKey']) {
                headings[i] = DataModel.systemList[j]['key'];
            }
        }
    }

    return headings.join() + chunk.substr(index);
}


// Build parser settings
Parser.buildConfig = function () {
    return {
        delimeter: Parser.delimeter ,
        newline: Parser.newline,
        header: Parser.header,
        dynamicTyping: Parser.dynamicTyping,
        preview: Parser.preview,
        encoding: Parser.encoding,
        worker: Parser.worker,
        comments: Parser.comments,
        chunk: Parser.chunk,
        step: Parser.step,
		skipEmptyLines: Parser.skipEmptyLines,
        beforeFirstChunk: Parser.beforeFirstChunk,
        complete: Parser.complete
    };
}

// Complete parsing all result
Parser.complete = function () {
    // End time
    Parser.endTime = performance.now();
    // Calculate processing time
    var ms = (Parser.endTime - Parser.startTime), // Milliseconds
        min = (ms/1000/60) << 0, // Minutes
        sec = (ms/1000) % 60 << 0; // Seconds
    var totalTime = (min + "m : " + sec + "s ("+ ms.toFixed(2) + "ms)");
    console.log ("Total time: " + totalTime);

    // using streaming parser
    if (Parser.step != undefined) {
        TrajModel.setUserModel();
        // Reset percentage to zero
        Parser.percent = 0;
    }

    // using chunk parser
    if (Parser.chunk != undefined) {
        // Use to debug and test
        // To make sure that we insert all of the data
        setTimeout(DataManager.validateInsertResult, 8000);
        UI.enableAggregationButton();
    }
}

// Update progress bar from workers
Parser.updateProgressbar = function (percent) {

    $('#progressbar').html(percent + '%');
    $('#progressbar').width(((percent*$('#progressbar-bg').width())/100) + 'px');
}