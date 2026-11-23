const methods = {};
let queryExecution = require('../queryExecution');
methods.getTaxGroupDetails = function (client, jsonObj, event, callback) {
    let subQuery = "";
    let subQueryParams = [];
    let offset = event.offset;
    let max = event.max;
    if (event.listingType) {
        if (event.listingType == "allActive") {
            subQuery = "where tg.is_active =true"
        }
    }
    if (event.txtSearchInput) {
        if (subQuery == "") {
            subQuery = " where tg.group_name= ? ";
            subQueryParams.push(event.txtSearchInput.trim());
        }
        else {
            subQuery = subQuery + " and tg.group_name= ? ";
            subQueryParams.push(event.txtSearchInput.trim());
        }
    }


    let taxGroupQuery = "select tg.id as groupId,tg.group_name,if(tg.is_active is true,true,false) as taxIsActive,tg.tax_percentage as taxGroupPercentage from tax_group as tg " + subQuery + ";"
    // let taxGroupDetailsQuery = "select ifnull(tg.id,'') as taxGroupId,ifnull(tg.group_name,'') as taxGroupName,if(tgd.is_active is true,true,false) as groupIsActive, " +
    //     " ifnull(tgd.tax_name,'') as taxName,ifnull(tgd.tax_percentage,'') as taxPercentage,ifnull(tgd.id,'') as taxGroupdetailsId " +
    //     " from tax_group as tg " +
    //     " inner join tax_group_details as tgd on tg.id=tgd.tax_group_id where tg.is_active = true ;"
    let taxGroupDetailsQuery = "select ifnull(tg.id,'') as taxGroupId,ifnull(tg.group_name,'') as taxGroupName,if(tgd.is_active is true,true,false) as groupIsActive, " +
        " ifnull(tgd.tax_name,'') as taxName,ifnull(tgd.tax_percentage,'') as taxPercentage,ifnull(tgd.id,'') as taxGroupdetailsId " +
        " from tax_group as tg " +
        " inner join tax_group_details as tgd on tg.id=tgd.tax_group_id " + subQuery + " ;"

    //console.log(taxGroupQuery + taxGroupDetailsQuery)
    //let result = await connection.query(taxGroupQuery + taxGroupDetailsQuery)


    queryExecution.queryExecution(client, jsonObj, event, taxGroupQuery + taxGroupDetailsQuery, [...subQueryParams, ...subQueryParams], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        let Result = response.result;
        let groupResult = Result[0]
        let groupDetailsResult = Result[1]
        for (let i = 0; i < groupResult.length; i++) {

            let GroupDetailsArray = [];
            for (let j = 0; j < groupDetailsResult.length; j++) {

                if (groupResult[i].groupId == groupDetailsResult[j].taxGroupId) {
                    console.log("333")
                    GroupDetailsArray.push({
                        groupId: groupDetailsResult[j].taxGroupdetailsId,
                        taxName: groupDetailsResult[j].taxName,
                        taxPercentage: groupDetailsResult[j].taxPercentage,
                        is_active: groupDetailsResult[j].groupIsActive

                    });
                }
            }
            console.log("444")
            groupResult[i].groupDetails = GroupDetailsArray

        }
        const responseData = {
            success: "1",
            result: {
                "groupResult": groupResult

            },
            errorMessage: "",
            successMessage: "Success"
        };
        callback(responseData);
    });
}
module.exports = methods;