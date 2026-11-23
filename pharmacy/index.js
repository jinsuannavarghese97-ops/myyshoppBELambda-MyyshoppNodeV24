'use strict';
const methods = {};
const listRecord=require('./listRecord'); 
const saveRecord=require('./saveRecord'); 
let queryExecution = require('../queryExecution');


methods.index = function(client,jsonObj , event, callback) {
    if(event.functionName=='listRecord'){
        listRecord.index(client,jsonObj,event, function(response){
             callback(response)
        });
    }
    else if(event.functionName=='saveRecord'){
        saveRecord.index(client,jsonObj,event, function(response){
             callback(response)
        });
    }
    else{
        const data = {
            success: "0",
            result: [],
            errorMessage: "Function not exist",
            successMessage: ""
        };
        callback(data)
    }
}
module.exports = methods;