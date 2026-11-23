const methods = {};
let queryExecution = require('../queryExecution');
methods.getRestItemTaxGroupDetails = function (client, jsonObj, event, callback) {
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
            whereQuery = whereQuery + " and tg.group_name like ?";
            whereQueryParams.push('%' + event.searchInput.trim() + '%');
        }

    }
    if (event.itemTaxGroupDetailsId) {
        whereQuery = whereQuery + " and itgd.id= ? ";
        whereQueryParams.push(event.itemTaxGroupDetailsId);
    }


    let itemTaxGroupDetailsQuery = "SELECT " +
        " i.id as itemId,i.name as itemName, " +
        " rs.id as spiceId,rs.name as spiceName, " +
        " sis.id as rtStoreItemSizeId, " +
        " group_concat(siz.id )as itemSizeId,group_concat(siz.name) as itemSizeName, " +
        " c.id as courseId,c.name as courseName , " +
        " ct.id as courseTypeId ,ct.name as courseTypeName,  " +
        " cu.id as cuisineId ,cu.name as cuisineName,  " +
        " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value  " +
        " FROM configuration WHERE config_key = 'bucketSubFolder'),'/',(SELECT  config_value FROM configuration  " +
        " WHERE config_key = 's3PathRestaurant'),'/',i.image) as itemImg , " +
        " itgd.id as itemTaxGroupDetailsId,tg.id as taxGroupId,tg.group_name as taxGroupName " +
        " FROM rt_store_item AS i  " +
        " INNER JOIN rt_spice  rs on rs.id=i.rt_spice_id and rs.is_active=true " +
        " INNER JOIN rt_store_item_size sis on sis.rt_store_item_id=i.id and sis.is_active=true " +
        " INNER JOIN  rt_item_size siz on sis.rt_item_size_id=siz.id and siz.is_active=true " +
        " INNER JOIN rt_course_type as ct  on ct.id = i.rt_course_type_id  " +
        " INNER JOIN rt_course as c on c.id = i.rt_course_id  " +
        " INNER join rt_cuisine as cu on i.rt_cuisine_id = cu.id and cu.is_active = true " +
        "  LEFT JOIN rt_store_item_tax_group_details AS itgd ON i.id = itgd.rt_item_id " +
        "  LEFT JOIN tax_group as tg on tg.id=itgd.tax_group_id " +
        " WHERE i.is_active is true " + whereQuery + " group by i.id " + limitQuery + ";"

    let itemTaxGroupDetailsCountQuery = "select count(*) AS totCount from(SELECT " +
        " count(*) " +
        " FROM rt_store_item AS i " +
        " INNER JOIN rt_spice  rs on rs.id=i.rt_spice_id and rs.is_active=true " +
        " INNER JOIN rt_store_item_size sis on sis.rt_store_item_id=i.id and sis.is_active=true " +
        " INNER JOIN  rt_item_size siz on sis.rt_item_size_id=siz.id and siz.is_active=true " +
        " INNER JOIN rt_course_type as ct  on ct.id = i.rt_course_type_id  " +
        " INNER JOIN rt_course as c on c.id = i.rt_course_id  " +
        " INNER join rt_cuisine as cu on i.rt_cuisine_id = cu.id and cu.is_active = true " +
        " LEFT JOIN rt_store_item_tax_group_details AS itgd ON i.id = itgd.rt_item_id " +
        " LEFT JOIN tax_group as tg on tg.id=itgd.tax_group_id " +
        " WHERE i.is_active is true " + whereQuery + " group by i.id ) AS tot;"


    console.log(itemTaxGroupDetailsQuery + "........", itemTaxGroupDetailsCountQuery)
    console.log("1........", new Date().getSeconds())

    queryExecution.queryExecution(client, jsonObj, event, itemTaxGroupDetailsQuery + itemTaxGroupDetailsCountQuery, [...whereQueryParams, ...limitQueryParams, ...whereQueryParams], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let Result = response.result;
        let itemTaxGroupResult = Result[0]
        let itemTaxGroupTotalCount = Result[1]

        const responseData = {
            success: "1",
            result: {
                "itemTaxGroupDetails": itemTaxGroupResult,
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