// DrugVis
// By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
// License: BSD

/*
    File.js
    Note: use to manage file system
*/

var File = File || {}

File.currentFile;
File.extension = "";
File.support = ['csv', 'json'];

// Get current file
File.getCurrentFile = function () {
    return File.currentFile;
}

// Get file name
File.getFileName = function () {
    return File.currentFile.name;
}

// Get file size
File.getFileSize = function () {
    return File.formatBytes(File.currentFile.size,1);
}

// Get original file size in bytes
File.getFileByte = function () {
	return File.currentFile.size;
}

// Get last modify date
File.getFileLastModify = function () {
    return File.currentFile.lastModifiedDate;
}

// Check support file type
File.isSupportFileType = function (file) {
    File.extension = file.name.split('.').pop().toLowerCase();

    if ( File.support.indexOf(File.extension) > -1 ) {
        return true;
    } else {
        return false;
    }
}

// Reset file system
File.reset = function () {
    File.currentFile = null;
    File.extension = "";
}

// Convert file size format
File.formatBytes = function(bytes,decimals) {
    if ( bytes == 0 ) return '0 Bytes';
    var k = 1000,
    dm = decimals + 1 || 3,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor (Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}