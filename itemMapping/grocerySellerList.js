let methods = {};
let queryExecution = require('../queryExecution');
methods.getGrocerySellerAndStore =function (client,jsonObj,event, callback) {
       
         let query = " SELECT s.retail_group_name AS seller,s.id AS sellerId,s.city_id as cityId, " +
                       "  (select group_concat(st1.name separator '|') from store as st1 where st1.id = st.id) as storeName, " +
                       "  (select group_concat(st1.id separator '|') from store as st1 where st1.id = st.id) as storeId " +
                       "  FROM seller AS s  " +
                       "  INNER JOIN store AS st ON st.seller_id = s.id  " +
                      "   INNER JOIN  store_main_category  AS smc ON smc.store_id = st.id  " +
                      "   inner join main_category as mc on mc.id = smc.main_category_id  " +
                      "   WHERE (smc. main_category_id  = 1  or mc.main_group_category_id = 1) AND st. is_active  = TRUE AND st. is_approved  = TRUE AND s. is_active  = TRUE AND s. is_approved  = TRUE  " +
                       //"  GROUP BY s.id  " +
                       "  ORDER BY s.retail_group_name "
                       console.log("query..................",query)
    	queryExecution.queryExecution(client, jsonObj, event, query,[], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            else{
                var seller = []
                var sellerIdArray=[]
                for(let i=0;i<response.result.length;i++){
                    let index = sellerIdArray.indexOf(response.result[i].sellerId);
                    // console.log("index...",index)
                    if(index=="-1")
                    {
                    sellerIdArray.push(response.result[i].sellerId)
                    var s = {
                        id : response.result[i].sellerId,
                        name : response.result[i].seller,
                        cityId : response.result[i].cityId
                    }
                    seller.push(s)
                    }
                    
                }
                var store = []
                for(let i=0;i<response.result.length;i++){
                    var storeId = response.result[i].storeId.split("|")
                    var storeName = response.result[i].storeName.split("|")
                    for(let j=0;j<storeId.length;j++){
                        var s = {
                            id : storeId[j],
                            name : storeName[j],
                            sellerId:response.result[i].sellerId,
                            sellerame : response.result[i].seller
                        }
                        store.push(s)
                    }
                }
               
                const responseData = {
                    success: "1",
                    result: {
                        "seller": seller,
                        "store": store
                    },
                    errorMessage: "",
                    successMessage: "Success"
                };
                callback(responseData);
            }
        })
   
}
module.exports = methods;