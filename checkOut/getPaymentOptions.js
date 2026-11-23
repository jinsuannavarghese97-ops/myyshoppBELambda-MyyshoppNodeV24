const queryExecution = require('../queryExecution')
let methods = {};

methods.getPaymentOptions = function (client, jsonObj, event, callback) {
    var storeList = event.storeId.split(',')
    var count = storeList.length
    var queryString = ""
    var queryStringValues = []
    var razorPayQuery = "";
    var razorPayStoreQuery = ""
    if (count == '1') {
        queryString = " select p.name as title,p.id as type,sp.description as description,if((sp.description is null or sp.description = ''),'',concat('<b>',s.name,' :- </b>',sp.description,'<br/>')) as descriptionAllStores,if(p.id != 5,'',if((SELECT payment_gateways_id FROM store_payment_key where store_id in (" + event.storeId + ")=1),'Razor Pay',if((SELECT payment_gateways_id FROM store_payment_key where store_id in (" + event.storeId + ")=2),'Fed Pay',''))) as paymentMethod " +
            " from store_payment_type sp " +
            " inner join store as s on s.id = sp.store_id  " +
            " INNER JOIN payment_type p on p.id= sp.payment_type_id and p.is_active=true  " +
            " where sp.is_active=true and sp.store_id in (" + event.storeId + ") " +
            " group by sp.payment_type_id; "
    }
    else {

        queryString = "select group_concat(sp.store_id) as storeId ,GROUP_CONCAT(NULLIF(sp.description, '') SEPARATOR '<br/>')  as description, group_concat(if((sp.description is null or sp.description = ''),'',concat('<b>',s.name,' :- </b>',sp.description,'<br/>')) separator '') as descriptionAllStores,sp.payment_type_id as type,p.name as title, count(*) nb,if(sp.payment_type_id = 5,'Razor Pay','') as paymentMethod from store_payment_type sp " +
            " inner join store as s on s.id = sp.store_id " +
            "INNER JOIN payment_type p on p.id= sp.payment_type_id and p.is_active=true " +
            "where sp.is_active=true and sp.store_id in (" + event.storeId + ") " +
            "group by sp.payment_type_id  " +
            "having nb = ?;"
        queryStringValues.push(parseInt(count))
    }

    console.log("queryString...", queryString);

    razorPayQuery = " SELECT config_value FROM configuration WHERE config_key = 'razorpaykeyid'; " +
        " SELECT config_value FROM configuration WHERE config_key = 'razorpaykeysecret'; "

    if (event.storeId.split(',').length == 1) {
        razorPayStoreQuery = " SELECT public_key as publicKey,secret_key as secretKey,fed_charge_code as fedChargeCode, " +
            " fed_hash_key as fedHashKey,fed_pass_code as fedPassCode,fed_user_code as fedUserCode, " +
            " payment_gateways_id as paymentGatewayId,worldline_encryption_key as worldLineEncryptionKey, worldline_merchant_id as worldLineMerchantId, " +
            " bambora_merchant_id as bamboraMerchantId,bambora_merchant_passcode as bamboraMerchantPassscode,bambora_encoded_passcode as bamboraEncodedPasscode, " +
            " square_access_token as squareAccessToken,square_application_id as squareApploicationId,square_location_id as squareLocationId," +
            " phonepe_merchant_id as phonepeMerchantId ,phonepe_salt as phonepeSalt"+
            " FROM store_payment_key  " +
            " WHERE store_id =? and is_active is true; "
        queryStringValues.push(event.storeId)
    }

    let finalQuery = queryString + razorPayQuery + razorPayStoreQuery

    queryExecution.queryExecution(client, jsonObj, event, finalQuery, queryStringValues, function (response) {

        if (response.success == '0') {

            callback(response);
        }
        let finalResult = response.result
        let results = finalResult[0]
        let razorPayStoreQueryResults = finalResult[3]
        let razorPayQueryResults1 = finalResult[1]
        let razorPayQueryResults2 = finalResult[2]
       // console.log(".....",finalResult)
        var paymentOptions = [];
        //if (results.length > 0) {
        for (var i = 0; i < results.length; i++) {

            const payment = {
                paymentTypeId: results[i].type,
                paymentTitle: results[i].title,
                description: results[i].description,
                descriptionAllStores: results[i].descriptionAllStores,
                paymentMethod: results[i].paymentMethod
            }
            var razorPayResult = [];
            if (results[i].type == 5) {
                if (event.storeId.split(',').length == 1) {

                    if (razorPayStoreQueryResults.length > 0) {

                        payment.paymentGatewayId = razorPayStoreQueryResults[0].paymentGatewayId
                        razorPayResult[0] = {
                            razorpaykeyid: "",//razorPayStoreQueryResults[0].publicKey,
                            razorpaykeysecret: "",// razorPayStoreQueryResults[0].secretKey,
                            fedChargeCode: razorPayStoreQueryResults[0].fedChargeCode,
                            fedHashKey: "",//razorPayStoreQueryResults[0].fedHashKey,
                            fedPassCode: "",//razorPayStoreQueryResults[0].fedPassCode,
                            fedUserCode: razorPayStoreQueryResults[0].fedUserCode,
                            paymentGatewayId: razorPayStoreQueryResults[0].paymentGatewayId,
                            worldLineEncryptionKey: "",//razorPayStoreQueryResults[0].worldLineEncryptionKey,
                            worldLineMerchantId: razorPayStoreQueryResults[0].worldLineMerchantId,
                            bamboraMerchantId: razorPayStoreQueryResults[0].bamboraMerchantId,
                            bamboraMerchantPassscode: "",//razorPayStoreQueryResults[0].bamboraMerchantPassscode,
                            bamboraEncodedPasscode: "",//razorPayStoreQueryResults[0].bamboraEncodedPasscode,
                            squareAccessToken: razorPayStoreQueryResults[0].squareAccessToken,
                            squareApploicationId: razorPayStoreQueryResults[0].squareApploicationId,
                            squareLocationId: razorPayStoreQueryResults[0].squareLocationId,
                            phonepeMerchantId :razorPayStoreQueryResults[0].phonepeMerchantId,
                            phonepeSalt: razorPayStoreQueryResults[0].phonepeSalt
                        }
                    }
                    else {

                        payment.paymentGatewayId = "1"
                        razorPayResult[0] = {
                            razorpaykeyid: "",//razorPayQueryResults1[0].config_value,
                            razorpaykeysecret: "",//razorPayQueryResults2[0].config_value,
                            paymentGatewayId: "1"
                        }
                    }
                }
                else {

                    payment.paymentGatewayId = "1"
                    razorPayResult[0] = {
                        razorpaykeyid: "",//razorPayQueryResults1[0].config_value,
                        razorpaykeysecret: "",//razorPayQueryResults2[0].config_value,
                        paymentGatewayId: "1"
                    }
                }
            }

            payment.payResult = razorPayResult
           
            paymentOptions.push(payment)

        }
        
        var resultData = {
            paymentOptions: paymentOptions
        }
        
        const responseData = {
            success: "1",
            result: resultData,
            successMessage: paymentOptions.length > 0 ? "Success" : "No data found.",
            errorMessage: ""
        }
        callback(responseData);

    });
};

module.exports = methods;
