const request = require("request");
const queryExecution = require('../queryExecution')
const methods = {};
methods.worldLineStatus = function (client, jsonObj, event, callback) {
    var options = {
        'method': 'POST',
        'url': event.worldlineUrl,
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Origin': '*'
        },
        form: {
            'merchantReqStrT': event.merchantReqStrT,
            'mid': event.mid
        }
    };
    request(options, (error, response, body) => {
        if (response.statusCode != 200) {
            let resultData = {
                success: "0",
                successMessage: "",
                errorMessage: "Invalid status code <" + response.statusCode + ">",
                result: []
            }
            callback(resultData)
        }
        else {
            let resultData = {
                success: "1",
                successMessage: "Success.",
                errorMessage: "",
                result: {
                    body: body,
                    response: response
                }
            }
            callback(resultData)
        }

    });
}
module.exports = methods;
