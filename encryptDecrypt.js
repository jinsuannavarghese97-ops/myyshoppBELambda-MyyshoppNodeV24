var methods = {};

var CryptoJS = require("crypto-js");

const ENC_KEY = "m!y@y#s$h%o^p&p*a!d@m#i$n%0^12&3"
methods.encryptData = function(reqBody) {
    try {
             
            let dataToBeEncrypted=reqBody;
             dataToBeEncrypted=JSON.stringify(reqBody);
             var cipher = CryptoJS.AES.encrypt(JSON.stringify(dataToBeEncrypted), ENC_KEY).toString();
             return cipher;
       
     }
     catch (e) {
         return ("Something wrong in encrypt data",e);
     }
}

methods.decryptData = function(resultData) {
    try {
         
            var bytes  = CryptoJS.AES.decrypt(resultData, ENC_KEY);
            var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
            return decryptedData            
        
     }
     catch (e) {
         return ("Something wrong in decrypt data",e);
     }
}
module.exports = methods;