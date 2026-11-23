let methods = {};
let queryExecution = require('../queryExecution');
methods.sitemapStoreData = function(client,jsonObj,event,callback) {
 
     
    let queryString = " SELECT concat(sit.site_url,'/',s.slug) as slug " +
                        " FROM `site_category_group` AS scg " + 
                        " inner join site as sit on scg.id = sit.site_category_group " +
                        " INNER JOIN `site_category_group_stores` AS scgs ON scg.id = scgs.`site_category_group_id`   " +
                        " inner join store as s on s.id = scgs.store_id  " +
                        " inner join seller as sl on sl.id = s.seller_id " +
                        " where scg.is_active = true and s.is_active = true and s.is_approved = true and sl.is_active = true and sl.is_approved = true  and sit.id = 226;"

    //connection.query(queryString, function (error, results, fields) {
    queryExecution.queryExecution(client, jsonObj, event, queryString,[], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result
            
            const responseData = {
                success:"1",
                result:results,
                successMessage:"Success",
                errorMessage:""
            }
            callback(responseData);
        });
}  
module.exports = methods;