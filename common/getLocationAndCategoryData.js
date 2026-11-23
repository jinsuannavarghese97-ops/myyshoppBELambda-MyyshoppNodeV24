const queryExecution = require('../queryExecution')
const methods = {};
methods.getLocationAndCategoryData = function (client, event, callback) {
    let query = `
        SELECT 
            alternative_name AS alternativeName, 
            id AS mainCategoryId, 
            main_group_category_id AS mainGroupCategoryId, 
            seo_title AS seoTitle, 
            seo_description AS seoDescription, 
            seo_keyword AS seoKeyword, 
            seo_slug AS seoSlug, 
            seo_h1 AS seoH1 
        FROM main_category 
        WHERE (name LIKE ? OR name_search LIKE ?);

        SELECT 
            l.name AS locationName, 
            l.id AS locationId, 
            c.name AS cityName, 
            c.id AS cityId 
        FROM location AS l 
        INNER JOIN city AS c ON c.id = l.city_id 
        WHERE l.is_active = TRUE AND l.is_approved = TRUE AND l.name = ?;
    `;

    let queryParams = [
        event.categoryName + '%',
        '%' + event.categoryName + '%',
        event.loactionName
    ];

    console.log('query...', query)
    queryExecution.queryExecution(client, "", event, query, queryParams, function (response) {
        if (response.success == '0') {
            callback(response);
        }
        else {
            var obj = {
                category: response.result[0],
                location: response.result[1]
            }
            const result = {
                success: "1",
                result: obj,
                successMessage: "Success",
                errorMessage: ""
            };
            callback(result);
        }
    });
}
module.exports = methods;
