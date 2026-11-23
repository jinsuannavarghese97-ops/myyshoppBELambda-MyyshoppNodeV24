const methods = {};
let queryExecution = require('../queryExecution');
methods.index = function (client, jsonObj, event, callback) {

    let buyerId = event.buyerId
    let trackOrder = [];
    let queryString =

        "select os.id orderStatusId,os.name as orderStatus,os.is_active as isActive ,os.sort_order as sort" +
        " from order_status as os" +
        "  where os.is_Active=0 order by os.sort_order asc ;" +
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
        " IN ('Delivered','Cancelled','Returned')  )  OR (os.name IN ('Open','In Process','Out for Delivery','Verified'))  )" +
        " AND sale.buyer_id = ? " +
        "  AND sos.is_current_status = true  ORDER BY so.id desc ";


    queryExecution.queryExecution(client, jsonObj, event, queryString, [buyerId], function (response) {
        if (response.success == '0') {
            return response
        }
        let queryStringResults = response.result
        for (let i = 0; i < queryStringResults[0].length; i++) {
            let isActiveFlag = 0


            for (let j = 0; j < queryStringResults[1].length; j++) {
                //console.log("li.........")
                if (
                    queryStringResults[0][i].orderStatusId ==
                    queryStringResults[1][j].orderStatusId
                ) {
                    //queryStringResults[0][i]. isActive = 1;
                    isActiveFlag = 1

                }

            }
            let trackOrderDetails = [];
            trackOrderDetails = {
                id: queryStringResults[0][i].orderStatusId,
                isActive: isActiveFlag,
                name: queryStringResults[0][i].orderStatus,
            };
            trackOrder.push(trackOrderDetails);
        }

        const responseData = {
            success: "1",
            result: {
                "trackOrder": trackOrder,
                // "userFeedbackDetails": feedbackOrderData

            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(responseData);
    });
}
module.exports = methods;