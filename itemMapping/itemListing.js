let methods = {};
let queryExecution = require('../queryExecution');
methods.itemListing =function (client,jsonObj,event, callback) {
    let subQuery = ""    
    let subQueryvalues = []
    const removeQuotes = (str) => {
        return str.split("'").join('');
            };
    if(event.searchKey=='itemName'){
        subQuery = subQuery+" and i.name like ? "
        subQueryvalues.push(removeQuotes("'"+event.searchValue+"%'"))
    }
    else if(event.searchKey=='categoryLevel1Name'){
        subQuery = subQuery+" and cl1.name like ? "
        subQueryvalues.push(removeQuotes("'"+event.searchValue+"%'"))

    }
    else if(event.searchKey=='categoryLeve21Name'){
        subQuery = subQuery+" and cl2.name like ?"
        subQueryvalues.push(removeQuotes("'"+event.searchValue+"%'"))

    }
    else if(event.searchKey=='categoryLeve31Name'){
        subQuery = subQuery+" and cl3.name like ?"
        subQueryvalues.push(removeQuotes("'"+event.searchValue+"%'"))

    }
    else if(event.searchKey=='brandName'){
        subQuery = subQuery+" and b.name like ? "
        subQueryvalues.push(removeQuotes("'"+event.searchValue+"%'"))

    }
    if(event.isWrongData){
        subQuery = subQuery+" and i.isWrongData = ? "
        subQueryvalues.push(removeQuotes("'"+event.searchValue+"%'"))

    }
    let query = " select i.id as itemId, i.brand_id as brandId, i.category_level1_id as categorylevel1Id, "+
                " i.category_level2_id as categoryLevel2Id, i.category_level3_id as categoryLevel3Id,  "+
                " i.description as description, i.logo_path as logoPath, i.logo_path_thumb as logoPathThumb, "+ 
                " i.name as itemName, i.pack_id as packId, i.search_names as searchNames, i.denomination as denomination, "+ 
                " if(i.is_loose_item is true,true,false) isLooseItem, i.variation as variation, cl1.name as categoryLevel1Name,  "+
                " cl2.name as categoryLevel2Name, cl3.name as categoryLevel3Name, p.name as packName, p.unit as packUnit,  "+
                " p.unit_type as packUnitType, b.name as brandName, if(i.isWrongData is true,true,false) as isWrongData "+
                " from item as i "+
                " inner join category_level1 as cl1 on i.category_level1_id = cl1.id "+
                " inner join category_level2 as cl2 on i.category_level2_id = cl2.id "+
                " inner join pack as p on i.pack_id = p.id "+
                " left join category_level3 as cl3 on i.category_level3_id = cl3.id  "+
                " left join brand as b on i.brand_id = b.id  "+
                " where i.id is not null "+subQuery+
                " limit ?,?;"+
                
                " select CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath')  "+
                " ,'/',(SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
                " (SELECT config_value FROM configuration WHERE config_key = 'itemImagesFolder'),'/') as imagePath; "
	queryExecution.queryExecution(client, jsonObj, event, query,[...subQueryvalues,parseInt(event.offset),parseInt(event.max)], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        else{
            const responseData = {
                success: "1",
                result: {
                    "itemList": response.result[0],
                    "imagePath": response.result[1]
                },
                errorMessage: "",
                successMessage: "Success"
            };
            callback(responseData);
        }
    })
   
}


methods.statusChange =function (client,jsonObj,event, callback) {
    const queryExecution = require('../queryExecution');
const methods = {};
methods.changeSellerItemStatus = function(client, jsonObj, event, callback) {
    let subQuery = ""
    let successMessage = ""
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
        let subQueryValues = []
    if (event.isActive) {
        successMessage = event.isActive == "true" ? "Activated successfully." : "Deactivated successfully.";
        event.isActive = event.isActive == "true" ? true : false;
        subQuery = " is_active = ?"  
        subQueryValues.push(event.isActive)
    } else if (event.isApproved) {
        successMessage = event.isApproved == "true" ? "Approved successfully." : "Unapproved successfully.";
        event.isApproved = event.isApproved == "true" ? true : false;
        subQuery = " is_approved = ? "  
        subQueryValues.push(event.isApproved)

    }
    let updateQuery = " UPDATE seller_item SET " + subQuery + ", modified_by = ?, modified_on = CONVERT_TZ (now(), '+00:00',?) where id = ?; "
    queryExecution.queryExecution(client, jsonObj, event, updateQuery,[...subQueryValues,event.userId,event.timeZone,event.sellerItemId], function(response) {
        if (response.success == '0') {
            callback(response);
        } else {
            response.result = []
            response.successMessage = successMessage
            callback(response);
        }
    });
}
methods.changeStoreItemStockStatus = function(client, jsonObj, event, callback) {
    let subQuery = ""
    let successMessage = ""
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
        let subQueryVal = []
    if (event.isActive) {
        successMessage = event.isActive == "true" ? "Activated successfully." : "Deactivated successfully.";
        event.isActive = event.isActive == "true" ? true : false;
        subQuery = " is_active = ? "  
        subQueryVal.push(event.isActive)
    }
    let updateQuery = " UPDATE store_item_stock SET " + subQuery + ", modified_by = ?, modified_on = CONVERT_TZ (now(), '+00:00',?) where id = ?; "
    queryExecution.queryExecution(client, jsonObj, event, updateQuery,[...subQueryVal,event.userId,event.timeZone,event.storeItemStockId], function(response) {
        if (response.success == '0') {
            callback(response);
        } else {
            response.successMessage = successMessage
            response.result = []
            callback(response);
        }
    });
}
module.exports = methods;
    let query = " update item set isWrongData = ?, modified_on = CONVERT_TZ (now(), '+00:00',?), modified_by = ? where id = ?;"
	queryExecution.queryExecution(client, jsonObj, event, query,[event.isWrongData,event.timeZone,event.userId,event.itemId], function (response) {
        if (response.success == '0') {
            callback(response);
        }
        else{
            const responseData = {
                success: "1",
                result: {},
                errorMessage: "",
                successMessage: "Success"
            };
            callback(responseData);
        }
    })
   
}
module.exports = methods;