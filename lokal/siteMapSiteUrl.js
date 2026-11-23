let methods = {};
let queryExecution = require('../queryExecution');
methods.siteMapSiteUrl = function(client,jsonObj,event,callback) {
 
     
    let queryString = " select ssd.site_url as siteUrl " +
                        " from site as s " +
                        " inner join site_sub_domain as ssd on s.id = ssd.site_id " +
                        " inner join site_category_group as scg on scg.id = s.site_category_group " +
                        " where scg.is_active = true and ssd.store_id is null and s.id = 226 " +
                    //     " union " +
                    //   "  select ssd.site_url as siteUrl " +
                    //   "  from site as s " +
                    //   "  inner join site_sub_domain as ssd on s.id = ssd.site_id " +
                    //   "  inner join seller as sl on sl.id = s.seller_id " +
                    //   "  inner join store as st on sl.id = st.seller_id " +
                    //   "   where st.is_active = true and st.is_approved = true and sl.is_active = true and sl.is_approved = true " +
                      "   union " +
                      "   select ssd.site_url as siteUrl " +
                      "   from site as s " +
                      "   inner join site_sub_domain as ssd on s.id = ssd.site_id " +
                      "   inner join store as st on st.id = ssd.store_id " +
                      "   inner join seller as sl on sl.id = st.seller_id " +
                      "   where st.is_active = true and st.is_approved = true and sl.is_active = true and sl.is_approved = true and s.id = 226; "

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