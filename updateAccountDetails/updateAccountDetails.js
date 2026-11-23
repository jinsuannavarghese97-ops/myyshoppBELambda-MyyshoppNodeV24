const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {
    let currentUserId = event.currentUserId;
    let firstName = event.firstName;
    let lastName = event.lastName;
    let emailId = event.emailId;
    let mobileNumber = event.mobileNumber;
    let promotions = event.promotions == '1' ? true : false;
    let updateAccountData = [];

    let checkEmailAlreadyExist = `select b.id from buyer as b
    inner join sec_user as u on u.id=b.id 
    where u.email_id= ? and b.id!= ? and u.email_id!='' and b.site_id = ? `
    console.log("....checkEmailAlreadyExist....",checkEmailAlreadyExist,emailId, currentUserId,event.siteId)
    queryExecution.queryExecution(client, jsonObj, event, checkEmailAlreadyExist, [emailId, currentUserId,event.siteId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        else {
            let userResult = response.result;
              console.log("userResult...",userResult)
            if (userResult.length > 0) {
                const response = {
                    success: "0",
                    successMessage: "",
                    errorMessage: "Email Already Exist."
                }
                callback(response);
            } else {
                let updateAccountQuery = `
                    UPDATE buyer AS b
                    INNER JOIN sec_user AS sec ON b.id = sec.id
                    SET 
                        b.first_name = ?, 
                        b.last_name = ?, 
                        sec.email_id = ?, 
                        sec.mobile_number = ?, 
                        b.is_opt_in = ?
                    WHERE 
                        b.id = ?
                `;

                let updateAccountParams = [firstName, lastName, emailId, mobileNumber, promotions, currentUserId];
               // console.log("..updateAccountParams....",updateAccountQuery,updateAccountParams)
                queryExecution.queryExecution(client, jsonObj, event, updateAccountQuery, updateAccountParams, function (response) {
                    callback(response);
                });
            }
        }
    });
}
module.exports = methods;
