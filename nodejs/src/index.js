import TransportHID from '@ledgerhq/hw-transport-node-hid';
import TransportSpeculos from '@ledgerhq/hw-transport-node-speculos';
import IOTALedger from 'hw-app-iota';

const USE_SPECULOS = false;
const SPECULOS_APDU_PORT = 4000;

// use testnet path
const PATH_INDEX = 0x44444444;
const BIP32_PATH =
  "44'/1'/" + PATH_INDEX + "'/" + PATH_INDEX + "'/" + PATH_INDEX + "'";

async function createTransport() {
  if (USE_SPECULOS) {
    return await TransportSpeculos.open({ apduPort: SPECULOS_APDU_PORT });
  }
  return await TransportHID.create();
}

(async () => {
  const transport = await createTransport();
  const ledger = new IOTALedger(transport);

  console.log('App version: ' + (await ledger.getAppVersion()));

  console.log('Generate address: ' + BIP32_PATH);
  console.log(await ledger.getAddress(BIP32_PATH, { prefix: 'atoi' }));
})().catch((e) => {
  console.error(e);
});
