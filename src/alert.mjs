const fetchServerPrivateIp = () => {
  const networkInterfacesMap = require('os').networkInterfaces();
  if (networkInterfacesMap && networkInterfacesMap.hasOwnProperty('eth0')) {
    for (const ipAddressObj of networkInterfacesMap['eth0']) {
      if (ipAddressObj.family === 'IPv4' && !ipAddressObj.internal) {
        return ipAddressObj.address;
      }
    }
  }
  return null;
}

const sendAlert = (subject, message) => {
  console.error(`\n**** ${subject} ****\n${message}]\nmysqlPartitionKeeper:${fetchServerPrivateIp()}`);
  // WRITE YOUR OWN IMPLEMENTATION OF ALERTS;
}

export default sendAlert;