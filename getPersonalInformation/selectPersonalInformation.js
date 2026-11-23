const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {

    //context.callbackWaitsForEmptyEventLoop = false;
    let currentUserId = event.currentUserId;
    let selectAccountData = [];

    let selectAccountQuery = " select b.first_name as firstName,b.last_name as lastName, " +
        " b.gender as gender,b.is_married as married, " +
        " b.spouse_name as spouseName,b.spouse_dob as dateBirth,b.number_of_kids as numberOfkids," +
        " k.name as kidsName,k.gender as kidsgender,k.date_of_birth as kidsbirth " +
        " from buyer as b " +
        " left join kids as k on k.buyer_id=b.id " +
        " where b.id =  ? ";
    console.log("selectAccountQuery......" + selectAccountQuery)
    //connection.query(selectAccountQuery, function (error, selectAccountResults, fields) {   
    queryExecution.queryExecution(client, jsonObj, event, selectAccountQuery, [currentUserId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let selectAccountResults = response.result
        for (let i = 0; i < selectAccountResults.length; i++) {
            let selectAccounDtetails = [];
            selectAccounDtetails = {
                firstName: selectAccountResults[i].firstName,
                lastName: selectAccountResults[i].lastName,
                gender: selectAccountResults[i].gender,
                married: selectAccountResults[i].married,
                spouseName: selectAccountResults[i].spouseName,
                dateBirth: selectAccountResults[i].dateBirth,
                numberOfkids: selectAccountResults[i].numberOfkids,
                kidsName: selectAccountResults[i].kidsName,
                kidsgender: selectAccountResults[i].kidsgender,
                kidsbirth: selectAccountResults[i].kidsbirth

            }
            selectAccountData.push(selectAccounDtetails)
        }
        const responseData = {
            success: "1",
            result: {
                "selectAccounDtetails": selectAccountData,

            },
            errorMessage: "",
            successMessage: selectAccountData.length > 0 ? "Success." : "No Data Found."
        };
        callback(response);
    })

}
module.exports = methods;