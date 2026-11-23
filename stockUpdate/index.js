const methods = {};
const sellerItemMap = require('./sellerItemMap');
const sellerItemMapIsMapped = require('./sellerItemMapIsMapped');
const saveStoreItemStock = require('./saveStoreItemStock');
const changeStatus = require('./changeStatus');
const unmapItems = require('./unmapItems');
const storeItemList = require('./storeItemList');
const itemNameUpdate = require('./itemNameUpdate');
const saveAndMapItem = require('./saveAndMapItem');
const stockUpdateHistory = require('./stockUpdateHistory');
const stockUpdateLists = require('./stockUpdateLists');
const sellerItemMapProcedure = require('./sellerItemMapProcedure');
const sellerItemImportHistory = require('./sellerItemImportHistory');
const addDefaultItem = require('./addDefaultItem');
const sellerItemMapReport = require('./sellerItemMapReport');
const saveItemNames = require('./saveItemNames');
const rtStoreItemBulkSaveUpdate =require('./rtStoreItemBulkSaveUpdate');
//const rtStoreItemBulkUpload = require('./rtStoreItemBulkUpload')
 


methods.index = function(client,jsonObj,event,callback) {
    if(event.functionName == 'sellerItemMap'){
        sellerItemMap.sellerItemMap(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'sellerItemMapReport'){
        sellerItemMapReport.sellerItemMapReport(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'sellerItemMapIsMapped'){
        sellerItemMapIsMapped.sellerItemMapIsMapped(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'changeSellerItemStatus'){
        changeStatus.changeSellerItemStatus(client,jsonObj,event, function(response){
            callback(response)
        });
        
    }
    else if(event.functionName == 'changeStoreItemStockStatus'){
        changeStatus.changeStoreItemStockStatus(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'unmapItems'){
        unmapItems.unmapItems(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'storeItemList'){
        storeItemList.storeItemList(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'saveStoreItemStock'){
        saveStoreItemStock.saveStoreItemStock(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'deleteSellerItem'){
        unmapItems.deleteSellerItem(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'itemNameUpdate'){
        itemNameUpdate.itemNameUpdate(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'saveAndMapItem'){
        saveAndMapItem.saveAndMapItem(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'stockUpdateHistory'){
        stockUpdateHistory.stockUpdateHistory(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'stockUpdateLists'){
        stockUpdateLists.stockUpdateLists(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'sellerItemMapProcedure'){
        sellerItemMapProcedure.sellerItemMapProcedure(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'sellerItemImportHistory'){
        sellerItemImportHistory.sellerItemImportHistory(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'addDefaultItem'){
        addDefaultItem.addDefaultItem(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'saveItemNames'){
        saveItemNames.saveItemNames(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    else if(event.functionName == 'rtStoreItemBulkSaveUpdate'){
        rtStoreItemBulkSaveUpdate.rtStoreItemBulkSaveUpdate(client,jsonObj,event, function(response){
            callback(response)
        });
    }
    
    else{  
        const data = {
            success: "0",
            result: [],
            errorMessage: "Function not exist1",
            successMessage: ""
        };
        callback(data)
    }
};
module.exports = methods;
