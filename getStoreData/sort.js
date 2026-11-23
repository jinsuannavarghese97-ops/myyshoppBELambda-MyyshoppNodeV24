let methods = {};
methods.sort = function (client,jsonObj,event, callback) {
    let sortListing = [
            {
                
                "title": "Popularity",
                "sortId": "rank",
                "isSelected": "0",
            },
              
            {  
                 "title": "Price - Low to High",
                "sortId": "asc",
                "isSelected": "0",
            },
            {   
                "title": "Price - High to Low",
                "sortId": "desc",
                "isSelected": "0",
            },
            {   
                "title": "Offer",
                "sortId": "Offer",
                "isSelected": "0",
            },
            {   
                  "title": "Alphabetical",
                "sortId": "name",
                "isSelected": "0"
               
            }
        ]
        return callback(sortListing);
};
module.exports = methods;