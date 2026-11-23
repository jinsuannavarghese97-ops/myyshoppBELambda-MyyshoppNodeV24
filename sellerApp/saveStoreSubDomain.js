const queryExecution = require('../queryExecution')
const methods = {};

methods.saveStoreSubDomain = function (client, jsonObj, event, callback) {
    event.subDomainUrl = event.subDomainUrl.replace(/'/g, "''")
    let existSubQry = "";
    let existSubQryParams = [];
    if (event.subDomainId) {
        existSubQry = "and id!= ?";
        existSubQryParams.push(event.subDomainId)
    }
    let checkQry = `
        SELECT id 
        FROM site_sub_domain 
        WHERE site_id = ? AND site_url = ? ${existSubQry};
    `;

    let checkQryParams = [
        event.siteId,
        event.subDomainUrl
    ];

    let saveQry = "";
    let saveQryParams = [];
   // console.log("checkQry......",checkQry,checkQryParams,existSubQryParams);
    
    queryExecution.queryExecution(client, "", event, checkQry, [event.siteId,event.subDomainUrl,...existSubQryParams], function (response) {
        //console.log(".........",response)
        //console.log('response.result.........',response)
        if (response.success == '0') {
            callback(response);
        }
        else {
            console.log(response.result)
            if (response.result.length > 0) {
                let response = {
                    success: "0",
                    errorMessage: "subDomain URL Already Exist",
                    successMessage: ""
                };
                callback(response);

            }
            else {
                if (event.subDomainId) {

                    saveQry = `
                        UPDATE site_sub_domain 
                        SET 
                            site_url = ?, 
                            store_id = ? 
                        WHERE site_id = ? AND id = ?;
                    `;

                    saveQryParams = [
                        event.subDomainUrl,
                        event.storeId,
                        event.siteId,
                        event.subDomainId
                    ];

                }
                else {
                    saveQry = `
                        INSERT INTO site_sub_domain (version, site_id, site_url, store_id, is_active) 
                        VALUES (0, ?, ?, ?, TRUE);
                    `;

                    saveQryParams = [
                        event.siteId,
                        event.subDomainUrl,
                        event.storeId
                    ];
                }
            }
            queryExecution.queryExecution(client, "", event, saveQry, saveQryParams, function (responsenew) {
                if (responsenew.success == '0') {
                    callback(responsenew);
                }
                else {
                    let response = {
                        success: "1",
                        errorMessage: "",
                        successMessage: "Success"
                    };
                    callback(response);
                }
            })

        }


    })
}

methods.getStoreSubDomain = function (client, jsonObj, event, callback) {

    let limitQry = "";
    let limitQryParams = [];
    let searchQry = "";
    let searchQryParams = [];

    if (event.searchText) {
        searchQry = " and ssd.site_url like ? ";
        searchQryParams.push("%" + event.searchText.trim() + "%");
    }
    if (event.max) {
        limitQry = "limit  ?,?";
        limitQryParams = [parseInt(event.offset), parseInt(event.max)];
    }
    let getQry = "SELECT st.name,ssd.id,ssd.site_id,ssd.site_url,ssd.store_id,if(ssd.is_active is true,true,false) as is_active from site_sub_domain as ssd inner join store as st on ssd.store_id=st.id where ssd.site_id= ?" + searchQry + " order by ssd.id desc " + limitQry + ";" +
        "SELECT count(*) as totalCount FROM site_sub_domain as ssd where ssd.site_id= ? " + searchQry + ";"
    console.log(getQry)
    const params = [event.siteId, ...searchQryParams, ...limitQryParams, event.siteId, ...searchQryParams];
    queryExecution.queryExecution(client, "", event, getQry, params, function (response) {

        if (response.success == '0') {
            callback(response);
        }
        let results = response.result;
        if (results.length > 0) {
            const response = {
                "success": "1",
                "successMessage": "Success",
                "result": JSON.parse(JSON.stringify(results[0]).replace(/\:null/gi, "\:\"\"")),
                "count": results[1][0].totalCount,

                "errorMessage": ""
            }
            callback(response)
        }
        else {
            const response = {
                "success": "1",
                "successMessage": "No data found matching the criteria.",
                "errorMessage": ""
            }
            callback(response)
        }
    });
}


methods.statusChangeStoreSubDomain = function (client, jsonObj, event, callback) {

    let statusChangeQry = "update site_sub_domain set is_active=" + event.isActive + " where  site_id=? and store_id=?;"
    console.log(statusChangeQry)
    queryExecution.queryExecution(client, "", event, statusChangeQry, [ event.siteId,event.storeId ],function (responsenew) {
        if (responsenew.success == '0') {
            callback(responsenew);
        }
        else {
            let response = {
                success: "1",
                errorMessage: "",
                successMessage: "Success"
            };
            callback(response);
        }
    })
}
module.exports = methods;
