var mysql = require('mysql');
var request = require("request");
var methods = {};
let queryExecution = require('../queryExecution');
methods.smsCommon = function (client, jsonObj, event, callback) {

    event.smsType = "Transactional SMS"
    let type = jsonObj.type
    let name = ""
    if (type == "Forgot Password") {
        name = "Forgot Password OTP"
    }
    else if (type == "SignUp") {
        name = "Sign Up OTP"
    }
    else {
        name = "Login OTP"
    }
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
        " WHERE config_key = 'smsGatewayEntityId'; " +

        " SELECT if(semts.id,semts.sms_template_id,semt.sms_template_id) as templateId,semt.sms_text as smsText,semts.site_id as siteId, if(s.sms_signature is null,(SELECT config_value as smsLoginName FROM configuration WHERE config_key = 'smsSignature'),s.sms_signature) as smsSignature " +
        " from sms_or_email_message_type as semt " +
        " left join sms_or_email_message_type_site semts on semt.id = semts.sms_or_email_message_type_id and semts.site_id =" + event.siteId +
        " left join site as s on s.id = semts.site_id " +
        " where semt.hassms is true and semt.name = ? ;"



    queryExecution.queryExecution(client, jsonObj, event, queryString,  [event.siteId, name], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let result = response.result;
        let templateId = result[6][0].templateId
        let smsText = result[6][0].smsText.replace("{{randNumber}}", jsonObj.randomInt) + '-' + result[6][0].smsSignature

        var url = (result[0].length > 0 && result[0][0].url) ? result[0][0].url : result[1][0].url
        let gatewayName = (result[0].length > 0 && result[0][0].gateway_name) ? result[0][0].gateway_name : result[1][0].gateway_name
        let smsSender = (result[0].length > 0 && result[0][0].sms_sender) ? result[0][0].sms_sender : result[2][0].sms_sender
        //result[0][0].sms_sender ? result[0][0].sms_sender : result[2][0].sms_sender
        let entityId = (result[0].length > 0 && result[0][0].entityId) ? result[0][0].entityId : result[5][0].entityId
        var message = smsText //.replace(/ /g,'%20' )
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
            url = url.replace("param6", templateId)
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
                        errorMessage: "Something went wrong.",
                        successMessage: ""
                    };
                } else {
                    response = {
                        success: "1",
                        userInput: event.mobileNumber,
                        userId: event.userId,
                        errorMessage: "",
                        successMessage: "OTP sent successfully"
                    };
                }

                callback(response);

            });

    });
}
module.exports = methods;
