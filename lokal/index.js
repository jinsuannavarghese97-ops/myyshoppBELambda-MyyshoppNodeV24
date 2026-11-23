let homePageDetails = require('./homePageDetails.js');
let category = require('./category.js');
let store = require('./store.js');
let cityList = require('./cityList.js');
let locationList = require('./locationList.js');
let storeNonCategory = require('./storeNonCategory.js');
let storeDetails = require('./storeDetails.js');
let storesBySellerId = require('./storesBySellerId.js');
let storesBySellerIdNonLocation = require('./storesBySellerIdNonLocation.js');
let themeList = require('./themeList.js');
let storeLocation = require('./storeLocation');
let footerLink = require('./footerLink');
let storeByLocationId = require('./storeByLocationId');
let globalLocations = require('./globalLocations');
let sitemapItemData = require('./sitemapItemData.js');
let sitemapStoreData = require('./sitemapStoreData.js');
let siteMapSiteUrl = require('./siteMapSiteUrl.js');
let getProductSeo = require('./getProductSeo.js');
const methods = {};

methods.index = function(client,jsonObj,event,callback) {
    if(event.functionName == 'homePageDetails'){
        jsonObj.myCategoryId = event.myCategoryId
        homePageDetails.homePageDetails(client,jsonObj,event, function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'category'){
        jsonObj.myCategoryId = event.myCategoryId;
        jsonObj.locationId = event.locationId;
        jsonObj.sellerId = event.sellerId
        category.category(client,jsonObj,event,function(result){
            console.log("..result...",result)
            callback(result); 
        });
    }
    else if(event.functionName == 'getProductSeo'){
        jsonObj.storeItemStockId = event.storeItemStockId;
        getProductSeo.getProductSeo(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'store'){
        jsonObj.myCategoryId = event.myCategoryId;
        jsonObj.locationId = event.locationId
        jsonObj.categoryId = event.categoryId
        jsonObj.storeDate = event.storeDate
        store.store(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'storeDetails'){
        jsonObj.storeId = event.storeId;
        storeDetails.storeDetails(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'storeNonCategory'){
        jsonObj.myCategoryId = event.myCategoryId;
        jsonObj.locationId = event.locationId
        jsonObj.categoryId = event.categoryId
        jsonObj.storeDate = event.storeDate
        storeNonCategory.storeNonCategory(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'storesBySellerId'){
        jsonObj.locationId = event.locationId
        jsonObj.sellerId = event.sellerId
        storesBySellerId.storesBySellerId(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'storesBySellerIdNonLocation'){
        jsonObj.sellerId = event.sellerId
        storesBySellerIdNonLocation.storesBySellerIdNonLocation(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'cityList'){
        jsonObj.myCategoryId = event.myCategoryId;
        jsonObj.cityKeyWord = event.cityKeyWord
        cityList.city(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'locationList'){
        //console.log("inside lokal second index")
        jsonObj.myCategoryId = event.myCategoryId;
        jsonObj.cityId = event.cityId
        jsonObj.locationKeyword = event.locationKeyword
        jsonObj.sellerId = event.sellerId
        jsonObj.storeId = event.storeId
        locationList.location(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'themeList'){
        themeList.themeList(client,jsonObj,event,function(result){
            
            callback(result); 
        });
    }
    else if(event.functionName == 'sitemapItemData'){
        sitemapItemData.sitemapItemData(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'sitemapStoreData'){
        sitemapStoreData.sitemapStoreData(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'siteMapSiteUrl'){
        siteMapSiteUrl.siteMapSiteUrl(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'storeLocation'){
        storeLocation.storeLocation(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'footerLink'){
        footerLink.footerLink(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'storeByLocationId'){
        storeByLocationId.storeByLocationId(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else if(event.functionName == 'globalLocations'){
        globalLocations.globalLocations(client,jsonObj,event,function(result){
            callback(result); 
        });
    }
    else{
        const data = {
            success: "0",
            result:[],
            errorMessage: "Function not exist",
            successMessage: ""
        };
        callback(data);
    }
}
module.exports = methods;