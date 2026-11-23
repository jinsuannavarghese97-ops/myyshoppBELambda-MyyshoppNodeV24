let methods = {};
let queryExecution = require('../queryExecution');
methods.sitemapItemData = function(client,jsonObj,event,callback) {
 
     
    // let queryString = " SELECT siss.slug " +
    //                   "   FROM `site_category_group` AS scg " +
    //                   "   INNER JOIN `site_category_group_stores` AS scgs ON scg.id = scgs.`site_category_group_id` and scgs.is_active = true " +
    //                   "   inner join store_item_stock as sis on scgs.store_id = sis.store_id  and scgs.is_active = true " +
    //                   "  inner join store_item_stock_seo as siss on sis.id = siss.store_item_stock_id and sis.city_id = siss.city_id " +
    //                   "  where scg.is_active = true limit "+event.offset+","+event.max+";"
                       
                       
                       let queryString = " (SELECT concat(ssd.site_url,'/',siss.slug) as slug " +
                        " from site_sub_domain as ssd " +
                        " INNER JOIN `site_category_group_stores` AS scgs ON ssd.store_id = scgs.store_id and scgs.is_active = true " +
                       "  inner join store as st on st.id = scgs.store_id  " +
                        " inner join seller as sl on sl.id = st.seller_id " +
                       "  inner join store_item_stock as sis on scgs.store_id = sis.store_id and st.city_id = sis.city_id and scgs.is_active = true and sis.is_active = true " +
                       "  inner join store_item_stock_seo as siss on sis.id = siss.store_item_stock_id and sis.city_id = siss.city_id  " +
                       "  where st.is_active = true and st.is_approved = true and sl.is_active = true and sl.is_approved = true and ssd.site_id = 226 limit "+event.offset+","+event.max+") " +
                       "  union " +
                       "  (SELECT concat(s.site_url,'/',siss.slug) as slug " +
                       "  from site as s " +
                      "   INNER JOIN `site_category_group_stores` AS scgs ON s.site_category_group = scgs.`site_category_group_id` and scgs.is_active = true " +
                      "   inner join store as st on st.id = scgs.store_id  " +
                      "   inner join seller as sl on sl.id = st.seller_id " +
                      "   inner join store_item_stock as sis on scgs.store_id = sis.store_id and st.city_id = sis.city_id and scgs.is_active = true and sis.is_active = true " +
                      "   inner join store_item_stock_seo as siss on sis.id = siss.store_item_stock_id and sis.city_id = siss.city_id  " +
                       "  where st.is_active = true and st.is_approved = true and sl.is_active = true and sl.is_approved = true and s.id = 226 limit ?,?) " 
                    //   "   union " +
                    //   "   (SELECT concat(s.site_url,'/',siss.slug) as slug " +
                    //   "   from site as s " +
                    //   "   inner join seller as sl on sl.id = s.seller_id " +
                    //   "   inner join store as st on sl.id = st.seller_id  " +
                    //   "  inner join store_item_stock as sis on st.id = sis.store_id and st.city_id = sis.city_id and sis.is_active = true " +
                    //   "   inner join store_item_stock_seo as siss on sis.id = siss.store_item_stock_id and sis.city_id = siss.city_id  " +
                    //   "   where st.is_active = true and st.is_approved = true and sl.is_active = true and sl.is_approved = true limit "+event.offset+","+event.max+") "

    //connection.query(queryString, function (error, results, fields) {
    
    console.log('queryString......',queryString)
    queryExecution.queryExecution(client, jsonObj, event, queryString,[parseInt(event.offset),parseInt(event.max)], function (response) {
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