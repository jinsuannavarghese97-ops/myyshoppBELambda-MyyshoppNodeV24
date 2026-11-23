
const mysql = require('mysql');
let methods = {};

methods.queryExecution = function (client,jsonObj , query, callback) {
    
    const pool = mysql.createPool({
        host: jsonObj.dbhost,
        user: jsonObj.dbuser,
        password: jsonObj.dbpassword,
        database: jsonObj.dbdatabase,
        connectionLimit: 100,
        queueLimit: 500,
        debug: false,
        multipleStatements: true,
    })
    pool.getConnection(function (err, connection) {
        if(err){
            const response = {
                success:"0",
                successMessage:"",
                errorMessage:"Something went wrong.",
                errorType:"Connection Error"
            }
            callback(response);
        }
        connection.query(query, function (error, results, fields) {
            if(error){
                let errorQry = "INSERT INTO error_log (version,controller,created_on,function,exceptions) values ('0','"+jsonObj.mainFunction+"',now(),'"+jsonObj.functionName+"',?) ";
                connection.query(errorQry,[error.sqlMessage], function (errorData, results, fields) {
                    connection.release();
                    //connection.end();
                    const response = {
                        success:"0",
                        successMessage:"",
                        errorMessage:"Something went wrong.",
                        errorType:"Execution Error"
                    }
                    callback(response);
                });
            }
            else{
                connection.release();
                //connection.end();
                const response = {
                    success:"1",
                    successMessage:"Success",
                    errorMessage:"",
                    errorType:"",
                    result:results
                }
                callback(response);
            }
        })    
    })
}
module.exports = methods;