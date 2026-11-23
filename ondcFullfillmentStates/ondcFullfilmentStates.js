const queryExecution = require('../queryExecution')
const methods = {};
methods.ondcFullfilmentStates = function (client, jsonObj, event, callback) {
    let selectQry = "SELECT id as ondcStatusId ,ondc_state_name as ondcStatusName , order_status_id as orderStatusId FROM ondc_fullfillment_states ;"
    // console.log('query...', selectQry)
    queryExecution.queryExecution(client, "", event, selectQry,[], function (response) {
        //  console.log('response..........', response)
        if (response.success == '0') {
            callback(response);
        }
        else {
            const result = {
                success: "1",
                result: response.result,
                successMessage: "Success",
                errorMessage: ""
            };
            callback(result);
        }
    })

}
module.exports = methods;
