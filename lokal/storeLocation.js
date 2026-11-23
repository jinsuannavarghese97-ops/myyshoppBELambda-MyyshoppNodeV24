let methods = {};
let queryExecution = require('../queryExecution');
methods.storeLocation = function(client,jsonObj,event,callback) {

            let queryString=" select group_concat(distinct st.id) as id,group_concat(distinct st.name) as storeName,count(*) as count "+
                            " from store as st "+
                            " inner join location_group_type as lgt on lgt.store_id=st.id and lgt.store_id in ("+event.storeId+") and lgt.location_id = ?;"+
                            
                            " select group_concat(distinct st.id) as id,group_concat(distinct st.name) as storeName "+
                            " from store as st "+
                            " where st.id in ("+event.storeId+") ;"+
                            
                            " select name from location where id = ?; "+
                            
                            " select st.id as id,st.name as storeName "+
                            " from store as st "+
                            " where st.id in ("+event.storeId+") group by st.id;"
            //connection.query(queryString, function (error, storeResult, fields) {
            queryExecution.queryExecution(client, jsonObj, event, queryString,[event.locationId,event.locationId], function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let storeResult = response.result
                let storeList="",location="",storeIds="",cartClearFlag='0'
                if(storeResult[0].length>0 && storeResult[0][0].count>0){
                    for(let i=0;i<storeResult[3].length;i++){
                      let storeId = storeResult[0][0].id
                      if(storeId.includes(storeResult[3][i].id)){
                          
                      }  
                      else{
                          cartClearFlag = '1'
                          storeList= storeList=="" ? storeResult[3][i].storeName : storeList+","+storeResult[3][i].storeName
                          storeIds = storeIds=="" ? storeResult[3][i].id : storeList+","+storeResult[3][i].id
                      }
                    }
                    let result = {
                        cartClearFlag:cartClearFlag,
                        storeIds:storeIds,
                        message:storeList+"("+storeResult[2][0].name+") does not serve this locality ,so cart for "+storeList+"("+storeResult[2][0].name+") will be cleared"
                    }
                    const responseData = {
                        success:'1',
                        successMessage:"Success",
                        result:result,
                        errorMessage:""
                    }
                    callback(responseData);
                }
                else{
                    let result = {
                        cartClearFlag:'1',
                        storeIds:storeResult[1][0].id,
                        message:storeResult[1][0].storeName+"("+storeResult[2][0].name+") does not serve this locality ,so cart for "+storeResult[1][0].storeName+"("+storeResult[2][0].name+") will be cleared."
                    }
                    const responseData = {
                        success:'1',
                        successMessage:"Success",
                        result:result,
                        errorMessage:""
                    }
                    callback(responseData);
                }
                
            })
        
}  
module.exports = methods;