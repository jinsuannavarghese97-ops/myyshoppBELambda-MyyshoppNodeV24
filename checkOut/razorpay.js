const request = require("request");
const queryExecution = require('../queryExecution')
const methods = {};
methods.razorpay = function (client, jsonObj, event, callback) {
    if (event.timeZone) {
        let num = event.timeZone.slice(1);

        let symbol = event.timeZone.toString(0)[0] == '-' ? '+' : '-'
        let hours = (num / 60);
        let rhours = Math.floor(hours);
        rhours = rhours.toString.length == 1 ? '0' + rhours : rhours
        let minutes = (hours - rhours) * 60;
        let rminutes = Math.round(minutes);
        event.timeZone = symbol + rhours + ':' + rminutes
        event.time = symbol + num
    }
    //console.log("event.time ",event.time)
    event.time = event.time ? event.time : '+330'
    event.timeZone = event.timeZone ? event.timeZone : '+05:30'
    let razorPayConfigQuery = " SELECT config_value FROM configuration WHERE config_key = 'razorpaykeyid'; " +
        " SELECT config_value FROM configuration WHERE config_key = 'razorpaykeysecret'; " +
        " SELECT public_key as config_value FROM store_payment_key WHERE store_id in (" + event.storeId + ") AND is_active = TRUE;" +
        " SELECT secret_key as config_value FROM store_payment_key WHERE store_id in (" + event.storeId + ") AND is_active = TRUE; "
    queryExecution.queryExecution(client, jsonObj, event, razorPayConfigQuery, [], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
        let razorKey
        let razorkeysecret
        let isSingle = event.storeId.split(',').length == 1
        razorKey = (isSingle == true && results[2].length == 1) ? results[2][0].config_value : results[0][0].config_value;
        razorkeysecret = (isSingle == true && results[2].length == 1) ? results[3][0].config_value : results[1][0].config_value
        request({
            method: 'GET',
            url: "https://" + razorKey + ":" + razorkeysecret + "@api.razorpay.com/v1/payments/" + event.paymentId
        },
            function (error, response, body) {
                if (error) {
                    const response = {
                        success: "0",
                        successMessage: "",
                        errorMessage: "Something went wrong"
                    };
                    callback(response);
                }
                else {
                    let responseData = JSON.parse(body)

                    let saveRazorDetailsQuery = "INSERT INTO payment (amount,amount_refunded,contact,created_at,currency,description,email,entity,error_code,error_description,fee,method,paymentid,refund_status,service_tax,status,payment_gateways_id) VALUES " +
                        "  (?,?,?,CONVERT_TZ (now(), '+00:00',?),?,?,?,?,?,?,?,?,?,?,?,?,1);";
                    queryExecution.queryExecution(client, jsonObj, event, saveRazorDetailsQuery, [responseData.amount, responseData.amount_refunded, responseData.contact, event.timeZone, responseData.currency, responseData.description, responseData.email, responseData.entity, responseData.error_code, responseData.error_description, responseData.fee, responseData.method, responseData.id, responseData.refund_status, responseData.tax, responseData.status], function (responses) {
                        responseData.paymentId = responses.result.insertId
                        if (event.itemBeforePaymentGroupCode) {
                            let update = " UPDATE item_before_payment set payment_id = " + responses.result.insertId + " where group_code = " + event.itemBeforePaymentGroupCode + ";"
                            //callback(response);
                            queryExecution.queryExecution(client, jsonObj, event, update, function (responses) {
                                const response = {
                                    success: "1",
                                    razorPayData: responseData,
                                    successMessage: "Success",
                                    errorMessage: ""
                                };
                                callback(response);
                            });
                        }
                        else {
                            const response = {
                                success: "1",
                                razorPayData: responseData,
                                successMessage: "Success",
                                errorMessage: ""
                            };
                            callback(response);
                        }
                    });


                }
            });
    });

}
module.exports = methods;
