
// get the client
const processArg = process.argv;
const TABLE_NAME = processArg[2];
const MYSQLIP = processArg[3];
const mysql = require('mysql2');
import sendAlert from "./alert.mjs"
const { reorganisePartitionQuery, oldestPartitionInfoQuery, dropPartitionQuery } = require('./queries');
const serverIp = fetchServerPrivateIp();
const databaseName = "dbname";
// create the connection
let mpkConn = mysql.createPool({});
const mpkPromiseWrapper = mpkConn.promise();

(async function main() {
  const { executionSuccess } = await reorganisePartition();
  if (executionSuccess) await dropOldPartition();
  const endmpkConnection = await mpkConn.end();
  console.log(endmpkConnection);
})();

async function reorganisePartition() {
  try {
    const reorganiseQuery = reorganisePartitionQuery(TABLE_NAME);
    console.log(reorganiseQuery);
    const reorganiseResult = await mpkPromiseWrapper.query(reorgQuery);
    console.log(reorganiseResult);
    sendAlert(`REROGANISE_PARTITION_SUCCESS for Table ${TABLE_NAME}`,
      `New Partition ${newPartitionName} created out of future partition\n${JSON.stringify(reorganiseResult)}\nQUERY: ${reorgQuery}`);
    return { executionSuccess: true };
  } catch (err) {
    sendAlert(`ERROR IN reorganisePartition for Table ${TABLE_NAME}`, err && err.message);
    console.error(err, err && err.message);
    return { executionSuccess: false };
  }
}

async function dropOldPartition() {
  try {
    const partitionInfo = await mpkPromiseWrapper.query(oldestPartitionInfoQuery(databaseName, TABLE_NAME));
    console.log(partitionInfo);
    if (partitionInfo
      && partitionInfo.length
      && partitionInfo[0]
      && partitionInfo[0].length
      && partitionInfo[0][0]
      && partitionInfo[0][0].PARTITION_ORDINAL_POSITION == 1) {
      const partitionToDrop = partitionInfo[0][0].PARTITION_NAME;
      const dropPartitionQuery = dropPartitionQuery(TABLE_NAME, partitionToDrop);
      console.log(dropPartitionQuery);
      const dropPartitionResult = await mpkPromiseWrapper.query(dropPartitionQuery);
      console.log(dropPartitionResult);
      sendAlert(
        `DROP_PARTITION_SUCCESS for Table ${TABLE_NAME}`,
        `Partition ${partitionToDrop} Dropped for Table ${TABLE_NAME}\nQUERY: ${dropPartitionQuery}\n${JSON.stringify(dropPartitionResult)}`);
      return { executionSuccess: true };
    } else {
      console.error("TABLE_NOT_PARTITIONED", `No Partition Found for Table ${TABLE_NAME}`);
      sendAlert("TABLE_NOT_PARTITIONED", `No Partition Found for Table ${TABLE_NAME}`);
      return { executionSuccess: false };
    }
  } catch (err) {
    sendAlert(`ERROR IN dropOldPartition for Table ${TABLE_NAME}`, err && err.message);
    console.error(err, err && err.message);
    return { executionSuccess: false };
  }
}
