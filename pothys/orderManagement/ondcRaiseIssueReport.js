let mysql = require('mysql');
let methods = {};
let ondcUpdateCall = require('./ondcUpdateCall.js');
methods.ondcRaiseIssueReport = function (client, jsonObj, event, queryExecution, callback) {
    let whereQry = "";
    let whereQryParams = [];
    let storeQry = "";
    let storeQryParams = [];
    let limitQry = "";
    let limitQryParams = [];
    if (event.searchText) {
        whereQry = " where igm.ondc_order_number like ?";
        whereQryParams.push("%" + event.searchText + "%");
    }
    if (event.storeId) {
        if (whereQry) {
            whereQry = whereQry + " and so.store_id = ? ";
            whereQryParams.push(event.storeId);
        }
        else {
            storeQry = " where so.store_id = ? ";
            storeQryParams.push(event.storeId);
        }
    }
    if (event.max) {
        limitQry = " limit ?,? ";
        limitQryParams.push(parseInt(event.offset), parseInt(event.max));
    }

    let orderQry = " ORDER BY FROM_UNIXTIME(FLOOR(igm.created_on / 1000)) + INTERVAL (igm.created_on % 1000) MICROSECOND DESC "

    console.log("enter ....................")
    let queryString = " select igm.id as igmId,igm.ondc_issue_id as IssueId,igm.ondc_order_number as ondcOrderNumber,igm.ondc_issue_json as issueJson, " +
        " igm.created_on as createdOn,igm.issue_status_id as issueStatusId ,so.id as saleOrderId,oic.category,ois.sub_category_name " +
        " from ondc_IGM as igm " +
        " inner join ondc_IGM_category as oic on igm.category_id=oic.id " +
        " inner join ondc_IGM_subcategory as ois on igm.sub_category_id=ois.id " +
        " inner join sale as s on s.ondc_order_number=igm.ondc_order_number " +
        " inner join sale_order as so on so.sale_id=s.id " + whereQry + storeQry + " group by igm.ondc_issue_id " + orderQry + limitQry + ";"


    let countQry = " select count(*) as totalCount from (select igm.id from ondc_IGM as igm " +
        " inner join ondc_IGM_category as oic on igm.category_id=oic.id " +
        " inner join ondc_IGM_subcategory as ois on igm.sub_category_id=ois.id " +
        " inner join sale as s on s.ondc_order_number=igm.ondc_order_number " +
        " inner join sale_order as so on so.sale_id=s.id " + whereQry + storeQry + " group by igm.ondc_issue_id " + orderQry + " ) as a"
    console.log("queryString......", queryString)
    const params = [...whereQryParams, ...storeQryParams, ...limitQryParams, ...whereQryParams, ...storeQryParams];
    queryExecution.queryExecution(client, jsonObj, event, queryString + countQry, params, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result[0];
        let countResults = response.result[1];
        // console.log("countResults........", countResults)
        let issueListing = [];
        if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {

                let issueObjectList = {
                    igmId: results[i].igmId,
                    IssueId: results[i].IssueId,
                    ondcOrderNumber: results[i].ondcOrderNumber,
                    issueJson: JSON.parse(results[i].issueJson),
                    createdOn: results[i].createdOn,
                    issueStatusId: results[i].issueStatusId,
                    saleOrderId: results[i].saleOrderId,
                    category: results[i].category,
                    sub_category_name: results[i].sub_category_name
                }
                issueListing.push(issueObjectList)
            }
        }



        let responseData = {
            "success": "1",
            "successMessage": "Success",
            "results": issueListing,
            "count": countResults[0].totalCount,
            "errorMessage": ""
        }
        callback(responseData)
    });
}
methods.ondcRaiseIssueStatusUpdate = function (client, jsonObj, event, queryExecution, callback) {

    let updateField = "";
    let updateFieldParams = [];
    let modifiedOn = new Date().getTime();
    let closureOn = new Date().getTime();
    if (event.IssueStatus == 17) {
        updateField = ",closure_on= ? ";
        updateFieldParams.push(closureOn);
    }


    console.log("enter ....................")
    let queryString = `
        UPDATE ondc_IGM 
        SET 
        issue_status_id = ?, 
        modified_on = ? 
        ${updateField} 
        WHERE id = ?;
    `;

    const queryParams = [
        event.IssueStatus,
        modifiedOn,
        ...updateFieldParams,
        event.igmId
    ];

    console.log("queryStringUPDATEondc_IGM......", queryString)
    queryExecution.queryExecution(client, jsonObj, event, queryString, queryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        let responseData = {
            "success": "1",
            "successMessage": "Success",
            // "results": results,
            "errorMessage": ""
        }
        callback(responseData)
    });
}

methods.ondcRaiseIssueItemDetails = function (client, jsonObj, event, queryExecution, callback) {

    console.log("enter ....................")
    let queryString = `
    SELECT * 
    FROM sale_order_item 
    WHERE store_item_stock_id IN (?) 
    AND sale_order_id = ?;
`;

    const queryParams = [
        event.itemId,
        event.saleOrderId
    ];

    console.log("queryString......", queryString)
    queryExecution.queryExecution(client, jsonObj, event, queryString, queryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        let responseData = {
            "success": "1",
            "successMessage": "Success",
            "results": results,
            "errorMessage": ""
        }
        callback(responseData)
    });
}

methods.ondcIssuelog = function (client, jsonObj, event, queryExecution, callback) {

    console.log("enter ....................")
    let limitQry = "";
    let limitQryParams = [];
    if (event.max) {
        limitQry = " limit ?,? ";
        limitQryParams.push(parseInt(event.offset), parseInt(event.max));
    }
    let queryString = " select * from ondc_error_log order by id desc " + limitQry + " ;"
    let countQuery = " select count(*) as totalCount from ondc_error_log ;"
    console.log("queryString......", queryString)
    queryExecution.queryExecution(client, jsonObj, event, queryString + countQuery, limitQryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result[0];
        let totalCount = response.result[1][0].totalCount
        let responseData = {
            "success": "1",
            "successMessage": "Success",
            "results": results,
            totalCount: totalCount,
            "errorMessage": ""
        }
        callback(responseData)
    });
}

methods.cancelOndcItem = async function (client, jsonObj, event, queryExecution, callback) {
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
    const milliseconds = Date.now();
    //console.log("event.time ",event.time)
    event.time = event.time ? event.time : '+330'
    event.timeZone = event.timeZone ? event.timeZone : '+05:30'
    let storeId = event.storeId
    var TaxQueryResult = ""
    let taxQry = "";
    let taxQryParams = [];
    if (storeId) {
        taxQry = " SELECT st.`tax_name` AS taxName,st.`tax_percentage` AS taxPercentage,st.`apply_tax_on_id` AS applyTax,st.id as storeTaxId, " +
            "IF(st.`apply_tax_on_id`, " +
            " (SELECT sd.tax_percentage FROM store_tax_details AS sd WHERE st.`apply_tax_on_id` = sd.id) " +
            " ,NULL) AS applyTaxPercentage,st.store_id as storeId " +
            " FROM `store_tax_details` AS st " +
            //" inner join store as sto on sto.id=st.store_id " +
            " WHERE st.is_active = true and st.`store_id` in (?);"
        console.log("taxQry..........................", taxQry)
        taxQryParams.push(storeId);
    }


    console.log("Inside Update SaleOrderItem  Status....");
    let selectCancelledTotalQuery = "select SUM(net_amount*cancelled_quantity) as totalAmount from sale_order_item where sale_order_id= ? and status=5;";
    let updateSaleOrderItemStatusQuery = " UPDATE sale_order_item SET status=5,ondc_fullfillment_states_id =7,cancelled_by='Seller',cancelled_at= ?,cancelled_quantity=quantity  WHERE id=?;" + selectCancelledTotalQuery
    let updateSaleOrderItemStatusQueryParams = [milliseconds, event.saleOrderItemId, event.saleOrderId];
    console.log("updateSaleOrderItemStatusQuery...........", updateSaleOrderItemStatusQuery)

    let selectQuery = "select * from ondc_sale where ondc_order_id= ?;";
    let selectQueryParams = [event.ondcOrderId];
    let saleQry = `
        SELECT 
            SUM(quantity) AS totalCount, 
            SUM(cancelled_quantity) AS totalCancelledCount, 
            (SELECT COUNT(*) FROM sale_order_item WHERE sale_order_id = ? AND status = 5) AS cancelledCount 
        FROM sale_order_item 
        WHERE sale_order_id = ?;
    `;

    const saleQryParams = [event.saleOrderId, event.saleOrderId];

    //console.log("selectQuery.............",selectQuery)

    let storeDetailsQuery = `
        SELECT 
            soi.id as saleOrderItemId, 
            so.store_id as storeId, 
            s.ondc_covenient_fee, 
            s.net_amount, 
            so.ondc_conveniencefee_tax, 
            so.ondc_deliveryCharge_tax, 
            IF(st.item_wise_tax = TRUE, TRUE, FALSE) as item_wise_tax, 
            IF(st.item_price_including_tax = TRUE, TRUE, FALSE) as item_price_including_tax, 
            soi.store_item_stock_id, 
            so.cancelled_tax, 
            soi.quantity as itemQuantity 
        FROM sale as s 
        INNER JOIN sale_order as so ON s.id = so.sale_id 
        INNER JOIN store as st ON st.id = so.store_id 
        INNER JOIN sale_order_item as soi ON soi.sale_order_id = so.id 
        WHERE so.id = ? 
        AND soi.id = ?;
    `;

    const storeDetailsQueryParams = [event.saleOrderId, event.saleOrderItemId];

    //var selectQueryResult = await connection.execute(selectQuery);
    let itemTaxQuery = `
    SELECT 
        sis.id as storeItemStockId, 
        sis.item_price, 
        tg.id as taxGroupId, 
        tg.group_name as taxGroupName, 
        tg.tax_percentage as taxGroupPercentage, 
        GROUP_CONCAT(tgd.tax_name) as taxName, 
        GROUP_CONCAT(tgd.tax_percentage) as taxPercentage, 
        GROUP_CONCAT(tgd.id) as taxGroupdetailsId, 
        itgd.item_id as itemId 
    FROM tax_group as tg 
    INNER JOIN tax_group_details as tgd ON tg.id = tgd.tax_group_id 
    INNER JOIN item_tax_group_details as itgd ON tg.id = itgd.tax_group_id 
    INNER JOIN store_item_stock as sis ON sis.item_id = itgd.item_id 
    INNER JOIN sale_order_item as soi ON soi.store_item_stock_id = sis.id 
    WHERE tg.is_active = TRUE 
    AND tgd.is_active = TRUE 
    AND soi.id IN (?) 
    GROUP BY soi.id;
`;

    const itemTaxQueryParams = [event.saleOrderItemId];

    const allparams = [...taxQryParams, ...updateSaleOrderItemStatusQueryParams, ...selectQueryParams, ...saleQryParams, ...storeDetailsQueryParams, ...itemTaxQueryParams];

    await queryExecution.queryExecution(client, jsonObj, event, taxQry + updateSaleOrderItemStatusQuery + selectQuery + saleQry + storeDetailsQuery + itemTaxQuery, allparams, async function (response) {
        if (response.success == '0') {
            callback(response);
        }
        TaxQueryResult = response.result[0]
        let itemTaxQueryResult = []
        console.log("response.result[0]............", response.result[0])
        console.log("response.result[1]............", response.result[1])
        console.log("response.result[2]............", response.result[2])
        console.log("response.result[4]............", response.result[4])
        console.log("response.result[5]............", response.result[5])
        console.log("response.result[6]............", response.result[6])
        itemTaxQueryResult = response.result[6]
        let updateSaleOrderItemStatusQueryResult = response.result
        let selectQueryResult = response.result[3]
        let storeDetailsQueryResult = response.result[5]
        console.log("storeDetailsQueryResult.........", storeDetailsQueryResult)
        var taxTotal = 0;
        let ondcJson = JSON.parse(selectQueryResult[0].ondc_json)
        let data = ondcJson.message.order.payment
        //data = JSON.parse(data.message)
        console.log("data.......", ondcJson.message.order.payment)
        const fee = data["@ondc/org/buyer_app_finder_fee_amount"];
        console.log("feeeeeeeeeeeeeeeee", fee);
        if (updateSaleOrderItemStatusQueryResult[2].length > 0) {
            if (updateSaleOrderItemStatusQueryResult[2][0].totalAmount > 0) {

                if (storeDetailsQueryResult[0].item_wise_tax != true) {
                    //-------------------TAX start---------------------------

                    for (var m = 0; m < TaxQueryResult.length; m++) {

                        var taxAmount = 0;

                        if (TaxQueryResult[m].applyTax != "" && TaxQueryResult[m].applyTax != null) {
                            taxAmount = (updateSaleOrderItemStatusQueryResult[2][0].totalAmount / 100) * TaxQueryResult[m].applyTaxPercentage
                            taxAmount = (taxAmount / 100) * TaxQueryResult[m].taxPercentage
                        }
                        else {
                            taxAmount = (updateSaleOrderItemStatusQueryResult[2][0].totalAmount / 100) * TaxQueryResult[m].taxPercentage
                        }

                        console.log("taxAmount................", taxAmount)
                        taxTotal = taxTotal + parseFloat(taxAmount)
                    }

                    console.log("taxTotal...............", taxTotal)

                    //--------------------------TAX end----------------------------------------
                }

                if (storeDetailsQueryResult[0].item_wise_tax == true) {

                    console.log("itemTaxQueryResult........", itemTaxQueryResult)
                    //itemTaxQueryResult = itemTaxQueryResult[0] ? itemTaxQueryResult[0] : []

                    if (itemTaxQueryResult.length > 0) {
                        for (let s = 0; s < itemTaxQueryResult.length; s++) {
                            if (storeDetailsQueryResult[0].store_item_stock_id == itemTaxQueryResult[s].storeItemStockId) {
                                let itemTaxAmount = (parseFloat(itemTaxQueryResult[s].item_price) / 100) * itemTaxQueryResult[s].taxGroupPercentage
                                let itemsId = itemTaxQueryResult[s].storeItemStockId
                                itemTaxAmount = itemTaxAmount * storeDetailsQueryResult[0].itemQuantity
                                console.log("itemTaxAmount....................", itemTaxAmount)
                                taxTotal = taxTotal ? (parseFloat(taxTotal) + parseFloat(itemTaxAmount)) : itemTaxAmount
                                console.log("cancelllllllllllltaxTotal....................", taxTotal)
                                // breakupArray.push({
                                //     "@ondc/org/item_id": itemsId,
                                //     "title": "Item Tax",
                                //     "@ondc/org/title_type": "tax",
                                //     "price": {
                                //         "currency": "INR",
                                //         "value": itemTaxAmount.toFixed(2).toString()
                                //     }
                                // })
                            }

                        }

                    }
                    if (storeDetailsQueryResult[0].cancelled_tax) {
                        taxTotal = taxTotal + parseFloat((storeDetailsQueryResult[0].cancelled_tax))
                    }

                }
                console.log("canceltaxTotal..........", taxTotal)



                let buyerFee = (parseFloat(updateSaleOrderItemStatusQueryResult[2][0].totalAmount) / 100) * fee
                let updateSaleOrderCancelledTotalQuery = `
                    UPDATE sale_order 
                    SET 
                        cancelled_total = ?, 
                        cancelled_convenience_fee = ?, 
                        cancelled_tax = ? 
                    WHERE id = ?;
                `;

                let updateSaleOrderCancelledTotalParams = [
                    updateSaleOrderItemStatusQueryResult[2][0].totalAmount,
                    buyerFee,
                    taxTotal,
                    event.saleOrderId
                ];

                let updateSaleCancelledTotalQuery = `
                    UPDATE sale 
                    SET 
                        cancelled_total = ?, 
                        cancelled_convenience_fee = ?, 
                        cancelled_tax = ? 
                    WHERE id = ?;
                `;

                let updateSaleCancelledTotalParams = [
                    updateSaleOrderItemStatusQueryResult[2][0].totalAmount,
                    buyerFee,
                    taxTotal,
                    event.saleId
                ];

                let updateSaleOrderStatusQry = "";
                let updateSaleOrderStatusQryParams = [];
                let insertSaleOrderStatusqry = "";
                let insertSaleOrderStatusqryParams = [];
                console.log("response.result[4][0].totalCancelledCount.............", response.result[4][0].totalCancelledCount)
                if (response.result[4][0].totalCount == response.result[4][0].totalCancelledCount) {
                    updateSaleOrderCancelledTotalQuery = `
                        UPDATE sale_order 
                        SET 
                            order_status_id = 5, 
                            cancelled_total = ?, 
                            cancelled_convenience_fee = ?, 
                            cancelled_tax = ? 
                        WHERE id = ?;
                    `;

                    updateSaleOrderCancelledTotalParams = [
                        updateSaleOrderItemStatusQueryResult[2][0].totalAmount,
                        buyerFee,
                        taxTotal,
                        event.saleOrderId
                    ];

                    updateSaleCancelledTotalQuery = `
                        UPDATE sale 
                        SET 
                            ondc_fullfillment_states_id = 7, 
                            cancelled_total = ?, 
                            cancelled_convenience_fee = ?, 
                            cancelled_tax = ? 
                        WHERE id = ?;
                    `;

                    updateSaleCancelledTotalParams = [
                        updateSaleOrderItemStatusQueryResult[2][0].totalAmount,
                        buyerFee,
                        taxTotal,
                        event.saleId
                    ];

                    updateSaleOrderStatusQry = `
                        UPDATE sale_order_status 
                        SET is_current_status = FALSE 
                        WHERE sale_order_id = ?;
                    `;

                    updateSaleOrderStatusQryParams = [event.saleOrderId];

                    insertSaleOrderStatusqry = `
                        INSERT INTO sale_order_status 
                        (created_by, created_on, is_active, is_current_status, order_status_id, sale_order_id, status_date) 
                        VALUES (?, CONVERT_TZ(now(), '+00:00', ?), TRUE, TRUE, 5, ?, CONVERT_TZ(now(), '+00:00', ?));
                    `;

                    insertSaleOrderStatusqryParams = [
                        event.userId,
                        event.timeZone,
                        event.saleOrderId,
                        event.timeZone
                    ];

                }
                console.log("updateSaleOrderCancelledTotalQuery + updateSaleCancelledTotalQuery...........", updateSaleOrderCancelledTotalQuery + updateSaleCancelledTotalQuery + updateSaleOrderStatusQry + insertSaleOrderStatusqry);
                const allparams1 = [updateSaleOrderCancelledTotalParams, updateSaleCancelledTotalParams, updateSaleOrderStatusQryParams, insertSaleOrderStatusqryParams];

                await queryExecution.queryExecution(client, jsonObj, event, updateSaleOrderCancelledTotalQuery + updateSaleCancelledTotalQuery + updateSaleOrderStatusQry + insertSaleOrderStatusqry, allparams1, async function (responseData) {
                    let responses = {
                        "success": "1",
                        "successMessage": "Success",
                        "errorMessage": ""
                    }
                    event.orderId = event.saleOrderId
                    await ondcUpdateCall.ondcUpdateCall(client, event, event, queryExecution, function (response2) {
                        console.log("response2.................", response2)
                        if (response2.success == '0') {
                            callback(response);
                        }

                        callback(responses)
                    })
                    //callback(responses)
                })

            }
        }

    });
}
methods.ondcRaiseIssueCountSummeryReport = function (client, jsonObj, event, queryExecution, callback) {



    let totalCountQry = " select count(*) as totalCount from (select igm.id from ondc_IGM as igm " +
        " inner join ondc_IGM_category as oic on igm.category_id=oic.id " +
        " inner join ondc_IGM_subcategory as ois on igm.sub_category_id=ois.id " +
        " inner join sale as s on s.ondc_order_number=igm.ondc_order_number " +
        " inner join sale_order as so on so.sale_id=s.id  group by igm.ondc_issue_id ) as a"

    let totalResolvedCountQry = " select count(*) as totalCount from (select igm.id from ondc_IGM as igm " +
        " inner join ondc_IGM_category as oic on igm.category_id=oic.id " +
        " inner join ondc_IGM_subcategory as ois on igm.sub_category_id=ois.id " +
        " inner join sale as s on s.ondc_order_number=igm.ondc_order_number " +
        " inner join sale_order as so on so.sale_id=s.id WHERE igm.issue_status_id=17  group by igm.ondc_issue_id ) as a"

    let totalUnResolvedCountQry = " select count(*) as totalCount from (select igm.id from ondc_IGM as igm " +
        " inner join ondc_IGM_category as oic on igm.category_id=oic.id " +
        " inner join ondc_IGM_subcategory as ois on igm.sub_category_id=ois.id " +
        " inner join sale as s on s.ondc_order_number=igm.ondc_order_number " +
        " inner join sale_order as so on so.sale_id=s.id WHERE igm.issue_status_id!=17  group by igm.ondc_issue_id ) as a"

    queryExecution.queryExecution(client, jsonObj, event, totalCountQry + ";" + totalResolvedCountQry + ";" + totalUnResolvedCountQry, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;

        console.log("results........", results)

        let countResult = {
            buyerIssuesRaisedTotalCount: results[0][0].totalCount,
            buyerIssuesResolvedTotalCount: results[1][0].totalCount,
            buyerIssuesUnResolvedTotalCount: results[2][0].totalCount
        }
        console.log("countResult........", countResult)


        let responseData = {
            "success": "1",
            "successMessage": "Success",
            "results": countResult,
            "errorMessage": ""
        }
        callback(responseData)
    });
}


module.exports = methods;
