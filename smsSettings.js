let sentSms = require('./sentSms.js');
let methods = {};
methods.smsSettings = function(client, jsonObj, event, queryExecution, callback) {
    console.log("Inside smsSettings....................")
    event.storeId = event.storeId ? event.storeId : 0
    event.siteId = event.siteId ? event.siteId : 0
    let smsData = " SELECT if(mcd.hassms is true,'1','0') as hasSms,mcd.sms_text as smsText,mcd.sms_template_id as templateId, " +
        " s.sms_gateway_entity_id as entityId,s.sms_signature as signature,s.sms_sender as senderId " +
        " FROM message_content_details as mcd " +
        " INNER JOIN site as s on s.seller_id = mcd.seller_id and s.sms_gateway_entity_id is not null " +
        " and s.sms_signature is not null and s.sms_sender is not null " +
        " where store_id = " + event.storeId + " and sms_or_email_message_type_id = " + event.smsEmailType +
        " and mcd.hassms is true and mcd.is_active is true and mcd.sms_template_id is not null; " +

        " SELECT if(semt.hassms is true,'true','false') as hasSms,semt.sms_text as smsText,semts.sms_template_id as templateId, " +
        " s.sms_gateway_entity_id as entityId,s.sms_signature as signature,s.sms_sender as senderId " +
        " FROM sms_or_email_message_type as semt " +
        " INNER JOIN sms_or_email_message_type_site as semts on semt.id = semts.sms_or_email_message_type_id " +
        " and semts.sms_template_id is not null and semts.sms_or_email_message_type_id = " + event.smsEmailType +
        " INNER JOIN site as s on s.id = semts.site_id and s.sms_gateway_entity_id is not null " +
        " and s.sms_signature is not null and s.sms_sender is not null and ((s.seller_id = (select seller_id from store where id = " + event.storeId + " limit 1)) or (s.id = " + event.siteId + ")); " +
        //"-- INNER JOIN store as st on s.seller_id = st.seller_id and st.id = 193 ""

        " SELECT if(semt.hassms is true,'true','false') as hasSms,semt.sms_text as smsText,semt.sms_template_id as templateId, " +
        " (select config_value from configuration where config_key = 'smsGatewayEntityId') as entityId, " +
        " (select config_value from configuration where config_key = 'smsSignature') as signature, " +
        " (select config_value from configuration where config_key = 'smsSender') as senderId " +
        " FROM sms_or_email_message_type as semt " +
        " where semt.id = " + event.smsEmailType + ";" +

        " SELECT sg.gateway_name,sg.url,sg.accountId,sg.authToken,sg.id as smsGateWayId,s.twilio_phone_number as twilioPhoneNumber " +
        " FROM site as s " +
        " INNER JOIN sms_gateway as sg on sg.id = s.sms_gateway_id " +
        " WHERE s.id = " + event.siteId + " and sg.is_active is true ;" +

        " SELECT gateway_name,url  " +
        " FROM sms_gateway " +
        " WHERE is_default is true and is_active is true ; " +

        " SELECT config_value as smsLoginName " +
        " FROM configuration " +
        " WHERE config_key = 'smsLoginName'; " +

        " SELECT config_value as smsApiPassword " +
        " FROM configuration " +
        " WHERE config_key = 'smsApiPassword'; " +
        " select email_id from sec_user where id='" + event.userId + "';" +
        " select country_id from buyer where id='" + event.userId + "';" +
        " select country_code as countryCode from country where id = (select country_id from buyer where id='" + event.userId + "') ;"
    console.log("smsData....", smsData)

    queryExecution.queryExecution(client, jsonObj, event, smsData, [], function(response) {
        if (response.success == '0') {
            callback(response);
            //return;
        }
        let smsDetailsResult = response.result;
        console.log("--smsDetailsResult--------", smsDetailsResult)
        let smsDetails = []
        if (smsDetailsResult[0].length > 0) {
            smsDetails = smsDetailsResult[0]
        }
        else if (smsDetailsResult[1].length > 0) {
            smsDetails = smsDetailsResult[1]
        }
        else {
            smsDetails = smsDetailsResult[2]
        }
        let userEmailId = smsDetailsResult[7].length > 0 ? smsDetailsResult[7][0].email_id : ""
        let countryId = smsDetailsResult[8].length > 0 ? smsDetailsResult[8][0].country_id : ""
        if (smsDetails.length > 0) {
            event.message = smsDetails[0].smsText
            event.message = event.message.replace('{{buyerName}}', event.buyerName)
            event.message = event.message.replace('{{orderNo}}', event.orderId)
            event.message = event.message.replace('{{currency}}', event.currency)
            event.message = event.message.replace('{{netAmount}}', event.grossAmount)
            event.message = event.message.replace('{{storeName}}', event.storeName)
            event.message = event.message.replace('{{telephoneNumber}}', event.mobileNumber)
            event.message = event.message.replace('{{randNumber}}', event.randomInt)
            event.message = event.message + "-" + smsDetails[0].signature
            event.senderId = smsDetails[0].senderId
            event.templateId = smsDetails[0].templateId
            event.senderId = smsDetails[0].senderId
            event.smsLoginName = smsDetailsResult[5][0].smsLoginName
            event.smsApiPassword = smsDetailsResult[6][0].smsApiPassword
            event.gateway_name = smsDetailsResult[3][0] ? smsDetailsResult[3][0].gateway_name : smsDetailsResult[4][0].gateway_name
            event.url = smsDetailsResult[3][0] ? smsDetailsResult[3][0].url : smsDetailsResult[4][0].url
            event.entityId = smsDetails[0].entityId
            console.log("url...", event.url);
            if ((countryId) && (countryId != 1)) {
                console.log('countryIdExist and country not india...........', countryId)
                const response = {
                    success: "1",
                    userInput: event.mobileNumber,
                    userId: event.userId,
                    userEmailId: userEmailId,
                    userCountryId: countryId,
                    errorMessage: "",
                    successMessage: "Success"
                };
                callback(response)
            }
            else {
                event.accountId = (smsDetailsResult[3].length > 0 && smsDetailsResult[3][0].accountId) ? smsDetailsResult[3][0].accountId : ""
                event.authToken = (smsDetailsResult[3].length > 0 && smsDetailsResult[3][0].authToken) ? smsDetailsResult[3][0].authToken : ""
                event.smsGateWayId = (smsDetailsResult[3].length > 0 && smsDetailsResult[3][0].smsGateWayId) ? smsDetailsResult[3][0].smsGateWayId : ""
                event.countryCode = (smsDetailsResult[9].length > 0 && smsDetailsResult[9][0].countryCode) ? smsDetailsResult[9][0].countryCode : "";
                event.twilioPhoneNumber = (smsDetailsResult[3].length > 0 && smsDetailsResult[3][0].twilioPhoneNumber) ? smsDetailsResult[3][0].twilioPhoneNumber : ""
                console.log(countryId, 'countryId........event.url....', event)
                sentSms.sentSms(client, jsonObj, queryExecution, event, function(response1) {
                 //   console.log("......response1.....",response1)
                    if(response1.success == 0){
                        callback(response1) 
                    }else{
                      const response = {
                        success: "1",
                        userInput: event.mobileNumber,
                        userId: event.userId,
                        userEmailId: userEmailId,
                        userCountryId: countryId,
                        errorMessage: "",
                        successMessage: "OTP sent successfully"
                    };
                    callback(response)  
                    }
                    
                });
            }
        }
        else {
            const response = {
                success: "1",
                userInput: event.mobileNumber,
                userId: event.userId,
                userEmailId: userEmailId,
                userCountryId: countryId,
                errorMessage: "",
                successMessage: "OTP sent successfully"
            };
            callback(response)
        }
    })
}
module.exports = methods;
