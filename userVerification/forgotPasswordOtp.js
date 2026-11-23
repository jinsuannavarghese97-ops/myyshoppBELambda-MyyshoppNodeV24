let methods = {};
let queryExecution = require('../queryExecution');
methods.forgotPasswordOtp = function (client,jsonObj ,event, callback) {
    
    let userQuery = "SELECT su.mobile_number as mobile_number,su.id as Id,sr.authority as userRole from sec_user as su " +
        "INNER JOIN sec_user_sec_role as susr on susr.sec_user_id=su.id " +
        "INNER JOIN sec_role as sr on sr.id=susr.sec_role_id where su.id =?;"
    queryExecution.queryExecution(client, jsonObj, event, userQuery,[jsonObj.userId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let userResult = response.result;
        for (let i = 0; i < userResult.length; i++) {
            let mobileNumber = userResult[i].mobile_number
            
            let otpExistQuery = " Select * from user_mobile_otp as usrMobOtp " +
                " where usrMobOtp.mobile_number = ? and usrMobOtp.otp = ? "
            queryExecution.queryExecution(client, jsonObj, event, otpExistQuery,[mobileNumber,jsonObj.otp], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let results = response.result;
                let responseData
                if (results.length > 0) {
                    responseData = {
                        success: "1",
                        errorMessage: "",
                        userId: userResult[0].Id,
                        successMessage: "Valid"
                    };
                } else {
                    responseData = {
                        success: "0",
                        errorMessage: "",
                        successMessage: "Invalid"
                    };
                }
                return callback(responseData);
            })
        }
    })
}
module.exports = methods;
