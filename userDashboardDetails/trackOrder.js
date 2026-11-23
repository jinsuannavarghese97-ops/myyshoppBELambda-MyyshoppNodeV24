let methods = {};
let queryExecution = require('../queryExecution');
methods.trackOrder = function (client, jsonObj, event, callback) {
    let buyerId = jsonObj.buyerId
    let trackOrder = [];
    let queryString = "select os.id as orderStatusId,os.name as orderStatus,os.is_active as isActive ,os.sort_order as sort" +
        " from order_status as os" +
        " where  os.name <> 'Refund Requested ' and os.name <>'Refund Accepted'  " +
        "  order by os.sort_order asc ;" +

        "SELECT so.id AS orderNo, CONCAT(s.name, ', ', s.locality) AS storeName,s.name as strName,s.locality as locality, os.name AS orderStatus, " +
        " date_format(sale.sale_date,'%d %M %Y') as orderDate,sos.comments as comments,os.id as orderStatusId" +
        " from sale_order so  " +
        " INNER JOIN sale_order_status sos  ON sos.sale_order_id = so.id  " +
        " INNER JOIN order_status os  ON os.id =  sos.order_status_id  " +
        " INNER JOIN store s  ON s.id = so.store_id " +
        "INNER JOIN sale as sale  ON sale.id = so.sale_id" +
        "  WHERE ((os.name IN ('Delivered','Cancelled','Returned')" +
        "  AND CAST(sos.status_date AS DATE) BETWEEN DATE_ADD(CAST(NOW() AS DATE), INTERVAL -3 DAY) " +
        " AND CAST(NOW() AS DATE)  AND os.name " +
        " IN ('Delivered','Cancelled','Returned')  )  OR (os.name IN ('Open','In Process','Out for Delivery','Verified','Refund Requested','Refund Accepted'))  )" +
        " AND sale.buyer_id =  ?" +
        "  AND sos.is_current_status = true  " +
        " ORDER BY so.id desc ;" +

        "SELECT so.id AS orderNo,group_concat(os.id) as orderStatusId " +
        " from sale_order so  " +
        " INNER JOIN sale_order_status sos  ON sos.sale_order_id = so.id  " +
        " INNER JOIN order_status os  ON os.id =  sos.order_status_id  " +
        " INNER JOIN store s  ON s.id = so.store_id " +
        "INNER JOIN sale as sale  ON sale.id = so.sale_id" +
        "  WHERE so.id in (select sale_order_id from sale_order_status where order_status_id = 5 ) " +
        " AND sale.buyer_id = ? " +
        " GROUP BY so.id " +
        " ORDER BY so.id desc ";
    //connection.query(queryString, function (error, queryStringResults, fields){
    queryExecution.queryExecution(client, jsonObj, event, queryString, [buyerId, buyerId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let queryStringResults = response.result;
        let trackDetailStatus = [];
        if (queryStringResults.length > 0) {
            for (let i = 0; i < queryStringResults[1].length; i++) {
                let isActiveFlag = 0
                trackDetailStatus = [];
                let count = 0, status = []
                for (let j = 0; j < queryStringResults[0].length; j++) {
                    isActiveFlag = 0
                    let jsonObject1 = JSON.parse(queryStringResults[1][i].orderStatusId);
                    let jsonObject2 = JSON.parse(queryStringResults[0][j].orderStatusId);
                    if (jsonObject1 == jsonObject2) {
                        if (jsonObject1 != 5) {
                            status = []
                            count = j
                        }
                        else {
                            for (let v = 0; v < queryStringResults[2].length; v++) {
                                console.log("queryStringResults[1][i].orderNo ", queryStringResults[1][i].orderNo)
                                console.log("queryStringResults[2][v].orderNo ", queryStringResults[2][v].orderNo)
                                if (queryStringResults[1][i].orderNo == queryStringResults[2][v].orderNo) {
                                    status = queryStringResults[2][v].orderStatusId.split(',')
                                }
                            }
                        }
                        isActiveFlag = '1'
                    }
                    let trackDetails = {
                        id: queryStringResults[0][j].orderStatusId,
                        isActive: isActiveFlag,
                        name: queryStringResults[0][j].orderStatus
                    }
                    trackDetailStatus.push(trackDetails)
                }
                for (let m = 0; m < count; m++) {
                    trackDetailStatus[m].isActive = '1'
                }
                if (status.length > 0) {
                    for (let d = 0; d < trackDetailStatus.length; d++) {
                        for (let c = 0; c < status.length; c++) {
                            if (trackDetailStatus[d].id == status[c]) {
                                trackDetailStatus[d].isActive = '1'
                            }
                        }
                    }
                }
                let trackDetails = {
                    orderStatus: trackDetailStatus,
                    storeName: queryStringResults[1][i].storeName,
                    orderNo: queryStringResults[1][i].orderNo,
                    strName: queryStringResults[1][i].strName,
                    locality: queryStringResults[1][i].locality,
                    orderDate: queryStringResults[1][i].orderDate,
                    comments: queryStringResults[1][i].comments
                }
                trackOrder.push(trackDetails)
            }
            const data = {
                success: "1",
                result: {
                    "trackOrder": trackOrder,
                },
                errorMessage: "",
                successMessage: "Success"
            };
            callback(data);

        }
        else {
            const data = {
                success: "1",
                result: {
                    "trackOrder": trackOrder,
                },
                errorMessage: "",
                successMessage: "No data found."
            };
            callback(data);
        }
    });
}
module.exports = methods;