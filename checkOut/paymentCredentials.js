const queryExecution = require('../queryExecution')
let methods = {};

methods.paymentCredentials = function (client, jsonObj, event, callback) {

    let razorPayStoreQuery = " SELECT public_key as publicKey,secret_key as secretKey,fed_charge_code as fedChargeCode, " +
        " fed_hash_key as fedHashKey,fed_pass_code as fedPassCode,fed_user_code as fedUserCode, " +
        " payment_gateways_id as paymentGatewayId,worldline_encryption_key as worldLineEncryptionKey, worldline_merchant_id as worldLineMerchantId " +
        " FROM store_payment_key  " +
        " WHERE store_id = ? and is_active is true; "

    queryExecution.queryExecution(client, jsonObj, event, razorPayStoreQuery, [event.storeId], function (response) {
        if (response.success == '0' && razorPayStoreQuery != '') {
            callback(response);
        }
        let razorPayStoreQueryResults = response.result
        console.log("razorPayStoreQueryResults ", razorPayStoreQueryResults)
        let payResult = []
        if (razorPayStoreQueryResults.length > 0) {
            payResult[0] = {
                razorpaykeyid: "",//razorPayStoreQueryResults[0].publicKey,
                razorpaykeysecret: "",//razorPayStoreQueryResults[0].secretKey,
                fedChargeCode: razorPayStoreQueryResults[0].fedChargeCode,
                fedHashKey: "",//razorPayStoreQueryResults[0].fedHashKey,
                fedPassCode: "",//razorPayStoreQueryResults[0].fedPassCode,
                fedUserCode: razorPayStoreQueryResults[0].fedUserCode,
                paymentGatewayId: razorPayStoreQueryResults[0].paymentGatewayId,
                worldLineEncryptionKey: "",//razorPayStoreQueryResults[0].worldLineEncryptionKey,
                worldLineMerchantId: razorPayStoreQueryResults[0].worldLineMerchantId
            }
            const resultData = {
                success: "1",
                successMessage: "Success",
                result: payResult,
                errorMessage: ""
            }
            callback(resultData)
        }
        else {
            const resultData = {
                success: "0",
                successMessage: "",
                result: payResult,
                errorMessage: "Something went wrong."
            }
            callback(resultData)
        }

    });
};

module.exports = methods;
