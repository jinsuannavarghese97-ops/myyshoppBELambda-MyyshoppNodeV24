const methods = {};
let queryExecution = require('../queryExecution');
methods.getCommonItemTaxGroupDetails = function (client, jsonObj, event, callback) {


    let whereQuery = "";
    let whereQueryParams = [];
    let offset = 0
    let max = event.max
    let limitQuery = "";
    let limitQueryParams = [];
    if (event.max) {
        if (event.offset) {
            offset = event.offset
        }
        limitQuery = " limit ?,? ";
        limitQueryParams = [parseInt(offset), parseInt(max)];
    }

    if (event.searchColName != "" && event.searchColName != null && event.searchColName != "0") {
        if (event.searchColName == 'item_name') {
            whereQuery = whereQuery + " and ci.name like ?";
            whereQueryParams.push('%' + event.searchInput.trim() + '%');
        }
        if (event.searchColName == 'tax_group_name') {
            whereQuery = whereQuery + " and tg.group_name like ?";
            whereQueryParams.push('%' + event.searchInput.trim() + '%');
        }
        if (event.searchColName == 'brand_name') {
            whereQuery = whereQuery + " and cb.name like ?";
            whereQueryParams.push('%' + event.searchInput.trim() + '%');
        }
    }

    let itemTaxGroupDetailsQuery = " select itgd.id as itemTaxGroupDetailsId,tg.id as taxGroupId,tg.group_name as groupName,tg.tax_percentage as taxGroupPercentage, " +
        " ci.id as itemId,ci.title as title,cim.name as itemMasterName, " +
        " cc1.name as cmCategory1Name,cc2.name as cmCategory2Name,cc3.name as cmCategory3name, " +
        " cb.name as cmBrandName, ct.name as cmTypeName " +
        " FROM cm_item AS ci " +
        " INNER JOIN cm_item_master as cim on cim.id=ci.cm_item_master_id " +
        " LEFT JOIN cm_category1 as cc1 on cc1.id=cim.cm_category1_id " +
        " LEFT JOIN cm_category2 as cc2 on cc2.id=cim.cm_category2_id " +
        " LEFT JOIN cm_category3 as cc3 on cc3.id=cim.cm_category3_id " +
        " LEFT JOIN cm_brand as cb on cb.id=cim.cm_brand_id " +
        " LEFT JOIN cm_type as ct on ct.id=cim.cm_type_id " +
        " LEFT JOIN cm_item_tax_group_details AS itgd ON ci.id = itgd.cm_item_id " +
        " LEFT JOIN tax_group as tg on tg.id=itgd.tax_group_id " +
        " WHERE ci.is_active is true" +
        whereQuery + limitQuery + ";"
    // whereQuery + " GROUP BY i.id ORDER BY itgd.id DESC " + limitQuery + ";"

    let itemTaxGroupDetailsCountQuery = "select count(*) AS totCount from(SELECT count(*) " +
        " FROM cm_item AS ci " +
        " INNER JOIN cm_item_master as cim on cim.id=ci.cm_item_master_id " +
        " LEFT JOIN cm_category1 as cc1 on cc1.id=cim.cm_category1_id " +
        " LEFT JOIN cm_category2 as cc2 on cc2.id=cim.cm_category2_id " +
        " LEFT JOIN cm_category3 as cc3 on cc3.id=cim.cm_category3_id " +
        " LEFT JOIN cm_brand as cb on cb.id=cim.cm_brand_id " +
        " LEFT JOIN cm_type as ct on ct.id=cim.cm_type_id " +
        " LEFT JOIN cm_item_tax_group_details AS itgd ON ci.id = itgd.cm_item_id " +
        " LEFT JOIN tax_group as tg on tg.id=itgd.tax_group_id " +
        " WHERE ci.is_active is true" +
        whereQuery + " GROUP BY ci.id ) AS tot;"


    console.log(itemTaxGroupDetailsQuery + "........", itemTaxGroupDetailsCountQuery)
    console.log("1........", new Date().getSeconds())

    queryExecution.queryExecution(client, jsonObj, event, itemTaxGroupDetailsQuery + itemTaxGroupDetailsCountQuery, [...whereQueryParams, ...limitQueryParams, ...whereQueryParams], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let Result = response.result;
        let itemTaxGroupResult = Result[0]
        let itemTaxGroupTotalCount = Result[1]
        let itemTaxGroupArray = []
        let itemTaxGroupDetails = {}

        const responseData = {
            success: "1",
            result: {
                "itemTaxGroupDetails": JSON.parse(JSON.stringify(itemTaxGroupResult).replace(/\:null/gi, "\:\"\"")),
                "totalCount": itemTaxGroupTotalCount[0] ? itemTaxGroupTotalCount[0].totCount : 0

            },
            errorMessage: "",
            successMessage: "Success"
        };
        // console.log("----------------------", responseData)
        callback(responseData);
    });
}
module.exports = methods;