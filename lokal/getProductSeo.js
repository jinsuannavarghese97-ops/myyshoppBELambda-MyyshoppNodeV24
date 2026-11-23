let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.getProductSeo = function(client,jsonObj,event,callback) {
         let seoQuery = " select siss.seo_title, siss.seo_description, siss.seo_keywords, siss.slug " +
                        " from store_item_stock as sis " +
                        " inner join store_item_stock_seo as siss on sis.id = siss.store_item_stock_id and sis.city_id = siss.city_id " +
                        " where sis.id = ?" 
                queryExecution.queryExecution(client, jsonObj, event, seoQuery,[jsonObj.storeItemStockId], function (response) {
                    if (response.success == '0') {
                        callback(response);
                    }
                    let seoResults = response.result
                    const data = {
                        success: "1",
                        result:seoResults,
                        errorMessage: "",
                        successMessage: "Success"
                    };
                    callback(data);
                 })
       // })
}
module.exports = methods;