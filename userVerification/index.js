let forgotPassword = require('./forgotPassword.js');
let resetPassword = require('./resetPassword.js');
let changePassword= require('./changePassword.js');
let sms = require('./sms.js');
let userOrdersms = require('./userOrdersms.js');
let forgotPasswordOtp = require('./forgotPasswordOtp.js');
let idaLogin = require('./idaLogin.js');
let sendOtp = require('./sendOtp.js');
const methods = {};
methods.index = function(client,jsonObj ,event,callback) {
    if(event.functionName == 'forgotPassword'){
        jsonObj.siteId = event.siteIdInForgot;
        jsonObj.userInput = event.userInputInForgot;
        forgotPassword.forgotPassword(client,jsonObj ,event, function(response){
             callback(response);
        });
    }
    else if(event.functionName == 'resetPassword'){
        jsonObj.userId = event.userIdInResetPwrd;
        jsonObj.newPassword = event.newPasswordInResetPwrd;
        
         resetPassword.resetPassword(client,jsonObj ,event, function(response){
             callback(response);
         });
    }
    else if(event.functionName == 'sms'){
        jsonObj.siteId = event.siteIdInSms;
        jsonObj.type = event.typeInSms;
        jsonObj.mobileNumber = event.mobileNumberInSms;
        jsonObj.otp = event.otpInSms;
        console.log("sm")
         sms.sms(client,jsonObj ,event, function(response){
             callback(response);
         });
    }
    else if(event.functionName=='userOrdersms'){
       
        jsonObj.saleId=event.saleId
        //console.log("event.saleId.."+event.saleId)
      userOrdersms.userOrdersms(client,jsonObj ,event, function(response){
             callback(response);
         }); 
        
    }
    else if(event.functionName == 'changePassword'){
        jsonObj.oldPassword = event.oldPasswordInChangePwrd;
        jsonObj.newPassword = event.newPasswordInChangePwrd;
        jsonObj.userId = event.userIdInChangePwrd;
        //console.log("pwsss...")
         changePassword.changePassword(client,jsonObj ,event, function(response){
             callback(response);
         });
    }
    
    else if(event.functionName == 'forgotPasswordOtp'){
          jsonObj.siteId = event.siteId;
          jsonObj.userInput = event.userInput;
          jsonObj.userId = event.userId;
        jsonObj.otp = event.otp;
        //console.log("forgotPasswordOtp")
         forgotPasswordOtp.forgotPasswordOtp(client,jsonObj ,event, function(response){
             callback(response);
         });
    }
    else if(event.functionName == 'sendOtp'){
        jsonObj.type = event.type;
         jsonObj.siteId = event.siteId;
        jsonObj.userInput = event.userInput;
         sendOtp.sendOtp(client,jsonObj ,event, function(response){
             callback(response);
         });
    }
    else if(event.functionName == 'idaLogin'){
        idaLogin.idaLogin(client,jsonObj ,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'test'){
        jsonObj.type = event.type;
         jsonObj.siteId = event.siteId;
        jsonObj.userInput = event.userInput;
         sendOtp.sendOtp(client,jsonObj ,event, function(response){
             callback(response);
         });
    }
     else{
        const data = {
            success: "0",
            result: [],
            errorMessage: "Function not exist",
            successMessage: ""
        };
        callback(data);
    }
};
module.exports = methods;