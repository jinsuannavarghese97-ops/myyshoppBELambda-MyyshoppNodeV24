let methods = {};
let queryExecution = require('../queryExecution');

methods.selectAccountDetails = function (client,jsonObj,event, accountParams, callback) {
    let selectAddressQuery = " select if(b.is_opt_in is true,'1','0') as promotions, " +
        "  b.first_name as buyerFirstName,b.last_name as buyerLastName,sec.email_id as buyerEmailId, sec.mobile_number as buyerMobileNumber " +
        " from  buyer as b " +
        "  inner join sec_user as sec ON b.id = sec.id " +
        " where b.id = ? ";
    console.log("...selectAddressQuery...",selectAddressQuery)
    queryExecution.queryExecution(client, jsonObj, event, selectAddressQuery, [accountParams.currentUserId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let selectAddressQueryresult = response.result;
        let accountList = []
        for (let i = 0; i < selectAddressQueryresult.length; i++) {
            let accountData = {
                buyerFirstName: selectAddressQueryresult[i].buyerFirstName,
                buyerLastName: selectAddressQueryresult[i].buyerLastName,
                buyerEmailId: selectAddressQueryresult[i].buyerEmailId,
                buyerMobileNumber: selectAddressQueryresult[i].buyerMobileNumber,
                promotions: selectAddressQueryresult[i].promotions
            }
            accountList.push(accountData)
        }
        const data = {
            success: "1",
            result: {
                "accountList": accountList,
            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(data)
    });
}

module.exports = methods;
