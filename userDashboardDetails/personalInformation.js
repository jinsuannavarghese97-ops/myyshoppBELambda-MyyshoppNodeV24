let methods = {};
let queryExecution = require('../queryExecution');
methods.personalInformation = function (client, jsonObj, event, callback) {
    let currentUserId = jsonObj.currentUserId;
    let selectAccountData = [];
    let selectAccountQuery = " select b.first_name as firstName,b.last_name as lastName, " +
        " b.gender as gender,b.is_married as married, " +
        " b.spouse_name as spouseName,b.date_of_birth as dateBirth,b.number_of_kids as numberOfkids" +
        " from buyer as b " +
        " where b.id = ? "
    //connection.query(selectAccountQuery, function (error, selectAccountResults, fields) {   
    queryExecution.queryExecution(client, jsonObj, event, selectAccountQuery, [currentUserId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let selectAccountResults = response.result;
        for (let i = 0; i < selectAccountResults.length; i++) {
            let selectAccounDtetails = [];
            selectAccounDtetails = {
                firstName: selectAccountResults[i].firstName,
                lastName: selectAccountResults[i].lastName,
                gender: selectAccountResults[i].gender,
                married: selectAccountResults[i].married == true ? 1 : 0,
                spouseName: selectAccountResults[i].spouseName,
                dateBirth: selectAccountResults[i].dateBirth,
                numberOfkids: selectAccountResults[i].numberOfkids,


            }
            selectAccountData.push(selectAccounDtetails)
        }
        const data = {
            success: "1",
            result: {
                "personalInformation": selectAccountData
            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(data)
        //callback(selectAccountData);
    });
}
module.exports = methods;