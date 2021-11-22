import config from "config";

const processArg = process.argv;
const TABLE_NAME = processArg[2];
const MYSQLIP = processArg[3];
const DATABASE_NAME = config.get('dbSettings.dbName');

import sendAlert from "./src/alert.mjs"
import { reorganiseMonthlyPartitionQuery, oldestPartitionInfoQuery, dropPartitionQuery } from './src/queries.mjs';

(async function main() {
  try {
    await reorganiseMonthlyPartitionQuery(TABLE_NAME);
    await dropOldPartition();
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
})();

async function dropOldPartition() {
  try {
    const partitionInfo = await oldestPartitionInfoQuery(DATABASE_NAME, TABLE_NAME);

    if (partitionInfo
      && partitionInfo.length
      && partitionInfo[0]
      && partitionInfo[0].PARTITION_ORDINAL_POSITION == 1) {
      const partitionToDrop = partitionInfo[0].PARTITION_NAME;
      console.log(partitionToDrop);
      await dropPartitionQuery(TABLE_NAME, partitionToDrop);
      return { executionSuccess: true };
    } else {
      console.log("else");
      // console.error("TABLE_NOT_PARTITIONED", `No Partition Found for Table ${TABLE_NAME}`);
      // sendAlert("TABLE_NOT_PARTITIONED", `No Partition Found for Table ${TABLE_NAME}`);
      return { executionSuccess: false };
    }
    
  } catch (err) {
    // sendAlert(`ERROR IN dropOldPartition for Table ${TABLE_NAME}`, err && err.message);
    console.error(err, err && err.message);
    return { executionSuccess: false };
  }
}
