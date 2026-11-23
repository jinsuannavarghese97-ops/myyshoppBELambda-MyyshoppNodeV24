const methods = {};
let queryExecution = require('../queryExecution');
methods.ondcUnits = function (client, jsonObj, event, callback) {

    let unitQuery = " select id as ondcUnitId,name as ondcUnit,if(is_active is true,true,false) as isActive from ondc_unit where is_active=true "

    queryExecution.queryExecution(client, jsonObj, event, unitQuery, [], function (unitQueryResult) {
        if (unitQueryResult.success == '0') {
            callback(unitQueryResult);
        }
        let results = unitQueryResult.result;

        const response = {
            success: "1",
            successMessage: "Success.",
            result: results,
            errorMessage: ""
        }
        callback(response)

    })
}
module.exports = methods;