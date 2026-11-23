let request = require("request");
let methods = {};
let queryExecution = require('../queryExecution');
methods.smsCommon = function (client, jsonObj, event, callback) {
    event.smsType = "Transactional SMS"
    let queryString = " SELECT s.sms_sender,sg.gateway_name,sg.url " +
        " FROM site as s " +
        " LEFT JOIN sms_gateway as sg on sg.id = s.sms_gateway_id and sg.is_active is true " +
        " WHERE s.id = ?  ;" +

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
        " WHERE config_key = 'smsApiPassword'; "
    //connection.query(queryString, function (error, result, fields) {
    queryExecution.queryExecution(client, jsonObj, event, queryString, [event.siteId], function (response) {
        if (response.success == '0') {
            return response
        }
        let result = response.result
        let url = (result[0].length > 0) ? result[0][0].url : result[1][0].url
        let gatewayName = (result[0].length > 0) ? result[0][0].gateway_name : result[1][0].gateway_name
        let smsSender = (result[0].length > 0) ? result[0][0].sms_sender : result[1][0].sms_sender
        //result[0][0].sms_sender ? result[0][0].sms_sender : result[2][0].sms_sender
        let message = event.message //.replace(/ /g,'%20' )
        //"http://sms.xilligence.com/sendsms?uname=xilligence&pwd=4xilligence8&to=param1&msg=param2&route=param3&senderid=param4"
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
        }
        //"http://sms.arackal.com/api/api.php?ver=1&mode=1&action=push_sms&type=1&route=param5&login_name=param1&api_password=param2&message=param4&number=param3&sender=param6"
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
                        errorMessage: "Something went wrong.",
                        successMessage: ""
                    };
                    callback(response);
                }
                else {
                    response = {
                        success: "1",
                        userInput: event.mobileNumber,
                        errorMessage: "",
                        successMessage: "OTP sent successfully"
                    };
                }

                callback(response);

            });
        //callback(event)

    });

}
module.exports = methods;