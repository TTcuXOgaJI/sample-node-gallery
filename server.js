var http = require("http"),
    url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
            console.log("Request for " + pathname + " received .");
            route(handle, pathname, response, request);
    }

    http.createServer(onRequest).listen(Number(process.env.PORT || 3000));
    console.log("Server has started !");
}

exports.start = start;