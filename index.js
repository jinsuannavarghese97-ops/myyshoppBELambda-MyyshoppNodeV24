'use strict';
console.time()
// mysql2: API-compatible callback pool; supports MySQL 8 caching_sha2_password (RDS Proxy).
const mysql2 = require('mysql2');
const fs = require('fs');
const path = require('path');
const https = require('https');

const checkout = require('./checkOut/index');
const cmHome = require('./cmHome/cmHome');
const cmItemListing = require('./cmItemListing/cmItemListing');
const cmItemProfile = require('./cmItemProfile/cmItemProfile');
const cmMyOrderSave = require('./cmMyOrderSave/cmMyOrderSave');
const getBuyerOrder = require('./getBuyerOrder/getBuyerOrder');
const getBuyerOrderDetails = require('./getBuyerOrderDetails/getBuyerOrderDetails');
const getFeedback = require('./getFeedback/getFeedback');
const getItemDetailsById = require('./getItemDetailsById/index');
const getItemResult = require('./getItemResult/index');
const getPersonalInformation = require('./getPersonalInformation/selectPersonalInformation');
const getStoreData = require('./getStoreData/index');
const getStoredetails = require('./getStoreDetails/index');
const getStoreRelatedData = require('./getStoreRelatedData/index');
const getStoreServingLocations = require('./getStoreServingLocations/index');
const getTrackOrder = require('./gettrackOrder/gettrackOrder');
const getUserAuthentication = require('./getUserAuthentication/getUserAuthentication');
const getWishList = require('./getWishList/wishList');
const homePageData = require('./homePageData/index');
const itemContactUsSave = require('./itemContactUsSave/index');
const lokal = require('./lokal/index');
const myOrderSave = require('./myOrderSave/myOrderSave');
const myShopp = require('./myShopp/index');
const pothys = require('./pothys/index');
const promoCode = require('./promoCode/index');
const restaurantHome = require('./restaurantHome/rthome');
const removeWishList = require('./removeWishList/removeWishList');
const rtBookYourTable = require('./rtBookYourTable/rtBookYourTable');
const rtItemListing = require('./rtItemListing/rtItemListing');
const rtLeftMenu = require('./rtLeftMenu/rtLeftMenu');
const rtOrderDetails = require('./rtOrderDetails/rtOrderDetails');
const rtstoreDetails = require('./rtStoreDetails/rtstoreDetails');
const saveDeliveryAddress = require('./saveDeliveryAddress');
const saveUserDashboardDetails = require('./saveUserDashboardDetails');
const searchResult = require('./searchResult');
const updateAccountDetails = require('./updateAccountDetails/updateAccountDetails');
const updateAddressDetails = require('./updateAddressDetails/updateAddressDetails');
const updateFeedback = require('./updateFeedback/updateFeedback');
const userDashboardDetails = require('./userDashboardDetails/index');
const userRegistration = require('./userRegistration/index');
const userVerification = require('./userVerification/index');
const wishListSave = require('./wishListSave/wishListSave');
const getSiteDetail = require('./getSiteDetail/getSiteDetail');
const pharmacy = require('./pharmacy/index.js');
const alcohol = require('./alcohol/index.js');
const common = require('./common/index.js');
const admin = require('./admin/index.js');
const getPlanDetails = require('./admin/getPlanDetails.js');
const saveSellerDetails = require('./admin/saveSellerDetails.js');
const getUserConfiguration = require('./admin/getUserConfiguration.js');
const saveRazorPaymentDetails = require('./admin/saveRazorPaymentDetails.js');
const razorPayStatusChange = require('./admin/razorPayStatusChange.js');
const saveSubscriptionDetails = require('./admin/saveSubscriptionDetails.js');
const razorpayPlanDetails = require('./admin/razorpayPlanDetails.js');
const stockUpdate = require('./stockUpdate/index.js')
const createUpiPayment = require('./admin/createUpiPayment.js');
const itemMapping = require('./itemMapping/index');
const sellerAppLogin = require('./getUserAuthentication/sellerAppLogin.js');
const sellerAppOrderManagementMain = require('./sellerApp/orderManagementMain.js');
const sellerAppOrderManagementSub = require('./sellerApp/sellerAppOrderManagementSub.js');
const sellerAppOrderDetails = require('./sellerApp/sellerAppOrderDetails.js');
const sellerAppChangeStatus = require('./sellerApp/sellerAppChangeStatus.js');
const itemWithOutImage = require('./admin/itemWithOutImage.js');
const groceryitemListing = require('./sellerApp/groceryitemListing.js');
const commonItemListing = require('./sellerApp/commonItemListing.js');
const restaurantItemListing = require('./sellerApp/restaurantItemListing.js');
const saveGroceryStock = require('./sellerApp/saveGroceryStock.js');
const saveRestuarantStock = require('./sellerApp/saveRestuarantStock.js');
const saveCommonItemStock = require('./sellerApp/saveCommonItemStock.js');
const getRtItemSize = require('./sellerApp/getRtItemSize.js');
const saveStoreSubDomain = require('./sellerApp/saveStoreSubDomain.js');
const adminSiteUrlDecryption = require('./getUserAuthentication/adminSiteUrl.js');
const sellerRegistrationSendMail = require('./admin/sellerRegistrationSendMail.js');
const getTaxGroupDetails = require('./TaxDetails/getTaxGroupDetails.js');
const encryptDecrypt = require('./encryptDecrypt');
const rtItemWiseSalesReport = require('./itemWiseSalesReports/restaurentItemWiseSaleReport.js');
const groceryItemWiseSalesReport = require('./itemWiseSalesReports/groceryItemWiseSaleReport.js');
const commonItemWiseSaleReport = require('./itemWiseSalesReports/cmItemWiseSaleReport.js');
const getItemTaxGroupDetails = require('./TaxDetails/getItemTaxGroupDetails.js');
const saveUpdateItemTaxGroupDetails = require('./TaxDetails/saveUpdateItemTaxGroupDetails.js');
const saveMessageContentSiteDetails = require('./common/saveMessageContentSiteDetails.js');
const saveOrUpdateRestaurantItemTaxGroupDetails = require('./TaxDetails/saveUpdateResItemTaxGroupDetails.js');
const getRestItemTaxGroupDetails = require('./TaxDetails/getRestItemTaxGroupDetails.js');
const saveOrUpdateCommonItemTaxGroupDetails = require('./TaxDetails/SaveUpdateCommItemTaxGroupDetails.js');
const getCommonItemTaxGroupDetails =require('./TaxDetails/getCommonItemTaxGroupDetails.js');
const deleteRtMasterDetails = require('./common/deleteRtMasterDetails.js');
const ondcFullfilmentStates = require('./ondcFullfillmentStates/ondcFullfilmentStates.js');
const getOndcUnits = require('./admin/getOndcUnits.js');
const getOndcLogisticsDeliveryCharges = require('./admin/getOndcLogisticsDeliveryCharges.js');
const getOndcCancellReasons = require('./admin/getOndcCancellReasons.js');
const getMappedAndUnMappedRestaurentItems =  require('./admin/getMappedAndUnMappedRestaurentItems.js');
const updateGroceryStoreItemStock = require('./sellerApp/UpdateGroceryStoreItemStock.js');
const groceryItemStockSaveUpdate = require('./admin/groceryItemStockSaveUpdate.js');
const saveSetPermission = require('./setPermission/saveSetPermission.js')
const setPermissionList = require('./setPermission/setPermissionList.js')
const userWiseSetPermissionList = require('./setPermission/userWiseSetPermission.js')
const editGroceryItemStockList = require('./admin/editGroceryItemStock.js')



//let alias = 'dev'
//let alias = 'test'
//let alias = 'PROD'
let alias = 'PROD_TOKEN'
//let alias= 'aurora_test'
//let alias = 'testProd'
//let alias='Axis_Test'

// DB connection details come from AWS Secrets Manager (same as PurpleHealth).
// Secret keys used: host, port, username, password, dbname
// Env var dbsecretarn overrides the default ARN (e.g. for a test secret).
const DB_SECRET_ARN = process.env.dbsecretarn ||
    'arn:aws:secretsmanager:ap-south-1:196395329624:secret:storedigdb_prod-kwKBPx';

// Amazon RDS global CA bundle (needed when the DB / RDS Proxy requires TLS).
// Looked for in the function package first, then in a layer (/opt).
let rdsCa = null;
[path.join(__dirname, 'global-bundle.pem'), '/opt/global-bundle.pem', '/opt/nodejs/global-bundle.pem']
    .some(function (p) {
        try {
            rdsCa = fs.readFileSync(p);
            console.log('rdsCa loaded from', p, 'bytes:', rdsCa.length, 'certs:', (rdsCa.toString().match(/BEGIN CERTIFICATE/g) || []).length);
            return true;
        }
        catch (e) { return false; }
    });
// TLS is mandatory (RDS Proxy). Missing bundle -> DB init fails with a clear error
// (returned as the usual encrypted token) instead of connecting without TLS.
if (!rdsCa) console.error('global-bundle.pem NOT FOUND - DB connections will be refused until it is deployed');

const keepAliveAgent = new https.Agent({ keepAlive: true });

// Works on every Node runtime: SDK v3 (bundled in Node 18+), else SDK v2 (bundled in Node <=16 / layer).
function fetchSecret(secretArn, cb) {
    const region = process.env.AWS_REGION || 'ap-south-1';
    let v3;
    try { v3 = require('@aws-sdk/client-secrets-manager'); } catch (e) { v3 = null; }
    if (v3) {
        const sm = new v3.SecretsManagerClient({ region: region });
        return sm.send(new v3.GetSecretValueCommand({ SecretId: secretArn }))
            .then(function (data) { cb(null, data.SecretString); })
            .catch(cb);
    }
    const AWS = require('aws-sdk');
    const sm = new AWS.SecretsManager({ region: region, httpOptions: { agent: keepAliveAgent } });
    sm.getSecretValue({ SecretId: secretArn }, function (err, data) {
        if (err) return cb(err);
        cb(null, data.SecretString);
    });
}

function createDbPool(cfg) {
    const opts = {
        host: cfg.host,
        port: cfg.port || 3306,
        user: cfg.user,
        password: cfg.password,
        database: cfg.database,
        charset: 'utf8mb4_unicode_ci',
        connectionLimit: 5,
        waitForConnections: true,
        queueLimit: 0,
        connectTimeout: 5000,
        debug: false,
        multipleStatements: true,
        // rejectUnauthorized:false encrypts but skips issuer check (same as PurpleHealth);
        // set true once the deployed global-bundle.pem is confirmed as the official bundle.
        ssl: { ca: rdsCa, rejectUnauthorized: false }
    };
    return mysql2.createPool(opts);
}

var client;               // active pool, reused across warm invocations
var clientPromise = null; // in-flight init, shared by concurrent cold-start calls

function ensureDbClient(cb) {
    if (client) return cb(null, client);
    if (!clientPromise) {
        clientPromise = new Promise(function (resolve, reject) {
            if (!rdsCa) return reject(new Error('global-bundle.pem not found (checked function root, /opt, /opt/nodejs)'));
            fetchSecret(DB_SECRET_ARN, function (err, secretString) {
                if (err) return reject(err);
                let s;
                try { s = JSON.parse(secretString); } catch (e) { return reject(e); }
                resolve(createDbPool({
                    host: s.host,
                    port: s.port,
                    user: s.username,
                    password: s.password,
                    database: s.dbname
                }));
            });
        });
    }
    clientPromise
        .then(function (pool) { client = pool; cb(null, pool); })
        .catch(function (err) { clientPromise = null; cb(err); });
}

var jsonObj = {};

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    ensureDbClient(function (dbInitErr) {
        if (dbInitErr) {
            console.error("DB init (Secrets Manager) failed:", dbInitErr);
            return callback(null, {
                "token": encryptDecrypt.encryptData({
                    success: "0",
                    result: [],
                    errorMessage: "Database initialization failed",
                    successMessage: ""
                }).toString()
            });
        }
        routeRequest(event, context, callback);
    });
};

// Original MyyShopp routing - unchanged.
function routeRequest(event, context, callback) {
    console.log("event....decryptData.",event)
   // event = event ? JSON.parse(JSON.parse(encryptDecrypt.decryptData(event.token))) : event
   //  event =  JSON.parse(encryptDecrypt.decryptData(event.token))

    console.log("event....decryptData.", event)

    event.alias = alias

    let functionName = event.functionName ? event.functionName.split('/') : ""

    event.functionName = functionName[1] ? functionName[1] : ""
    jsonObj.functionName = event.functionName ? event.functionName : functionName[0].toString().toLowerCase()
    jsonObj.mainFunction = functionName[0].toString().toLowerCase()
    if (functionName[0].toString().toLowerCase() == 'checkout'.toLowerCase()) {
        //event.event.worldlineUrl = (alias == 'PROD' || alias == 'testProd') ? process.env['PRODWorldLineUrl'] : process.env['testWorldLineUrl']
        checkout.index(client, jsonObj, event, function(response) {
            console.log("..........",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'cmHome'.toLowerCase()) {
        cmHome.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'cmItemListing'.toLowerCase()) {
        cmItemListing.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'cmItemProfile'.toLowerCase()) {
        cmItemProfile.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'cmMyOrderSave'.toLowerCase()) {
        cmMyOrderSave.index(client, jsonObj, event, function(response) {
            console.log("...",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getBuyerOrder'.toLowerCase()) {
        getBuyerOrder.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getBuyerOrderDetails'.toLowerCase()) {
        getBuyerOrderDetails.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getFeedback'.toLowerCase()) {
        getFeedback.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getItemDetailsById'.toLowerCase()) {
        getItemDetailsById.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getItemResult'.toLowerCase()) {
        getItemResult.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getPersonalInformation'.toLowerCase()) {
        getPersonalInformation.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getstorehomedata'.toLowerCase()) {
        getStoreData.index(client, jsonObj, event, function(response) {
            console.log("..response...",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getStoredetails'.toLowerCase()) {
        console.log(".......innnn")
        getStoredetails.index(client, jsonObj, event, function(response) {
            console.log(".response...",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getStoreRelatedData'.toLowerCase()) {
        getStoreRelatedData.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getStoreServingLocations'.toLowerCase()) {
        getStoreServingLocations.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getTrackOrder'.toLowerCase()) {
        getTrackOrder.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'userlogin'.toLowerCase()) {
        getUserAuthentication.index(client, jsonObj, event, function(response) {
            console.log("-------userlogin--------------------------",response.result.userData)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getWishList'.toLowerCase()) {
        getWishList.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'homePageData'.toLowerCase()) {
        homePageData.index(client, jsonObj, event, function(response) {
            console.log("..response...",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'itemContactUsSave'.toLowerCase()) {
        itemContactUsSave.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'lokal'.toLowerCase()) {
       console.log("start...",new Date().getSeconds());
        lokal.index(client, jsonObj, event, function(response) {
            console.log("End...",new Date().getSeconds());
             console.log("response lokal....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            //console.timeEnd();
            
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'myOrderSave'.toLowerCase()) {
        myOrderSave.index(client, jsonObj, event, function(response) {
               console.log("response.....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'myShopp'.toLowerCase()) {
        myShopp.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'pothys'.toLowerCase()) {
        pothys.index(client, jsonObj, event, function(response) {
            console.log("pothys response....",response)
        response = {
                "token": encryptDecrypt.encryptData(response).toString()
        }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'promoCode'.toLowerCase()) {
        promoCode.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'removeWishList'.toLowerCase()) {
        removeWishList.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'restaurantHome'.toLowerCase()) {
        restaurantHome.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'rtBookYourTable'.toLowerCase()) {
        rtBookYourTable.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'rtItemListing'.toLowerCase()) {
        rtItemListing.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'rtLeftMenu'.toLowerCase()) {
        rtLeftMenu.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'rtOrderDetails'.toLowerCase()) {
        rtOrderDetails.index(client, jsonObj, event, function(response) {
            console.log("........Index Result......",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'rtstoreDetails'.toLowerCase()) {
        rtstoreDetails.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'saveDeliveryAddress'.toLowerCase()) {
      
        saveDeliveryAddress.index(client, jsonObj, event, function(response) {
              console.log("...saveDeliveryAddress...",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'saveUserDashboardDetails'.toLowerCase()) {
        saveUserDashboardDetails.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'searchResult'.toLowerCase()) {
        searchResult.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'updateAccountDetails'.toLowerCase()) {
        updateAccountDetails.index(client, jsonObj, event, function(response) {
            console.log("....response...",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'updateAddressDetails'.toLowerCase()) {
        updateAddressDetails.index(client, jsonObj, event, function(response) {
            
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'updateFeedback'.toLowerCase()) {
        updateFeedback.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'userDashboardDetails'.toLowerCase()) {
        userDashboardDetails.index(client, jsonObj, event, function(response) {
            console.log("...response..",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'usersignup'.toLowerCase()) {
        userRegistration.index(client, jsonObj, event, function(response) {
            console.log("usersignup....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'userVerification'.toLowerCase()) {
        userVerification.index(client, jsonObj, event, function(response) {
            console.log("response......",JSON.stringify(response,0,null))
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'wishListSave'.toLowerCase()) {
        wishListSave.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    /*
        else if(functionName[0].toString().toLowerCase() == 'getsitedetails'.toLowerCase()){
            yesbank_getSiteDetails.index(client,jsonObj,event, function(response){
                 callback(null,response)
            });
        }*/
    else if (functionName[0].toString().toLowerCase() == 'getsitedetail'.toLowerCase()) {
        getSiteDetail.index(client, jsonObj, event, function(response) {

            console.log("response...",JSON.stringify(response,0,null))
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }

            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'pharmacy'.toLowerCase()) {
        pharmacy.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'alcohol'.toLowerCase()) {
        alcohol.index(client, jsonObj, event, function(response) {
            console.log("response....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'common'.toLowerCase()) {
        common.index(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'admin'.toLowerCase()) {
        admin.index(client, jsonObj, event, function(response) {
            // console.log("response..response..",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getPlanDetails'.toLowerCase()) {
        getPlanDetails.getPlanDetails(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'saveSellerDetails'.toLowerCase()) {
        saveSellerDetails.saveSellerDetails(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getUserConfiguration'.toLowerCase()) {
        getUserConfiguration.getUserConfiguration(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'saveRazorPaymentDetails'.toLowerCase()) {
        saveRazorPaymentDetails.saveRazorPaymentDetails(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'sendMailRazorPaymentDetails'.toLowerCase()) {
        saveRazorPaymentDetails.sendMailRazorPaymentDetails(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'razorPayStatusChange'.toLowerCase()) {
        razorPayStatusChange.razorPayStatusChange(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'saveSubscriptionDetails'.toLowerCase()) {
        saveSubscriptionDetails.saveSubscriptionDetails(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'razorpayPlanDetails'.toLowerCase()) {
        razorpayPlanDetails.razorpayPlanDetails(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'itemWithOutImage'.toLowerCase()) {
        itemWithOutImage.itemWithOutImage(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'stockUpdate'.toLowerCase()) {
        console.log("start...",new Date().getSeconds())
        stockUpdate.index(client, jsonObj, event, function(response) {
           console.log("End...",new Date().getSeconds(),"...response...",response)  
           
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'createUpiPayment'.toLowerCase()) {
        createUpiPayment.createUpiPayment(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'itemMapping'.toLowerCase()) {
       
        itemMapping.index(client, jsonObj, event, function(response) {
             console.log("itemMapping response....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'sellerAppLogin'.toLowerCase()) {
        sellerAppLogin.sellerAppLogin(client, jsonObj, event, function(response) {
            console.log("response...",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'adminSiteUrlDecryption'.toLowerCase()) {
        adminSiteUrlDecryption.adminSiteUrlDecryption(client, jsonObj, event, function(response) {
            console.log("---------------",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }

    else if (functionName[0].toString().toLowerCase() == 'sellerAppOrderManagementMain'.toLowerCase()) {
        sellerAppOrderManagementMain.sellerAppOrderManagementMain(client, jsonObj, event, function(response) {
            console.log("sellerAppOrderManagementMain11111111111111..............",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'sellerAppOrderManagementSub'.toLowerCase()) {
        sellerAppOrderManagementSub.sellerAppOrderManagementSub(client, jsonObj, event, function(response) {
            // console.log("response.....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'sellerAppOrderDetails'.toLowerCase()) {
        sellerAppOrderDetails.sellerAppOrderDetails(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'sellerAppChangeStatus'.toLowerCase()) {

        sellerAppChangeStatus.sellerAppChangeStatus(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'groceryitemlisting'.toLowerCase()) {

        groceryitemListing.groceryitemListing(client, jsonObj, event, function(response) {
            console.log("NonTokenresponse.........", response)

            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            //console.log("Tokenresponse.........", response)
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'commonItemListing'.toLowerCase()) {

        commonItemListing.commonItemListing(client, jsonObj, event, function(response) {
            console.log("NonTokenresponse.........", response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            console.log("Tokenresponse.........", response)
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'restaurantItemListing'.toLowerCase()) {

        restaurantItemListing.restaurantItemListing(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'saveGroceryStock'.toLowerCase()) {

        saveGroceryStock.saveGroceryStock(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'saveRestuarantStock'.toLowerCase()) {

        saveRestuarantStock.saveRestuarantStock(client, event, event, function(response) {
            console.log("saveRestuarantStock..response..",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }

            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'saveStoreSubDomain'.toLowerCase()) {

        saveStoreSubDomain.saveStoreSubDomain(client, event, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }

            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getStoreSubDomain'.toLowerCase()) {

        saveStoreSubDomain.getStoreSubDomain(client, event, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }

            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'statusChangeStoreSubDomain'.toLowerCase()) {

        saveStoreSubDomain.statusChangeStoreSubDomain(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }

            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'saveCommonItemStock'.toLowerCase()) {

        saveCommonItemStock.saveCommonItemStock(client, event, event, function(response) {
           console.log("saveCommonItemStock......",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }

            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getRtItemSize'.toLowerCase()) {

        getRtItemSize.getRtItemSize(client, event, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }

            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'sellerRegistrationSendMail'.toLowerCase()) {
        sellerRegistrationSendMail.sellerRegistrationSendMail(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getTaxGroupDetails'.toLowerCase()) {
        getTaxGroupDetails.getTaxGroupDetails(client, jsonObj, event, function(response) {
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'restaurantItemWiseReport'.toLowerCase()) {
        rtItemWiseSalesReport.restauarantItemWiseSaleReport(client, jsonObj, event, function(response) {
          console.log("response....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'groceryItemWiseSaleReport'.toLowerCase()) {
        groceryItemWiseSalesReport.groceryItemWiseSaleReport(client, jsonObj, event, function(response) {
              console.log("response......",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'cmItemWiseSaleReport'.toLowerCase()) {
        commonItemWiseSaleReport.cmItemWiseSaleReport(client, jsonObj, event, function(response) {
            // console.log("response.....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
     else if (functionName[0].toString().toLowerCase() == 'getItemTaxGroupDetails'.toLowerCase()) {
        getItemTaxGroupDetails.getItemTaxGroupDetails(client, jsonObj, event, function(response) {
            // console.log("response.....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
     else if (functionName[0].toString().toLowerCase() == 'saveItemTaxGroupDetails'.toLowerCase()) {
        saveUpdateItemTaxGroupDetails.saveOrUpdateItemTaxGroupDetails(client, jsonObj, event, function(response) {
            // console.log("response.....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'saveRestaurantItemTaxGroupDetails'.toLowerCase()) {
        saveOrUpdateRestaurantItemTaxGroupDetails.saveOrUpdateRestaurantItemTaxGroupDetails(client, jsonObj, event, function(response) {
            // console.log("response.....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    
   else if (functionName[0].toString().toLowerCase() == 'saveCommonItemTaxGroupDetails'.toLowerCase()) {
        saveOrUpdateCommonItemTaxGroupDetails.SaveUpdateCommItemTaxGroupDetails(client, jsonObj, event, function(response) {
            // console.log("response.....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
      else if (functionName[0].toString().toLowerCase() == 'getRtItemTaxGroupDetails'.toLowerCase()) {
        getRestItemTaxGroupDetails.getRestItemTaxGroupDetails(client, jsonObj, event, function(response) {
            // console.log("response.....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    
     else if (functionName[0].toString().toLowerCase() == 'getCommonItemTaxGroupDetails'.toLowerCase()) {
        getCommonItemTaxGroupDetails.getCommonItemTaxGroupDetails(client, jsonObj, event, function(response) {
            // console.log("response.....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    
       else if (functionName[0].toString().toLowerCase() == 'saveWhatsAppMessageContentSiteDetails'.toLowerCase()) {
        saveMessageContentSiteDetails.saveWhatsAppMessageContentSiteDetails(client, jsonObj, event, function(response) {
            // console.log("response.....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'deleteRtMasterDetails'.toLowerCase()) {
        deleteRtMasterDetails.deleteRtMasterDetails(client, jsonObj, event, function(response) {
        console.log("response.....",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
     else if (functionName[0].toString().toLowerCase() == 'ondcFullfilmentStates'.toLowerCase()) {
        ondcFullfilmentStates.ondcFullfilmentStates(client, jsonObj, event, function(response) {
        console.log("response...ondcFullfilmentStates..",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getOndcUnits'.toLowerCase()) {
        getOndcUnits.ondcUnits(client, jsonObj, event, function(response) {
        console.log("response...getOndcUnits..",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getOndcLogisticsDeliveryCharge'.toLowerCase()) {
        getOndcLogisticsDeliveryCharges.getOndcLogisticsDeliveryCharge(client, jsonObj, event, function(response) {
        console.log("response...getOndcLogisticsDeliveryCharges..",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getOndcCancellReasons'.toLowerCase()) {
        getOndcCancellReasons.ondcCancellReasonsList(client, jsonObj, event, function(response) {
         console.log("response...getOndcCancellReasons..",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'getMappedAndUnMappedRestaurentItems'.toLowerCase()) {
        getMappedAndUnMappedRestaurentItems.mappedAndUnMappedRestaurantItemsListing(client, jsonObj, event, function(response) {
         console.log("response...getMappedAndUnMappedRestaurentItems..",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'updateGroceryStoreItemStock'.toLowerCase()) {
      
        updateGroceryStoreItemStock.updateStoreItemStockGrocery(client, jsonObj, event, function(response) {
         console.log("response...UpdateGroceryStoreItemStock..",response)
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'groceryItemStockSaveUpdate'.toLowerCase()) {
        console.log("start...",new Date().getSeconds());
        groceryItemStockSaveUpdate.newGroceryItemStockSaveUpdate(client, event, function(response) {
         console.log("response...groceryItemStockSaveUpdate..",response)
          console.log("End...",new Date().getSeconds());
            response = {
                "token": encryptDecrypt.encryptData(response).toString()
            }
            callback(null, response)
        });
    }
    else if (functionName[0].toString().toLowerCase() == 'saveSetPermission'.toLowerCase()) {
    saveSetPermission.saveSetPermission(client, jsonObj, event, function (response) {
        console.log("response.....", response)
        response = {
            "token": encryptDecrypt.encryptData(response).toString()
        }
        callback(null, response)
    });
}
else if (functionName[0].toString().toLowerCase() == 'setPermissionList'.toLowerCase()) {
    setPermissionList.setPermissionList(client, jsonObj, event, function(response) {
    console.log("response.....",response)
        response = {
            "token": encryptDecrypt.encryptData(response).toString()
        }
         callback(null, response)
    });
}
else if (functionName[0].toString().toLowerCase() == 'userWiseSetPermissionList'.toLowerCase()) {
    userWiseSetPermissionList.userWiseSetPermissionList(client, jsonObj, event, function(response) {
    console.log("response.....",response)
        response = {
            "token": encryptDecrypt.encryptData(response).toString()
        }
         callback(null, response)
    });
}
 else if (functionName[0].toString().toLowerCase() == 'editGroceryItemStockList'.toLowerCase()) {
    editGroceryItemStockList.editGroceryItemStockList(client, jsonObj, event, function(response) {
    console.log("response.....",response)
        response = {
            "token": encryptDecrypt.encryptData(response).toString()
        }
         callback(null, response)
    });
}   
    else {
         
        //console.log("warming up myyshopp")
        //var query = "SELECT id FROM sec_user WHERE id = 1"
        //client.query(query, function (error, result, fields) {
        let data = {
            success: "0",
            result: [],
            errorMessage: "Function not exist0",
            successMessage: ""
        };
        data = {
            "token": encryptDecrypt.encryptData(data).toString()
        }
        callback(null, data)
        //});
    }
}
