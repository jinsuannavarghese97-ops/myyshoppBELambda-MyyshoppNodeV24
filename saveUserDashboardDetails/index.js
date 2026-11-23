let personalInformation = require('./personalInformation.js');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client,jsonObj, event, callback) {
    if (event.functionName == 'personalInformation') {
        jsonObj.userId = event.userId;
        jsonObj.firstName = event.firstName;
        if (event.lastName) {
            jsonObj.lastName = event.lastName;
        } else {
            jsonObj.lastName = null;
        }
        jsonObj.gender = event.gender;
        jsonObj.married = event.married;
        jsonObj.spouseName = (event.spouseName == '' || event.spouseName == null || event.spouseName == 'undefined') ? '' : event.spouseName;
        jsonObj.numberOfkids = event.numberOfkids;
        jsonObj.dateBirth = (event.dateBirth == '' || event.dateBirth == null || event.dateBirth == 'undefined' || event.dateBirth == '0000-00-00 00:00:00') ? 'NULL' : event.dateBirth;;
        personalInformation.personalInformation(client,jsonObj,event, function (response) {
            callback(response)
        });
    }
}
module.exports = methods;
