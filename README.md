# MySQLPartitionKeeper

Automatically creates new monthly partition and removes oldest partition for range partitioned tables.

As an illustration this code works only for tables range partitioned on timestamp.

Partition Nomenclature used -
```
1. p_20191001

2. p_20191101

..

x.   p_20210101 - Contains all records before 2021-01-01

x+1. p_20210201 - Contains all records before 2021-02-01

..

..

n.   future     - Contains all records before MAX VALUE
```

### Partition Offset

Partition Offset are the number of partitions that have greater range than the current partition, or more formally, the partitions that have greater ordinal position than the current partition, excluding the future partition.

Here are a few examples to understand about partitionOffSet - 

1. Assume if the current month is k and partition for the month k+1 does not exist, then `partitionOffset` is 0. MySQLPartitionKeeper has to create a new partition for the month k+1 out of the future partition.

2. Similarly, if the current month is k and partition for the month k+1 already exists, then `partitionOffset` is 1. MySQLPartitionKeeper has to create a new partition for the month k+2 out of the future partition.

3. If the current month is k and partition for the month k+2 already exists, then `partitionOffset` is 2. MySQLPartitionKeeper has to create a new partition for the month k+3 out of the future partition, and so on.

## Sample Database Creation

```mysql
CREATE DATABASE `sampledb`;

CREATE TABLE `sampledb`.`tb_foo_partitioned` 
  ( `id` INT NOT NULL AUTO_INCREMENT, `ts` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`id`, `ts`)) 
  ENGINE = InnoDB 
  PARTITION BY RANGE (UNIX_TIMESTAMP(ts)) PARTITIONS 3 ( 
    PARTITION p_20211001 VALUES LESS THAN (UNIX_TIMESTAMP("2021-10-01")), 
    PARTITION p_20211101 VALUES LESS THAN (UNIX_TIMESTAMP("2021-11-01")), 
    PARTITION future VALUES LESS THAN MAXVALUE
);
```

## Usage

```bash
NODE_ENV=sample node index.js
```

## Note -
Ensure usage of code in a test environment, before running in production.