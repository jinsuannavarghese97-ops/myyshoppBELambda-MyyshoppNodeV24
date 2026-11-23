let deliverySlots = require('./deliverySlots.js');
let rtDeliverySlots = require('./rtDeliverySlots.js');
const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function(jsonObj,event,callback) {
    const pool  = mysql.createPool({
        host : jsonObj.dbhost,
        user:  jsonObj.dbuser,
        password : jsonObj.dbpassword,
        database : jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
        typeCast: function castField( field, useDefaultTypeCasting ) {
            if ( ( field.type === "BIT" ) && ( field.length === 1 ) ) {
                let bytes = field.buffer();
                return( bytes[ 0 ] === 1 );
            }
            return( useDefaultTypeCasting() );
        }
      });
      
    //context.callbackWaitsForEmptyEventLoop = false;
    if(event.functionName == 'deliverySlots'){
        jsonObj.storeId = event.storeId;
        jsonObj.locationId = event.locationId
        jsonObj.categoryId = event.mainCategoryId;
        deliverySlots.deliverySlots(jsonObj,event, function(result){
            const data = {
                success: "1",
                result: {
                     "locationBasedDetails":result
                },
                errorMessage: "",
                successMessage: "Success"
            };
            callback(data)
        })
    }
    else if(event.functionName == 'rtDeliverySlots'){
        jsonObj.storeId = event.storeId;
      
        rtDeliverySlots.rtDeliverySlots(jsonObj,event, function(result){
            const data = {
                success: "1",
                result: {
                     "locationBasedDetails":result
                },
                errorMessage: "",
                successMessage: "Success"
            };
            callback(data)
        })
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
};
module.exports = methods;