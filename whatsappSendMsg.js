let methods = {};
var request = require('request');
methods.whatsAppSendMessages = function(client, jsonObj, event, queryExecution, callback) {
    try {
        console.log("Inside WhatsApp Send Messages")
       
        
        if (event.fromPage == "orderChangeStatus") {
            if (event.smsEmailType) {
                console.log("-event.smsEmailType--",event.smsEmailType)
                if (event.smsEmailType == 5) //Order Confirmed ,orderStatusId == 8
                {
                    event.templateName = "myyshopp_order_confirmed"

                }
                else if (event.smsEmailType == 6) //Order Cancel ,orderStatusId == 5
                {
                    event.templateName = "myyshopp_order_cancel"

                }
                else if (event.smsEmailType == 7) //Order Dispatched ,orderStatusId == 3
                {
                    event.templateName = "myyshopp_order_dispatched"
                }
                else if (event.smsEmailType == 8) //Order Delivered,orderStatusId == 4
                {
                    event.templateName = "myyshopp_order_delivered"
                }
                else {
                    event.templateName = "0"
                }
            }

        }
        console.log(event.templateName);

        let templateMessageSiteQuery = "select a.id,message_title, template_name, template_language, message_header_type, " +
            " message_header_params, message_body, message_body_params, b.access_token, " +
            "b. from_number from whatsapp_message_content  as a inner join whatsapp_message_content_site as b on a.id=b.whatsapp_message_content_id where template_name='" + event.templateName + "' and b.site_id='" + event.siteId + "';"


        let templateMessageQuery = "select id,message_title, template_name, template_language, message_header_type, " +
            " message_header_params, message_body, message_body_params, access_token, " +
            " from_number from whatsapp_message_content where template_name='" + event.templateName + "'"

        let templateMessageSiteFinalQuery = templateMessageSiteQuery + templateMessageQuery;

        queryExecution.queryExecution(client, jsonObj, event, templateMessageSiteFinalQuery,[], function(response) {
            if (response.success == '0') {
                callback(response);
            }
            let templateMessageSiteQueryResults = response.result;
            if (templateMessageSiteQueryResults[1].length > 0) {

                var messageParams = ""
                var phoneNoId = ""
                var accessToken = ""
                var templateLanguageCode = ""

                if (templateMessageSiteQueryResults[0].length > 0) {

                    messageParams = templateMessageSiteQueryResults[0][0].message_body_params
                    phoneNoId = templateMessageSiteQueryResults[0][0].from_number
                    accessToken = templateMessageSiteQueryResults[0][0].access_token
                    templateLanguageCode = templateMessageSiteQueryResults[0][0].template_language
                }
                else {

                    messageParams = templateMessageSiteQueryResults[1][0].message_body_params
                    phoneNoId = templateMessageSiteQueryResults[1][0].from_number
                    accessToken = templateMessageSiteQueryResults[1][0].access_token
                    templateLanguageCode = templateMessageSiteQueryResults[1][0].template_language
                }



                if (event.fromPage == "orderChangeStatus") {
                    
                    messageParams = messageParams.replace("~customername~", event.buyerName)
                    messageParams = messageParams.replace("~orderno~", event.orderId)
                    messageParams = messageParams.replace("~currency~", event.currency)
                    messageParams = messageParams.replace("~amount~", event.grossAmount)
                    messageParams = messageParams.replace("~shopname~", event.storeName)

                }
                let messageSplit = messageParams.split(",");
                let messageContent = ""
                
                let buyerNo = event.mobileNumber;
                let buyerNumber = buyerNo.slice(buyerNo.length - 10);
                event.mobileNumber = "91" + buyerNumber
               
                console.log("...event.mobileNumber",event.mobileNumber)
                for (let i = 0; i < messageSplit.length; i++) {
                   if (i == 0) {
                       messageContent = '{"type":"text","text":"' + messageSplit[i] + '"}'
                    }
                    else {
                        messageContent = messageContent + "," + '{"type":"text","text":"' + messageSplit[i] + '"}'
                    }
                }
                
                var options = {
                    'method': 'POST',
                    'url': 'https://graph.facebook.com/v17.0/' + phoneNoId + '/messages',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + accessToken + ''
                    },

                    body: JSON.stringify({
                        "messaging_product": "whatsapp",
                        "to": event.mobileNumber,
                        "recipient_type": "individual",
                        "type": "template",
                        "template": {
                            "name": event.templateName,
                            "language": {
                                "code": templateLanguageCode,
                                "policy": "deterministic"
                            },
                            "components": [

                                {
                                    "type": "body",
                                    "parameters": "[" + messageContent + "]"

                                }

                            ]
                        }
                    })


                };
                request(options, function (error, response) {

                    if (response.statusCode == 200) {

                        const result = {
                            success: "1",
                            successMessage: "success",
                            errorMessage: ""
                        };
                        return callback(result);
                    }
                    else {
                        const result = {
                            success: "0",
                            successMessage: response.statusCode,
                            errorMessage: response.body
                        };
                        return callback(result);
                    }
                });
                
                

            }
            else {
                const result = {
                    success: "1",
                    successMessage: "No Data Found",
                    errorMessage: ""
                };

                callback(result);
            }
        });
    }
    catch (err) {
        console.log("--inside catch -", err)
        const result2 = {
            success: "0",
            successMessage: "",
            errorMessage: "Something went wrong"
        };
        callback(result2)

    }

}
module.exports = methods;
