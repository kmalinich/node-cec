(function () {
	let emitLines;

	emitLines = (stream) => {
		let backlog;
		backlog = '';

		stream.on('data', (data) => {
			let n;
			let results;

			backlog += data;
			n        = backlog.indexOf('\n');
			results  = [];

			while (~n) {
				stream.emit('line', backlog.substring(0, n));
				backlog = backlog.substring(n + 1);
				results.push(n = backlog.indexOf('\n'));
			}

			return results;
		});

		return stream.on('end', () => {
			if (backlog) return stream.emit('line', backlog);
		});
	};

	module.exports = emitLines;
}).call(this);
