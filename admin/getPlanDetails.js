const methods = {};
let queryExecution = require('../queryExecution');
methods.getPlanDetails = function (client, jsonObj, event, callback) {

    let dQuery = " select st.id as subscriptionPlanDetailsId,st.plan_id as planId,st.plan_name as planName,st.plan_amount as planAmount,st.created_by as createdBy,DATE_FORMAT(st.created_on,'%d-%m-%Y') as createdOn,st.plan_description as planDescription,st.initial_amount as initialAmount " +
        " from subscription_plan_details as st  " +
        " where st.is_active is true order by st.id asc "

    queryExecution.queryExecution(client, jsonObj, event, dQuery, [], function (queryStringResult) {
        if (queryStringResult.success == '0') {
            callback(queryStringResult);
        }
        let results = queryStringResult.result
        if (results.length > 0) {

            const response = {
                success: "1",
                successMessage: "Success.",
                result: results,
                errorMessage: ""
            }
            callback(response)
        }
        else {
            const response = {
                success: "0",
                successMessage: "",
                result: [],
                errorMessage: "No data found."
            }
            callback(response)
        }
    })
}
module.exports = methods;