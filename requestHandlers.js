var querystring = require("querystring"),
    fs = require('fs'),
    url = require("url"),
    path = require('path'),
    formidable = require("formidable"),
    mv = require('mv'),
    imageTypes = ['.png', '.jpg', 'gif'];


function start(response) {
    console.log("Request handler 'start' was called.");
    var body = '<html>' +
        '<head>' +
        '<meta http-equiv="content-type" content="text/html" charset="UTF-8" />' +
        '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">' +
        '</head>' +
        '<script>function validateForm() {' +
        'var uploadValue = document.forms["uploadForm"]["upload"].value;' +
        'if (uploadValue == null || uploadValue == "") {' +
        'alert("Please choose Image");' +
        'return false;' +
        '}' +
        '}' +
        '</' +
        'script > ' +
        '<body style="padding-top: 200px;">' +
        '<nav class="navbar navbar-default navbar-fixed-top text-center" style="height: 120px;"> <div class=" text-center" style="margin-top: 25px;"><strong style="font-size: 40px;">Simple Image Gallery</strong></div></nav>' +
        '<div class="container text-center">' +
        '<div id="msg"></div>' +
        '<form action="/upload" enctype="multipart/form-data" method="post" name="uploadForm" onsubmit="return validateForm()">' +
        '<div class="form-group">' +
        '<label class="btn btn-info btn-file" style="width: 300px; height: 80px; margin-right: 5px;">' +
        '<div class="text-center" style="margin-top: 5px; font-size: 40px;"><strong>Browse Image</strong></div> <input type="file" name="upload" style="display: none; ">' +
        '</label>' +
        '<input class="btn btn-success" style="width: 300px;height: 80px; margin-left: 5px; font-size: 40px;font-weight: bold" type="submit" value="Upload"/>' +
        '</div>' +
        '</form>' +
        '<a class="btn btn-primary" style="width: 610px;height: 80px;" role="button" href="/showImagesGallery"><strong style="font-size: 40px;">Show Gallery</strong></a>' +
        '</div>' +
        '</body>';
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();

}
function upload(response, request) {
    console.log("Request handler 'upload' was called.");
    var form = new formidable.IncomingForm(),
        content = '',
        body;
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
        else {
            content = '<div class="alert alert-danger" style="font-size: 50px;">' +
                '<strong>Error!</strong> Wrong file format.' +
                '</div>';
        }
        body = '<html>' +
            '<head>' +
            '<meta http-equiv="content-type" content="text/html" charset="UTF-8" />' +
            '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">' +
            '</head>' +
            '<body style="padding-top: 200px;">' +
            '<nav class="navbar navbar-default navbar-fixed-top text-center"  style="height: 120px;"> <div class=" text-center" style="margin-top: 25px;"><strong style="font-size: 40px;">Uploaded Image</strong></div></nav>' +
            '<div class="container text-center">' +
            content +
            '<hr style=" border-style: solid none;border-width: 1px 0;">' +
            '<a class="btn btn-info" style="width: 300px;height: 80px; margin-right: 5px; font-size: 40px;font-weight: bold" role="button" href="/">Home</a>' +
            '<a class="btn btn-info" style="width: 300px;height: 80px; margin-left: 5px; font-size: 40px;font-weight: bold" role="button" href="/showImagesGallery">Show Gallery</a>' +
            '</div>' +
            '</body>';
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(body);
        response.end();
    });
}

function showImagesGallery(response) {
    var imageDir = "./images/",
        galleryHideStatus = "hidden",
        alertHideStatus = "";

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
            galleryHideStatus = "";
            alertHideStatus = "hidden";
        }
        var body = '<head>' +
            '<meta http-equiv="content-type" content="text/html" charset="UTF-8" />' +
            '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">' +
            '<script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>' +
            '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>' +
            '<script>' +
            'function getSelectedImageInCarousel(element) {' +
            'var selectedImage = element.href;' +
            'if(document.getElementsByClassName("item active").length > 0){' +
            'var selectedItem =  document.getElementsByClassName("item active")[0].childNodes[1].childNodes[0].innerHTML;' +
            'element.href = element.href + document.getElementsByClassName("item active")[0].childNodes[1].childNodes[0].innerHTML;' +
            'return true;' +
            '}else{' +
            'return false;' +
            '}' +
            '}' +
            '</script>' +
            '<style>' +
            '.carousel-inner > .item > img,' +
            '.carousel-inner > .item > a > img {' +
            'width: 70%;' +
            'margin: auto;' +
            '}' +
            '</style>' +
            '</head>' +
            '<body style="padding-top: 200px;">' +
            '<nav class="navbar navbar-default navbar-fixed-top text-center" style="height: 120px;"> <div class=" text-center" style="margin-top: 25px;"><strong style="font-size: 40px;">Simple Image Gallery</strong></div></nav>' +
            '<div class="container">' +
            '<div  id="myCarousel" class="carousel slide" data-ride="carousel" ' + galleryHideStatus + '>' +
            '<!-- Indicators -->' +
            '<ol class="carousel-indicators">' + carouselIndicatorsInnerHTML + '</ol>' +
            ' <!-- Wrapper for slides -->' +
            '<div  class="carousel-inner" role="listbox">' + carouselInnerHTML + '</div>' +
            '<a class="left carousel-control" href="#myCarousel" role="button" data-slide="prev">' +
            '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>' +
            '<span class="sr-only">Previous</span>' +
            '</a>' +
            '<a class="right carousel-control" href="#myCarousel" role="button" data-slide="next">' +
            '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>' +
            '<span class="sr-only">Next</span>' +
            '</a>' +
            '</div>' +
            '<div class="alert alert-warning" ' + alertHideStatus + ' >' +
            '<div class="text-center"><strong  style="font-size: 50px;">Gallery is empty.</strong></div>' +
            '</div>' +
            '</div>' +
            '<hr style=" border-style: solid none;border-width: 1px 0;">' +
            '<div class="container text-center">' +
            '<a class="btn btn-info"  style="width: 300px;height: 80px; margin-right: 5px; font-size: 40px;font-weight: bold" role="button" href="/">Home</a>' +
            '<a class="btn btn-danger"  style="width: 300px;height: 80px; margin-left: 5px; font-size: 40px;font-weight: bold" role="button" href="/deleteImage?Image=" onclick="return getSelectedImageInCarousel(this);">Delete</a>' +
            '</div>' +
            '</body>';
        response.writeHead(200, {'Content-type': 'text/html'});
        response.end(body);
    });
}


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

function showImage(response, request) {
    var query = url.parse(request.url).query,
        params = querystring.parse(query);
    response.writeHead(200, {"Content-Type": "image/png"});
    fs.createReadStream("./images/" + params.Image).pipe(response);
}

function deleteImage(response, request) {
    var query = url.parse(request.url).query,
        params = querystring.parse(query);
    fs.unlink("./images/" + params.Image); //removing image from gallery
    body = '<html>' +
        '<head>' +
        '<meta http-equiv="content-type" content="text/html" charset="UTF-8" />' +
        '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">' +
        '</head>' +
        '<body style="padding-top: 200px;">' +
        '<nav class="navbar navbar-default navbar-fixed-top text-center" style="height: 120px;"> <div class=" text-center" style="margin-top: 15px;"></div></nav>' +
        '<div class="container text-center">' +
        '<div class="alert alert-success">' +
        '<strong  style="font-size: 50px;">' +
        'Image "' + params.Image + '" Has been removed from gallery.' +
        '</strong>' +
        '</div>' +
        '<hr style=" border-style: solid none;border-width: 1px 0;">' +
        '<a class="btn btn-info" style="width: 300px;height: 80px; margin-right: 5px; font-size: 40px;font-weight: bold"  role="button" href="/">Home</a>' +
        '<a class="btn btn-info" style="width: 300px;height: 80px; margin-left: 5px; font-size: 40px;font-weight: bold"  role="button" href="/showImagesGallery">Show Gallery</a>' +
        '</div>' +
        '</body>';
    response.writeHead(200, {'Content-type': 'text/html'});
    response.end(body);
}

exports.showImagesGallery = showImagesGallery;
exports.start = start;
exports.upload = upload;
exports.showImage = showImage;
exports.deleteImage = deleteImage;