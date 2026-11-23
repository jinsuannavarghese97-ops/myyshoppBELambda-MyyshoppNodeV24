let mysql = require('mysql');
let config = require('../config.json');
let cancelledOrDeliveredOrder = require('./SellerReports/cancelledOrDeliveredOrder.js');
let returnedOrders = require('./SellerReports/returnedOrders.js');
let verifyCancelledOrder = require('./SellerReports/verifyCancelledOrder.js');
let reviewOrderedItems = require('./SellerReports/reviewOrderedItems.js')
let datewiseDeliveredOrder = require('./SellerReports/datewiseDeliveredOrder.js')
let sellerCreatedOrder = require('./SellerReports/sellerCreatedOrder.js')
let buyerDetails = require('./SellerReports/buyerDetails.js')
let customerOrDatewiseDeliveredOrder = require('./SellerReports/customerOrDatewiseDeliveredOrder.js')
let sellerPayment = require('./SellerReports/sellerPayment.js')
let getCityDetails = require('./Common/getCityDetails.js')
let stockUpdateSingle = require('./ItemManagement/stockUpdateSingle.js')
let updateSingleStock = require('./ItemManagement/updateSingleStock.js')
let deactivateActivateItem = require('./ItemManagement/deactivateActivateItem.js')
let offerStatusChange = require('./ItemManagement/offerStatusChange.js')
let sellerStockPrice = require('./SellerReports/sellerStockPrice.js')
let siteReport = require('./SellerReports/siteReport.js')
let sellerProfile = require('./Seller/sellerProfile.js')

const methods = {};

methods.index = function(jsonObj,event,callback) {
    const pool  = mysql.createPool({
        host : jsonObj.dbhost,
        user:  jsonObj.dbuser,
        password : jsonObj.dbpassword,
        database : jsonObj.dbdatabase,
        debug: false,
        multipleStatements: true,
        typeCast: function castField( field, useDefaultTypeCasting ) {
            if ( ( field.type === "BIT" ) && ( field.length === 1 ) ) {
                let bytes = field.buffer();
                return( bytes[ 0 ] === 1 );
            }
            return( useDefaultTypeCasting() );
        }
      });
	  
	  
	  

    let functionName = event.functionName
    //context.callbackWaitsForEmptyEventLoop = false;
    if (functionName == 'cancelledOrDeliveredOrder') {
        jsonObj.sellerId = event.sellerId
        jsonObj.storeId = event.storeId
        jsonObj.cancelDeliverOrderOrderStatusId = event.cancelDeliverOrderOrderStatusId
        jsonObj.cancelDeliverOrderFromDate = event.cancelDeliverOrderFromDate
        jsonObj.cancelDeliverOrderToDate = event.cancelDeliverOrderToDate
        jsonObj.cancelDeliverOrderOffset = event.cancelDeliverOrderOffset
        jsonObj.cancelDeliverOrderMax = event.cancelDeliverOrderMax
        
        cancelledOrDeliveredOrder.cancelledOrDeliveredOrder(jsonObj,function(response){
            console.log("response....cancelledOrDeliveredOrder...", response)
            callback(response)
        });
    }
    else if (functionName == 'returnedOrders') {
        jsonObj.returnedOrderSelectCombo = event.returnedOrderSelectCombo
        jsonObj.returnedOrderSearchText = event.returnedOrderSearchText
        jsonObj.storeId = event.storeId
        jsonObj.returnedOrderFromDate = event.returnedOrderFromDate
        jsonObj.returnedOrderToDate = event.returnedOrderToDate
        jsonObj.sellerId = event.sellerId
        jsonObj.returnedOrderMax = event.returnedOrderMax
        jsonObj.returnedOrderOffset = event.returnedOrderOffset
        
        returnedOrders.returnedOrders(jsonObj,function(response){
            console.log("response....returnedOrders...", response)
            callback(response)
        });
    }
    else if (functionName == 'verifyCancelledOrder') {
    
        jsonObj.storeId = event.storeId
        jsonObj.verifyCancelOrderCmbSelect = event.verifyCancelOrderCmbSelect
        jsonObj.verifyCancelOrderSearchText = event.verifyCancelOrderSearchText
        jsonObj.sellerId = event.sellerId
        jsonObj.verifyCancelOrderOffset = event.verifyCancelOrderOffset
        jsonObj.verifyCancelOrderMax = event.verifyCancelOrderMax
    
    verifyCancelledOrder.verifyCancelledOrder(jsonObj,function(response){
        console.log("response....verifyCancelledOrder...",response)
        callback(response)
    });
}
else if(functionName == 'reviewOrderedItems'){
    jsonObj.reviewOrderItemCmbStatus = event.reviewOrderItemCmbStatus
    jsonObj.reviewOrderItemFromDate = event.reviewOrderItemFromDate
    jsonObj.reviewOrderItemToDate = event.reviewOrderItemToDate
    jsonObj.sellerId = event.sellerId
    jsonObj.reviewOrderItemOffset = event.reviewOrderItemOffset
    jsonObj.reviewOrderItemMax = event.reviewOrderItemMax

    reviewOrderedItems.reviewOrderedItems(jsonObj,function(response){
        callback(response)
    });
}
else if(functionName == 'datewiseDeliveredOrder'){
    jsonObj.storeId = event.storeId
    jsonObj.datewiseDeliverOrderFromDate = event.datewiseDeliverOrderFromDate
    jsonObj.datewiseDeliverOrderToDate = event.datewiseDeliverOrderToDate
    jsonObj.sellerId = event.sellerId
    jsonObj.datewiseDeliverOrderOffset = event.datewiseDeliverOrderOffset
    jsonObj.datewiseDeliverOrderMax = event.datewiseDeliverOrderMax

    datewiseDeliveredOrder.datewiseDeliveredOrder(jsonObj,function(response){
        //console.log("response....datewiseDeliveredOrder...",response)
        callback(response)
    });
}
else if(functionName == 'sellerCreatedOrder'){
    jsonObj.storeId = event.storeId
    jsonObj.sellerId = event.sellerId
    jsonObj.sellerCreatedOrderFromDate = event.sellerCreatedOrderFromDate
    jsonObj.sellerCreatedOrderToDate = event.sellerCreatedOrderToDate
    jsonObj.sellerCreatedOrderOffset = event.sellerCreatedOrderOffset
    jsonObj.sellerCreatedOrderMax = event.sellerCreatedOrderMax

    sellerCreatedOrder.sellerCreatedOrder(jsonObj,function(response){
        console.log("response....sellerCreatedOrder...",response)
        callback(response)
    });
}
else if(functionName == 'buyerDetails'){

    jsonObj.buyerDetailscmbSearch = event.buyerDetailscmbSearch
    jsonObj.buyerDetailsTextSearch = event.buyerDetailsTextSearch
    jsonObj.buyerDetailsState = event.buyerDetailsState
    jsonObj.buyerDetailsCity = event.buyerDetailsCity
    jsonObj.buyerDetailsTxtlastDay = event.buyerDetailsTxtlastDay
    jsonObj.buyerDetailsFromDate = event.buyerDetailsFromDate
    jsonObj.buyerDetailsToDate = event.buyerDetailsToDate
    jsonObj.sellerId = event.sellerId
    jsonObj.storeId = event.storeId
    jsonObj.buyerDetailsOffset = event.buyerDetailsOffset
    jsonObj.buyerDetailsMax = event.buyerDetailsMax

    buyerDetails.buyerDetails(jsonObj,function(response){
       // console.log("response....buyerDetails...",response)
       callback(response)
    });
}
else if(functionName == 'customerOrDatewiseDeliveredOrder'){

    jsonObj.customerDatewiseDeliverOrderCmbTypes = event.customerDatewiseDeliverOrderCmbTypes
    jsonObj.customerDatewiseDeliverOrderTextInput = event.customerDatewiseDeliverOrderTextInput
    jsonObj.customerDatewiseDeliverOrderFromDate = event.customerDatewiseDeliverOrderFromDate
    jsonObj.customerDatewiseDeliverOrderToDate = event.customerDatewiseDeliverOrderToDate
    jsonObj.storeId = event.storeId
    jsonObj.sellerId = event.sellerId
    jsonObj.customerDatewiseDeliverOrderOffset = event.customerDatewiseDeliverOrderOffset
    jsonObj.customerDatewiseDeliverOrderMax = event.customerDatewiseDeliverOrderMax

    customerOrDatewiseDeliveredOrder.customerOrDatewiseDeliveredOrder(jsonObj,function(response){
         console.log("response....customerOrDatewiseDeliveredOrder...",response)
         callback(response)
     });
}
else if(functionName == 'sellerPayment'){
    jsonObj.storeId = event.storeId
    jsonObj.sellerId = event.sellerId
    jsonObj.sellerPaymentFromDate = event.sellerPaymentFromDate
    jsonObj.sellerPaymentToDate = event.sellerPaymentToDate
    jsonObj.sellerPaymentOffset = event.sellerPaymentOffset
    jsonObj.sellerPaymentMax = event.sellerPaymentMax
    
    sellerPayment.sellerPayment(jsonObj,function(response){
         console.log("response....sellerPayment...",response)
         callback(response)
     });
}
else if(functionName == 'getCityDetails'){   
    jsonObj.stateId = event.stateId     
    getCityDetails.getCityDetails(jsonObj,function(response){
         console.log("response....getCityDetails...",response)
         callback(response)
     });
}
else if(functionName == 'stockUpdateSingle'){   
    jsonObj.stockUpdateSingleCmbStatus = event.stockUpdateSingleCmbStatus
    jsonObj.stockUpdateSingleCmbStatusOffer = event.stockUpdateSingleCmbStatusOffer
    jsonObj.stockUpdateSingleCmbSelect = event.stockUpdateSingleCmbSelect
    jsonObj.stockUpdateSingleTextInput = event.stockUpdateSingleTextInput
    jsonObj.stockUpdateSingleCmbSelectSort = event.stockUpdateSingleCmbSelectSort
    jsonObj.stockUpdateSingleFromDate = event.stockUpdateSingleFromDate
    jsonObj.stockUpdateSingleToDate = event.stockUpdateSingleToDate
    jsonObj.storeId = event.storeId
    jsonObj.sellerId = event.sellerId
    jsonObj.stockUpdateSingleOffset = event.stockUpdateSingleOffset
    jsonObj.stockUpdateSingleMax = event.stockUpdateSingleMax

    stockUpdateSingle.stockUpdateSingle(jsonObj,function(response){
        console.log("response....stockUpdateSingle...",response)
        callback(response)
     });
}
else if(functionName == 'updateSingleStock'){      
   jsonObj.storeItemStockId = event.storeItemStockId
   jsonObj.sellerId = event.sellerId
   jsonObj.storeId = event.storeId
   jsonObj.sellerItemId = event.sellerItemId
   jsonObj.itemName = event.itemName
   jsonObj.itemCode = event.itemCode
   jsonObj.updateSingleStockOfferText = event.updateSingleStockOfferText
   jsonObj.updateSingleStockIsOfferFlag = event.updateSingleStockIsOfferFlag
   jsonObj.updateSingleStockOfferPrice = event.updateSingleStockOfferPrice
   jsonObj.updateSingleStockOfferFrom = event.updateSingleStockOfferFrom
   jsonObj.updateSingleStockOfferTo = event.updateSingleStockOfferTo
   jsonObj.updateSingleStockStockQuantity = event.updateSingleStockStockQuantity
   jsonObj.updateSingleStockItemPrice = event.updateSingleStockItemPrice
   jsonObj.updateSingleStockMrp = event.updateSingleStockMrp
   jsonObj.updateSingleStockRank = event.updateSingleStockRank
    updateSingleStock.updateSingleStock(jsonObj,function(response){
         console.log("response....updateSingleStock...",response)
         callback(response)
     });
}
else if(functionName == 'deactivateActivateItem'){      
    jsonObj.sellerId = event.sellerId
    jsonObj.storeItemStockId = event.storeItemStockId
    jsonObj.itemStatus = event.itemStatus
    
    deactivateActivateItem.deactivateActivateItem(jsonObj,function(response){
          console.log("response....deactivateActivateItem...",response)
          callback(response)
      });
 }
 else if(functionName == 'offerStatusChange'){      
    jsonObj.sellerId = event.sellerId
    jsonObj.storeItemStockId = event.storeItemStockId
    jsonObj.offerStatus = event.offerStatus
    
    offerStatusChange.offerStatusChange(jsonObj,function(response){
          console.log("response....offerStatusChange...",response)
          callback(response)
      });
 }
 else if(functionName == 'sellerStockPrice'){
    jsonObj.storeId = event.storeId
    jsonObj.sellerId = event.sellerId
    jsonObj.sellerStockPriceCmbSelect = event.sellerStockPriceCmbSelect
    jsonObj.sellerStockPriceTextInput = event.sellerStockPriceTextInput
    jsonObj.sellerStockPriceOffset = event.sellerStockPriceOffset
    jsonObj.sellerStockPriceMax = event.sellerStockPriceMax
        
    sellerStockPrice.sellerStockPrice(jsonObj,function(response){
         console.log("response....sellerStockPrice...",response)
         callback(response)
     });
}
else if(functionName == 'siteReport'){      
    jsonObj.sellerId = event.sellerId
    jsonObj.siteComboStatus = event.siteComboStatus
    jsonObj.saleDateFrom = event.saleDateFrom
    jsonObj.saleDateTo = event.saleDateTo
    jsonObj.siteOffset = event.siteOffset
    jsonObj.siteMax = event.siteMax
    siteReport.siteReport(jsonObj,function(response){
          console.log("response....siteReport...",response)
          callback(response)
      });
 }
 else if(functionName == 'sellerProfile'){      
    jsonObj.sellerId = event.sellerId    
    sellerProfile.sellerProfile(jsonObj,function(response){
          console.log("response....sellerProfile...",response)
          callback(response)
      });
 }
    else {
        const response = {
            success: "0",
            successMessage: "",
            errorMessage: "Function not exist"
        };
        callback(response)
    }
}
module.exports = methods;