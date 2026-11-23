let methods = {};
let queryExecution = require('../queryExecution');
methods.getFiles =function (client,jsonObj,event, callback) {
        var wquery = "";
        let offset = event.offset ? event.offset : 0
        let max = event.max ? event.max : 10
        let wqueryValues = []
		const removeQuotes = (str) => {
			return str.split("'").join('');
				};
        if(event.sellerName !== ""){
            wquery = " and s.retail_group_name like ? "
            wqueryValues.push(removeQuotes("'%" +event.sellerName+"%'"))

        }
        if(event.fromDate !== ""){
           wquery = wquery + "  and DATE(si.created_on) >= ? "
           wqueryValues.push(event.fromDate)

        }
        if(event.toDate !== ""){
           wquery = wquery + "  and DATE(si.created_on) <= ? "
           wqueryValues.push(event.toDate)

        }
        let query= " select si.id,date_format(si.created_on,'%d-%M-%Y %I:%i %p') as createdOn,si.seller_id,if(si.is_active,1,0) as is_active,s.retail_group_name,"+
                    " CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/', "+
    				" (SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/',  "+
    				" (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', "+
    				" (SELECT config_value FROM configuration WHERE config_key = 'csvFileFolderBackup'),'/',si.file_name) AS s3fileName,si.file_name "+
    				" FROM seller_item_import_status AS si    INNER JOIN seller as s ON s.id = si.seller_id  WHERE si.id != 0 " +wquery+
    				" order by si.created_on desc LIMIT ?,? ;"+
    				" select count(*) as totalCount from seller_item_import_status as si "+
					 "   INNER JOIN seller as s ON s.id = si.seller_id  WHERE si.id != " + 0 + wquery+
					 " order by si.created_on desc "
    			
        queryExecution.queryExecution(client, jsonObj, event, query,[...wqueryValues,parseInt(offset),parseInt(max),...wqueryValues], function (response) {
            if (response.success == '0') {
                callback(response);
            }
            else{
                const responseData = {
                    success: "1",
                    result: {
                        "result": response.result[0],
                        "totalCount": response.result[1][0].totalCount
                    },
                    errorMessage: "",
                    successMessage: "Success"
                };
                callback(responseData);
            }
        })
   
}
module.exports = methods;