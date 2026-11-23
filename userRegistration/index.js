let signUp = require('./signUp.js');
let verifyOTP = require('./verifyOTP.js');
let enquiryMail = require('./enquiryMail.js');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function(client,jsonObj,event,callback) {
    if (event.functionName == 'signUp') {
        jsonObj.token = event.token;
        jsonObj.otpFlag = event.otpFlag
        jsonObj.siteId = event.siteId;
        signUp.signUp(client,jsonObj,event, function (response) {
            callback( response)
        });
    }
    else if (event.functionName == 'verifyOTP') {
        jsonObj.mobileNumber = event.mobileNumber;
        jsonObj.otp = event.otp;
        jsonObj.type = event.type;
        jsonObj.siteId = event.siteId;
        jsonObj.token = event.token;
        verifyOTP.verifyOTP(client,jsonObj,event, function (response) {
            callback( response)
        })
    }
    else if (event.functionName == 'enquiryMail') {
        enquiryMail.enquiryMail(client,jsonObj,event, function (response) {
            callback( response)
        })
    }
    
    else {
        const data = {
            success: "0",
            result: [],
            errorMessage: "Function not exist",
            successMessage: ""
        };
        callback( data)
    }


};
module.exports = methods;