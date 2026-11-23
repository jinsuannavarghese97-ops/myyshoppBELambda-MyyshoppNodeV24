let methods = {};

methods.queryExecution = function (client, jsonObj, event, query, queryParams, callback) {
  //  console.log("query...111...........",query,queryParams)
    let params = [];
    if (queryParams) {
        params = queryParams;
    }
    client.query(query, params, function (error, results, fields) {
       //  console.log(error,"results..............",results)
        if (error) {
           // console.log(query, "error..............", error.sqlMessage)
            let errorQry = "INSERT INTO error_log (version,controller,created_on,function,exceptions,api_params) values ('0',?,now(),?,?,?) ";
            const errorQryParams = [jsonObj.mainFunction, jsonObj.functionName, error.sqlMessage.replace(/'/ig, "\\'"), JSON.stringify(event)];
            client.query(errorQry, errorQryParams, function (errorData, results, fields) {
                //client.release;
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Something went wrong.",
                    errorType: "Execution Error"
                }
                callback(response);
            });
        }
        else {
            //client.release;

            const response = {
                success: "1",
                successMessage: "Success",
                errorMessage: "",
                errorType: "",
                result: results
            }
            callback(response);
        }
    })
}
module.exports = methods;
