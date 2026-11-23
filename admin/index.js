const siteCategoryGroupList = require('./siteCategoryGroupList');
const commonAdmin = require('./commonAdmin');
const footerLink = require('./footerLink');
const banner = require('./banner');
const storeList = require('./storeList');
const location = require('./location');
const saveSiteCategoryGroup = require('./saveSiteCategoryGroup');
const promotionList = require('./promotionList');
const subscriptionReport = require('./subscriptionReport');
const ondcOrderDetails = require('./ondcOrderDetails.js')
const siteCategoryGroupAddOfferBannerAndPromocode = require('./siteCategoryGroupofferBannerAndPromocodeUpdation')
const groceryStoreItemListing = require('./groceryStoreItemListing.js')

const methods = {};

methods.index = function(client,jsonObj,event,callback) {
    if(event.functionName == 'siteCategoryGroupList'){
        siteCategoryGroupList.siteCategoryGroupList(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'statusChangeAdmin'){
        commonAdmin.statusChangeAdmin(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'categoryList'){
        commonAdmin.categoryList(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'locationList'){
        commonAdmin.locationList(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'locationDetails'){
        location.locationDetails(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'addLocation'){
        location.addLocation(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'deleteLocation'){
        location.deleteLocation(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'locationStores'){
        location.locationStores(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'footerLinkList'){
        footerLink.footerLinkList(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'footerLinkSave'){
        footerLink.footerLinkSave(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'bannerList'){
        banner.bannerList(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'bannerSave'){
        banner.bannerSave(client,jsonObj,event, function(response){
            console.log("response....",response)
            callback(response);
        });
    }
    else if(event.functionName == 'storeList'){
        storeList.storeList(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'addStore'){
        storeList.addStore(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'deleteStore'){
        storeList.deleteStore(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'saveSiteCategoryGroup'){
        saveSiteCategoryGroup.saveSiteCategoryGroup(client,jsonObj,event, function(response){
            console.log("saveSiteCategoryGroup...result",response)
            callback(response);
        });
    }
    else if(event.functionName == 'deleteCategory'){
        commonAdmin.deleteCategory(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'addCategory'){
        commonAdmin.addCategory(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'promotionList'){
        promotionList.promotionList(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'subscriptionReport'){
        subscriptionReport.subscriptionReport(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'subscriptionStatusChange'){
        subscriptionReport.subscriptionStatusChange(client,jsonObj,event, function(response){
            callback(response);
        });
    }
    else if(event.functionName == 'ondcOrderDetails'){
        ondcOrderDetails.ondcOrderDetails(client,jsonObj,event, function(response){
           // console.log("response...ondcOrderDetails..",response)
            callback(response);
        });
    }
     else if(event.functionName == 'siteCategoryGroupAddOfferBannerAndPromocode'){
        siteCategoryGroupAddOfferBannerAndPromocode.siteCategoryGroupAddOfferBannerAndPromocode(client,jsonObj,event, function(response){
            console.log("response...siteCategoryGroupAddOfferBannerAndPromocode..",response)
            callback(response);
        });
    }
     else if(event.functionName == 'groceryStoreItemListing'){
        groceryStoreItemListing.groceryStoreItemListing(client,jsonObj,event, function(response){
            console.log("response...groceryStoreItemListing..",response)
            callback(response);
        });
    }
    else{
        const data = {
            success: "0",
            result: [],
            errorMessage: "Function not exist",
            successMessage: ""
        };
        callback(data);
    }
};
module.exports = methods;