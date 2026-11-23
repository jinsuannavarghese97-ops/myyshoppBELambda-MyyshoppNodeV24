const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function(client,jsonObj,event,callback) {
    
    //context.callbackWaitsForEmptyEventLoop=false;
    let queryString = "Select s.id as storeId,s.name as storeName,CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/', "+
                      " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                      " (SELECT  config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/', "+
                      " if(s.logo_path is null,'default.jpg',s.logo_path)) AS image_path "+
                      " FROM store as s "+
                      " WHERE id in("+event.storeId+")"
    //con.query(queryString, function (error, results, fields) {
    queryExecution.queryExecution(client,jsonObj,event, queryString, [],function (response) {
      if (response.success == '0') {
          callback(response)
      }
      let results = response.result
      let storeDetails = []
      for(let i=0;i<results.length;i++){
          const storeData = {
              storeId:results[i].storeId,
              storeName:results[i].storeName,
              storeLogo:results[i].image_path
          }
          storeDetails.push(storeData)
      }
      console.log("..storeDetails...",storeDetails)
      const responseData = {
        success:"1",
        result:{
            storeDetails:storeDetails
        },
        errorMessage: "",
        successMessage:"Success."
      };
      callback(responseData); 
          
  });
}
module.exports = methods;