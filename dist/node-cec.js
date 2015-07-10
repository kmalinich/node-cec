// Generated by CoffeeScript 1.9.2
(function() {
  var CEC, EventEmitter, emitLines, exec, ref, spawn,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  ref = require('child_process'), spawn = ref.spawn, exec = ref.exec;

  EventEmitter = require('events').EventEmitter;

  emitLines = require('./lib/emitLines');

  this.CEC = require('./lib/cectypes');

  CEC = this.CEC;

  this.NodeCec = (function(superClass) {
    extend(NodeCec, superClass);

    function NodeCec(cecName) {
      this.cecName = cecName != null ? cecName : null;
      this.processTraffic = bind(this.processTraffic, this);
      this.onClose = bind(this.onClose, this);
      this.ready = false;
      this.stdinHandlers = [
        {
          contains: 'waiting for input',
          callback: (function(_this) {
            return function(line) {
              return _this.emit('ready', _this);
            };
          })(this)
        }, {
          match: /^TRAFFIC:/g,
          callback: this.processTraffic
        }
      ];
    }

    NodeCec.prototype.start = function() {
      var clientName, params;
      clientName = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      this.clientName = clientName != null ? clientName : 'cec-client';
      this.params = params;
      if (this.cecName != null) {
        this.params.push('-o');
        this.params.push(this.cecName);
      }
      this.client = spawn(this.clientName, this.params);
      emitLines(this.client.stdout);
      this.client.on('close', this.onClose);
      return this.client.stdout.on('line', (function(_this) {
        return function(line) {
          _this.emit('data', line);
          return _this.processLine(line);
        };
      })(this));
    };

    NodeCec.prototype.stop = function() {
      this.emit('stop', this);
      this.client.kill('SIGINT');
      return exec('killall -9 ' + this.clientName);
    };

    NodeCec.prototype.onClose = function() {
      return this.emit('stop', this);
    };

    NodeCec.prototype.send = function(message) {
      return this.client.stdin.write(message);
    };

    NodeCec.prototype.sendCommand = function() {
      var command;
      command = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      command = command.map(function(hex) {
        return hex.toString(16);
      });
      command = command.join(' ');
      return this.send('tx ' + command);
    };

    NodeCec.prototype.processLine = function(line) {
      var handler, i, len, matches, ref1, results;
      ref1 = this.stdinHandlers;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        handler = ref1[i];
        if (handler.contains != null) {
          if (line.indexOf(handler.contains) >= 0) {
            results.push(handler.callback(line));
          } else {
            results.push(void 0);
          }
        } else if (handler.match != null) {
          matches = line.match(handler.match);
          if ((matches != null ? matches.length : void 0) > 0) {
            results.push(handler.callback(line));
          } else {
            results.push(void 0);
          }
        } else if (handler.fn != null) {
          if (handler.fn(line)) {
            results.push(handler.callback(line));
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    NodeCec.prototype.processTraffic = function(traffic) {
      var command, packet, tokens;
      packet = {};
      command = traffic.substr(traffic.indexOf(']\t') + 2);
      command = command.substr(command.indexOf(' ') + 1);
      tokens = command.split(':');
      if (tokens != null) {
        packet.tokens = tokens;
      }
      if ((tokens != null ? tokens.length : void 0) > 0) {
        packet.source = tokens[0][0];
        packet.target = tokens[0][1];
      }
      if ((tokens != null ? tokens.length : void 0) > 1) {
        packet.opcode = parseInt(tokens[1], 16);
        packet.args = tokens.slice(2, +tokens.length + 1 || 9e9).map(function(hexString) {
          return parseInt(hexString, 16);
        });
      }
      return this.processPacket(packet);
    };

    NodeCec.prototype.processPacket = function(packet) {
      var from, key, opcode, opcodes, osdname, ref1, source, to;
      if (!(((ref1 = packet.tokens) != null ? ref1.length : void 0) > 1)) {
        this.emit('POLLING', packet);
        return;
      }
      switch (packet.opcode) {
        case CEC.Opcode.SET_OSD_NAME:
          if (!(packet.args.length >= 1)) {
            break;
          }
          osdname = String.fromCharCode.apply(null, packet.args);
          this.emit('SET_OSD_NAME', packet, osdname);
          return true;
        case CEC.Opcode.ROUTING_CHANGE:
          if (!(packet.args.length >= 4)) {
            break;
          }
          from = packet.args[0] << 8 | packet.args[1];
          to = packet.args[2] << 8 | packet.args[3];
          this.emit('ROUTING_CHANGE', packet, from, to);
          return true;
        case CEC.Opcode.ACTIVE_SOURCE:
          if (!(packet.args.length >= 2)) {
            break;
          }
          source = packet.args[0] << 8 | packet.args[1];
          this.emit('ACTIVE_SOURCE', packet, source);
          return true;
        case CEC.Opcode.REPORT_PHYSICAL_ADDRESS:
          if (!(packet.args.length >= 2)) {
            break;
          }
          source = packet.args[0] << 8 | packet.args[1];
          this.emit('REPORT_PHYSICAL_ADDRESS', packet, source, packet.args[2]);
          return true;
        default:
          opcodes = CEC.Opcode;
          for (key in opcodes) {
            opcode = opcodes[key];
            if (!(opcode === packet.opcode)) {
              continue;
            }
            if ((key != null ? key.length : void 0) > 0) {
              this.emit.apply(this, [key, packet].concat(slice.call(packet.args)));
            }
            return true;
          }
      }
      this.emit('packet', packet);
      return false;
    };

    return NodeCec;

  })(EventEmitter);

}).call(this);