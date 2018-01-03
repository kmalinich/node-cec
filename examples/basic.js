/* eslint no-console : 0 */

// -------------------------------------------------------------------------- //
// Example: basic.js
// For more cec-events: http://www.cec-o-matic.com/
// -------------------------------------------------------------------------- //

const nodecec = require('../');

const NodeCec = nodecec.NodeCec;
const CEC     = nodecec.CEC;

const cec = new NodeCec('node-cec-monitor');


// Kill cec-client process on exit
process.on('SIGINT', () => {
	if (cec !== null) {
		cec.stop();
	}
	process.exit();
});


// CEC event handling
cec.once('ready', (client) => {
	console.log(' -- READY -- ');
	client.sendCommand(0xf0, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);
});

cec.on('REPORT_POWER_STATUS', (packet, status) => {
	let keys = Object.keys(CEC.PowerStatus);

	for (let i = keys.length - 1; i >= 0; i--) {
		if (CEC.PowerStatus[keys[i]] == status) {
			console.log('POWER_STATUS:', keys[i]);
			break;
		}
	}
});

cec.on('ROUTING_CHANGE', (packet, fromSource, toSource) => {
	console.log('Routing changed from ' + fromSource + ' to ' + toSource + '.');
});


// Start cec-client

// -m  = start in monitor-mode
// -d8 = set log level to 8 (=TRAFFIC) (-d 8)
// -br = logical address set to `recording device`
cec.start('cec-client', '-m', '-d', '8', '-b', 'r');
