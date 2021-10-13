import * as mysql from "mysql";

const dbConnection = mysql.createPool({
  host: `${MYSQLIP}`,
  user: 'maintenance',
  password: 'passwords',
  database: databaseName
});