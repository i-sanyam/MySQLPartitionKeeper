import * as mysql from "mysql2/promise";
import config from "config";
import sendAlert from "./alert.mjs";

if (! (config.has('dbSettings.host') && config.has('dbSettings.user') && config.has('dbSettings.password') 
    && config.has('dbSettings.dbName') && config.has('dbSettings.tableName')) ) {
  sendAlert("INVALID CONFIG FILE", "Check your config and try again");
  process.exit(9);
}

const tableName = config.get('dbSettings.tableName');
const dbName    = config.get('dbSettings.dbName');

const connectionPool = mysql.createPool({
  host     : config.get('dbSettings.host'),
  user     : config.get('dbSettings.user'),
  password : config.get('dbSettings.password'),
  database : dbName
});

const executeQuery = async (query, params, event) => {
  try {
    const [rows, fields] = await connectionPool.query(query, params);
    sendAlert(`${event} success`, JSON.stringify({ event, params, query, rows }));
    return rows;
  } catch (e) {
    sendAlert(`Error in ${event}`, e && e.message);
    throw e;
  }
}

(async () => {
  try {
    await executeQuery(`SELECT * FROM ${tableName} LIMIT 1`, [], "establishing mysql connection");
  } catch (e) {
    process.exit(1);
  }
})();

export default executeQuery;