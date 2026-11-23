const queryExecution = require('../queryExecution')
const methods = {};
methods.getEasypayDetails = function (client, event, callback) {
    console.log("inisde getEasypayDetails")
    // let query = " update easypay_details set status = '"+event.paymentStatus+"' where track_id = '"+event.track_id+"' ; "
    //  console.log("inisde query....",query)
    // queryExecution.queryExecution(client,"",event, query, function (response1) {
    //      if (response1.success == '0') {
    //         callback(response1);
    //     }
    //     else{
    let query1 = " select params_set_1,amount from easypay_details where track_id = ? ;"
    console.log("inisde query1....", query1)
    queryExecution.queryExecution(client, "", event, query1, [event.track_id], function (response) {
        console.log("inisde response....", response)
        if (response.success == '0') {
            callback(response);
        }
        else {
            console.log('response.result......', response.result.length)
            if (response.result.length > 0) {

                console.log('iffffffffffff11f')
                const result = {
                    success: "1",
                    result: response.result[0],
                    successMessage: "Success",
                    errorMessage: ""
                };
                callback(result);
            }
            else {
                console.log('elseeeeeeeee1')
                const result = {
                    success: "1",
                    data: "",
                    successMessage: "Success",
                    errorMessage: ""
                };
                callback(result);
            }
        }
    });
    // }
    // });
}
module.exports = methods;
