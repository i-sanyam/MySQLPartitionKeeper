import config from "config";

import sendAlert from "./src/alert.mjs"
import { reorganiseMonthlyPartitionQuery, oldestPartitionInfoQuery, dropPartitionQuery } from './src/queries.mjs';

const TABLE_NAME    = config.get('dbSettings.tableName');
const DATABASE_NAME = config.get('dbSettings.dbName');

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

    if (!(partitionInfo
      && partitionInfo.length
      && partitionInfo[0]
      && partitionInfo[0].PARTITION_ORDINAL_POSITION == 1)) {
      sendAlert("TABLE_NOT_PARTITIONED", `No Partition Found for Table ${TABLE_NAME}`);
      throw new Error(`No Partition Found for Table ${TABLE_NAME}`);
    }

    const partitionToDrop = partitionInfo[0].PARTITION_NAME;
    await dropPartitionQuery(TABLE_NAME, partitionToDrop);
    return;
  } catch (err) {
    sendAlert(`ERROR IN dropOldPartition for Table ${TABLE_NAME}`, err && err.message);
    throw err;
  }
}
