let mysql = require('mysql');
let methods = {};
let queryExecution = require('../queryExecution');
const orderReview = require('./orderReview');
methods.sellerAppOrderManagementSub = function (client, jsonObj, event, callback) {
    //console.log("event....",event)
    let restaurantData = [];
    let taxData = [];
    let resrdataNew = [];
    let orderStatus = []
    let orderId = event.orderId
    let itemQuery = "";
    let itemQueryParams = [];
    let commonItemData = [];
    let groceryItemData = [];
    let taxDataGroup = []
    let orderData = []
    let storeAddressQuery = " select cr.symbol AS currencySymbol,st.email_footer_text as email_footer_text, st.name as storeName,st.address1 as storeAddress1," +
        " st.address2 as storeAddress2,so.sale_id as saleId,st.consumer_card_name as consumerCardName,c.name as cityName,s.name as stateName,st.id,st.locality as locality," +
        " su.email_id as email,st.telephone_number as telephone,su.mobile_number as mobile,so.id as orderId, " +
        " CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',  (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/',  st.logo_path) AS logopath, so.promocode_item_name as promoCodeItemName,so.promo_code_amount as promoCodeAmount " +
        " from store as st " +
        " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
        " inner join sale_order as so on so.store_id = st.id " +
        " inner join sec_user as su on su.id = st.sec_user_id " +
        " inner join city as c on c.id = st.city_id " +
        " inner join state as s on s.id = c.state_id " +
        " where so.id = ? ";
    queryExecution.queryExecution(client, jsonObj, event, storeAddressQuery, [orderId], function (response) {
        if (response.success == '0') {
            //   console.log("111111")
            callback(response);
        }
        let storeAddressQueryResult = response.result;
        let currency = storeAddressQueryResult.length > 0 ? storeAddressQueryResult[0].currencySymbol + " " : "Rs. "
        let orderQueryData = []
        let taxQry = ""
        if (event.mainGroupCategoryId == 1) {
            taxQry = " SELECT soi.id AS saleOrderItemId,soi.`item_id` AS itemId,GROUP_CONCAT(soit.`tax_name`) AS taxName,GROUP_CONCAT(soit.`tax_percentage`) AS taxPercentage,GROUP_CONCAT(soit.`tax_amount`) AS taxAmount, " +
                " soi.`group_name` AS taxGroupName,soi.`group_percentage` AS taxGroupPercentage,soi.`group_item_tax_amount` AS taxGroupTotal, " +
                " soi.`tax_group_id` AS taxGroupId " +
                " FROM `sale_order_item_tax_details` AS soit " +
                " INNER JOIN `sale_order_item` AS soi ON soit.`sale_order_item_id` = soi.id " +
                " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
                " WHERE so.id = ? " +
                " GROUP BY soi.`item_id` ;"
        }
        else if (event.mainGroupCategoryId == 5) {
            taxQry =
                " SELECT soi.id AS saleOrderItemId,soi.`rt_store_item_id` AS itemId,GROUP_CONCAT(soit.`tax_name`) AS taxName,GROUP_CONCAT(soit.`tax_percentage`) AS taxPercentage,GROUP_CONCAT(soit.`tax_amount`) AS taxAmount, " +
                " soi.`group_name` AS taxGroupName,soi.`group_percentage` AS taxGroupPercentage,soi.`group_item_tax_amount` AS taxGroupTotal, " +
                " soi.`tax_group_id` AS taxGroupId " +
                " FROM `rt_sale_order_item_tax_details` AS soit " +
                " INNER JOIN `rt_sale_order_items` AS soi ON soit.`rt_sale_order_item_id` = soi.id " +
                " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
                " WHERE so.id = ? " +
                " GROUP BY soi.`rt_store_item_id` ;"
        }
        else if (event.mainGroupCategoryId == 8) {
            taxQry =
                " SELECT soi.id AS saleOrderItemId,soi.`cm_item_id` AS itemId,GROUP_CONCAT(soit.`tax_name`) AS taxName,GROUP_CONCAT(soit.`tax_percentage`) AS taxPercentage,GROUP_CONCAT(soit.`tax_amount`) AS taxAmount, " +
                " soi.`group_name` AS taxGroupName,soi.`group_percentage` AS taxGroupPercentage,soi.`group_item_tax_amount` AS taxGroupTotal, " +
                " soi.`tax_group_id` AS taxGroupId " +
                " FROM `cm_sale_order_items_tax_details` AS soit " +
                " INNER JOIN `cm_sale_order_item` AS soi ON soit.`cm_sale_order_item_id` = soi.id " +
                " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
                " WHERE so.id = ? " +
                " GROUP BY soi.`cm_item_id` ;"
        }

        let orderQuery = " select if(py.paymentId is null,'',py.paymentId) as paymentId, if(bsa.alternate_number,bsa.alternate_number,'') as alternateNumber,so.id as orderId,os.name as orderStatus,os.id as orderStatusId,so.consumer_number as consumerNumber,mc.name as mainCategoryName," +
            " p.name as paymentType,date_format(s.sale_date,'%d-%m-%Y %I:%i %p') as orderDate,so.delivery_slot as deliverySlot,bsa.name as buyerName,bsa.address1 as buyerAddress1,bsa.address2 as buyerAddress2, " +
            " so.delivery_charge as deliverCharge,so.promocode_item_name as promoCodeItemName,so.promo_code_amount as promoCodeAmount," +
            " so.promo_code_id as promoCode,so.gross_amount as orderNetAmount,so.main_category_id as mainCatId, " +
            " l.name as locationName,c.name as cityName,sta.name as stateName,st.id as storeId,st.name as storeName, " +
            " bsa.telephone_number as buyerTelephone,bsa.zip as zipcode,su.email_id as buyerEmail,bsa.id as buyerAddressId," +
            " s.site_id as siteId,s.created_by as created,so.dine_in_no_of_people as dineIn,if(so.`is_dine_in` is true,'1','0') as isDineIn," +
            " if(so.`is_store_pick_up` is true,'1','0') as isStorePickUp,if(so.alcohol_receiver_name is not null,so.alcohol_receiver_name,'') as receiverName,if(so.alcohol_receiver_name is not null,aao.name,'') as receiverOptionsName,if(so.alcohol_receiver_name is not null,aro.name,'') as orderOptionsName " +
            " from sale as s " +
            " inner join sale_order as so on s.id = so.sale_id " +
            " left join payment as py on py.id = s.payment_id " +
            " inner join main_category as mc on mc.id=so.main_category_id " +
            " inner join sale_order_status as sos on so.id = sos.sale_order_id " +
            " left join alcohol_receive_options as aro on aro.id = so.alcohol_receive_options_id " +
            " left join alcohol_order_options as aao on aao.id = so.alcohol_order_options_id " +
            " inner join order_status as os on os.id = sos.order_status_id " +
            " inner join buyer_delivery_address as bsa on bsa.id = s.buyer_delivery_address_id " +
            " inner join location as l on l.id= bsa.location_id " +
            " inner join city as c on c.id = l.city_id " +
            " inner join state as sta on sta.id = c.state_id " +
            " inner join store as st on st.id = so.store_id " +
            " inner join sec_user as su on su.id = s.buyer_id " +
            " inner join payment_type as p on p.id = s.payment_type_id " +
            "  where s.is_active = true " +
            " and sos.is_current_status = true " +
            " and so.id= ?;" +

            " select tax.tax_amount as taxAmount,tax.tax_name as taxName, tax.tax_percentage as taxPercentage, " +
            "tax.sale_order_id as saleOrderId,so.store_id " +
            " from sale_order_tax_details as tax " +
            " inner join sale_order as so on so.id=tax.sale_order_id " +
            " where tax.sale_order_id= ?;" + taxQry



        queryExecution.queryExecution(client, jsonObj, event, orderQuery, [orderId, event.orderId, event.orderId], function (response) {
            if (response.success == '0') {
                //  console.log("222222")
                callback(response);
            }
            let orderQueryResults = response.result;
            //   console.log("orderQueryResults......",orderQueryResults)
            let itemTaxGroupByResult = orderQueryResults[2] ? orderQueryResults[2] : []

            //----------------------------------

            let itemTaxDetails = []

            if (itemTaxGroupByResult.length > 0) {
                for (let s = 0; s < itemTaxGroupByResult.length; s++) {
                    console.log("itemTaxQueryResult[s].taxName......", itemTaxGroupByResult[s].taxName)
                    let detailTaxName = itemTaxGroupByResult[s].taxName.split(",")
                    let detailTaxAmount = itemTaxGroupByResult[s].taxAmount.split(",")
                    let detailTaxPercentage = itemTaxGroupByResult[s].taxPercentage.split(",")
                    let taxDetail = []
                    for (let x = 0; x < detailTaxName.length; x++) {
                        taxDetail[x] = {
                            taxName: detailTaxName[x],
                            taxAmount: detailTaxAmount[x],
                            taxPercentage: detailTaxPercentage[x]
                        }
                    }
                    //  console.log("taxDetail..................",taxDetail)
                    itemTaxDetails[s] = {
                        taxGroupId: itemTaxGroupByResult[s].taxGroupId,
                        taxGroupName: itemTaxGroupByResult[s].taxGroupName,
                        groupTaxPercentage: itemTaxGroupByResult[s].taxGroupPercentage,
                        itemId: itemTaxGroupByResult[s].itemId,
                        taxGroupTotal: itemTaxGroupByResult[s].taxGroupTotal,
                        taxDetail: taxDetail
                    }
                }

                //  console.log("itemTaxDetails..................",itemTaxDetails)
                const out = Object.values(itemTaxDetails.reduce((acc, c) => {
                    const { taxGroupId } = c;
                    acc[taxGroupId] = (acc[taxGroupId] || []).concat(c);
                    return acc;
                }, {}));
                //	console.log("out...", out)
                taxDataGroup = []
                for (var k = 0; k < out.length; k++) {
                    let taxGroupTotal = 0
                    let newTax = []
                    for (var n = 0; n < out[k].length; n++) {

                        taxGroupTotal = taxGroupTotal + out[k][n].taxGroupTotal
                        taxDataGroup[k] = {

                            taxPercentage: out[k][n].groupTaxPercentage,
                            taxName: out[k][n].taxGroupName,
                            taxGroupId: out[k][n].taxGroupId,
                            itemId: out[k][n].itemId,
                            taxAmount: taxGroupTotal,
                            taxsArray: out[k][n].taxDetail

                        }
                    }
                }
                //	console.log("taxDataGroup.....................",taxDataGroup)

            }

            //----------------------------------

            for (let k = 0; k < orderQueryResults[1].length; k++) {

                let tax = 0

                const taxDetails = {
                    taxName: orderQueryResults[1][k].taxName,
                    taxPercentage: orderQueryResults[1][k].taxPercentage,
                    taxAmount: currency + orderQueryResults[1][k].taxAmount.toFixed(2)
                }
                taxData.push(taxDetails)
            }
            if (orderQueryResults[0][0].mainCatId == 8 || orderQueryResults[0][0].mainCatId == 9 || orderQueryResults[0][0].mainCatId == 11 || orderQueryResults[0][0].mainCatId == 18) {
                orderQueryResults[0][0].mainCatId = 8
            }
            else if (orderQueryResults[0][0].mainCatId == 1, orderQueryResults[0][0].mainCatId == 2, orderQueryResults[0][0].mainCatId == 3, orderQueryResults[0][0].mainCatId == 4, orderQueryResults[0][0].mainCatId == 7, orderQueryResults[0][0].mainCatId == 13, orderQueryResults[0][0].mainCatId == 14, orderQueryResults[0][0].mainCatId == 15, orderQueryResults[0][0].mainCatId == 16, orderQueryResults[0][0].mainCatId == 21, orderQueryResults[0][0].mainCatId == 24, orderQueryResults[0][0].mainCatId == 25) {
                orderQueryResults[0][0].mainCatId = 1
            }
            event.mainGroupCategoryId = event.mainGroupCategoryId ? event.mainGroupCategoryId : orderQueryResults[0][0].mainCatId
            if (event.mainGroupCategoryId == 1) {
                itemQuery = " SELECT cr.symbol AS currencySymbol,st.name as storeName,so.main_category_id,st.id as storeId,s.id as saleId,so.id as orderId,soi.net_amount as totalItemAmount,(soi.net_amount* soi.quantity) as Amount," +
                    " s.net_amount as saleNetAmount,concat(soi.unit,'',soi.unit_type)as sizeItem,s.gross_amount as salegrossAmount,(soi.quantity* soi.item_price) as totalPrice,  soi.item_name as itemName," +
                    " b.name as brandName,so.delivery_charge as delivaryCharge,p.name as packName,soi.review_status as reviewStatus, soi.quantity as quantity,soi.mrp as mrpprice,soi.net_amount as netAmount," +
                    " so.delivery_charge as deliveryCharge ,soi.item_code as itemCode,soi.mrp as itemMrp,soi.item_price as itemPrice,so.consumer_number as conNumber,so.delivery_slot as slot,it.is_loose_item as looseItem,  (select sum(soi.net_amount) " +
                    " from sale_order_item as soi where soi.sale_order_id = so.id) as itemNetAmount,CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',  (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
                    " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/',  st.logo_path) AS logopath, sos.unit as stockUnit,sos.net_amount as stockNetAmount,sos.unit_type as stockUnitType," +
                    " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/',(SELECT  config_value FROM configuration WHERE config_key = 'itemImagesFolder'),'/',it.logo_path_thumb) as itemImg, " +
                    " '' as attachmentId,'' as attachment,'' as attachmentName  " +
                    " FROM sale as s" +
                    " INNER JOIN sale_order as so ON s.id = so.sale_id and so.id = ? " +
                    " INNER JOIN store as st ON st.id = so.store_id " +
                    " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
                    //" inner join location_group_type as lgt on lgt.store_id=st.id"+
                    //" inner join group_type as gt on gt.id=lgt.group_type_id "+
                    " INNER JOIN sale_order_item as soi ON soi.sale_order_id = so.id" +
                    " INNER JOIN store_item_stock as sos ON sos.id = soi.store_item_stock_id " +
                    " INNER JOIN item it ON it.id = soi.item_id " +
                    " INNER JOIN pack p ON p.id = it.pack_id " +
                    " LEFT OUTER JOIN brand as b ON it.brand_id=b.id " +
                    " where so.id= ? " +
                    " UNION " +
                    " SELECT cr.symbol AS currencySymbol,st.name as storeName,so.main_category_id,st.id as storeId,s.id as saleId,so.id as orderId,0 as totalItemAmount,0 as Amount," +
                    " s.net_amount as saleNetAmount,'' as sizeItem,s.gross_amount as salegrossAmount,'' as totalPrice,  '' as itemName," +
                    " '' as brandName,so.delivery_charge as delivaryCharge,'' as packName,'' as reviewStatus, 0 as quantity,0 as mrpprice,0 as netAmount," +
                    " so.delivery_charge as deliveryCharge ,'' as itemCode,0 as itemMrp,0 as itemPrice,so.consumer_number as conNumber,so.delivery_slot as slot,'0' as looseItem,  " +
                    " 0 as itemNetAmount,CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',  (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
                    " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/',  st.logo_path) AS logopath, '' as stockUnit,0 as stockNetAmount,'' as stockUnitType," +
                    " '' as itemImg, " +
                    " phba.id as attachmentId,concat((select config_value from configuration where config_key = 's3Address'),'/', " +
                    " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
                    " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                    " (select config_value from configuration where config_key = 's3pharmacyItemFolder') " +
                    " ,'/attachments/',phba.attachment_name) as attachment,phba.attachment_name as attachmentName  " +
                    " FROM sale as s" +
                    " INNER JOIN sale_order as so ON s.id = so.sale_id and so.id = ? " +
                    " INNER JOIN store as st ON st.id = so.store_id " +
                    " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
                    " INNER JOIN ph_buyer_attachments_sale_order as phbaso on phbaso.sale_order_id = so.id " +
                    " INNER JOIN ph_buyer_attachments as phba on phba.id = phbaso.ph_buyer_attachments_id ";
                itemQueryParams = [orderId, orderId, orderId];
            }

            else if (event.mainGroupCategoryId == 5) {
                itemQuery = " select cr.symbol AS currencySymbol,(soi.quantity* soi.total_item_amount) as totalPrice,group_concat(distinct concat(rtItemSl1.name,'|',rtItemSl2.name,'|',sosl.net_amount)) as subitem ," +
                    " soi.sale_order_id as orderId,'' as reviewStatus,(soi.net_amount* soi.quantity) as Amount, " +
                    " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/'," +
                    " (SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/'," +
                    "  (SELECT  config_value FROM configuration WHERE config_key = 's3PathRestaurant'),'/',rtImage.image_name)as restitemImg," +
                    " soi.id,soi.quantity as quantity,soi.item_name as itemName,soi.item_price as itemPrice, soi.net_amount as netAmount, " +
                    " soi.total_item_amount as totalItemAmount,i.name,rtImage.image_name as imageName,so.message,so.delivery_charge as deliveryCharge,isz.name as itemsize, '' as size_name ,i.description as itemDescription" +
                    " from rt_sale_order_items as soi " +
                    " inner join sale_order as so on so.id = soi.sale_order_id " +
                    " INNER JOIN store as st ON st.id = so.store_id " +
                    " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
                    " inner join sale as s on s.id = so.sale_id " +
                    " inner join rt_store_item as i on i.id= soi.rt_store_item_id " +
                    " left JOIN rt_sale_order_item_sublevel sosl on sosl.rt_sale_order_items_id =soi.id " +
                    " left join rt_item_sub_level1 as rtItemSl1 on rtItemSl1.id = sosl.rt_item_sub_level1_id " +
                    " left join rt_item_sub_level2 as rtItemSl2 on rtItemSl2.id = sosl.rt_item_sub_level2_id " +
                    " left join rt_store_item_image as rtImage on rtImage.rt_store_item_id =i.id and rtImage.is_default=1 " +
                    " inner join rt_store_item_size sis on sis.rt_store_item_id=soi.rt_store_item_id " +
                    " inner join rt_item_size isz on isz.id= sis.rt_item_size_id and sis.id= soi.rt_store_item_size_id " +
                    " where so.id = ? " +
                    " group by soi.id ";
                itemQueryParams = [orderId];
            }

            else if (event.mainGroupCategoryId == 8) {
                itemQuery = "SELECT cr.symbol AS currencySymbol,'' as itemCode,s.id as saleId,so.id as orderId,st.id as storeId,csoi.item_price as itemPrice,csoi.net_amount as netAmount," +
                    "s.net_amount as saleNetAmount,s.gross_amount as salegrossAmount,csoi.review_status as reviewStatus,csoi.item_name as itemName, " +
                    " cb.name as brandName, csoi.quantity as quantity,csoi.net_amount as totalItemAmount,csoi.mrp as itemMrp, (csoi.quantity* csoi.net_amount) as totalPrice," +
                    " csoi.net_amount as itemPrice,so.delivery_charge as deliveryCharge,so.consumer_number as conNumber," +
                    " so.delivery_slot as slot,CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/'," +
                    " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                    " (select config_value from configuration where config_key = 's3PathCommonItem'),'/','clothing/',cii.image)as itemImg," +
                    " ci.stock_quantity as stockUnit,ci.net_amount as stockNetAmount,ci.title as packName," +
                    " cs.name as size_name  FROM sale as s" +
                    " INNER JOIN sale_order as so ON s.id = so.sale_id " +
                    " INNER JOIN store as st ON st.id = so.store_id " +
                    " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
                    " INNER JOIN cm_sale_order_item as csoi ON csoi.sale_order_id = so.id " +
                    " inner join cm_item as ci on ci.id=csoi.cm_item_id " +
                    " inner join cm_item_master as cim on cim.id=ci.cm_item_master_id" +
                    " left join cm_item_images as cii on cii.cm_item_id=ci.id and cii.is_default=1 " +
                    " LEFT OUTER JOIN cm_brand as cb ON cb.id=cim.cm_brand_id" +
                    " left join cm_item_size as cis on cis.id = csoi.cm_item_size_id " +
                    " left join cm_size as cs on cs.id = cis.cm_size_id " +
                    " WHERE so.id = ? ";
                itemQueryParams = [orderId];
            }
            else if (event.mainGroupCategoryId == 21) {
                itemQuery = " select soi.id as itemId,soi.item_name as itemName,soi.item_code as itemCode,soi.quantity as quantity," +
                    " soi.net_amount as itemPrice,so.message,b.name as brandName,p.name as packName," +
                    " concat((select config_value from configuration where config_key = 's3Address'),'/'," +
                    " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/'," +
                    " (select config_value from configuration where config_key = 'bucketSubFolder'),'/'," +
                    " (select config_value from configuration where config_key = 's3PharmacyItemFolder'),'/'," +
                    " (select config_value from configuration where config_key = 's3PharmacyItemImages'),'/',i.logo_path) as imageName, " +
                    " i.is_loose_item as looseItem,sos.unit as stockUnit,sos.net_amount as stockNetAmount," +
                    "  sos.unit_type as stockUnitType,soi.review_status as reviewStatus,soi.sale_order_id as orderId " +
                    " from ph_sale_order_item as soi " +
                    " INNER JOIN ph_store_item_stock as sos ON sos.id = soi.store_item_stock_id " +
                    " inner join ph_item as i on i.id= soi.ph_item_id " +
                    " INNER JOIN ph_pack p ON p.id = i.ph_pack_id " +
                    " LEFT OUTER JOIN ph_brand as b ON i.ph_brand_id=b.id " +
                    " inner join sale_order as so on so.id = soi.sale_order_id " +
                    " inner join sale as s on s.id = so.sale_id " +
                    " where so.id = ? ";
                itemQueryParams = [orderId];
            }
            //    console.log("itemQuery....",itemQuery)
            queryExecution.queryExecution(client, jsonObj, event, itemQuery, itemQueryParams, function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                let itemQueryResult = response.result;
                //   console.log("itemQueryResult....",itemQueryResult)
                let orderReviewParams = {
                    orderId: event.orderId
                }
                orderReview.orderReview(client, jsonObj, event, function (data) {
                    let orderCommentQuery = " select sos.comments as comments,os.name as orderStatus " +
                        " from sale_order_status as sos " +
                        " inner join order_status as os on os.id = sos.order_status_id " +
                        " where sos.sale_order_id = ? ";
                    //connection.query(orderCommentQuery, function(error, orderCommentResult, fields) {
                    queryExecution.queryExecution(client, jsonObj, event, orderCommentQuery, [event.orderId], function (response) {
                        if (response.success == '0') {
                            callback(response);
                        }
                        let orderCommentResult = response.result;
                        //    console.log("orderCommentResult....",orderCommentResult)
                        for (let m = 0; m < orderCommentResult.length; m++) {
                            orderStatus[m] = {
                                status: orderCommentResult[m].orderStatus,
                                comments: orderCommentResult[m].comments == "" || orderCommentResult[m].comments == null ? "" : orderCommentResult[m].comments
                            }
                        }

                        let orderReview = data;
                        let subtotal = 0
                        let savedAmount = 0
                        if (orderQueryResults[0][0].mainCatId == 1) {

                            if (itemQueryResult.length > 0) {
                                for (let i = 0; i < itemQueryResult.length; i++) {
                                    let groceryItemListing = [];
                                    groceryItemListing = {
                                        totalPrice: currency + parseFloat(itemQueryResult[i].totalPrice).toFixed(2),
                                        orderId: itemQueryResult[i].orderId,
                                        reviewStatus: itemQueryResult[i].reviewStatus,
                                        quantity: itemQueryResult[i].quantity,
                                        itemCode: itemQueryResult[i].itemCode,
                                        sizeItem: itemQueryResult[i].sizeItem,
                                        itemImg: itemQueryResult[i].itemImg,
                                        Amount: currency + (itemQueryResult[i].Amount.toFixed(2)),
                                        deliveryCharge: itemQueryResult[i].deliveryCharge != 0 ? currency + (itemQueryResult[i].deliveryCharge.toFixed(2)) : "Free",
                                        itemName: itemQueryResult[i].itemName,
                                        itemPrice: currency + (itemQueryResult[i].itemPrice.toFixed(2)),
                                        netAmount: currency + (itemQueryResult[i].netAmount.toFixed(2)),
                                        totalItemAmount: currency + (itemQueryResult[i].totalItemAmount.toFixed(2)),
                                        packName: itemQueryResult[i].packName,
                                        itemMrp: currency + (itemQueryResult[i].itemMrp.toFixed(2)),
                                        phAttachment: itemQueryResult[i].attachment,
                                        phAttachmentName: itemQueryResult[i].attachmentName
                                    }

                                    groceryItemData.push(groceryItemListing)
                                    subtotal = subtotal + (itemQueryResult[i].itemPrice * itemQueryResult[i].quantity)
                                    savedAmount = savedAmount + (itemQueryResult[i].itemMrp * itemQueryResult[i].quantity - itemQueryResult[i].itemPrice * itemQueryResult[i].quantity)

                                }
                            }

                        }


                        else if (orderQueryResults[0][0].mainCatId == 5) {
                            if (itemQueryResult.length > 0) {

                                for (let i = 0; i < itemQueryResult.length; i++) {
                                    let toppings = []
                                    //    console.log("itemQueryResult[i]....",itemQueryResult[i])
                                    if (itemQueryResult[i].subitem != null && itemQueryResult[i].subitem != '') {
                                        let subItemName = itemQueryResult[i].subitem.split(',')
                                        for (let j = 0; j < subItemName.length; j++) {

                                            let subItemNameSplit = subItemName[j].split('|')
                                            let val = 'Free'
                                            if (subItemNameSplit[2] != '0' && subItemNameSplit[2] != '' && subItemNameSplit[2] != null) {
                                                val = 'Rs. ' + parseFloat(subItemNameSplit[2]).toFixed(2)
                                            }
                                            let restsubItemNameSplit = [];
                                            restsubItemNameSplit = {
                                                toppings1: subItemNameSplit[0],
                                                toppings2: subItemNameSplit[1],
                                                toppings3: val
                                            }
                                            toppings.push(restsubItemNameSplit)
                                        }
                                    }
                                    let restauarantListing = [];
                                    restauarantListing = {
                                        totalPrice: currency + parseFloat(itemQueryResult[i].totalPrice).toFixed(2),
                                        subitem: itemQueryResult[i].subitem,
                                        orderId: itemQueryResult[i].orderId,
                                        reviewStatus: itemQueryResult[i].reviewStatus,
                                        quantity: itemQueryResult[i].quantity,
                                        itemName: itemQueryResult[i].itemName,
                                        itemPrice: currency + (itemQueryResult[i].itemPrice.toFixed(2)),
                                        netAmount: currency + (itemQueryResult[i].netAmount.toFixed(2)),
                                        totalItemAmount: currency + (itemQueryResult[i].totalItemAmount.toFixed(2)),
                                        itemsize: itemQueryResult[i].itemsize,
                                        size_name: itemQueryResult[i].size_name,
                                        restitemImg: itemQueryResult[i].restitemImg,
                                        Amount: currency + (itemQueryResult[i].Amount.toFixed(2)),
                                        toppingsData: toppings,
                                        itemImg: itemQueryResult[i].itemImg,
                                        deliveryCharge: itemQueryResult[i].deliveryCharge != 0 ? currency + (itemQueryResult[i].deliveryCharge.toFixed(2)) : "Free",
                                        itemDescription: itemQueryResult[i].itemDescription

                                    }
                                    restaurantData.push(restauarantListing)
                                    //  console.log("restauarantListing....",restauarantListing)
                                    subtotal = subtotal + (itemQueryResult[i].totalItemAmount * itemQueryResult[i].quantity)
                                    savedAmount = savedAmount + (itemQueryResult[i].itemPrice * itemQueryResult[i].quantity - itemQueryResult[i].netAmount * itemQueryResult[i].quantity)
                                }

                            }

                        }


                        else if (orderQueryResults[0][0].mainCatId == 8) {
                            if (itemQueryResult.length > 0) {
                                for (let i = 0; i < itemQueryResult.length; i++) {
                                    let commonItemListing = [];
                                    commonItemListing = {
                                        totalPrice: currency + parseFloat(itemQueryResult[i].totalPrice).toFixed(2),
                                        orderId: itemQueryResult[i].orderId,
                                        reviewStatus: itemQueryResult[i].reviewStatus,
                                        quantity: itemQueryResult[i].quantity,
                                        itemName: itemQueryResult[i].itemName,
                                        itemPrice: currency + (itemQueryResult[i].itemPrice.toFixed(2)),
                                        netAmount: currency + (itemQueryResult[i].netAmount.toFixed(2)),
                                        totalItemAmount: currency + (itemQueryResult[i].totalItemAmount.toFixed(2)),
                                        size_name: itemQueryResult[i].size_name,
                                        packName: itemQueryResult[i].packName,
                                        itemMrp: currency + (itemQueryResult[i].itemMrp.toFixed(2)),
                                        itemImg: itemQueryResult[i].itemImg,
                                        deliveryCharge: itemQueryResult[i].deliveryCharge != 0 ? currency + (itemQueryResult[i].deliveryCharge.toFixed(2)) : "Free"

                                    }
                                    commonItemData.push(commonItemListing)
                                    subtotal = subtotal + (itemQueryResult[i].totalItemAmount * itemQueryResult[i].quantity)
                                    savedAmount = savedAmount + (itemQueryResult[i].itemPrice * itemQueryResult[i].quantity - itemQueryResult[i].netAmount * itemQueryResult[i].quantity)
                                }
                            }
                        }

                        let delivaryCharge
                        resrdataNew = [{
                            subtotal: currency + (subtotal.toFixed(2)),
                            savedAmount: currency + (savedAmount.toFixed(2)),
                            delivaryCharge: orderQueryResults[0][0].deliverCharge != 0 ? currency + (orderQueryResults[0][0].deliverCharge.toFixed(2)) : "Free",
                            grandtotal: currency + (orderQueryResults[0][0].orderNetAmount.toFixed(2)),
                            taxData: taxData,
                            taxDataGroup: taxDataGroup,
                            itemWiseTax: itemTaxDetails
                        }]
                        console.log("resrdataNew....", resrdataNew)
                        const responseData = {
                            success: "1",
                            result: {
                                "storeDetails": storeAddressQueryResult,
                                "orderDetails": orderQueryResults[0],
                                "groceryItemListing": groceryItemData,
                                "restauarantItemListing": restaurantData,
                                "commonItemListing": commonItemData,
                                "taxDetails": resrdataNew,
                                "orderReviewDetails": orderReview,
                                "orderStatus": orderStatus
                            },
                            errorMessage: "",
                            successMessage: "Success"
                        };
                        console.log("responseData....", responseData)
                        callback(responseData);
                    });
                });
            })
        })
    })
}
module.exports = methods;
