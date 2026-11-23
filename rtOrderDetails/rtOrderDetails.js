const mysql = require('mysql');
const methods = {};
let queryExecution = require('../queryExecution');
//let taxCommonFunction = require('./taxCommonFunction');

methods.index = async function (client, jsonObj, event, callback) {

    let restaurantData = [];
    let taxData = [];
    let orderId = event.orderId
    let itemQuery = "";
    let itemQueryParams = [];
    let commonItemData = [];
    let groceryItemData = [];
    let taxDataGroup = []
    var taxDatas = []
    let storeAddressQuery = " select cr.symbol AS currencySymbol,st.email_footer_text as email_footer_text, st.name as storeName,st.address1 as storeAddress1," +
        " st.address2 as storeAddress2,so.sale_id as saleId,st.consumer_card_name as consumerCardName,c.name as cityName,s.name as stateName,st.id,st.locality as locality," +
        " su.email_id as email,st.telephone_number as telephone,su.mobile_number as mobile,so.id as orderId,st.pan_number as panNumber,st.gst_number as gstNumber,s.code as stateCode,p.paymentid as paymentTransactionId, " +
        " CONCAT((SELECT config_value FROM configuration WHERE config_key = 's3Address'),'/'," +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeDigS3BucketName'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
        " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/thumb/',st.logo_path) as storeImagePath " +
        " from store as st " +
        " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
        " inner join sale_order as so on so.store_id = st.id " +
        " inner join sale as sl on sl.id = so.sale_id " +
        " left join payment as p on p.id = sl.payment_id " +
        " inner join sec_user as su on su.id = st.sec_user_id " +
        " inner join city as c on c.id = st.city_id " +
        " inner join state as s on s.id = c.state_id " +
        " where so.id = ? ";
    console.log("Start.....1", new Date().getSeconds());
    await queryExecution.queryExecution(client, jsonObj, event, storeAddressQuery, [orderId], async function (response) {
        if (response.success == '0') {
            callback(response);
        }
        console.log("Start.....2", new Date().getSeconds());
        let storeAddressQueryResult = response.result;
        let orderQueryData = []

        let orderQuery = " select if(so.promo_code_id is null,'',pc.code) as promoCode,if(so.promo_code_amount is null,0,so.promo_code_amount) as promoCodeAmount,so.consumer_number as consumerNumber, so.message as comments,cr.symbol AS currencySymbol,so.id as orderId,os.name as orderStatus,so.consumer_number as consumerNumber,mc.name as mainCategoryName," +
            " p.name as paymentType,date_format(s.sale_date,'%d-%b-%Y %I:%i %p') as orderDate,so.delivery_slot as deliverySlot,bsa.name as buyerName,bsa.address1 as buyerAddress1,bsa.address2 as buyerAddress2, " +
            " so.delivery_charge as deliverCharge,so.promocode_item_name as promoCodeItemName," +
            " so.promo_code_id as promoCodeId,so.gross_amount as orderNetAmount,so.main_category_id as mainCatId, " +
            " l.name as locationName,c.name as cityName,sta.name as stateName,st.id as storeId,sta.id as stateId, " +
            " bsa.telephone_number as buyerTelephone,bsa.zip as zipcode,su.email_id as buyerEmail,bsa.id as buyerAddressId," +
            " s.site_id as siteId,s.created_by as created,so.dine_in_no_of_people as dineIn,if(so.`is_dine_in` is true,'1','0') as isDineIn," +
            " if(so.`is_store_pick_up` is true,'1','0') as isStorePickUp,if(so.alcohol_receiver_name is not null,so.alcohol_receiver_name,'') as receiverName,if(so.alcohol_receiver_name is not null,aao.name,'') as receiverOptionsName,if(so.alcohol_receiver_name is not null,aro.name,'') as orderOptionsName, st.consumer_card_name as consumerCardName " +
            " ,so.cancelled_convenience_fee as cancelledConvenienceFee , so.cancelled_tax as cancelledTax ,so.cancelled_total as cancelledTotal ,(s.ondc_covenient_fee - so.cancelled_convenience_fee) as ondcConvenientFee," +
            " s.returned_convenience_fee,s.returned_tax,s.returned_total,so.ondc_conveniencefee_tax,so.ondc_deliveryCharge_tax,bba.first_name as billingName,bba.address1 as billingAddress1,bba.address2 as billingAddress2,bba.telephone_number as billingTelephone,bba.zip as billingZip,stat.id as billingStateId,stat.code as billingStateCode,sta.code as shippingStateCode  " +
            " from sale as s " +
            " inner join sale_order as so on s.id = so.sale_id " +
            " inner join main_category as mc on mc.main_group_category_id=so.main_category_id " +
            " inner join sale_order_status as sos on so.id = sos.sale_order_id " +
            " left join alcohol_receive_options as aro on aro.id = so.alcohol_receive_options_id " +
            " left join alcohol_order_options as aao on aao.id = so.alcohol_order_options_id " +
            " inner join order_status as os on os.id = sos.order_status_id " +
            " inner join buyer_delivery_address as bsa on bsa.id = s.buyer_delivery_address_id " +
            " left join buyer_billing_address as bba on bba.id = s.buyer_billing_address_id " +
            " left join location as lc on lc.id= bba.location_id " +
            " left join city as ct on ct.id = lc.city_id " +
            " left join state as stat on stat.id = ct.state_id " +
            " inner join location as l on l.id= bsa.location_id " +
            " inner join city as c on c.id = l.city_id " +
            " inner join state as sta on sta.id = c.state_id " +
            " inner join store as st on st.id = so.store_id " +
            " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
            " inner join sec_user as su on su.id = s.buyer_id " +
            " inner join payment_type as p on p.id = s.payment_type_id " +
            " left join promo_code as pc on pc.id = so.promo_code_id " +
            "  where s.is_active = true " +
            " and sos.is_current_status = true " +
            " and so.id= ? group by so.id;" +

            " SELECT cr.symbol AS currencySymbol,st.store_id as store_id,st.`tax_name` AS taxName,0 as itemNetAmount,st.`tax_percentage` AS taxPercentage,st.`apply_tax_on_id` AS applyTax, IF(st.`apply_tax_on_id`,  (SELECT sd.tax_percentage FROM store_tax_details AS sd WHERE st.`apply_tax_on_id` = sd.id)  ,NULL) AS applyTaxPercentage  " +
            " FROM `store_tax_details` AS st   " +
            " INNER JOIN store as s ON s.id = st.store_id  " +
            " INNER JOIN currency AS cr ON cr.id = s.`currency_id` " +
            " WHERE st.is_active = true and st.`store_id` in (select store_id from sale_order where sale_id = " + storeAddressQueryResult[0].saleId + ");" +

            " select tax.tax_amount as taxAmount,tax.tax_name as taxName, tax.tax_percentage as taxPercentage,cr.symbol AS currencySymbol, " +
            "tax.sale_order_id as saleOrderId,so.store_id " +
            " from sale_order_tax_details as tax " +
            " inner join sale_order as so on so.id=tax.sale_order_id " +
            " inner join store as s on s.id=so.store_id " +
            " INNER JOIN currency AS cr ON cr.id = s.`currency_id` " +
            " where tax.sale_order_id= ?;" +

            " SELECT soi.`tax_group_id` AS taxGroupId,soi.`group_percentage` AS taxGroupPercentage, soi.id as item_id,soi.item_name, " +
            " soi.item_code as itemCode,soi.net_amount,soi.quantity,(soi.net_amount*soi.quantity) as totalPri," +
            " ROUND(SUM(soit.`tax_amount`),2) AS taxAmount, ROUND(((soi.net_amount*soi.quantity)+SUM(soit.`tax_amount`)),2) as totalNetAmt," +
            " soi.`tax_group_id` AS taxGroupId ,tg.group_name " +
            " FROM `sale_order_item_tax_details` AS soit " +
            " INNER JOIN `sale_order_item` AS soi ON soit.`sale_order_item_id` = soi.id " +
            " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
            " inner join tax_group as tg on tg.id=soi.tax_group_id " +
            " WHERE so.id = ? " +
            " group by soi.id ;"




        // " SELECT soi.id AS saleOrderItemId,soi.`item_id` AS itemId,GROUP_CONCAT(soit.`tax_name`) AS taxName,GROUP_CONCAT(soit.`tax_percentage`) AS taxPercentage,GROUP_CONCAT(soit.`tax_amount`) AS taxAmount, " +
        // " soi.`group_name` AS taxGroupName,soi.`group_percentage` AS taxGroupPercentage,soi.`group_item_tax_amount` AS taxGroupTotal, " +
        // " soi.`tax_group_id` AS taxGroupId " +
        // " FROM `sale_order_item_tax_details` AS soit " +
        // " INNER JOIN `sale_order_item` AS soi ON soit.`sale_order_item_id` = soi.id " +
        // " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
        // " WHERE so.id = " + event.orderId + " " +
        // " GROUP BY soi.`item_id` ;"
        const orderQueryParams = [orderId, event.orderId, event.orderId];
        console.log("orderQuery..........", orderQuery)
        await queryExecution.queryExecution(client, jsonObj, event, orderQuery, orderQueryParams, async function (response) {
            if (response.success == '0') {
                callback(response);
            }
            console.log("Start.....3", new Date().getSeconds());
            let orderQueryResults = response.result;
            console.log("......", orderQueryResults)
            //let itemTaxGroupByResult = orderQueryResults[3] ? orderQueryResults[3] : []
            console.log("orderQueryResults[0][0].mainCatId...........", orderQueryResults[0][0].mainCatId)
            if (orderQueryResults[0][0].mainCatId == 1) {
                console.log("..mainCatId..1.");

                itemQuery = " SELECT cr.symbol AS currencySymbol,st.name as storeName,so.main_category_id,st.id as storeId,s.id as saleId,so.id as orderId,soi.net_amount as totalItemAmount," +
                    " s.net_amount as saleNetAmount,concat(soi.unit,'',soi.unit_type)as sizeItem,s.gross_amount as salegrossAmount,(soi.quantity* soi.item_price) as totalPrice,  soi.item_name as itemName," +
                    " b.name as brandName,so.delivery_charge as deliletyCharge,p.name as packName,soi.review_status as reviewStatus, soi.quantity as quantity,soi.mrp as mrpprice,soi.net_amount as netAmount," +
                    " so.delivery_charge as deliveryCharge ,soi.item_code as itemCode,soi.mrp as itemMrp,soi.item_price as itemPrice,so.consumer_number as conNumber,so.delivery_slot as slot,it.is_loose_item as looseItem,  (select sum(soi.net_amount) " +
                    " from sale_order_item as soi where soi.sale_order_id = so.id) as itemNetAmount,CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',  (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/', " +
                    " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/',  st.logo_path) AS logopath, sos.unit as stockUnit,sos.net_amount as stockNetAmount,sos.unit_type as stockUnitType," +
                    " CONCAT((SELECT  config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',(SELECT config_value  FROM configuration WHERE config_key = 'bucketSubFolder'),'/',(SELECT  config_value FROM configuration WHERE config_key = 'itemImagesFolder'),'/',it.logo_path_thumb) as itemImg, " +
                    " '' as attachmentId,'' as attachment,'' as attachmentName,soi.cancelled_quantity,soi.status as itemStatus,soi.id as item_id  " +
                    " FROM sale as s" +
                    " INNER JOIN sale_order as so ON s.id = so.sale_id " +
                    " INNER JOIN store as st ON st.id = so.store_id " +
                    " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
                    " INNER JOIN sale_order_item as soi ON soi.sale_order_id = so.id" +
                    " INNER JOIN store_item_stock as sos ON sos.id = soi.store_item_stock_id " +
                    " INNER JOIN item it ON it.id = soi.item_id " +
                    " INNER JOIN pack p ON p.id = it.pack_id " +
                    " LEFT OUTER JOIN brand as b ON it.brand_id=b.id " +
                    " where so.id= ? " +
                    " UNION " +
                    " SELECT cr.symbol AS currencySymbol,st.name as storeName,so.main_category_id,st.id as storeId, " +
                    " s.id as saleId,so.id as orderId,0 as totalItemAmount, s.net_amount as saleNetAmount,'' as sizeItem, " +
                    " s.gross_amount as salegrossAmount,0 as totalPrice,  '' as itemName, '' as brandName, " +
                    " so.delivery_charge as deliletyCharge,'' as packName,'' as reviewStatus, 0 as quantity,0 as mrpprice, " +
                    " 0 as netAmount, so.delivery_charge as deliveryCharge ,'' as itemCode,0 as itemMrp,0 as itemPrice, " +
                    " so.consumer_number as conNumber,so.delivery_slot as slot,'0' as looseItem, 0 as itemNetAmount, " +
                    "CONCAT((SELECT config_value FROM configuration WHERE config_key = 'cdnImagePath'),'/',  " +
                    " (SELECT config_value FROM configuration WHERE config_key = 'bucketSubFolder'),'/',  " +
                    " (SELECT config_value FROM configuration WHERE config_key = 'storeImagesFolder'),'/',  st.logo_path) " +
                    " AS logopath, 0 as stockUnit,0 as stockNetAmount,'' as stockUnitType, '' as itemImg, " +
                    " phba.id as attachmentId,concat((select config_value from configuration where config_key = 's3Address'),'/', " +
                    " (select config_value from configuration where config_key = 'storeDigS3BucketName'),'/', " +
                    " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                    " (select config_value from configuration where config_key = 's3pharmacyItemFolder') " +
                    " ,'/attachments/',phba.attachment_name) as attachment,phba.attachment_name as attachmentName ,'' as cancelled_quantity,'' as itemStatus,'' as item_id " +
                    " FROM sale as s " +
                    " INNER JOIN sale_order as so ON s.id = so.sale_id  and so.id = ? " +
                    " INNER JOIN store as st ON st.id = so.store_id  " +
                    " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
                    " INNER JOIN ph_buyer_attachments_sale_order as phbaso on phbaso.sale_order_id = so.id " +
                    " INNER JOIN ph_buyer_attachments as phba on phba.id = phbaso.ph_buyer_attachments_id ;" +

                    " SELECT GROUP_CONCAT(DISTINCT soit.`tax_name`) as taxSubGroups " +
                    " FROM `sale_order_item_tax_details` AS soit " +
                    " INNER JOIN `sale_order_item` AS soi ON soit.`sale_order_item_id` = soi.id " +
                    " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
                    " WHERE so.id = ? " +
                    " GROUP BY so.id ;" +


                    " SELECT soi.id AS saleOrderItemId,soi.`tax_group_id` AS taxGroupId,soi.`group_percentage` AS taxGroupPercentage, " +
                    " soi.`group_name` AS taxGroupName,SUM(soit.`tax_amount`) AS groupTotal " +
                    " FROM `sale_order_item_tax_details` AS soit " +
                    " INNER JOIN `sale_order_item` AS soi ON soit.`sale_order_item_id` = soi.id " +
                    " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
                    " WHERE so.id = ? " +
                    " GROUP BY soi.`tax_group_id` " +
                    " ORDER BY soi.`group_percentage` ;" +

                    " SELECT soi.`tax_group_id` AS taxGroupId,soi.`group_percentage` AS taxGroupPercentage, " +
                    " GROUP_CONCAT(DISTINCT soit.`tax_name`) AS taxName,SUM(soit.`tax_amount`) AS taxAmount, " +
                    " GROUP_CONCAT(DISTINCT soit.`tax_percentage`) AS taxPercentage,soi.`tax_group_id` AS taxGroupId " +
                    " FROM `sale_order_item_tax_details` AS soit " +
                    " INNER JOIN `sale_order_item` AS soi ON soit.`sale_order_item_id` = soi.id " +
                    " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
                    " WHERE so.id = ? " +
                    " GROUP BY soi.`tax_group_id`,soit.`tax_name` ;";
                itemQueryParams = [orderId, orderId, event.orderId, event.orderId, event.orderId];
            }
            else if (orderQueryResults[0][0].mainCatId == 5) {
                console.log("..mainCatId..5.");
                itemQuery = " select (soi.quantity* soi.item_price) as totalPrice,group_concat(rtItemSl1.name,'|',rtItemSl2.name,'|',sosl.net_amount) as subitem ," +
                    " soi.sale_order_id as orderId,'' as reviewStatus,cr.symbol AS currencySymbol, " +
                    " soi.id,soi.quantity as quantity,i.name as itemName,soi.item_price as itemPrice, soi.net_amount as netAmount, " +
                    " soi.total_item_amount as totalItemAmount,i.name,rtImage.image_name as imageName,so.message as comments,so.delivery_charge,isz.name as itemsize, '' as size_name, " +
                    " '' as attachmentId,'' as attachment,'' as attachmentName  " +
                    " from rt_sale_order_items as soi " +
                    " inner join sale_order as so on so.id = soi.sale_order_id " +
                    " INNER JOIN store as st ON st.id = so.store_id " +
                    " INNER JOIN currency AS cr ON cr.id = st.`currency_id` " +
                    "  inner join sale as s on s.id = so.sale_id " +
                    " inner join rt_store_item as i on i.id= soi.rt_store_item_id " +
                    "  left JOIN rt_sale_order_item_sublevel sosl on sosl.rt_sale_order_items_id =soi.id " +
                    "  left join rt_item_sub_level1 as rtItemSl1 on rtItemSl1.id = sosl.rt_item_sub_level1_id " +
                    " left join rt_item_sub_level2 as rtItemSl2 on rtItemSl2.id = sosl.rt_item_sub_level2_id " +
                    " left join rt_store_item_image as rtImage on rtImage.rt_store_item_id =i.id and rtImage.is_default=1 " +
                    " inner join rt_store_item_size sis on sis.rt_store_item_id=soi.rt_store_item_id " +
                    " inner join rt_item_size isz on isz.id= sis.rt_item_size_id and sis.id= soi.rt_store_item_size_id " +
                    " where so.id = ? " +
                    " group by soi.id ;" +

                    " SELECT GROUP_CONCAT(DISTINCT soit.`tax_name`) as taxSubGroups " +
                    " FROM `rt_sale_order_item_tax_details` AS soit " +
                    " INNER JOIN `rt_sale_order_items` AS soi ON soit.`rt_sale_order_item_id` = soi.id " +
                    " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
                    " WHERE so.id = ? " +
                    " GROUP BY so.id ;" +


                    " SELECT soi.id AS saleOrderItemId,soi.`tax_group_id` AS taxGroupId,soi.`group_percentage` AS taxGroupPercentage, " +
                    " soi.`group_name` AS taxGroupName,SUM(soit.`tax_amount`) AS groupTotal " +
                    " FROM `rt_sale_order_item_tax_details` AS soit " +
                    " INNER JOIN `rt_sale_order_items` AS soi ON soit.`rt_sale_order_item_id` = soi.id " +
                    " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
                    " WHERE so.id = ? " +
                    " GROUP BY soi.`tax_group_id` " +
                    " ORDER BY soi.`group_percentage` ;" +

                    " SELECT soi.`tax_group_id` AS taxGroupId,soi.`group_percentage` AS taxGroupPercentage, " +
                    " GROUP_CONCAT(DISTINCT soit.`tax_name`) AS taxName,SUM(soit.`tax_amount`) AS taxAmount, " +
                    " GROUP_CONCAT(DISTINCT soit.`tax_percentage`) AS taxPercentage,soi.`tax_group_id` AS taxGroupId " +
                    " FROM `rt_sale_order_item_tax_details` AS soit " +
                    " INNER JOIN `rt_sale_order_items` AS soi ON soit.`rt_sale_order_item_id` = soi.id " +
                    " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
                    " WHERE so.id = ? " +
                    " GROUP BY soi.`tax_group_id`,soit.`tax_name` ;";
                itemQueryParams = [orderId, event.orderId, event.orderId, event.orderId];

            }
            else if (orderQueryResults[0][0].mainCatId == 8) {
                console.log("..mainCatId..8.");
                itemQuery = "SELECT '' as itemCode,cr.symbol AS currencySymbol,s.id as saleId,so.id as orderId,st.id as storeId,csoi.item_price as itemPrice,csoi.net_amount as netAmount," +
                    "s.net_amount as saleNetAmount,s.gross_amount as salegrossAmount,csoi.review_status as reviewStatus,csoi.item_name as itemName, " +
                    " cb.name as brandName, csoi.quantity as quantity,csoi.net_amount as totalItemAmount,csoi.mrp as itemMrp, (csoi.quantity* csoi.net_amount) as totalPrice," +
                    " csoi.net_amount as itemPrice,so.delivery_charge as deliveryCharge,so.consumer_number as conNumber,so.message as comments," +
                    " so.delivery_slot as slot,CONCAT((select config_value from configuration where config_key = 'cdnImagePath'),'/'," +
                    " (select config_value from configuration where config_key = 'bucketSubFolder'),'/', " +
                    " (select config_value from configuration where config_key = 's3PathCommonItem'),'/','clothing/',cii.image)as itemImg," +
                    " ci.stock_quantity as stockUnit,ci.net_amount as stockNetAmount,ci.title as packName," +
                    " cs.name as size_name, " +
                    " '' as attachmentId,'' as attachment,'' as attachmentName  " +
                    " FROM sale as s " +
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
                    " WHERE so.id = ?;" +

                    " SELECT GROUP_CONCAT(DISTINCT soit.`tax_name`) as taxSubGroups " +
                    " FROM `cm_sale_order_items_tax_details` AS soit " +
                    " INNER JOIN `cm_sale_order_item` AS soi ON soit.`cm_sale_order_item_id` = soi.id " +
                    " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
                    " WHERE so.id = ? " +
                    " GROUP BY so.id ;" +


                    " SELECT soi.id AS saleOrderItemId,soi.`tax_group_id` AS taxGroupId,soi.`group_percentage` AS taxGroupPercentage, " +
                    " soi.`group_name` AS taxGroupName,SUM(soit.`tax_amount`) AS groupTotal " +
                    " FROM `cm_sale_order_items_tax_details` AS soit " +
                    " INNER JOIN `cm_sale_order_item` AS soi ON soit.`cm_sale_order_item_id` = soi.id " +
                    " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
                    " WHERE so.id = ? " +
                    " GROUP BY soi.`tax_group_id` " +
                    " ORDER BY soi.`group_percentage` ;" +

                    " SELECT soi.`tax_group_id` AS taxGroupId,soi.`group_percentage` AS taxGroupPercentage, " +
                    " GROUP_CONCAT(DISTINCT soit.`tax_name`) AS taxName,SUM(soit.`tax_amount`) AS taxAmount, " +
                    " GROUP_CONCAT(DISTINCT soit.`tax_percentage`) AS taxPercentage,soi.`tax_group_id` AS taxGroupId " +
                    " FROM `cm_sale_order_items_tax_details` AS soit " +
                    " INNER JOIN `cm_sale_order_item` AS soi ON soit.`cm_sale_order_item_id` = soi.id " +
                    " INNER JOIN sale_order AS so ON so.id = soi.sale_order_id " +
                    " WHERE so.id = ? " +
                    " GROUP BY soi.`tax_group_id`,soit.`tax_name` ;";
                itemQueryParams = [orderId, event.orderId, event.orderId, event.orderId];
            }
            console.log("itemQuery.............", itemQuery)
            await queryExecution.queryExecution(client, jsonObj, event, itemQuery, itemQueryParams, async function (response) {
                if (response.success == '0') {
                    callback(response);
                }
                console.log("Start.....4", new Date().getSeconds());

                let finalResult = response.result
                let itemQueryResult = finalResult[0] ? finalResult[0] : [];
                //console.log("itemQueryResult.......", itemQueryResult)
                let taxName = (finalResult[1].length > 0) ? finalResult[1][0].taxSubGroups.split(',') : []
                let taxResult = finalResult[2] ? finalResult[2] : []
                let taxDetailResult = finalResult[3] ? finalResult[3] : []
                let subtotal = 0
                let savedAmount = 0

                let taxsubTotal = 0;
                let currencySymbols
                if (orderQueryResults[0][0].mainCatId == 1) {
                    if (itemQueryResult.length > 0) {

                        console.log("itemQueryResult...", itemQueryResult);
                        for (let i = 0; i < itemQueryResult.length; i++) {
                            currencySymbols = itemQueryResult[0].currencySymbol
                            taxsubTotal = taxsubTotal + itemQueryResult[i].netAmount;
                            /*taxData = []
                            for (let k = 0; k < orderQueryResults[1].length; k++) {
                                if (orderQueryResults[1][k].store_id == orderQueryResults[0][0].storeId) {
                                    const taxDetails = {
                                        taxName: orderQueryResults[1][k].taxName,
                                        taxPercentage: orderQueryResults[1][k].taxPercentage,
                                        taxAmount: orderQueryResults[1][k].currencySymbol + " " + parseFloat(orderQueryResults[1][k].taxAmount).toFixed(2)
                                    }
                                    taxData.push(taxDetails)
                                }
                            }*/


                            let groceryItemListing = [];
                            groceryItemListing = {
                                totalPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalPrice).toFixed(2),
                                orderId: itemQueryResult[i].orderId,
                                reviewStatus: itemQueryResult[i].reviewStatus,
                                quantity: itemQueryResult[i].quantity,
                                itemCode: itemQueryResult[i].itemCode,
                                sizeItem: itemQueryResult[i].sizeItem,
                                taxData: taxData,
                                itemImage: itemQueryResult[i].itemImg,
                                comments: itemQueryResult[i].comments,
                                deliveryCharge: itemQueryResult[i].deliveryCharge != 0 ? itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].deliveryCharge).toFixed(2) : "Free",
                                itemName: itemQueryResult[i].itemName,
                                itemPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                                netAmount: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].netAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                                totalItemAmount: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalItemAmount).toFixed(2),
                                brandName: itemQueryResult[i].brandName,
                                packName: itemQueryResult[i].packName,
                                itemMrp: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemMrp).toFixed(2),
                                itemMrp: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemMrp).toFixed(2),
                                itemMrp: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemMrp).toFixed(2),
                                phIds: itemQueryResult[i].attachmentId,
                                phAttachment: itemQueryResult[i].attachment,
                                phAttachmentName: itemQueryResult[i].attachmentName,
                                cancelled_quantity: itemQueryResult[i].cancelled_quantity,
                                itemStatus: itemQueryResult[i].itemStatus,
                                item_id: itemQueryResult[i].item_id
                            }
                            groceryItemData.push(groceryItemListing)

                            console.log("groceryItemData...", groceryItemData)
                            subtotal = subtotal + (itemQueryResult[i].itemPrice * itemQueryResult[i].quantity)
                            savedAmount = savedAmount + (itemQueryResult[i].itemMrp * itemQueryResult[i].quantity - itemQueryResult[i].itemPrice * itemQueryResult[i].quantity)
                        }
                        if (orderQueryResults[3]) {
                            console.log("inside iforderQueryResults[3]...", orderQueryResults)
                            console.log("groceryItemData...", groceryItemData)
                            for (let i = 0; i < groceryItemData.length; i++) {
                                const currentItem = groceryItemData[i];
                                console.log("currentItem.........", currentItem)
                                const matchingResult = orderQueryResults[3].find(item => item.item_id == currentItem.item_id);
                                console.log("matchingResult....", matchingResult)
                                if (matchingResult) {
                                    console.log("enter ...................")
                                    currentItem.taxGroupId = matchingResult.taxGroupId
                                    currentItem.item_id = matchingResult.item_id
                                    currentItem.item_name = matchingResult.item_name
                                    currentItem.itemCode = matchingResult.itemCode
                                    currentItem.net_amount = matchingResult.net_amount
                                    currentItem.quantity = matchingResult.quantity
                                    currentItem.totalPri = matchingResult.totalPri
                                    currentItem.taxAmount = matchingResult.taxAmount
                                    currentItem.totalNetAmt = matchingResult.totalNetAmt
                                    currentItem.group_name = matchingResult.group_name
                                    currentItem.taxGroupPercentage = matchingResult.taxGroupPercentage

                                    // You can add more properties from matchingResult to currentItem if needed
                                }
                                else {
                                    console.log("inside  else orderQueryResults[3]...")
                                    groceryItemData[i].taxGroupId = ""
                                    // groceryItemData[i].item_id = ""
                                    // groceryItemData[i].item_name = ""
                                    // groceryItemData[i].itemCode = ""
                                    // groceryItemData[i].net_amount = ""
                                    // groceryItemData[i].quantity = ""
                                    // groceryItemData[i].totalPri = ""
                                    // groceryItemData[i].taxAmount = ""
                                    // groceryItemData[i].totalNetAmt = ""
                                    groceryItemData[i].group_name = ""
                                    groceryItemData[i].taxGroupPercentage = ""
                                }
                            }
                        }
                        else {
                            console.log("no data orderQueryResults[3]...")
                            groceryItemData[i].taxGroupId = ""
                            // groceryItemData[i].item_id = ""
                            // groceryItemData[i].item_name = ""
                            // groceryItemData[i].itemCode = ""
                            // groceryItemData[i].net_amount = ""
                            // groceryItemData[i].quantity = ""
                            // groceryItemData[i].totalPri = ""
                            // groceryItemData[i].taxAmount = ""
                            // groceryItemData[i].totalNetAmt = ""
                            groceryItemData[i].group_name = ""
                            groceryItemData[i].taxGroupPercentage = ""
                        }

                    }

                }
                else if (orderQueryResults[0][0].mainCatId == 5) {
                    if (itemQueryResult.length > 0) {
                        for (let i = 0; i < itemQueryResult.length; i++) {
                            currencySymbols = itemQueryResult[0].currencySymbol
                            taxsubTotal = taxsubTotal + itemQueryResult[i].netAmount;
                            //console.log("3...sss..taxsubTotal"+taxsubTotal)

                            /*taxData = []
                            for (let k = 0; k < orderQueryResults[1].length; k++) {
                                if (orderQueryResults[1][k].store_id == orderQueryResults[0][0].storeId) {
                                    let tax = 0
                                    if (orderQueryResults[1][k].applyTax == null) {
                                        tax = taxsubTotal * orderQueryResults[1][k].taxPercentage / 100
                                    } 
                                    else {
                                        let applyTax = taxsubTotal * orderQueryResults[1][k].applyTaxPercentage / 100
                                        tax = applyTax * orderQueryResults[1][k].taxPercentage / 100
                                    }
                                    const taxDetails = {
                                        taxName: orderQueryResults[1][k].taxName,
                                        taxPercentage: orderQueryResults[1][k].taxPercentage,
                                        taxAmount: orderQueryResults[1][k].currencySymbol + " " + parseFloat(tax).toFixed(2)
                                    }
                                    taxData.push(taxDetails)
                                }
                            }*/
                            let toppings = []

                            if (itemQueryResult[i].subitem != null && itemQueryResult[i].subitem != '') {
                                let subItemName = itemQueryResult[i].subitem.split(',')
                                let toppingsMains = []
                                for (let j = 0; j < subItemName.length; j++) {

                                    let subItemNameSplit = subItemName[j].split('|')
                                    let val = 'Free'
                                    if (subItemNameSplit[2] != '0' && subItemNameSplit[2] != '' && subItemNameSplit[2] != null) {
                                        val = itemQueryResult[i].currencySymbol + " " + parseFloat(subItemNameSplit[2]).toFixed(2)
                                    }
                                    let restsubItemNameSplit = [];
                                    if (toppingsMains.indexOf(subItemNameSplit[0]) === -1) {
                                        toppingsMains.push(subItemNameSplit[0])
                                    }
                                    else {

                                    }
                                    restsubItemNameSplit = {
                                        toppings1: subItemNameSplit[0],
                                        toppings2: subItemNameSplit[1],
                                        toppings3: val
                                    }
                                    toppings.push(restsubItemNameSplit)
                                }
                            }
                            let mainTopping = []
                            let toppingsList = toppings.reduce(function (toppings, element) {
                                toppings[element.toppings1] = toppings[element.toppings1] || [];
                                if (mainTopping.indexOf(element.toppings1) === -1) {
                                    mainTopping.push(element.toppings1);
                                }
                                toppings[element.toppings1].push(element);
                                return toppings;

                            }, Object.create(null));
                            let restauarantListing = [];
                            restauarantListing = {
                                //totalPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalPrice).toFixed(2),
                                //totalPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalItemAmount).toFixed(2),
                                totalPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalItemAmount * itemQueryResult[i].quantity).toFixed(2),
                                subitem: itemQueryResult[i].subitem,
                                orderId: itemQueryResult[i].orderId,
                                reviewStatus: itemQueryResult[i].reviewStatus,
                                quantity: itemQueryResult[i].quantity,
                                itemName: itemQueryResult[i].itemName,
                                itemImage: itemQueryResult[i].itemImg,
                                itemPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                                netAmount: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].netAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                                totalItemAmount: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalItemAmount).toFixed(2),
                                itemsize: itemQueryResult[i].itemsize,
                                size_name: itemQueryResult[i].size_name,
                                toppingsData: toppings,
                                toppingsList: toppingsList,
                                mainTopping: mainTopping,
                                taxData: taxData,
                                brandName: "null",
                                comments: itemQueryResult[i].comments


                            }
                            //console.log("......", itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalItemAmount).toFixed(2))
                            restaurantData.push(restauarantListing)
                            subtotal = subtotal + (itemQueryResult[i].totalItemAmount * itemQueryResult[i].quantity)
                            //savedAmount = savedAmount + (itemQueryResult[i].itemPrice * itemQueryResult[i].quantity - itemQueryResult[i].netAmount * itemQueryResult[i].quantity)
                            savedAmount = savedAmount + (itemQueryResult[i].totalItemAmount * itemQueryResult[i].quantity - itemQueryResult[i].netAmount * itemQueryResult[i].quantity)

                        }

                    }

                }
                else if (orderQueryResults[0][0].mainCatId == 8) {
                    console.log("2............." + itemQueryResult.length)
                    if (itemQueryResult.length > 0) {
                        for (let i = 0; i < itemQueryResult.length; i++) {
                            currencySymbols = itemQueryResult[0].currencySymbol
                            /*taxData = []
                            for (let k = 0; k < orderQueryResults[1].length; k++) {
                                if (orderQueryResults[1][k].store_id == orderQueryResults[0][0].storeId) {
                                    let tax = 0
                                    if (orderQueryResults[1][k].applyTax == null) {
                                        tax = taxsubTotal * orderQueryResults[1][k].taxPercentage / 100
                                    } 
                                    else {
                                        let applyTax = taxsubTotal * orderQueryResults[1][k].applyTaxPercentage / 100
                                        tax = applyTax * orderQueryResults[1][k].taxPercentage / 100
                                    }
                                    const taxDetails = {
                                        taxName: orderQueryResults[1][k].taxName,
                                        taxPercentage: orderQueryResults[1][k].taxPercentage,
                                        taxAmount: orderQueryResults[1][k].currencySymbol + " " + parseFloat(tax).toFixed(2)
                                    }
                                    taxData.push(taxDetails)
                                }
                            }*/


                            let commonItemListing = [];
                            commonItemListing = {
                                totalPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalPrice).toFixed(2),
                                orderId: itemQueryResult[i].orderId,
                                reviewStatus: itemQueryResult[i].reviewStatus,
                                quantity: itemQueryResult[i].quantity,
                                itemName: itemQueryResult[i].itemName,
                                itemImage: itemQueryResult[i].itemImg,
                                itemPrice: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemPrice).toFixed(2),
                                netAmount: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].netAmount).toFixed(2),
                                totalItemAmount: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].totalItemAmount).toFixed(2),
                                size_name: itemQueryResult[i].size_name,
                                packName: itemQueryResult[i].packName,
                                itemMrp: itemQueryResult[i].currencySymbol + " " + parseFloat(itemQueryResult[i].itemMrp).toFixed(2),
                                brandName: itemQueryResult[i].brandName,
                                comments: itemQueryResult[i].comments
                            }
                            commonItemData.push(commonItemListing)
                            subtotal = subtotal + (itemQueryResult[i].totalItemAmount * itemQueryResult[i].quantity)
                            savedAmount = savedAmount + (itemQueryResult[i].itemPrice * itemQueryResult[i].quantity - itemQueryResult[i].netAmount * itemQueryResult[i].quantity)
                        }

                    }

                }
                taxData = []
                let taxTotal = 0
                /*for (let k = 0; k < orderQueryResults[1].length; k++) {
                    if (orderQueryResults[1][k].store_id == orderQueryResults[0][0].storeId) {
                        let tax = 0
                        if (orderQueryResults[1][k].applyTax == null) {
                            tax = subtotal * orderQueryResults[1][k].taxPercentage / 100
                            taxTotal = taxTotal+tax
                        } 
                        else {
                            let applyTax = taxsubTotal * orderQueryResults[1][k].applyTaxPercentage / 100
                            tax = applyTax * orderQueryResults[1][k].taxPercentage / 100
                            taxTotal = taxTotal+tax
                        }
                        const taxDetails = {
                            taxName: orderQueryResults[1][k].taxName,
                            taxPercentage: orderQueryResults[1][k].taxPercentage,
                            taxAmount: orderQueryResults[1][k].currencySymbol + " " + parseFloat(tax).toFixed(2)
                           
                        }
                        taxData.push(taxDetails)
                    }
                }*/

                for (let k = 0; k < orderQueryResults[2].length; k++) {
                    if (orderQueryResults[2][k].store_id == orderQueryResults[0][0].storeId) {
                        let tax = 0



                        const taxDetails = {
                            taxName: orderQueryResults[2][k].taxName,
                            taxPercentage: orderQueryResults[2][k].taxPercentage,
                            taxAmount: orderQueryResults[2][k].currencySymbol + " " + parseFloat(orderQueryResults[2][k].taxAmount).toFixed(2)

                        }
                        taxData.push(taxDetails)
                    }
                }

                //----------------------------------
                // let itemTaxDetails = []

                // if (itemTaxGroupByResult.length > 0) {
                //     for (let s = 0; s < itemTaxGroupByResult.length; s++) {
                //         console.log("itemTaxQueryResult[s].taxName......", itemTaxGroupByResult[s].taxName)
                //         let detailTaxName = itemTaxGroupByResult[s].taxName.split(",")
                //         let detailTaxAmount = itemTaxGroupByResult[s].taxAmount.split(",")
                //         let detailTaxPercentage = itemTaxGroupByResult[s].taxPercentage.split(",")
                //         let taxDetail = []
                //         for (let x = 0; x < detailTaxName.length; x++) {
                //             taxDetail[x] = {
                //                 taxName: detailTaxName[x],
                //                 taxAmount: detailTaxAmount[x],
                //                 taxPercentage: detailTaxPercentage[x]
                //             }
                //         }
                //         itemTaxDetails[s] = {
                //             taxGroupId: itemTaxGroupByResult[s].taxGroupId,
                //             taxGroupName: itemTaxGroupByResult[s].taxGroupName,
                //             groupTaxPercentage: itemTaxGroupByResult[s].taxGroupPercentage,
                //             itemId: itemTaxGroupByResult[s].itemId,
                //             taxGroupTotal: itemTaxGroupByResult[s].taxGroupTotal,
                //             taxDetail: taxDetail
                //         }
                //     }

                //     //console.log("itemTaxDetails..................",itemTaxDetails)
                //     const out = Object.values(itemTaxDetails.reduce((acc, c) => {
                //         const { taxGroupId } = c;
                //         acc[taxGroupId] = (acc[taxGroupId] || []).concat(c);
                //         return acc;
                //     }, {}));
                //     console.log("out...", out)
                //     taxDataGroup = []
                //     for (var k = 0; k < out.length; k++) {
                //         let taxGroupTotal = 0
                //         let newTax = []
                //         for (var n = 0; n < out[k].length; n++) {

                //             taxGroupTotal = taxGroupTotal + out[k][n].taxGroupTotal
                //             taxDataGroup[k] = {

                //                 taxPercentage: out[k][n].groupTaxPercentage,
                //                 taxName: out[k][n].taxGroupName,
                //                 taxGroupId: out[k][n].taxGroupId,
                //                 itemId: out[k][n].itemId,
                //                 taxAmount: taxGroupTotal,
                //                 taxsArray: out[k][n].taxDetail

                //             }
                //         }
                //     }
                //     //console.log("taxDataGroup.....................",taxDataGroup)

                // }



                //----------------------------------
                //let taxResultNew = await taxCommonFunction.taxCommonFunction(client, jsonObj, event, callback )
                console.log("Start.....5", new Date().getSeconds());
                let totTax = 0

                let taxHeadings = [{
                    "name": "Tax %"
                }, {
                    "name": "Tax Amount"
                }]

                for (var i = 0; i < taxName.length; i++) {
                    taxHeadings[taxHeadings.length] = {
                        "name": taxName[i]
                    }
                }
                let taxDetails = []
                for (var i = 0; i < taxResult.length; i++) {
                    totTax = totTax ? totTax + taxResult[i].groupTotal : taxResult[i].groupTotal
                    taxDetails[i] = {
                        taxPercentage: taxResult[i].taxGroupPercentage,
                        taxAmount: currencySymbols + " " + taxResult[i].groupTotal.toFixed(2),
                        taxName: taxResult[i].taxGroupName
                    }
                    let taxSubDetails = []
                    let taxSubDetailsCount = 0
                    for (var j = 0; j < parseInt(taxName.length); j++) {
                        var newArray = taxDetailResult.filter(function (el) {
                            return taxName[j] == el.taxName && el.taxGroupId == taxResult[i].taxGroupId;
                        });
                        if (newArray.length > 0) {
                            taxSubDetails[taxSubDetailsCount] = newArray[0].taxPercentage + "%"
                            taxSubDetailsCount++;
                            taxSubDetails[taxSubDetailsCount] = newArray[0].taxAmount.toFixed(2)
                            taxSubDetailsCount++
                        }
                        else {
                            taxSubDetails[taxSubDetailsCount] = "0%"
                            taxSubDetailsCount++;
                            taxSubDetails[taxSubDetailsCount] = '0'
                            taxSubDetailsCount++
                        }
                    }
                    taxDetails[i].taxSubDetails = taxSubDetails
                }

                let taxObj = {
                    taxHeadings: taxHeadings,
                    taxDetails: taxDetails
                }

                // taxDatas.add(taxHeadings)
                // taxDatas.add(taxDetails)
                // taxDatas.taxDetails =  taxDetails
                taxDatas.push(taxObj)

                //return taxData;



                console.log("Start.....6", new Date().getSeconds());

                //subtotal = subtotal+taxTotal

                let resrdataNew = []
                let deliletyCharge
                let grandTotal = orderQueryResults[0][0].orderNetAmount.toFixed(2) + orderQueryResults[0][0].deliverCharge
                console.log("Start.....7", new Date().getSeconds());
                console.log("taxData...", taxDatas)
                resrdataNew = [{

                    promoCode: orderQueryResults[0][0].promoCode,
                    promoCodeAmount: orderQueryResults[0][0].promoCodeAmount,
                    comments: orderQueryResults[0][0].comments,
                    consumerNumber: orderQueryResults[0][0].consumerNumber,
                    consumerCardName: orderQueryResults[0][0].consumerCardName,
                    subtotal: orderQueryResults[0][0].currencySymbol + " " + parseFloat(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    savedAmount: orderQueryResults[0][0].currencySymbol + " " + parseFloat(savedAmount).toFixed(2),
                    deliletyCharge: orderQueryResults[0][0].currencySymbol + " " + parseFloat(orderQueryResults[0][0].deliverCharge).toFixed(2),
                    grandtotal: orderQueryResults[0][0].currencySymbol + " " + parseFloat(grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    taxData: taxData,
                    taxResultNew: taxDatas,
                    totalTax: totTax.toFixed(2)
                    //itemTaxNew: orderQueryResults[3] ? orderQueryResults[3] : []
                    // taxDataGroup: taxDataGroup,
                    //itemWiseTax: itemTaxDetails,

                }]
                // console.log("Start..orderQueryResults...8", orderQueryResults);
                console.log("groceryItemData..", groceryItemData);
                const responseData = {
                    success: "1",
                    result: {
                        "storeAddressQueryResult": storeAddressQueryResult,
                        "orderQueryResults": orderQueryResults,
                        "groceryItemListing": groceryItemData,
                        "restauarantListing": restaurantData,
                        "resrdataNew": resrdataNew,
                        "commonItemListing": commonItemData,

                        //"taxData":taxData

                    },
                    errorMessage: "",
                    successMessage: "Success"
                };
                console.log("responseData.....9", responseData);
                callback(responseData);

            });
        })
    });
}
module.exports = methods;
