// @ledgerhq packages still require regeneratorRuntime
// see github.com/LedgerHQ/ledgerjs/issues/332
import 'regenerator-runtime/runtime';

import { listen } from '@ledgerhq/logs';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import TransportWebAuthn from '@ledgerhq/hw-transport-webauthn';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebBLE from '@ledgerhq/hw-transport-web-ble';
import AppIota from 'hw-app-iota';

const NUM_ACCOUNTS = 5;
const TIMEOUT = 5000;

// log everything to the console
listen(e => {
  console.log(`${e.type}: ${e.message}`);
});

async function getIotaAddress(Transport, account, index) {
  const transport = await Transport.create(TIMEOUT);
  try {
    const hwapp = new AppIota(transport);
    const bipPath = `44'/1'/${account}'/0'/${index}'`;
    return await hwapp.getAddress(bipPath, {
      prefix: 'atoi'
    });
  } finally {
    transport.close();
  }
}

async function getIotaAppVersion(Transport) {
  const transport = await Transport.create(TIMEOUT);
  try {
    const hwapp = new AppIota(transport);
    return await hwapp.getAppVersion();
  } finally {
    transport.close();
  }
}

const transports = [
  { name: 'U2F transport (legacy)', clazz: TransportU2F },
  { name: 'WebAuthn transport (experimental)', clazz: TransportWebAuthn },
  { name: 'WebUSB transport', clazz: TransportWebUSB },
  { name: 'WebHID transport (experimental)', clazz: TransportWebHID },
  { name: 'Web Bluetooth transport', clazz: TransportWebBLE }
];
const transportSelect = document.createElement('select');
transports.forEach((t, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.innerText = t.name;
  transportSelect.appendChild(opt);
});
document.body.appendChild(transportSelect);

const accountSelect = document.createElement('select');
for (let i = 0; i < NUM_ACCOUNTS; i++) {
  const opt = document.createElement('option');
  opt.value = i;
  opt.innerText = 'Account #' + i;
  accountSelect.appendChild(opt);
}
document.body.appendChild(accountSelect);

const addressBtn = document.createElement('button');
addressBtn.textContent = 'Get Address';
document.body.appendChild(addressBtn);

const versionBtn = document.createElement('button');
versionBtn.textContent = 'Get App Version';
document.body.appendChild(versionBtn);

const outputEl = document.createElement('code');
const pre = document.createElement('pre');
pre.appendChild(outputEl);
document.body.appendChild(pre);

addressBtn.onclick = () => {
  outputEl.textContent = '';
  getIotaAddress(
    transports[transportSelect.selectedIndex].clazz,
    accountSelect.selectedIndex,
    0
  ).then(
    a => {
      console.log(a);
      outputEl.style.color = '#000';
      outputEl.textContent = a;
    },
    e => {
      console.error(e);
      outputEl.style.color = '#a33';
      outputEl.textContent = e.message;
    }
  );
};

versionBtn.onclick = () => {
  outputEl.textContent = '';
  getIotaAppVersion(transports[transportSelect.selectedIndex].clazz).then(
    v => {
      console.log(v);
      outputEl.style.color = '#000';
      outputEl.textContent = v;
    },
    e => {
      console.error(e);
      outputEl.style.color = '#a33';
      outputEl.textContent = e.message;
    }
  );
};
