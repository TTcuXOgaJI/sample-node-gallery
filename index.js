var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["/showImage"] = requestHandlers.showImage;
handle["/showImagesGallery"]=requestHandlers.showImagesGallery;
handle["/deleteImage"]=requestHandlers.deleteImage;
handle["/favicon.ico"]=requestHandlers.favicon;
server.start(router.route,handle);