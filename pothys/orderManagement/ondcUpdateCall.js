let methods = {};
//const request = require("request");
const mysql = require('mysql')
var aws = require('aws-sdk');
var lambda = new aws.Lambda({
    region: 'ap-south-1'
});

methods.ondcUpdateCall = async (client, jsonObj, event, queryExecution, callback) => {
    console.log("inside intervalTimer")
    let queryString = " select s.ondc_order_number,os.ondc_json from sale as s " +
        " inner join sale_order as so on so.sale_id=s.id " +
        " inner join ondc_sale as os on os.ondc_order_id=s.ondc_order_number " +
        " where so.id= ?";
    console.log("queryString........", queryString)
    await queryExecution.queryExecution(client, jsonObj, event, queryString, [jsonObj.orderId], async function (response) {
        console.log(response, ".....")
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
        console.log(results, ".....")
        console.log("results.length..........", results.length)
        if (results.length > 0) {

            let ondcOrderNumber = results[0].ondc_order_number
            let ondcJson = JSON.parse(results[0].ondc_json)
            let ondcJsonContext = ondcJson.context
            console.log("ondcJsonContext............", ondcJsonContext)

            let obj = {
                "context": ondcJsonContext,
                "message": {
                    "order_id": ondcOrderNumber
                }


            }
            obj.context.action = "status"
            console.log("obj...", obj)
            var params = {
                FunctionName: 'ondc', // the lambda function we are going to invoke
                InvocationType: 'RequestResponse',
                LogType: 'Tail',
                Payload: JSON.stringify(obj, null, 2)
            };
            //axios.post('https://kswcqa4chb.execute-api.ap-south-1.amazonaws.com/test', obj).then((

            //) => {});
            console.log("params...", params)
            await lambda.invoke(params, function (error, data) {
                if (error) {
                    console.log("error.....................", error)
                }
                if (data) {
                    console.log(data)
                    //return data
                    let response = {
                        success: "1",
                        successMessage: "Status updated successfully",
                        errorMessage: ""
                    };
                    callback(response)
                }
            })
            //}, "20000")
        }

        else {
            console.log("Inside Ondc Update Call No Data Found")
            //return data
            let response = {
                success: "0",
                successMessage: "",
                errorMessage: "No Data Found"
            };
            callback(response)
        }
    })

}
module.exports = methods;
