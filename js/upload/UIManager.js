// DrugVis
// By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
// License: BSD

/*
    UIManager.js
    Note: use to manage user-interface (UI) for NeighborVis data Upload
*/

// UI namagespace
var UI = UI || {};

// UI componenets
UI.errorMessage = $('#error-message');
UI.errorDiv = $('#trajmodel-error');

// File selection ui elements
UI.selectFile = $('#select-file');
UI.completeSelectFile = $('#complete-select-file');
UI.fileSelector = $('#file');
UI.fileName = $('#file-name');
UI.fileSize = $('#file-size');
UI.fileModify = $('#file-modify');

// Survey ui elements
UI.surveyDiv = $('#survey-modal');
UI.surveyHeader = $('#survey-model-header');
UI.surveyQuestion = $('#survey-model-question');
UI.surveyHint = $('#survey-model-hint');
UI.surveySelect = $('#survey-model-select');

// user model
UI.fileModal = $('#fileModal');
UI.usermodel = $('#user-model-body');

// next and back button footer
UI.nextButton = $('#nextModal');
UI.backButton = $('#backModal');

// insertion modal
UI.insertDiv = $('#insert-modal');
UI.makepoint = $('#makepoint');

// Default button
UI.defaultButton = $('#default-button');

// Preprocessing Panel
UI.preprocessHeader = $('#preprocess-header');
UI.preprocessHint = $('#preprocess-hint');
UI.tripAggregationButton = $('#trip-aggregation');
UI.finishButton = $('#trip-finish'); 
//UI.ExtractRNButton = $('#ExtractRN');
//UI.MapMatchingButton = $('#MapMatching');

// Initialize user interface
UI.init = function () {
    UI.errorDiv.hide();
    UI.completeSelectFile.hide();
    UI.nextButton.hide();
    UI.backButton.hide();
    UI.fileSelector.val('');
}

// Set file information
UI.setFileInfo = function ( name, size, modify) {
    UI.fileName.html(name);
    UI.fileSize.html(size);
    UI.fileModify.html(modify);
}

// Complete selection file
UI.showCompleteSelectionFile = function () {
    // Hide select file panel
    UI.selectFile.hide();
    // Show complete selection and file detail
    UI.completeSelectFile.show();
    // Enable next button for next step
    UI.nextButton.show();
}

UI.showUploadSelectionFile = function () {
    // Hide select file panel
    UI.selectFile.show();
    // Show complete selection and file detail
    UI.completeSelectFile.hide();
    // Enable next button for next step
    UI.nextButton.hide();
}

// Show validated format
UI.showValidatedFormat = function () {
    UI.errorMessage.html();
    UI.errorDiv.hide();
    UI.nextButton.prop('disabled', false);
}

// Clear user attributes body
UI.clearUserAttribute = function () {
    UI.usermodel.html("");
}

// Display user attributes
UI.displayUserAttribute = function (element) {
    UI.usermodel.html(element);
}

UI.clearSelectedAttribute = function () {
    UI.surveySelect.html("");
}

// Display selected attribute
UI.selectedAttribute = function (element) {
    UI.surveySelect.html(element);
    UI.nextButton.prop('disabled', false);
}

// Enable aggregation button
UI.enableAggregationButton = function () {
    UI.makepoint.prop('disabled', false);
}

// Show aggregation panel
UI.showAggregationPanel = function () {
    //UI.insertDiv.html("<h4> Extract Road Network ... </h4>");
	// Call road network tab;
	UI.insertDiv.hide();
	UI.finishButton.hide();
	// Hide loader in make trip panel
	$('#loaderRN2').hide();
	UI.next();
}

// Next active tab
UI.next = function () {
	UI.errorDiv.removeClass("alert alert-success").addClass( "alert alert-danger" );
    // Find next tab
    var status = $('.nav-tabs > .active').next('li').find('a');
    UI.errorMessage.html();
    UI.errorDiv.hide();
	
	// Create database name
    if ( status.attr('id') === "dbname-tab") {
		
        // trigger to create database name
        status.trigger('click');
    }
	
	// Select tripid
    if ( status.attr('id') === "first-tab") {
		console.log ("go to file slection process");
        // trigger tripid survey
        status.trigger('click');
    }

    // Select tripid
    if ( status.attr('id') === "tripid-tab") {
        UI.surveyDiv.show();
        UI.clearSelectedAttribute();
        TrajModel.setUserModel();
        // Initialize user attributes
        TrajModel.initializeAttrSelection(File.currentFile, File.extension);
        TrajModel.currentStatusId = status.attr('id');
        // Disable next button
        UI.nextButton.prop('disabled', true);
		// Hide default button
		UI.defaultButton.hide();
		
        // Set survey information
        var header = "Attribute #1";
        var question = " <h2> Please specify the Event ID ? </h2> ";
        var hint = "<h5> ( Hint: select one from the provided variables ) </h5>";
        // Set survey information
        UI.showSurveyInfo(header,question,hint);

        // trigger tripid survey
        status.trigger('click');
    }
    // Select datetime
    if (status.attr('id') === "time-tab") {
        UI.clearSelectedAttribute();
        // Initialize user attributes
        TrajModel.initializeAttrSelection(File.currentFile, File.extension);
        TrajModel.currentStatusId = status.attr('id');
        // Disable next button
        UI.nextButton.prop('disabled', true);
		// Hide default button
		UI.defaultButton.show();
        // Show back button
        UI.backButton.show();
        // Set survey information
        var header = "Attribute #2";
        var question = "<h2> Please specify the day | time ? </h2>";
        var hint = "<h5> ( Hint: select one from the provided variables, Format templete YYYY-MM-DD hh:mm:ss) </h5>";
        // Set survey infromation
        UI.showSurveyInfo(header,question,hint);

        // trigger datetime survey
        status.trigger('click');
    }
    // Select latitude
    if (status.attr('id') === "latitude-tab") {
        UI.clearSelectedAttribute();
        // Initialize user attributes
        TrajModel.initializeAttrSelection(File.currentFile, File.extension);
        TrajModel.currentStatusId = status.attr('id');
        // Disable next button
        UI.nextButton.prop('disabled', true);
		// Hide default button
		UI.defaultButton.hide();
        // Show back button
        UI.backButton.show();
        // Set survey information
        var header = "Attribute #3";
        var question = "<h2> Please specify the latitude ? </h2>";
        var hint = "<h5> ( Hint: select one from the provided variables ) </h5>";
        // Set survey information
        UI.showSurveyInfo(header,question,hint);

        // Trigger latitude survey
        status.trigger('click');
    }
    // Select longitude
    if (status.attr('id') === "longitude-tab") {
        UI.clearSelectedAttribute();
        // Initialize user attributes
        TrajModel.initializeAttrSelection(File.currentFile, File.extension);
        TrajModel.currentStatusId = status.attr('id');
        // Disable next button
        UI.nextButton.prop('disabled', true);
		// Hide default button
		UI.defaultButton.hide();
        // Show back button
        UI.backButton.show();
        // Set survey information
        var header = "Attribute #4";
        var question = "<h2> Please specify the longitude ?</h2>";
        var hint = "<h5> ( Hint: select one from the provided variables ) </h5>";
        // Set survey information
        UI.showSurveyInfo(header,question,hint);

        // Trigger longitude survey
        status.trigger('click');
    }
	// Select speed
    if (status.attr('id') === "text-tab") {
        UI.clearSelectedAttribute();
        // Initialize user attributes
        TrajModel.initializeAttrSelection(File.currentFile, File.extension);
        TrajModel.currentStatusId = status.attr('id');
        // Disable next button
        UI.nextButton.prop('disabled', true);
		// Show default button
		UI.defaultButton.hide();
        // Show back button
        UI.backButton.show();
        // Set survey information
        var header = "Attribute #5";
        var question = "<h2> Please specify the text ?</h2>";
        var hint = "<h5> ( Hint: select one from the provided variables ) </h5>";
        // Set survey information
        UI.showSurveyInfo(header,question,hint);

        // Trigger speed survey
        status.trigger('click');
    }

    if (status.attr('id') === "category-tab") {
        UI.clearSelectedAttribute();
        // Initialize user attributes
        TrajModel.initializeAttrSelection(File.currentFile, File.extension);
        TrajModel.currentStatusId = status.attr('id');
        // Disable next button
        UI.nextButton.prop('disabled', true);
        // Show default button
        UI.defaultButton.show();
        // Show back button
        UI.backButton.show();
        // Set survey information
        var header = "Attribute #6";
        var question = "<h2> Please specify the category ?</h2>";
        var hint = "<h5> ( Hint: select one from the provided variables ) </h5>";
        // Set survey information
        UI.showSurveyInfo(header,question,hint);

        // Trigger speed survey
        status.trigger('click');
    }

    // Finish select attributes and start to insert
    if (status.attr('id') === "insert-tab") {
        // Hide next and back button
        UI.nextButton.hide();
        UI.backButton.hide();
		// Hide default button
		UI.defaultButton.hide();
        // Hide survey question
        UI.surveyDiv.hide();
        // Show inserting panel and progress bar
        UI.insertDiv.show();
        UI.makepoint.show();
        $('#loaderRN').show();
        $('#progressbar-bg').show();
        // Insert data to database
        UI.makepoint.prop('disabled', true);
        TrajModel.insertToDB();
		status.trigger('click');
    }
	
	// Create trip
	if (status.attr('id') === "preprocessing-tab") {
		status.trigger('click');
        UI.showFinish();
	}
	
}

// Back to previous tab
UI.back = function () {

    // Find next tab
    var status = $('.nav-tabs > .active').prev('li').find('a');

    // Hide error message
    UI.errorMessage.html("");
    UI.errorDiv.hide();

    // back to tripid tab
    if ( status.attr('id') === "tripid-tab" ) {
        // Hide back button
        UI.backButton.hide();
		// Hide default button
		UI.defaultButton.hide();
        // Set survey information
        var header = "Attribute #1";
        var question = " <h2> Please specify the report ID ? </h2> ";
        var hint = "<h5> ( Hint: select one from the provided variables ) </h5>";
        // Show survey information
        UI.showSurveyInfo(header,question,hint);

        // Set current status and user model
        TrajModel.currentStatusId = status.attr('id');
        TrajModel.setUserModel();

        status.trigger('click');
    }

    // back to time tab
    if ( status.attr('id') === "time-tab" ) {
        // Show back button
        UI.backButton.show();
		// Hide default button
		UI.defaultButton.show();
        // Set survey information
        var header = "Attribute #2";
        var question = "<h2> Please specify the day | time ? </h2> ";
        var hint = "<h5> ( Hint: select one from the provided variables) </h5>";
        // Show survey information
        UI.showSurveyInfo (header,question,hint);

        // Set current status and user model
        TrajModel.currentStatusId = status.attr('id');
        TrajModel.setUserModel();

        status.trigger('click');
    }

    // back to latitude tab
    if ( status.attr('id') === "latitude-tab" ) {
        // Show back button
        UI.backButton.show();
		// Hide default button
		UI.defaultButton.hide();
        // Set survey information
        var header = "Attribute #3";
        var question = "<h2> Please specify the Latitude ? </h2> ";
        var hint = "<h5> ( Hint: select one from the provided variables ) </h5>";
        // Show survey information
		//console.log ("latitude tab");
        UI.showSurveyInfo (header,question,hint);

        // Set current status and user model
        TrajModel.currentStatusId = status.attr('id');
        TrajModel.setUserModel();

        status.trigger('click');
    }

    // back to longitude tab
    if ( status.attr('id') === "longitude-tab" ) {
        // Show back button
        UI.backButton.show();
		// Hide default button
		UI.defaultButton.hide();
        // Set survey information
        var header = "Attribute #4";
        var question = "<h2> Please specify the Longitude ? </h2> ";
        var hint = "<h5> ( Hint: select one from the provided variables ) </h5>";
        // Show survey information
        UI.showSurveyInfo (header,question,hint);

        // Set current status and user model
        TrajModel.currentStatusId = status.attr('id');
        TrajModel.setUserModel();

        status.trigger('click');

    }
	
	// back to speed tab
    if ( status.attr('id') === "text-tab" ) {
        // Show back button
        UI.backButton.show();
		// Show default button
		UI.defaultButton.hide();
        // Set survey information
        var header = "Question #5";
        var question = "<h2> Please specify the text ?</h2>";
        var hint = "<h5> ( Hint: select one from the provided variables ) </h5>";
        // Show survey information
        UI.showSurveyInfo (header,question,hint);

        // Set current status and user model
        TrajModel.currentStatusId = status.attr('id');
        TrajModel.setUserModel();

        status.trigger('click');

    }

    if ( status.attr('id') === "category-tab" ) {
        // Show back button
        UI.backButton.show();
        // Show default button
        UI.defaultButton.show();
        // Set survey information
        var header = "Question #6";
        var question = "<h2> Please specify the category ?</h2>";
        var hint = "<h5> ( Hint: select one from the provided variables ) </h5>";
        // Show survey information
        UI.showSurveyInfo (header,question,hint);

        // Set current status and user model
        TrajModel.currentStatusId = status.attr('id');
        TrajModel.setUserModel();

        status.trigger('click');

    }
}

// Set survey information
UI.showSurveyInfo = function (header, question, hint) {
    UI.surveyHeader.html(header);
    UI.surveyQuestion.html(question);
    UI.surveyHint.html(hint);
}

// Finish making trip
UI.finishMakeTrip = function () {
	// Close Modal
	UI.fileModal.modal('toggle');
    $('#dbname-tab').trigger('click');
    // show select file
    $('#dbname-modal').show();
    UI.showUploadSelectionFile();

    $('#collGroup').empty();
    $('#dataTable tbody').empty();
    $('#selectedData').empty();
    getAllCollections();
}

// Finishing all process
UI.showFinish = function () {
	UI.tripAggregationButton.hide();
	// Display message
	UI.preprocessHeader.html("<center><h2>Your data successfully inserted on <b>"+DataManager.currentDB+"</b> database!</h2></center>");
	UI.preprocessHint.html("<center><h4>Hint: Click Finish button to end</h4></center>");
	UI.finishButton.show();
}

UI.error = function (message) {
    UI.errorMessage.html(message);
    UI.errorDiv.show();
}

UI.creatingDB = function () {
	UI.errorMessage.html ("Please be patient, initiating database on your system ... ");
	UI.errorDiv.removeClass( "alert alert-danger" ).addClass( "alert alert-success" );
}

UI.enableNextButton = function () {
	UI.nextButton.prop('disabled',false);
}

