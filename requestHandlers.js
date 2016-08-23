var querystring = require("querystring"),
    fs = require('fs'),
    url = require("url"),
    path = require('path'),
    formidable = require("formidable"),
    mv = require('mv'),
    jsdom = require('jsdom'),
    imageTypes = ['.png', '.jpg', '.gif'];

/**
 * Handler for home page request.
 * @param response
 */
function start(response) {
    console.log("Request handler 'start' was called.");
    fs.readFile('./view/index.html', function (err, html) {
        if (err) {
            throw err;
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(html);
            response.end();
        }
    });
}

/**
 * Handler for favicon request.
 * @param response
 */
function favicon(response) {
    console.log("Request handler 'favicon' was called.");
    var img = fs.readFileSync('./favicon/favicon.ico');
    response.writeHead(200, {"Content-Type": "image/x-icon"});
    response.end(img, 'binary');
}

/**
 * Handler for uploading new image request
 * @param response
 * @param request
 */
function upload(response, request) {
    console.log("Request handler 'upload' was called.");
    fs.readFile('./view/uploadedImage.html', function (err, html) {
        if (err) {
            throw err;
        } else {
            var form = new formidable.IncomingForm(),
                content = '',
                doc = jsdom.jsdom(html);
            console.log("about to parse");
            form.parse(request, function (error, fields, files) {
                console.log("parsing done");
                //Possible error in windows systems rename already existing file
                if (imageTypes.indexOf(path.extname(files.upload.name)) >= 0) {
                    mv(files.upload.path, "./images/" + files.upload.name, function (error) {
                        if (error) {
                            fs.unlink("./images/" + files.upload.name);
                            mv(files.upload.path, "./images/" + files.upload.name);
                        }
                    });
                    content = '<img style="max-width: 460px;max-height: 345px;border: 1px solid black;border-radius: 10px;" src="/showImage?Image=' + files.upload.name + '">';

                }
                // If was entered wrong format not .jpg , .png or .gif.
                else {
                    content = '<div class="alert alert-danger" style="font-size: 50px;">' +
                        '<strong>Error!</strong> Wrong file format.' +
                        '</div>';
                }
                doc.getElementById('uploadedImageContent').innerHTML = content;
                response.writeHead(200, {"Content-Type": "text/html"});
                response.write(jsdom.serializeDocument(doc));
                response.end();
            });
        }
    });
}

/**
 * Handler for image gallery request.
 * @param response
 */
function showImagesGallery(response) {
    console.log("Request handler 'showImageGallery' was called.");
    fs.readFile('./view/imagesGallery.html', function (err, html) {
        if (err) {
            throw err;
        } else {
            var imageDir = "./images/",
                galleryHideStatus = true,
                alertHideStatus = false,
                doc = jsdom.jsdom(html);

            /**
             * Get images from chosen directory and build page with bootstrap carousel with images in it.
             */
            getAllImagesFromDirectory(imageDir, function (err, files) {
                if (files.length > 0) {
                    var carouselIndicatorsInnerHTML = '';
                    var carouselInnerHTML = '';
                    carouselIndicatorsInnerHTML = carouselIndicatorsInnerHTML + '<li data-target="#myCarousel" data-slide-to="0" class="active"></li>';
                    carouselInnerHTML = carouselInnerHTML + '<div class="item active"><img style="width: 800px;height: 600px;margin:0 auto;" src="/showImage?Image=' + files[0] + '" alt="' + files[0] + '"><div class="carousel-caption"><h3>' + files[0] + '</h3></div></div>';

                    for (var i = 1; i < files.length; i++) {
                        carouselIndicatorsInnerHTML = carouselIndicatorsInnerHTML + '<li data-target="#myCarousel" data-slide-to="' + i + '"></li>';
                        carouselInnerHTML = carouselInnerHTML + '<div class="item"><img  style="width: 800px;height: 600px;margin:0 auto;" src="/showImage?Image=' + files[i] + '" alt="' + files[i] + '"><div class="carousel-caption"><h3>' + files[i] + '</h3></div></div>';
                    }
                    galleryHideStatus = false;
                    alertHideStatus = true;
                }
                if (galleryHideStatus) {
                    doc.getElementById('myCarousel').style.visibility = "hidden";
                } else {
                    doc.getElementById('myCarousel').style.visibility = "";
                }
                if (alertHideStatus) {
                    doc.getElementById('emptyGalleryMessage').style.visibility = "hidden";
                } else {
                    doc.getElementById('emptyGalleryMessage').style.visibility = "";
                }
                doc.getElementsByClassName('carousel-indicators')[0].innerHTML = carouselIndicatorsInnerHTML;
                doc.getElementsByClassName('carousel-inner')[0].innerHTML = carouselInnerHTML;
                response.writeHead(200, {'Content-type': 'text/html'});
                response.end(jsdom.serializeDocument(doc));
            });
        }
    });
}

/**
 * Gets images directory and pass array of images name + type to callback function.
 * @param imageDir
 * @param callback
 */
function getAllImagesFromDirectory(imageDir, callback) {
    var files = [];
    fs.readdir(imageDir, function (err, list) {
        if (list.length > 0) {
            for (var i = 0; i < list.length; i++) {
                if (imageTypes.indexOf(path.extname(list[i])) >= 0) { //Type checking
                    files.push(list[i]); // Storing Image
                }
            }
        }
        callback(err, files);
    });

}

/**
 * Handler for image request.
 * @param response
 * @param request
 */
function showImage(response, request) {
    console.log("Request handler 'showImage' was called.");
    var query = url.parse(request.url).query,
        params = querystring.parse(query);
    response.writeHead(200, {"Content-Type": "image/png"});
    fs.createReadStream("./images/" + params.Image).pipe(response);
}

/**
 * Handler for delete image request.
 * @param response
 * @param request
 */
function deleteImage(response, request) {
    console.log("Request handler 'deleteImage' was called.");
    fs.readFile('./view/deletedImage.html', function (err, html) {
        if (err) {
            throw err;
        } else {
            var query = url.parse(request.url).query,
                params = querystring.parse(query),
                doc = jsdom.jsdom(html);
            fs.unlink("./images/" + params.Image); //removing image from gallery
            doc.getElementById('deleteSuccessMSG').innerHTML = ' <strong style="font-size: 50px;">' +
                'Image "' + params.Image + '" Has been removed from gallery.' +
                '</strong>';
            response.writeHead(200, {'Content-type': 'text/html'});
            response.end(jsdom.serializeDocument(doc));
        }
    });
}

exports.showImagesGallery = showImagesGallery;
exports.start = start;
exports.upload = upload;
exports.showImage = showImage;
exports.deleteImage = deleteImage;
exports.favicon = favicon;