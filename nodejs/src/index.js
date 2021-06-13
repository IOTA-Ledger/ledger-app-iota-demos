import TransportHID from '@ledgerhq/hw-transport-node-hid';
import TransportSpeculos from '@ledgerhq/hw-transport-node-speculos';
import IOTALedger from 'hw-app-iota';
import { asTransactionObject } from '@iota/transaction-converter';
import Validator from '@iota/bundle-validator';
const isBundle = Validator.default;

const USE_SPECULOS = false;
const SPECULOS_APDU_PORT = 4000;

// use testnet path
const PATH_INDEX = 0x44444444;
const BIP32_PATH =
  "44'/4218'/" + PATH_INDEX + "'/" + PATH_INDEX + "'/" + PATH_INDEX + "'";
const SECURITY_LEVEL = 3;

const DEST_ADDRESS =
  'ADLJXS9SKYQKMVQFXR9JDUUJHJWGDNWHQZMDGJFGZOX9BZEKDSXBSPZTTWEYPTNM9OZMYDQWZXFHRTXRCOITXAGCJZ';
const KEY_INDEX = 4244444444;
const VALUE = 10;
const BALANCE = 2779530283277760;

async function createTransport() {
  if (USE_SPECULOS) {
    return await TransportSpeculos.default.open({
      apduPort: SPECULOS_APDU_PORT,
    });
  }
  return await TransportHID.default.create();
}

function validateBundleTrytes(bundleTrytes) {
  // convert to transaction objects to add transactions hashes to bundle
  var transactionObjects = [];
  bundleTrytes.forEach((tx) => {
    transactionObjects.unshift(asTransactionObject(tx));
  });

  // validates signatures and overall structure.
  console.assert(
    isBundle(transactionObjects),
    'Invalid bundle',
    transactionObjects
  );
}

(async () => {
  const transport = await createTransport();
  const ledger = new IOTALedger(transport);

  console.log('App version: ' + (await ledger.getAppVersion()));

  const maxBundleSize = await ledger.getAppMaxBundleSize();
  console.log('App max bundle size: ' + maxBundleSize);

  // initialize
  console.log('Setting path: ' + BIP32_PATH);
  await ledger.setActiveSeed(BIP32_PATH, SECURITY_LEVEL);

  const numInputs = Math.floor((maxBundleSize - 2) / SECURITY_LEVEL);
  const transfers = [
    {
      address: DEST_ADDRESS,
      value: VALUE,
      tag: '',
    },
  ];
  const inputs = [];
  for (let i = 0; i < numInputs; i++) {
    inputs.push({
      address: await ledger.getAddress(KEY_INDEX + i),
      balance: Math.floor(BALANCE / numInputs),
      keyIndex: KEY_INDEX + i,
    });
  }
  const remainder = {
    address: await ledger.getAddress(KEY_INDEX + numInputs),
    keyIndex: KEY_INDEX + numInputs,
  };
  console.log({
    transfers: transfers,
    inputs: inputs,
    change: remainder,
  });

  var trytes = await ledger.prepareTransfers(transfers, inputs, remainder);
  validateBundleTrytes(trytes);

  await ledger.getAddress(KEY_INDEX + numInputs + 1, { display: true });
})().catch((e) => {
  console.error(e);
});
