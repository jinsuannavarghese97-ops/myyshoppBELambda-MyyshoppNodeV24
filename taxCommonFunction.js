var methods = {};
const mysql = require('mysql');
let queryExecution = require('../queryExecution'); 
methods.taxCommonFunction = async function(client, jsonObj, event, callback, orderId) {

    console.log("enterrrrrrrrrrrrrrrrr")
    let taxData = []
    let taxHeadings = [{
        "name": "Tax %"
    }, {
        "name": "Tax Amount"
    }]

    let taxNameQuery = " SELECT GROUP_CONCAT(DISTINCT soit.`tax_name`) " +
        " FROM `sale_order_item_tax_details` AS soit " +
        " INNER JOIN `sale_order_item` AS soi ON soit.`sale_order_item_id` = soi.id " +
        " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
        " WHERE so.id =  " + orderId +
        " GROUP BY so.id ;" +


        " SELECT soi.id AS saleOrderItemId,soi.`tax_group_id` AS taxGroupId,soi.`group_percentage` AS taxGroupPercentage, " +
        " soi.`group_name` AS taxGroupName,SUM(soit.`tax_amount`) AS groupTotal " +
        " FROM `sale_order_item_tax_details` AS soit " +
        " INNER JOIN `sale_order_item` AS soi ON soit.`sale_order_item_id` = soi.id " +
        " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
        " WHERE so.id = " + orderId +
        " GROUP BY soi.`tax_group_id` " +
        " ORDER BY soi.`group_percentage` ;" +

        " SELECT soi.`tax_group_id` AS taxGroupId,soi.`group_percentage` AS taxGroupPercentage, " +
        " GROUP_CONCAT(DISTINCT soit.`tax_name`) AS taxName,SUM(soit.`tax_amount`) AS taxAmount, " +
        " GROUP_CONCAT(DISTINCT soit.`tax_percentage`) AS taxPercentage,soi.`tax_group_id` AS taxGroupId " +
        " FROM `sale_order_item_tax_details` AS soit " +
        " INNER JOIN `sale_order_item` AS soi ON soit.`sale_order_item_id` = soi.id " +
        " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
        " WHERE so.id = " + orderId +
        " GROUP BY soi.`tax_group_id`,soit.`tax_name` ;"
    //let queryString = taxNameQuery + taxGroupQuery + taxDetailsQuery
    //console.log(taxNameQuery + taxGroupQuery + taxDetailsQuery);



    await queryExecution.queryExecution(client, jsonObj, event, taxNameQuery,[], async function(response) {
        console.log("response............................", response)
        if (response.success == '0') {
            callback(response);
        }

        let results = response.result;
        console.log("results...............", results)
        let taxName = results[0] ? results[0] : []
        let taxResult = results[1] ? results[1] : []
        let taxDetailResult = results[2] ? results[2] : []


        for (var i = 0; i < taxName.length; i++) {
            taxHeadings[taxHeadings.length] = {
                "name": taxName[i]
            }
        }
        let taxDetails = []
        for (var i = 0; i < taxResult.length; i++) {
            taxDetails[i] = {
                taxPercentage: taxResult[i].taxGroupPercentage,
                taxAmount: taxResult[i].groupTotal,
                taxName: taxResult[i].taxGroupName
            }
            let taxSubDetails = []
            let taxSubDetailsCount = 0
            for (var j = 0; j < parseInt(taxName.length); j++) {
                var newArray = taxDetailResult.filter(function(el) {
                    return taxName[j] == el.taxName && el.taxGroupId == taxResult[i].taxGroupId;
                });
                if (newArray.length > 0) {
                    taxSubDetails[taxSubDetailsCount] = newArray[0].taxPercentage + "%"
                    taxSubDetailsCount++;
                    taxSubDetails[taxSubDetailsCount] = newArray[0].taxAmount
                    taxSubDetailsCount++
                }
                else {
                    taxSubDetails[taxSubDetailsCount] = "0%"
                    taxSubDetailsCount++;
                    taxSubDetails[taxSubDetailsCount] = '0'
                    taxSubDetailsCount++
                }
            }
            taxDetails[i].taxSubDetails = taxSubDetails
        }
        taxData.taxHeadings = taxHeadings
        taxData.taxDetails = taxDetails
        console.log("taxData...", taxData)
        return taxData;


    })
}

module.exports = methods;
