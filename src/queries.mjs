import executeQuery from "./mysql.mjs";

const getMonthSerialNumber = (monthNumber) => {
  return monthNumber < 10 ? `0${monthNumber}` : monthNumber;
}

const reorganiseMonthlyPartitionQuery = (TABLE_NAME, partitionToReorganise = "future", partitionOffset = 1) => {
  /**
   * generates query for adding a new partition 
   * eg. In the scenario where the cronjob runs in March 2020, for adding a new partition for the month of May 2020,
   * the new partition's name will be p_20206001 i.e. partition has all the records of less than date 2020-06-01
   */

  const dateObjNow          = new Date();
  const currentYear         = dateObjNow.getFullYear();
  const proposedMonthIdx    = dateObjNow.getMonth() + 1 + partitionOffset + 1;
  const isNextYearPartition = (proposedMonthIdx > 12);

  const newPartitionYear     = isNextYearPartition ? currentYear + 1 : currentYear;
  const newPartitionMonthIdx = getMonthSerialNumber(isNextYearPartition ? (proposedMonthIdx - 12) : proposedMonthIdx);

  const firstDayOfNewMonth = `${newPartitionYear}-${newPartitionMonthIdx}-01`;
  const newPartitionName   = `p_${newPartitionYear}${newPartitionMonthIdx}01`;

  const reorgQuery = `ALTER TABLE ${TABLE_NAME} REORGANIZE PARTITION ${partitionToReorganise} INTO (` +
    `PARTITION ${newPartitionName} VALUES LESS THAN (UNIX_TIMESTAMP('${firstDayOfNewMonth}')), ` +
    `PARTITION future VALUES LESS THAN MAXVALUE` +
  `)`;
  
  return executeQuery(reorgQuery, [], `'${TABLE_NAME}' reorganise partition '${partitionToReorganise}'`);
}

const oldestPartitionInfoQuery = (DATABASE_NAME, TABLE_NAME) => {
  const infoQuery = `SELECT * FROM information_schema.partitions WHERE ` + 
    `TABLE_SCHEMA ='${DATABASE_NAME}' ` + 
    `AND TABLE_NAME = '${TABLE_NAME}' ` +
    `AND PARTITION_ORDINAL_POSITION = 1`;
  return executeQuery(infoQuery, [], `Partition Info ${DATABASE_NAME}.${TABLE_NAME}`);
}

const dropPartitionQuery = (TABLE_NAME, partitionToDrop) => {
  const dropQuery = `ALTER TABLE ${TABLE_NAME} DROP PARTITION ${partitionToDrop}`;
  return executeQuery(dropQuery, [], `Drop ${TABLE_NAME}'s partition '${partitionToDrop}'`);
}

export { dropPartitionQuery, oldestPartitionInfoQuery, reorganiseMonthlyPartitionQuery };