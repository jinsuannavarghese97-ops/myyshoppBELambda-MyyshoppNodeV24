const methods = {};
let queryExecution = require('../queryExecution');
methods.getItemTaxGroupDetails = function (client, jsonObj, event, callback) {


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
            whereQuery = whereQuery + " and i.name like ?";
            whereQueryParams.push('%' + event.searchInput.trim() + '%');
        }
        if (event.searchColName == 'tax_group_name') {
            whereQuery = whereQuery + " and tg.group_name like  ?";
            whereQueryParams.push('%' + event.searchInput.trim() + '%');
        }
        if (event.searchColName == 'brand_name') {
            whereQuery = whereQuery + " and b.namelike ?";
            whereQueryParams.push('%' + event.searchInput.trim() + '%');
        }
    }


    let itemTaxGroupDetailsQuery = "SELECT itgd.id as itemTaxGroupDetailsId,tg.id as taxGroupId,tg.group_name as groupName,tg.tax_percentage as taxGroupPercentage, " +
        //  " GROUP_CONCAT(tgd.id SEPARATOR ',') AS taxGroupDetailsId,GROUP_CONCAT(tgd.tax_name SEPARATOR ',') AS taxGroupDetailsTaxName,GROUP_CONCAT(tgd.tax_percentage SEPARATOR ',') AS taxGroupDetailsTaxPercentage, " +
        " i.id as itemId,i.name as itemName,i.brand_id as brandId,b.name as brandName ,i.pack_id as packId ,p.name as packName, " +
        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value " +
        "  FROM configuration WHERE config_key = 'bucketSubFolder'),'/',(SELECT  config_value FROM configuration " +
        " WHERE config_key = 'itemImagesFolder'),'/',i.logo_path_thumb) as itemImg " +
        // " FROM item_tax_group_details as itgd " +
        " FROM item AS i " +
        " LEFT JOIN item_tax_group_details AS itgd ON i.id = itgd.item_id" +
        " LEFT JOIN tax_group as tg on tg.id=itgd.tax_group_id " +
        // " LEFT JOIN tax_group_details as tgd on tgd.tax_group_id=tg.id AND tgd.is_active=true " +
        // " INNER JOIN item as i on i.id=itgd.item_id " +
        " LEFT JOIN brand as b on b.id = i.brand_id " +
        " LEFT JOIN pack as p on p.id = i.pack_id " +
        " WHERE i.is_active is true " +
        whereQuery + limitQuery + ";"
    // whereQuery + " GROUP BY i.id ORDER BY itgd.id DESC " + limitQuery + ";"

    let itemTaxGroupDetailsCountQuery = "select count(*) AS totCount from(SELECT count(*) " +
        // " FROM item_tax_group_details as itgd " +
        " FROM item AS i " +
        " LEFT JOIN item_tax_group_details AS itgd ON i.id = itgd.item_id " +
        " LEFT JOIN tax_group as tg on tg.id=itgd.tax_group_id " +
        // " LEFT JOIN tax_group_details as tgd on tgd.tax_group_id=tg.id AND tgd.is_active=true " +
        // " INNER JOIN item as i on i.id=itgd.item_id " +
        " LEFT JOIN brand as b on b.id = i.brand_id " +
        " LEFT JOIN pack as p on p.id = i.pack_id " +
        " WHERE i.is_active is true " +
        whereQuery + " GROUP BY i.id ) AS tot;"


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
        if (itemTaxGroupResult.length > 0) {
            console.log("........", itemTaxGroupTotalCount[0].totCount)
            console.log("2........", new Date().getSeconds())
            for (let i = 0; i < itemTaxGroupResult.length; i++) {
                itemTaxGroupDetails = {
                    itemTaxGroupDetailsId: itemTaxGroupResult[i].itemTaxGroupDetailsId,
                    itemId: itemTaxGroupResult[i].itemId,
                    itemName: itemTaxGroupResult[i].itemName,
                    brandId: itemTaxGroupResult[i].brandId,
                    brandName: itemTaxGroupResult[i].brandName,
                    packId: itemTaxGroupResult[i].packId,
                    packName: itemTaxGroupResult[i].packName,
                    itemImg: itemTaxGroupResult[i].itemImg,
                    taxGroupId: itemTaxGroupResult[i].taxGroupId,
                    groupName: itemTaxGroupResult[i].groupName,
                    taxGroupPercentage: itemTaxGroupResult[i].taxGroupPercentage

                }
                // let taxGroupDetailsArray = [];
                // let taxGroupDetailsId = itemTaxGroupResult[i].taxGroupDetailsId.split(',');
                // let taxGroupDetailsTaxName = itemTaxGroupResult[i].taxGroupDetailsTaxName.split(',');
                // let taxGroupDetailsTaxPercentage = itemTaxGroupResult[i].taxGroupDetailsTaxPercentage.split(',');

                // for (let j = 0; j < taxGroupDetailsId.length; j++) {
                //     taxGroupDetailsArray.push({
                //         taxGroupDetailsId: taxGroupDetailsId[j],
                //         taxName: taxGroupDetailsTaxName[j],
                //         taxPercentage: taxGroupDetailsTaxPercentage[j]

                //     });

                // }
                itemTaxGroupArray[i] = itemTaxGroupDetails
                //itemTaxGroupArray[i].taxGroupDetails = taxGroupDetailsArray

            }
        }
        const responseData = {
            success: "1",
            result: {
                "itemTaxGroupDetails": itemTaxGroupArray,
                "totalCount": itemTaxGroupTotalCount[0].totCount

            },
            errorMessage: "",
            successMessage: "Success"
        };
        // console.log("----------------------", responseData)
        callback(responseData);
    });
}
module.exports = methods;