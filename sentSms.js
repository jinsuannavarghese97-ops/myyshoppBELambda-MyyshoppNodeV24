const request = require("request");
const methods = {};
methods.sentSms = async function(client, jsonObj, queryExecution, event, callback) {

    event.smsType = "Transactional SMS"
    console.log('event....data....', event)
    let url = event.url
    let gatewayName = event.gateway_name
    let smsSender = event.senderId
    const message = event.message //.replace(/ /g,'%20' )
    if (event.smsGateWayId != 3) {
       // console.log(".....in...if....")
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
            url = url.replace("param5", event.entityId)
            url = url.replace("param6", event.templateId)
        }
        if (gatewayName == 'SMS_ARACKAL') {
            url = url.replace("param1", event.smsLoginName)
            url = url.replace("param2", event.smsApiPassword)
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
        console.log('url.....', url)
        request({
                uri: url,
                method: "GET",
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            },
            function(error, response, body) {
                if (error) {
                    response = {
                        success: "0",
                        errorMessage: "",
                        successMessage: "Something went wrong"
                    };
                    callback(response);
                }
                else {


                    response = {
                        success: "1",
                        errorMessage: "",
                        successMessage: "OTP sent successfully"
                    };
                    callback(response);
                }

            });
    }

    else {
       // console.log(".....inelse....")

        let toNumber = event.countryCode.toString() + event.mobileNumber.toString()
        let fromNumber = event.twilioPhoneNumber
        // console.log("...toNumber..", toNumber)
        // console.log("..message...", message)
        const accountSid = event.accountId;
        const authToken = event.authToken;
        try {
            const client = require('twilio')(accountSid, authToken);
            await client.messages
                .create({ body: message, from: fromNumber, to: toNumber })
               
            callback({
                success: "1",
                errorMessage: "",
                successMessage: "OTP sent successfully via Twilio.",
            });
        }
        catch (error) {
            console.error("Twilio Error: ", error.message);
            callback({
                success: "0",
                errorMessage: error.message || "Failed to send SMS via Twilio.",
                successMessage: "",
            });
        }
    }

}



module.exports = methods;
