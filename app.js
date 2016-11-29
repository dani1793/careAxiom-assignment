'use strict';

var express = require('express');

//files required for the file reading and directory search
var debug = require('debug')('app');
var bodyParser = require('body-parser');

var app = express();

var port = 3000;
var hostname = 'localhost';


let addressAPI = require('./addressAPI');

app.use(bodyParser());
// Middleware to allow Cross Origin Resource Sharing (CORS)
// for usage with angular JS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept-Encoding, Accept-Language');
    next();
});

//The route that is called
//the useMethod could be set according to call the desired type of control flow
app.get('/I/want/title/', function (req, res, next) {

    const useMethod = {
        'callback': false,
        'promise': false,
        'async': true
    }

    //checks that the required parameters are present in the request
    console.log('request received');
    if (!(req.query.address)) {
        console.error('Params not found');
        next(new Error('No address found'));
    }
    else {
        const addresses = req.query.address;

        if (useMethod['callback'] === true) {
            addressAPI('callback', [].concat(addresses), function (titles) {
                console.log('ALL DONE!!!');
                console.log(titles);
                req.titles = titles;
                next();
            });

        }
        else if (useMethod['promise'] === true) {
            addressAPI('promise', [].concat(addresses)).then((titles)=> {
                console.log('ALL DONE!!!');
                console.log(titles);
                req.titles = titles;
                next()
            });
        }

        else if (useMethod['async'] === true) {
            addressAPI('async', [].concat(addresses), (err, titles)=> {
                console.log('ALL DONE!!!');
                console.log(titles);
                req.titles = titles;
                next()
            })
        }
    }


});

//Middle ware that creates the response HTML and send it back
app.use(function (req, res) {
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.write(createResponseHTML(req.titles));
    res.end();

});

//Middle ware to send error back to the client if there is any
app.use(function (err, req, res, next) {
    console.log(err.message);
    return res.status(err.status || 500).send({message: err.message});
});


app.listen(port, hostname, function () {
    console.log(`Server running at http://${hostname}:${port}/`);
});


/*
 This function is used to create the final HTML string from the array of titles
 @params:    (1) array of title objects, each object containing the address and the data inside title tag
 @returns:   (1) The final HTML string that is to be sent back to the client
 */
let createResponseHTML = (titles)=> {

    let titleListString = `<html>  <head></head><body><h1> Following are the titles of given websites: </h1><ul>`;

    titles.forEach((title)=> {
        titleListString += `<li>${title.address} - ${title.title} </li>`
    });

    titleListString += `</ul></body></html>`;

    return titleListString;
}