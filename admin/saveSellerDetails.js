const smsCommon = require('./smsCommon.js');
const sentSms = require('../sentSms.js');
let methods = {};
let queryExecution = require('../queryExecution');
methods.saveSellerDetails = function (client, jsonObj, event, callback) {

    let randomInt = Math.floor((Math.random() * 1000000) + 1);
    let message = "OTP is " + randomInt + "  Please enter the OTP to complete the process."
    let emailId = event.emailId
    let smsSender;
    let date = new Date();
    let createdOn = Date.parse(date);

    console.log('event....', event)
    //console.log('jsonObj....',jsonObj)
    if (event.otp) {
        let queryString = " SELECT * FROM user_mobile_otp where mobile_number = ? and otp = ?"
        console.log('queryString..otpverify...', queryString)
        //connection.query(queryString, function (error, results, fields) {
        queryExecution.queryExecution(client, jsonObj, event, queryString, [event.mobileNumber, event.otp], function (response) {
            if (response.success == '0') {
                callback(response);
            }

            let otpDeviceResults = response.result;
            if (otpDeviceResults.length > 0) {
                let sqlInsertQuery = "INSERT INTO subscription_seller_details (version,created_by,created_on,email_id,mobile_number,modified_by,modified_on,name,status,sales_person,location,store_name) VALUES ('0','1',NOW(),?,?,'1',NOW(),?,1,?,?,?)";
                console.log('queryString..sqlInsertQuery...', sqlInsertQuery)
                queryExecution.queryExecution(client, jsonObj, event, sqlInsertQuery, [emailId, event.mobileNumber, event.name, event.salesPerson, event.location, event.storeName], function (responseData) {
                    let sellerUserDetails = responseData.result

                    if (responseData.success == '0') {
                        callback(responseData);
                    }
                    else {

                        let dQuery = " select st.id as id,st.email_id as emailId,st.mobile_number as mobileNumber,st.name as name,st.created_by as createdBy,DATE_FORMAT(st.created_on,'%d-%m-%Y') as createdOn,st.status as status from subscription_seller_details as st  " +
                            " where st.id = ? order by st.id desc ;"
                        queryExecution.queryExecution(client, jsonObj, event, dQuery, [sellerUserDetails.insertId], function (responseSellerData) {
                            let results = responseSellerData.result
                            if (responseSellerData.success == '0') {
                                callback(responseSellerData);
                            }
                            else {
                                let response = {
                                    success: "1",
                                    sellerDetails: results,
                                    errorMessage: "",
                                    successMessage: "Success"
                                };
                                callback(response);
                            }
                        });
                    }

                });
            }
            else {
                let response = {
                    success: "0",
                    errorMessage: "Invalid OTP",
                    successMessage: ""
                };
                callback(response);
            }
        });
    }
    else {

        if (event.mobileNumber) {
            let queryString = " SELECT * FROM user_mobile_otp where mobile_number = ?; "
            console.log('queryString.....', queryString)
            //connection.query(queryString, function (error, results, fields) {
            queryExecution.queryExecution(client, jsonObj, event, queryString, [event.mobileNumber], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let results = response.result;
                let sqlInsert
                let val = []
                if (results.length > 0) {
                    sqlInsert = "UPDATE user_mobile_otp set otp = ? where mobile_number =? ";
                    val.push(randomInt, event.mobileNumber)
                } else {
                    sqlInsert = "INSERT INTO user_mobile_otp (version,created_on,mobile_number,otp) VALUES ('0',?,?,?)";
                    val.push(createdOn, event.mobileNumber, randomInt)

                }
                console.log('sqlInsert.....', sqlInsert)
                jsonObj.randomInt = randomInt

                //connection.query(sqlInsert, function (error, sqlInsertData, fields) {
                queryExecution.queryExecution(client, jsonObj, event, sqlInsert, [...val], function (response) {
                    if (response.success == '0') {
                        callback(response);
                    }
                    let sqlInsertData = response.result;
                    event.message = message;
                    event.randomInt = randomInt

                    smsCommon.smsCommon(client, jsonObj, event, function (response) {
                        callback(response)
                    });
                });
            });
        } else {
            let response = {
                success: "0",
                errorMessage: "Invalid Data",
                successMessage: ""
            };
            callback(response);
        }
    }

}
module.exports = methods;
