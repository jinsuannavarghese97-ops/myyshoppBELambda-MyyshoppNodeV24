var mysql = require('mysql');
var request = require("request");
var methods = {};
//let queryExecution = require('.../queryExecution');
methods.smsCommon = function (client, jsonObj, queryExecution, event, callback) {

    event.smsType = "Transactional SMS"

    let queryString = " SELECT s.sms_sender,sg.gateway_name,sg.url,s.sms_gateway_entity_id as entityId " +
        " FROM site as s " +
        " INNER JOIN sms_gateway as sg on sg.id = s.sms_gateway_id " +
        " WHERE s.id = ? and sg.is_active is true ;" +

        " SELECT gateway_name,url  " +
        " FROM sms_gateway " +
        " WHERE is_default is true and is_active is true ; " +

        " SELECT config_value as sms_sender " +
        " FROM configuration " +
        " WHERE config_key = 'smsSender'; " +

        " SELECT config_value as smsLoginName " +
        " FROM configuration " +
        " WHERE config_key = 'smsLoginName'; " +

        " SELECT config_value as smsApiPassword " +
        " FROM configuration " +
        " WHERE config_key = 'smsApiPassword'; " +

        " SELECT config_value as entityId " +
        " FROM configuration " +
        " WHERE config_key = 'smsGatewayEntityId'; "
    queryExecution.queryExecution(client, jsonObj, event, queryString, [event.siteId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let result = response.result;
        var url = (result[0].length > 0 && result[0][0].url) ? result[0][0].url : result[1][0].url
        let gatewayName = (result[0].length > 0 && result[0][0].gateway_name) ? result[0][0].gateway_name : result[1][0].gateway_name
        let smsSender = (result[0].length > 0 && result[0][0].sms_sender) ? result[0][0].sms_sender : result[2][0].sms_sender
        //result[0][0].sms_sender ? result[0][0].sms_sender : result[2][0].sms_sender
        let entityId = (result[0].length > 0 && result[0][0].entityId) ? result[0][0].entityId : result[5][0].entityId
        var message = event.message //.replace(/ /g,'%20' )
        if (gatewayName == 'REFINED') {
            //event.mobileNumber = '9020270910'
            url = url.replace("param1", event.mobileNumber)
            url = url.replace("param2", message)
            if (event.smsType == "OTP") {
                url = url.replace("param3", "T") //check if it is T
            }
            if (event.smsType == "Transactional SMS") {
                url = url.replace("param3", "T")
            }
            if (event.smsType == "Promotional SMS") {
                url = url.replace("param3", "T") //check if it is T
            }
            url = url.replace("param4", smsSender)
            url = url.replace("param5", entityId)
            url = url.replace("param6", '')
        }
        if (gatewayName == 'SMS_ARACKAL') {
            let smsLoginName = result[2][0].smsLoginName
            let smsApiPassword = result[3][0].smsApiPassword
            url = url.replace("param1", smsLoginName)
            url = url.replace("param2", smsApiPassword)
            url = url.replace("param3", event.mobileNumber)
            url = url.replace("param4", message)
            if (event.smsType == "OTP") {
                url = url.replace("param5", 4) //check if it is 4
            }
            if (event.smsType == "Transactional SMS") {
                url = url.replace("param5", 1) //check if it is 1
            }
            if (event.smsType == "Promotional SMS") {
                url = url.replace("param5", 2) //check if it is 2
            }
            url = url.replace("param6", smsSender)

        }
        request({
            uri: url,
            method: "GET",
            timeout: 10000,
            followRedirect: true,
            maxRedirects: 10
        },
            function (error, response, body) {
                if (error) {
                    response = {
                        success: "0",
                        //userInput:mobileNumber,
                        errorMessage: "Something went wrong3.",
                        successMessage: ""
                    };
                } else {
                    response = {
                        success: "1",
                        //userInput:mobileNumber,
                        errorMessage: "",
                        successMessage: "OTP sent successfully"
                    };
                }

                callback(response);

            });

    });
}
module.exports = methods;
