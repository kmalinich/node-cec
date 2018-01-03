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

		this.handle_traffic = bind(this.handle_traffic, this);
		this.on_close       = bind(this.on_close,        this);

		this.ready = false;

		this.stdin_handlers = [
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
				callback : this.handle_traffic,
			},
		];
	}
}

client.prototype.start = function () {
	let client_name = arguments[0];
	let params      = arguments.length >= 2 ? slice.call(arguments, 1) : [];

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
			return _this.handle_line(line);
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

client.prototype.send_write = function (message) {
	return this.client.stdin.write(message);
};

client.prototype.send = function () {
	let command;

	command = arguments.length >= 1 ? slice.call(arguments, 0) : [];

	command = command.map((hex) => {
		return hex.toString(16);
	});

	command = command.join(':');

	return this.send_write('tx ' + command);
};

client.prototype.handle_line = function (line) {
	let matches;
	let results = [];

	this.emit('line', line);

	this.stdin_handlers.forEach((handler) => {
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

client.prototype.handle_traffic = function (traffic) {
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

		packet.args = tokens.slice(2, +tokens.length + 1 || 9e9).map((hex_string) => {
			return parseInt(hex_string, 16);
		});
	}

	return this.handle_packet(packet);
};

client.prototype.handle_packet = function (packet) {
	let ref;

	if (!(((ref = packet.tokens) !== null ? ref.length : void 0) > 1)) {
		this.emit('polling', packet);
		return;
	}

	switch (packet.opcode) {
		case types.user_control.an_channels_list : this.emit('an_channels_list', packet); return true;
		case types.user_control.an_return        : this.emit('an_return',        packet); return true;

		case types.user_control.angle : this.emit('angle', packet); return true;

		case types.user_control.arrow_down       : this.emit('arrow_down',       packet); return true;
		case types.user_control.arrow_left       : this.emit('arrow_left',       packet); return true;
		case types.user_control.arrow_left_down  : this.emit('arrow_left_down',  packet); return true;
		case types.user_control.arrow_left_up    : this.emit('arrow_left_up',    packet); return true;
		case types.user_control.arrow_right      : this.emit('arrow_right',      packet); return true;
		case types.user_control.arrow_right_down : this.emit('arrow_right_down', packet); return true;
		case types.user_control.arrow_right_up   : this.emit('arrow_right_up',   packet); return true;
		case types.user_control.arrow_up         : this.emit('arrow_up',         packet); return true;

		case types.user_control.backward : this.emit('backward', packet); return true;

		case types.user_control.channel_down : this.emit('channel_down', packet); return true;
		case types.user_control.channel_up   : this.emit('channel_up',   packet); return true;

		case types.user_control.contents_menu            : this.emit('contents_menu',            packet); return true;
		case types.user_control.display_information      : this.emit('display_information',      packet); return true;
		case types.user_control.electronic_program_guide : this.emit('electronic_program_guide', packet); return true;

		case types.user_control.clear    : this.emit('clear',    packet); return true;
		case types.user_control.data     : this.emit('data',     packet); return true;
		case types.user_control.dot      : this.emit('dot',      packet); return true;
		case types.user_control.dvd_menu : this.emit('dvd_menu', packet); return true;
		case types.user_control.eject    : this.emit('eject',    packet); return true;
		case types.user_control.enter    : this.emit('enter',    packet); return true;
		case types.user_control.exit     : this.emit('exit',     packet); return true;

		case types.user_control.f1_blue   : this.emit('f1_blue',   packet); return true;
		case types.user_control.f2_red    : this.emit('f2_red',    packet); return true;
		case types.user_control.f3_green  : this.emit('f3_green',  packet); return true;
		case types.user_control.f4_yellow : this.emit('f4_yellow', packet); return true;
		case types.user_control.f5        : this.emit('f5',        packet); return true;

		case types.user_control.fast_forward          : this.emit('fast_forward',          packet); return true;
		case types.user_control.favorite_menu         : this.emit('favorite_menu',         packet); return true;
		case types.user_control.forward               : this.emit('forward',               packet); return true;
		case types.user_control.help                  : this.emit('help',                  packet); return true;
		case types.user_control.initial_configuration : this.emit('initial_configuration', packet); return true;
		case types.user_control.input_select          : this.emit('input_select',          packet); return true;
		case types.user_control.max                   : this.emit('max',                   packet); return true;

		case types.user_control.mute          : this.emit('mute',          packet); return true;
		case types.user_control.mute_function : this.emit('mute_function', packet); return true;

		case types.user_control.next_favorite : this.emit('next_favorite', packet); return true;

		case types.user_control.number0  : this.emit('number0',  packet); return true;
		case types.user_control.number1  : this.emit('number1',  packet); return true;
		case types.user_control.number2  : this.emit('number2',  packet); return true;
		case types.user_control.number3  : this.emit('number3',  packet); return true;
		case types.user_control.number4  : this.emit('number4',  packet); return true;
		case types.user_control.number5  : this.emit('number5',  packet); return true;
		case types.user_control.number6  : this.emit('number6',  packet); return true;
		case types.user_control.number7  : this.emit('number7',  packet); return true;
		case types.user_control.number8  : this.emit('number8',  packet); return true;
		case types.user_control.number9  : this.emit('number9',  packet); return true;
		case types.user_control.number11 : this.emit('number11', packet); return true;
		case types.user_control.number12 : this.emit('number12', packet); return true;

		case types.user_control.number_entry_mode : this.emit('number_entry_mode', packet); return true;

		case types.user_control.page_down : this.emit('page_down', packet); return true;
		case types.user_control.page_up   : this.emit('page_up',   packet); return true;

		case types.user_control.pause                 : this.emit('pause',                 packet); return true;
		case types.user_control.pause_play_function   : this.emit('pause_play_function',   packet); return true;
		case types.user_control.pause_record          : this.emit('pause_record',          packet); return true;
		case types.user_control.pause_record_function : this.emit('pause_record_function', packet); return true;

		case types.user_control.play          : this.emit('play',          packet); return true;
		case types.user_control.play_function : this.emit('play_function', packet); return true;

		case types.user_control.power                 : this.emit('power',                 packet); return true;
		case types.user_control.power_off_function    : this.emit('power_off_function',    packet); return true;
		case types.user_control.power_on_function     : this.emit('power_on_function',     packet); return true;
		case types.user_control.power_toggle_function : this.emit('power_toggle_function', packet); return true;

		case types.user_control.previous_channel : this.emit('previous_channel', packet); return true;

		case types.user_control.record          : this.emit('record',          packet); return true;
		case types.user_control.record_function : this.emit('record_function', packet); return true;

		case types.user_control.restore_volume_function : this.emit('restore_volume_function', packet); return true;
		case types.user_control.rewind                  : this.emit('rewind',                  packet); return true;
		case types.user_control.root_menu               : this.emit('root_menu',               packet); return true;

		case types.user_control.select                      : this.emit('select',                      packet); return true;
		case types.user_control.select_audio_input_function : this.emit('select_audio_input_function', packet); return true;
		case types.user_control.select_av_input_function    : this.emit('select_av_input_function',    packet); return true;
		case types.user_control.select_broadcast_type       : this.emit('select_broadcast_type',       packet); return true;
		case types.user_control.select_media_function       : this.emit('select_media_function',       packet); return true;
		case types.user_control.select_sound_presentation   : this.emit('select_sound_presentation',   packet); return true;

		case types.user_control.setup_menu   : this.emit('setup_menu',   packet); return true;
		case types.user_control.sound_select : this.emit('sound_select', packet); return true;

		case types.user_control.stop          : this.emit('stop',          packet); return true;
		case types.user_control.stop_function : this.emit('stop_function', packet); return true;
		case types.user_control.stop_record   : this.emit('stop_record',   packet); return true;

		case types.user_control.sub_picture       : this.emit('sub_picture',       packet); return true;
		case types.user_control.timer_programming : this.emit('timer_programming', packet); return true;
		case types.user_control.top_menu          : this.emit('top_menu',          packet); return true;
		case types.user_control.tune_function     : this.emit('tune_function',     packet); return true;
		case types.user_control.unknown           : this.emit('unknown',           packet); return true;
		case types.user_control.video_on_demand   : this.emit('video_on_demand',   packet); return true;

		case types.user_control.volume_down : this.emit('volume_down', packet); return true;
		case types.user_control.volume_up   : this.emit('volume_up',   packet); return true;

		case types.opcodes.active_source : {
			if (packet.args.length < 2) break;

			let active_source = packet.args[0] << 8 | packet.args[1];
			this.emit('active_source', packet, active_source);
			return true;
		}

		case types.opcodes.report_physical_address : {
			if (packet.args.length < 2) break;

			let physical_addr = packet.args[0] << 8 | packet.args[1];
			this.emit('physical_address', packet, physical_addr, packet.args[2]);
			return true;
		}

		case types.opcodes.report_power_status : {
			if (packet.args.length < 2) break;

			let power_status_code = packet.args[0] << 8 | packet.args[1];

			let power_status = 'unknown';
			Object.keys(types.power_status).forEach((name) => {
				if (types.power_status[name] !== power_status_code) return;
				power_status = types.power_status[name];
			});

			this.emit('power_status', packet, power_status);
			return true;
		}

		case types.opcodes.routing_change : {
			if (packet.args.length < 4) break;

			this.emit('routing', packet, {
				old : packet.args[0] << 8 | packet.args[1],
				new : packet.args[2] << 8 | packet.args[3],
			});
			return true;
		}

		case types.opcodes.set_osd_name : {
			if (packet.args.length < 1) break;

			let osd_name = String.fromCharCode.apply(null, packet.args);
			this.emit('osd_name', packet, osd_name);
			return true;
		}

		default : {
			Object.keys(types.opcodes).forEach((name) => {
				if (types.opcodes[name] !== packet.opcode) return;
				this.emit.apply(this, [ name, packet ].concat(slice.call(packet.args)));
			});
		}
	}

	this.emit('packet', packet);
	return false;
};

module.exports = client;
