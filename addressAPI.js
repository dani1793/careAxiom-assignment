//Importing required libraries
var q = require('promise');
var http = require('http');
var async = require('async');

//general config for http request
var config = {
    port: 80,
    method: 'GET'
}


/*
 This is the main function which is called from the app.js. The function then further call the functions according to the
 type defined and creates response accordingly
 @params:   (1) The type of function that is to be called: promise, callback and async
 (2) The array of addresses for which the request is to be sent
 (3) Callback function required for async or callback

 @returns:  (1) a promise or a callback depending on the type of call
 */
let callAddresses = (typeOfCall, addresses, callbackFunc)=> {

    let titles = [];
    if (typeof callbackFunc === 'function' && typeOfCall === 'callback') {
        for (let i = 0; i < addresses.length; i++) {


            callAPICallBack(config, addresses[i], (err, res)=> {
                // console.log(res.data);
                console.log(`received data for Callback: ${addresses[i]}`);
                titles.push({
                    'address': addresses[i],
                    'title': getTitleTag(res.data)
                })
                if (i === addresses.length - 1)
                    callbackFunc(titles);
            })
        }
        console.log('out of loop!!!');
    }

    else if (typeOfCall === 'promise') {
        return new q(function (fulfill, reject) {
            for (let i = 0; i < addresses.length; i++) {
                callAPIPromise(config, addresses[i]).then((res)=> {
                    console.log(`received data for Promise: ${addresses[i]}`);
                    titles.push({
                        'address': addresses[i],
                        'title': getTitleTag(res.data)
                    })

                    if (i === addresses.length - 1) {
                        fulfill(titles);
                    }
                }, (err)=> {
                    titles.push('NO RESPONSE');
                    if (i === addresses.length - 1) {
                        fulfill(titles);
                    }
                })

            }

        });

    }

    else if (typeOfCall === 'async' && typeof callbackFunc === 'function') {
        let functionStack = [];

        addresses.forEach((address)=> {
            functionStack.push(function (callback) {
                    callAPIAsync(config, address, callback)
                }
            )
        });
        console.log(functionStack);
        async.parallel(functionStack, (err, htmls)=> {
            let titles = [];

            htmls.forEach((html)=> {
                titles.push({
                    'address': html.address,
                    'title': getTitleTag(html.body.data)
                })

            })

            callbackFunc(null, titles);
        })
    }

}

/*
 This function is used to call the address using Callback
 @params:    (1) configuration setting the port
 (2) the url which is to be called
 (3) callback function to call when the data is received

 @returns:  (1) JSON with data
 {
 'body': data received from the url
 }
 If there is an error NO RESPONSE is sent
 */
let callAPICallBack = function (config, url, callbackFunc) {

    config.host = url;
    console.log(config.path);
    console.log(JSON.stringify(config));
    var request = http.request(config, function (response) {
        var body = {};
        body.data = '';
        response.on('data', function (data) {
            body.data += `${data}`;
        });
        response.on('end', function () {
            body.data;
            callbackFunc(null, body);
        });
    });
    request.on('error', function (e) {
        var body = {};
        body.data = 'NO RESPONSE';
        console.log('Problem with request: ' + e.message);
        callbackFunc(null, body);

    });
    request.end();

}

/*
 This function is used to call the address using Async
 @params:    (1) configuration setting the port
 (2) the url which is to be called
 (3) callback function to call when the data is received

 @returns:  (1) JSON with data
 {
 'body': data received from the url
 }
 If there is an error NO RESPONSE is sent
 */
let callAPIAsync = function (config, url, callback) {

    config.host = url;
    var request = http.request(config, function (response) {
        var body = {};
        body.data = '';
        response.on('data', function (data) {
            body.data += `${data}`;
        });
        response.on('end', function () {
            callback(null, {'body': body, 'address': url});
        });
    });
    request.on('error', function (e) {
        var body = {};
        body.data = 'NO RESPONSE';
        console.log('Problem with request: ' + e.message);
        callback(null, {'body': body, 'address': url});
    });
    request.end();
}

/*
 This function is used to call the address using Promise
 @params:    (1) configuration setting the port
 (2) the url which is to be called


 @returns:  (1) JSON with data
 {
 'body': data received from the url
 }
 If there is an error NO RESPONSE is sent
 */
let callAPIPromise = function (config, url) {
    return new q(function (fulfill, reject) {
        config.host = url;
        var request = http.request(config, function (response) {
            var body = {};
            body.data = '';
            response.on('data', function (data) {
                body.data += `${data}`;
            });
            response.on('end', function () {
                console.log(`Promise fulfilled`);
                fulfill(body);
            });
        });
        request.on('error', function (e) {
            var body = {};
            body.data = 'NO RESPONSE';
            console.log('Problem with request: ' + e.message);
            fulfill(body);
        });
        request.end();

    });

}


/*
 The function is used to extract the title tag from the html query
 @params:    (1) the html string
 @returns:   (1) the data inside title tag
 */
let getTitleTag = (html)=> {
    // console.log(html);
    if (html === 'NO RESPONSE') return html;

    const re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;
    var match = re.exec(html);
    if (match && match[2]) {
        return match[2];
    }
}

module.exports = callAddresses;