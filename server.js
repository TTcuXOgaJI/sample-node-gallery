var http = require("http"),
    url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        if (pathname != "/favicon.ico") {
            console.log("Request for " + pathname + " received .");
            route(handle, pathname, response, request);
        }else{
            response.writeHead(200, {'Content-Type': 'image/x-icon'} );
            response.end();
            console.log('favicon requested');
            return;
        }
    }

    http.createServer(onRequest).listen(Number(process.env.PORT || 3000));
    console.log("Server has started !");
}

exports.start = start;