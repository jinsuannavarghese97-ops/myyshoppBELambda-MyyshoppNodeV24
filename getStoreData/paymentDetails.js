let methods = {};
let queryExecution = require('../queryExecution');
methods.paymentDetails = function (client, jsonObj, event, callback) {

    let queryString = " select p.name as title,p.id as type  from store_payment_type sp " +
        " INNER JOIN payment_type p on p.id= sp.payment_type_id and p.is_active=true  " +
        " where sp.is_active=true and sp.store_id in (?) " +
        " group by sp.payment_type_id  ";
    queryExecution.queryExecution(client, jsonObj, event, queryString, [jsonObj.storeId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        let paymentOptions = []
        for (let i = 0; i < results.length; i++) {
            let payment = {
                paymentTypeId: results[i].type,
                paymentTitle: results[i].title
            }
            paymentOptions.push(payment)
        }
        const data = {
            success: "1",
            result: {
                "paymentOptions": paymentOptions
            },
            errorMessage: "",
            successMessage: "Success"
        };

        callback(data);
    });
}
module.exports = methods;
