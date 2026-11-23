const ageConfirm = require('./ageConfirm');
const orderAndRecieve = require('./orderAndRecieve');
const locationList = require('./locationList');
const methods = {};

methods.index = function(client,jsonObj,event,callback) {
    if(event.functionName == 'ageConfirm'){
        ageConfirm.ageConfirm(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'orderAndRecieve'){
        orderAndRecieve.orderAndRecieve(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'stateList'){
        locationList.stateList(client,jsonObj,event, function(response){
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