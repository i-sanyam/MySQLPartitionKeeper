import { networkInterfaces, hostname } from "os";

const fetchServerPrivateIp = () => {
  const networkInterface = "eth0"; // or wlp1s0 
  const networkFamily = "IPv4"; // or IPv6
  const hostName = hostname();
  const networkInterfacesMap = networkInterfaces();

  if (networkInterfacesMap && networkInterfacesMap[networkInterface]) {
    for (const ipAddressObj of networkInterfacesMap[networkInterface]) {
      if (ipAddressObj.family === networkFamily && !ipAddressObj.internal) {
        return `${hostName} ${ipAddressObj.address}`;
      }
    }
  }
  return hostName;
}

const serverPrivateIp = fetchServerPrivateIp();

const sendAlert = (subject, message) => {
  console.error(`
    **** ${subject} ****
    ${message}
    mysqlPartitionKeeper running at: ${serverPrivateIp}
  `);
  // WRITE YOUR OWN IMPLEMENTATION OF ALERTS
}

export default sendAlert;