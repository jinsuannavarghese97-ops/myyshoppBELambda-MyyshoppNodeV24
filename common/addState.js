const queryExecution = require('../queryExecution');
const methods = {};

// Lists states (filterable / paged) and the active countries.
// Called as functionName "common/addState". Request fields (all optional):
//   cmbStatus   - "1" / "0"-style is_active filter ("" or "0" = no filter)
//   cmbCategory - state column to search ("name", "alias_name", "id", "country_id"; "" or "0" = no search)
//   txtInput    - search text for cmbCategory (matched as "text%")
//   offset, max - paging for the state list
//
// Same response as the original /myshopp Lambda function: result.stateData, result.totalCount,
// result.countryData. The signup popup reads countryData (id, name, country_code, country_image).
//
// Differences from the original, on purpose: cmbStatus / txtInput are bound as query parameters and
// cmbCategory must be one of the whitelisted columns, so request values can no longer be injected into
// the SQL text (this endpoint is publicly callable).
const SEARCHABLE_COLUMNS = ['id', 'name', 'alias_name', 'country_id', 'is_active'];

const isSet = (value) => value !== '' && value !== null && value !== undefined && value !== '0' && value !== 0;
const toInt = (value, fallback, max) => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0) return fallback;
    return max ? Math.min(n, max) : n;
};

methods.addState = function (client, event, callback) {
    const conditions = [];
    const conditionParams = [];

    if (isSet(event.cmbStatus)) {
        const status = parseInt(event.cmbStatus, 10);
        if (!isNaN(status)) {
            conditions.push('s.is_active = ?');
            conditionParams.push(status);
        }
    }
    if (isSet(event.cmbCategory)) {
        if (SEARCHABLE_COLUMNS.indexOf(event.cmbCategory) === -1) {
            return callback({
                success: "0",
                result: [],
                errorMessage: "Invalid search field",
                successMessage: ""
            });
        }
        conditions.push('s.' + event.cmbCategory + ' like ?');
        conditionParams.push((event.txtInput || '') + '%');
    }
    const where = conditions.length ? ' where ' + conditions.join(' and ') + ' ' : ' ';

    const query =
        " select s.id as id, s.name as name, s.is_active as is_active, " +
        " s.alias_name as alias_name, s.country_id as country_id, c.name as countryName " +
        " from state as s " +
        " inner join country as c on c.id = s.country_id " + where +
        " order by id desc " +
        " limit ?,?; " +
        " select count(*) as totalCount from state as s " + where + "; " +
        " select id, name, country_code, country_image from country where is_active = true ";

    // statement 1: where-params, offset, max   statement 2: where-params again   statement 3: none
    const queryParams = [...conditionParams, toInt(event.offset, 0), toInt(event.max, 10, 1000), ...conditionParams];

    queryExecution.queryExecution(client, "", event, query, queryParams, function (dbResponse) {
        if (dbResponse.success == "0") {
            return callback({
                success: "0",
                result: [],
                errorMessage: "Something went wrong",
                successMessage: ""
            });
        }
        const rows = dbResponse.result;
        const blank = (value) => (value == null ? '' : value);

        const stateData = rows[0].map(function (row) {
            return {
                id: blank(row.id),
                name: blank(row.name),
                is_active: row.is_active,
                alias_name: blank(row.alias_name),
                country_id: blank(row.country_id),
                countryName: blank(row.countryName)
            };
        });
        const countryData = rows[2].map(function (row) {
            return {
                id: blank(row.id),
                name: blank(row.name),
                country_code: blank(row.country_code),
                country_image: blank(row.country_image)
            };
        });

        callback({
            success: "1",
            result: {
                stateData: stateData,
                totalCount: rows[1][0].totalCount,
                countryData: countryData
            },
            errorMessage: "",
            successMessage: "Success"
        });
    });
};
module.exports = methods;
