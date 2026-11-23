let methods = {};
let queryExecution = require('../queryExecution');
methods.notMappedList =function (client,jsonObj,event, callback) {
        let wquery = "";
        let offset = event.offset ? event.offset : 0
        let max = event.max ? event.max : 10
        let wqueryValues = []
		const removeQuotes = (str) => {
			return str.split("'").join('');
				};
        if(event.selectType =="1" ){
		    wquery = wquery +   " and si.category like ? "
            wqueryValues.push(removeQuotes("'%"+event.selectInput+"%'"))
		}
		if(event.selectType == "2" ){
			wquery = wquery + " and si.seller_item_code like ? "
            wqueryValues.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		if(event.selectType == "3" ){
			wquery = wquery + " and si.seller_item_name like ? "
            wqueryValues.push(removeQuotes("'%"+event.selectInput+"%'"))

		}
		
		
         let query= " SELECT si.`category` AS category,si.`seller_item_code` AS sellerItemCode,si.`bar_code` AS barCode,si.`seller_item_name` AS sellerItemName,si.`seller_item_id` AS sellerItemId " +
					" FROM seller_item_list  AS si " +
					" WHERE seller_id = ? AND seller_item_status = 'N' "+wquery+
					" LIMIT ?,? ;"+
					
					" select count(*) as totalCount " +
    				 " FROM seller_item_list  AS si " +
    				 " WHERE seller_id =? AND seller_item_status = 'N' "+wquery+";"+
    				 
    				  " select count(*) as totalCount " +
    				" FROM seller_item_list  AS si " +
    				" WHERE seller_id = ? AND seller_item_status = 'E' "+wquery+";"+ 
    				
    				" select count(*) as totalCount " +
    				" FROM seller_item_list  AS si " +
    				" WHERE seller_id = ? AND seller_item_status = 'P' "+wquery+";"+
    				 
    				" select count(*) as totalCount "+
                    " FROM seller_item_list  AS si "+
                    " INNER JOIN seller_item as s on si.seller_item_id = s.id and s.seller_id = ?"+
                    " WHERE s.seller_id = ? AND s.auto_map_status = 'S' "+wquery+";"
                let val = [event.sellerId,...wqueryValues,parseInt(offset),parseInt(max),event.sellerId,...wqueryValues,event.sellerId,...wqueryValues,event.sellerId,...wqueryValues,event.sellerId,event.sellerId,...wqueryValues]
    	queryExecution.queryExecution(client, jsonObj, event, query,val, function (response) {
            if (response.success == '0') {
                callback(response);
            }
            else{
                const responseData = {
                    success: "1",
                    result: {
                        "result": response.result[0],
                        "totalCount": response.result[1][0].totalCount,
                        "partiallyMapped": response.result[3][0].totalCount,
		                "exactMapped": response.result[2][0].totalCount,
		                "notMapped": response.result[1][0].totalCount,
		                "autoMapped": response.result[4][0].totalCount,
                    },
                    errorMessage: "",
                    successMessage: "Success"
                };
                callback(responseData);
            }
        })
   
}
module.exports = methods;