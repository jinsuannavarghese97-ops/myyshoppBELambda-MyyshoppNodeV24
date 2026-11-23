let moment =require('moment');
let methods = {};
let queryExecution = require('../queryExecution');
methods.storeByLocationId = function(client,jsonObj,event,callback) {
    let innerJoinWhereQuery=""
    let val = []
    if(event.sellerId)
    {
        innerJoinWhereQuery=" INNER JOIN store AS s on s.id=scgs.store_id AND s.seller_id=?"
        val.push(event.sellerId)
    }
    let listQuery = " SELECT  group_concat(distinct scgs.store_id)  as storeId "+
                    " FROM `site_category_group_stores` AS scgs "+
                    " INNER JOIN `location_group_type` AS lgt on lgt.store_id = scgs.store_id and lgt.is_active is true "+
                    " and ( lgt.location_id = ? or lgt.city_id = ?) "+
                    innerJoinWhereQuery +" where scgs.site_category_group_id = ?;"
                    //" group by scgs.store_id "
                     console.log("listQuery.....",listQuery)
    queryExecution.queryExecution(client, jsonObj, event, listQuery,[event.locationId,event.cityId,...val,event.siteCategoryGroupId], function (response) {
        console.log("response.....",response.result[0])
        if (response.success == '0') {
            callback(response);
        }
        let result = response.result[0].storeId ? response.result[0].storeId.split(',') : [];
        let resultData = [];
        for(let i=0;i<result.length;i++){
            resultData.push(parseInt(result[i]));
        }
        response.result = resultData;
         console.log("response..ddd...",response)
        callback(response);
    });
}  
module.exports = methods;