// Mock blockchain service — returns a fake hash synchronously for now
function mockStoreOnChain(data) {
  // create a simple hash-like string using timestamp and random
  const hash = `0x${Buffer.from(JSON.stringify(data) + Date.now()).toString('hex').slice(0, 32)}`;
  return Promise.resolve(hash);
}

module.exports = { mockStoreOnChain };
