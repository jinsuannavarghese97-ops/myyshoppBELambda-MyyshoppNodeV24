let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
methods.trackOrder = function (client, jsonObj, event, callback) {
    let orderId = jsonObj.orderId
    let trackOrder = [];
    let trackDetailStatus = [];
    let jsonObject2
    let jsonObject1
    let queryString = " select os.id as orderStatusId,os.name as orderStatus,os.is_active as isActive ,os.sort_order as sort " +
        " from order_status as os" +
        " order by os.sort_order asc ;" +
        " SELECT so.id AS orderNo, CONCAT(s.name, ', ', s.locality) AS storeName,sos.order_status_id  as saleOrderStatusId ," +
        " os.name AS orderStatus,date_format(sale.sale_date,'%d %M %Y') as orderDate , sos.is_active  as isActive" +
        " FROM sale_order so " +
        " INNER JOIN sale_order_status sos ON sos.sale_order_id = so.id " +
        " inner JOIN order_status os on os.id =  sos.order_status_id " +
        " INNER JOIN store s ON s.id = so.store_id " +
        " INNER JOIN sale sale ON sale.id = so.sale_id " +
        " where so.id= ? order by sos.id asc "
    queryExecution.queryExecution(client, jsonObj, event, queryString, [orderId], function (response) {
        if (response.success == '0') {
            callback(response);
        }

        let queryStringResults = response.result
        if (queryStringResults.length > 0) {
            let isActiveFlag = 0
            trackDetailStatus = [];
            for (let j = 0; j < queryStringResults[0].length; j++) {
                isActiveFlag = 0
                for (let i = 0; i < queryStringResults[1].length; i++) {
                    for (let k = 0; k < queryStringResults[0].length; k++) {
                        jsonObject1 = JSON.parse(queryStringResults[1][i].saleOrderStatusId);
                        jsonObject2 = JSON.parse(queryStringResults[0][j].orderStatusId);
                        if (jsonObject1 == jsonObject2) {
                            isActiveFlag = '1'
                        }
                    }
                }
                let trackDetails = {
                    id: queryStringResults[0][j].orderStatusId,
                    isActive: isActiveFlag,
                    name: queryStringResults[0][j].orderStatus
                }
                trackDetailStatus.push(trackDetails)
            }
            callback(trackDetailStatus);
        }
        else {
            callback(trackDetailStatus);
        }
    })
}
module.exports = methods;

