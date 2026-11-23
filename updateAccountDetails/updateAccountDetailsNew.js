let mysql = require('mysql');
let config = require('./config.json')
let queryExecution = require('../queryExecution');

exports.handler = (client, jsonObj, event, callback) => {
    let currentUserId = event.currentUserId
    let firstName = event.firstName
    let lastName = event.lastName
    let emailId = event.emailId
    let mobileNumber = event.mobileNumber
    let promotions = event.promotions
    let updateAccountData = [];
    if (event.otp) {
        let otpVerify = "SELECT * from user_mobile_otp where mobile_number = ? and otp = ?  "
        queryExecution.queryExecution(client, jsonObj, event, otpVerify, [event.mobileNumber, event.otp], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            let otpVerifyResults = response.result;
            if (otpVerifyResults.length > 0) {
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

                queryExecution.queryExecution(client, jsonObj, event, updateAccountQuery, updateAccountParams, function (response) {
                    callback(response);
                });
            }
            else {
                const response = {
                    success: "0",
                    result: {},
                    errorMessage: "Incorrect OTP.",
                    successMessage: ""
                };
                callback(response);
            }
        })
    }
    else {
        let updateAccountQuery = `
            UPDATE buyer AS b
            INNER JOIN sec_user AS sec ON b.id = sec.id
            SET 
                b.first_name = ?,
                b.last_name = ?,
                sec.email_id = ?,
                sec.mobile_number = ?,
                b.is_opt_in = ?
            WHERE b.id = ?
            `;
        let updateAccountParams = [firstName, lastName, emailId, mobileNumber, promotions, currentUserId];


        queryExecution.queryExecution(client, jsonObj, event, updateAccountQuery, updateAccountParams, function (response) {
            callback(response);

        })
    }
}
