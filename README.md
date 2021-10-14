# mysqlPartitionKeeper
Automatically creates new monthly partition and removes oldest partition for partitioned tables.

Partition Nomenclature used -
```
1. p_20191001

2. p_20191101

..

..

x.   p_20210101 - Contains all records before 2021-01-01

x+1. p_20210201 - Contains all records before 2021-02-01

..

..

n.   future     - Contains all records before MAX VALUE
```

## Note - 
This exact nomenclature has to be used for this code to work properly.
Ensure usage of code in a test environment, before running in production.