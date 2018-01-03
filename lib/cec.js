const EventEmitter = require('events');

let bind = function (fn, me) {
	return () => {
		return fn.apply(me, arguments);
	};
};

let slice = [].slice;

const spawn   = require('child_process').spawn;
const emit_ln = require('./emit-lines');

const types = require('./types');


class client extends EventEmitter {
	constructor(osd_name) {
		super();

		this.osd_name = osd_name !== null ? osd_name : null;

		this.traffic_handler = bind(this.traffic_handler, this);
		this.on_close        = bind(this.on_close,        this);

		this.ready = false;

		this.stdinHandlers = [
			{
				contains : 'waiting for input',
				callback : ((_this) => {
					return () => {
						return _this.emit('ready', _this);
					};
				})(this),
			},
			{
				match    : /^TRAFFIC:/g,
				callback : this.traffic_handler,
			},
		];
	}
}

client.prototype.start = function () {
	let client_name;
	let params;

	client_name = arguments[0];
	params      = arguments.length >= 2 ? slice.call(arguments, 1) : [];

	this.client_name = client_name !== null ? client_name : 'cec-client';
	this.params      = params;

	if (this.osd_name !== null) {
		this.params.push('-o');
		this.params.push(this.osd_name);
	}

	this.client = spawn(this.client_name, this.params);

	emit_ln(this.client.stdout);
	this.client.on('close', this.on_close);

	return this.client.stdout.on('line', ((_this) => {
		return (line) => {
			_this.emit('data', line);
			return _this.processLine(line);
		};
	})(this));
};

client.prototype.stop = function () {
	this.emit('stop', this);
	return this.client.kill('SIGINT');
};

client.prototype.on_close = function () {
	return this.emit('stop', this);
};

client.prototype.send = function (message) {
	return this.client.stdin.write(message);
};

client.prototype.sendCommand = function () {
	let command;

	command = arguments.length >= 1 ? slice.call(arguments, 0) : [];

	command = command.map((hex) => {
		return hex.toString(16);
	});

	command = command.join(':');

	return this.send('tx ' + command);
};

client.prototype.processLine = function (line) {
	let matches;
	let results = [];

	this.emit('line', line);

	this.stdinHandlers.forEach((handler) => {
		if (handler.contains === null && handler.fn === null && handler.match === null) {
			return;
		}

		if (handler.contains !== null) {
			if (line.indexOf(handler.contains) >= 0) { results.push(handler.callback(line)); }
			else { results.push(void 0); }
		}
		else if (handler.match !== null) {
			matches = line.match(handler.match);

			if ((matches !== null ? matches.length : void 0) > 0) { results.push(handler.callback(line)); }
			else { results.push(void 0); }
		}
		else if (handler.fn !== null) {
			if (handler.fn(line)) { results.push(handler.callback(line)); }
			else { results.push(void 0); }
		}
		else {
			results.push(void 0);
		}
	});

	return results;
};

client.prototype.traffic_handler = function (traffic) {
	let command;

	command = traffic.substr(traffic.indexOf(']\t') + 2);
	command = command.substr(command.indexOf(' ') + 1);

	let tokens = command.split(':');
	let packet = {};

	if (tokens !== null) packet.tokens = tokens;

	if ((tokens !== null ? tokens.length : void 0) > 0) {
		packet.source = tokens[0][0];
		packet.target = tokens[0][1];
	}

	if ((tokens !== null ? tokens.length : void 0) > 1) {
		packet.opcode = parseInt(tokens[1], 16);

		packet.args = tokens.slice(2, +tokens.length + 1 || 9e9).map((hexString) => {
			return parseInt(hexString, 16);
		});
	}

	return this.processPacket(packet);
};

client.prototype.processPacket = function (packet) {
	let ref;
	let source;

	if (!(((ref = packet.tokens) !== null ? ref.length : void 0) > 1)) {
		this.emit('POLLING', packet);
		return;
	}

	switch (packet.opcode) {
		case types.UserControlCode.ARROW_DOWN  : this.emit('ARROW_DOWN',  packet); return true;
		case types.UserControlCode.ARROW_LEFT  : this.emit('ARROW_LEFT',  packet); return true;
		case types.UserControlCode.ARROW_RIGHT : this.emit('ARROW_RIGHT', packet); return true;
		case types.UserControlCode.ARROW_UP    : this.emit('ARROW_UP',    packet); return true;
		case types.UserControlCode.ENTER       : this.emit('ENTER',       packet); return true;
		case types.UserControlCode.EXIT        : this.emit('EXIT',        packet); return true;

		case types.Opcode.ACTIVE_SOURCE : {
			if (!(packet.args.length >= 2)) break;

			source = packet.args[0] << 8 | packet.args[1];
			this.emit('ACTIVE_SOURCE', packet, source);
			return true;
		}

		case types.Opcode.REPORT_PHYSICAL_ADDRESS : {
			if (!(packet.args.length >= 2)) break;

			source = packet.args[0] << 8 | packet.args[1];
			this.emit('REPORT_PHYSICAL_ADDRESS', packet, source, packet.args[2]);
			return true;
		}

		case types.Opcode.ROUTING_CHANGE : {
			if (!(packet.args.length >= 4)) break;

			let route_old = packet.args[0] << 8 | packet.args[1];
			let route_new = packet.args[2] << 8 | packet.args[3];
			this.emit('ROUTING_CHANGE', packet, route_old, route_new);
			return true;
		}

		case types.Opcode.SET_OSD_NAME : {
			if (!(packet.args.length >= 1)) break;

			let osd_name = String.fromCharCode.apply(null, packet.args);
			this.emit('SET_OSD_NAME', packet, osd_name);
			return true;
		}

		default : {
			Object.keys(types.Opcode).forEach((name) => {
				if (types.Opcode[name] !== packet.opcode) return;
				this.emit.apply(this, [ name, packet ].concat(slice.call(packet.args)));
			});
		}
	}

	this.emit('packet', packet);
	return false;
};

module.exports = client;
