import '@babel/polyfill';

import TransportU2F from '@ledgerhq/hw-transport-u2f';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import TransportWebBLE from '@ledgerhq/hw-transport-web-ble';
import AppIota from 'hw-app-iota';

const SECURITY_LEVEL = 2;
const TIMEOUT = 5000;

async function getIotaAddress(Transport, account, page) {
  const transport = await Transport.create(TIMEOUT);
  try {
    const hwapp = new AppIota(transport);
    const bipPath = `44'/4218'/${account}'/${page}'`;
    await hwapp.setActiveSeed(bipPath, SECURITY_LEVEL);
    return await hwapp.getAddress(0, {
      checksum: true
    });
  } finally {
    transport.close();
  }
}

const transports = [
  { name: 'U2F transport', clazz: TransportU2F },
  { name: 'WebUSB transport', clazz: TransportWebUSB },
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
for (let i = 0; i <= 3; i++) {
  const opt = document.createElement('option');
  opt.value = i;
  opt.innerText = 'Account #' + i;
  accountSelect.appendChild(opt);
}
document.body.appendChild(accountSelect);

const btn = document.createElement('button');
btn.textContent = 'Get Address';
document.body.appendChild(btn);

const errorEl = document.createElement('code');
errorEl.style.color = '#a33';
const pre = document.createElement('pre');
pre.appendChild(errorEl);
document.body.appendChild(pre);

btn.onclick = () => {
  errorEl.textContent = '';
  getIotaAddress(
    transports[transportSelect.selectedIndex].clazz,
    accountSelect.selectedIndex,
    0
  ).then(
    a => {
      console.log(a);
      document.write(a);
    },
    e => {
      console.error(e);
      errorEl.textContent = e.message;
    }
  );
};
