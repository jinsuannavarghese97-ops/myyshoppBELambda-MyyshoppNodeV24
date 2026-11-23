const queryExecution = require('../queryExecution')
const methods = {};
methods.deleteRtMasterDetails = function (client, jsonObj, event, callback) {

    let deleteMasterSizeQuery = "DELETE FROM rt_master_size WHERE rt_master_id= ? ";
    let deleteMasterImageQuery = "DELETE FROM rt_master_image WHERE rt_master_id= ? ";
    let deleteRtStoreItemQuery = "UPDATE rt_store_item SET rt_master_id=null WHERE rt_master_id= ? ";
    let deleteMasterQuery = "DELETE FROM rt_master WHERE id= ? ";

    let deleteRtMasterFinalQuery = deleteMasterSizeQuery + ";" + deleteMasterImageQuery + ";" + deleteRtStoreItemQuery + ";" + deleteMasterQuery;
    console.log("deleteRtMasterFinalQuery.....", deleteRtMasterFinalQuery)

    queryExecution.queryExecution(client, "", event, deleteRtMasterFinalQuery, [event.rtMasterId, event.rtMasterId, event.rtMasterId, event.rtMasterId], function (finalResponse) {
        console.log("finalResponse.....", finalResponse)
        if (finalResponse.success == '0') {
            const response = {
                success: "0",
                successMessage: "",
                errorMessage: "Something went wrong"
            };
            callback(response);
        }
        else {

            const result = {
                success: "1",
                successMessage: "Success",
                errorMessage: ""
            };
            callback(result);
        }

    });
}
module.exports = methods;
