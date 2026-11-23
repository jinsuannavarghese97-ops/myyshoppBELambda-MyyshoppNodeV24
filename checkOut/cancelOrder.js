const queryExecution = require('../queryExecution')
let methods = {};


methods.cancelOrder = function (client, jsonObj, event, callback) {
    console.log("1.....", new Date().getSeconds())
    // let queryString = " select s.payment_id as paymentId,s.id as id from sale as s " +
    //     " inner join sale_order as so on so.sale_id=s.id " +
    //     " where so.id= " + event.orderId
    // queryExecution.queryExecution(client, jsonObj, event, queryString, function (queryStringResult) {
    //     console.log("2.....",new Date().getSeconds())
    //     if (queryStringResult.success == '0') {
    //         callback(queryStringResult);
    //     }
    //     let results = queryStringResult.result

    //     let cancelDetails = []
    //     let status
    //     if (results[0].paymentId != "" && results[0].paymentId != null) {
    //         status = "Refund Requested"
    //     }
    //     else {
    //         status = "Cancelled"
    //     }
    let orderQuery
    let statusQuery
    orderQuery = " select count(*) as count,sos.id as orderStatusId,so.gross_amount , " +
        " sle.created_by as createdBy,sos.created_on as createdOn,so.id as saleOrderId, " +
        " cmsoi.id as cmId, soi.id as groceryId,group_concat(soi.store_item_stock_id) as storeItemStockId, " +
        " group_concat(soi.quantity) as groceryQuantity,group_concat(cmsoi.cm_item_size_id) as cmItemSizeId, " +
        " group_concat(cmsoi.cm_item_id) as cmItemId,group_concat(if(cmsoi.cm_item_size_id is null and cmsoi.cm_item_id,cmsoi.quantity,0)) as cmItemQty, " +
        " group_concat(if(cmsoi.cm_item_size_id,cmsoi.quantity,0)) as cmItemSizeQty,group_concat(sis.stock_quantity) as groceryAvailableQty, " +
        " group_concat(if(cmsoi.cm_item_size_id is null and cmsoi.cm_item_id ,ci.available_quantity,0)) as cmItemAvailableQuantity, " +
        " group_concat(if(cmsoi.cm_item_size_id,cis.available_quantity,0)) as cmItemSizeAvailableQuantity " +
        " from sale_order as so " +
        " inner join sale_order_status as sos on sos.sale_order_id = so.id" +
        " INNER JOIN sale as sle on sle.id = so.sale_id " +
        " left join cm_sale_order_item as cmsoi on cmsoi.sale_order_id = so.id " +
        " left join cm_item_size as cis on cis.id = cmsoi.cm_item_size_id " +
        " left join cm_item as ci on ci.id = cmsoi.cm_item_id " +
        " left join sale_order_item as soi on soi.sale_order_id = so.id " +
        " left join store_item_stock as sis on sis.id = soi.store_item_stock_id " +
        " where sos.is_current_status = true and sos.sale_order_id = ?" +
        " group by sos.sale_order_id "
    queryExecution.queryExecution(client, jsonObj, event, orderQuery, [event.orderId], function (orderQueryResult) {

        if (orderQueryResult.success == '0') {
            callback(orderQueryResult);
        }
        let orderResult = orderQueryResult.result
        // console.log("-----orderResult----",orderResult[0]);
        if (event.timeZone) {
            let num = event.timeZone.slice(1);

            let symbol = event.timeZone.toString(0)[0] == '-' ? '+' : '-'
            let hours = (num / 60);
            let rhours = Math.floor(hours);
            rhours = rhours.toString.length == 1 ? '0' + rhours : rhours
            let minutes = (hours - rhours) * 60;
            let rminutes = Math.round(minutes);
            event.timeZone = symbol + rhours + ':' + rminutes
            event.time = symbol + num
        }

        event.time = event.time ? event.time : '+330'
        event.timeZone = event.timeZone ? event.timeZone : '+05:30'
        // statusQuery = " update sale_order_status set is_current_status=0 where sale_order_id=" + orderResult[0].saleOrderId+"; "+
        // " insert into sale_order_status(version,created_by,created_on,is_active,is_current_status,order_status_id,sale_order_id,status_date)" +
        //     " values(0," + orderResult[0].createdBy + ",CONVERT_TZ (now(), '+00:00','"+event.timeZone+"'),1,1,5," + orderResult[0].saleOrderId + ",CONVERT_TZ (now(), '+00:00','"+event.timeZone+"')) ;"+
        //     " UPDATE `sale_order` SET `order_status_id` = 5 WHERE id = "+orderResult[0].saleOrderId +";"   
        statusQuery = ` UPDATE sale_order_status SET is_current_status = ? WHERE sale_order_id = ?;
        INSERT INTO sale_order_status 
        (version, created_by, created_on, is_active, is_current_status, order_status_id, sale_order_id, status_date) 
        VALUES (?, ?, CONVERT_TZ(NOW(), '+00:00', ?), 1, 1, 5, ?, CONVERT_TZ(NOW(), '+00:00', ?));
        UPDATE sale_order SET order_status_id = 5 WHERE id = ?`
        let values = [
            0, orderResult[0].saleOrderId,   // For the first UPDATE query
            0, orderResult[0].createdBy, event.timeZone, orderResult[0].saleOrderId, event.timeZone,   // For the INSERT query
            orderResult[0].saleOrderId      // For the final UPDATE query
        ]
        //console.log("statusQuery ",statusQuery)
        queryExecution.queryExecution(client, jsonObj, event, statusQuery, values, function (statusQueryResult) {
            //  console.log("statusQueryResult.....",statusQueryResult)
            let updateQry = ""
            let updateQryValues = []
            let storeItemStockId = orderResult[0].storeItemStockId != null ? orderResult[0].storeItemStockId.split(',') : []
            let groceryQuantity = orderResult[0].storeItemStockId != null ? orderResult[0].groceryQuantity.split(',') : []
            let groceryAvailableQty = orderResult[0].storeItemStockId != null && orderResult[0].groceryAvailableQty ? orderResult[0].groceryAvailableQty.split(',') : []


            let cmItemId = orderResult[0].cmItemId != null ? orderResult[0].cmItemId.split(',') : []
            let cmItemQty = orderResult[0].cmItemId != null ? orderResult[0].cmItemQty.split(',') : []
            let cmItemAvailableQuantity = orderResult[0].cmItemId != null && orderResult[0].cmItemAvailableQuantity ? orderResult[0].cmItemAvailableQuantity.split(',') : []


            let cmItemSizeId = orderResult[0].cmItemSizeId != null ? orderResult[0].cmItemSizeId.split(',') : []
            let cmItemSizeQty = orderResult[0].cmItemSizeId != null ? orderResult[0].cmItemSizeQty.split(',') : []
            let cmItemSizeAvailableQuantity = orderResult[0].cmItemSizeId != null && orderResult[0].cmItemSizeAvailableQuantity ? orderResult[0].cmItemSizeAvailableQuantity.split(',') : []

            for (let i = 0; i < storeItemStockId.length; i++) {
                if (groceryQuantity[i] > 0) {
                    let newQty = parseInt(groceryAvailableQty[i]) + parseInt(groceryQuantity[i])
                    updateQry = updateQry + " UPDATE store_item_stock set stock_quantity = ? where id = ?;"
                    updateQryValues.push(newQty, storeItemStockId[i])
                }
            }

            for (let i = 0; i < cmItemId.length; i++) {
                if (cmItemQty[i] > 0) {
                    let newQty = parseInt(cmItemQty[i]) + parseInt(cmItemAvailableQuantity[i])

                    updateQry = updateQry + " UPDATE cm_item set available_quantity = ? where id = ?;"
                    updateQryValues.push(newQty, cmItemId[i])
                }
            }

            for (let i = 0; i < cmItemSizeId.length; i++) {
                if (cmItemSizeQty[i] > 0) {
                    let newQty = parseInt(cmItemSizeQty[i]) + parseInt(cmItemSizeAvailableQuantity[i])
                    //  console.log("cmItemQty..",parseInt(cmItemSizeQty[i]),"--newQty---",newQty,"--cmItemAvailableQuantity[i]--",parseInt(cmItemSizeAvailableQuantity[i]))
                    updateQry = updateQry + " UPDATE cm_item_size set available_quantity =? where id = ?;"
                    updateQryValues.push(newQty, cmItemSizeQty[i])
                }
            }
            // }
            if (updateQry) {
                //  console.log("updateQry.....",updateQry)
                queryExecution.queryExecution(client, jsonObj, event, updateQry, updateQryValues, function (updateQryResult) {
                    //  console.log("updateQryResult.....",updateQryResult)
                    updateQryResult.result = []
                    callback(updateQryResult);
                });
            }
            else {
                //  console.log("statusQueryResult.....",statusQueryResult)
                statusQueryResult.result = []
                callback(statusQueryResult)
            }
        });


    });
    //})
}
module.exports = methods;