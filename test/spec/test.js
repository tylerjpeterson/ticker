'use strict';
const test = require('tape');
const Ticker = require('./../../');

var ticker = null;
var ready = null;
var timer = null;

const close = () => {
	setTimeout(() => window.close(), 100);
};

const before = () => {
	if (ticker && typeof ticker.destroy === 'function') {
		ticker.destroy();
		ticker = null;
	}

	ticker = new Ticker();
	ready = false;
	timer = 0;
};

test('should be an object', assert => {
	before();
	assert.plan(1);
	assert.equal('object', typeof ticker, 'exports an object');
});

test('resolves', assert => {
	assert.plan(1);

	return new Promise(resolve => {
		before();

		ticker.on('update', () => {
			ready = true;
		});

		ticker.start();

		setTimeout(() => {
			assert.equal(ready, true, 'fires update event');
			resolve();
		}, 200);
	});
});

test('catches runtime', assert => {
	assert.plan(1);

	return new Promise(resolve => {
		before();

		ticker.on('update', e => {
			timer = e.runtime;
		});

		ticker.start();

		setTimeout(function () {
			ready = (timer < 1050 && timer > 950);
			assert.equal(ready, true, 'keeps accurate runtime');
		}, 1000);

		resolve();
	});
});

test('should cause the Ticker to throw update events', assert => {
	assert.plan(1);

	return new Promise(resolve => {
		before();

		ticker.on('update', () => {
			ready = true;
		});

		ticker.start();

		setTimeout(function () {
			ticker.stop();
			assert.equal(ready, true, 'emits update event');
			resolve();
		}, 200);
	});
});

test('should cause the Ticker to throw render events', assert => {
	return new Promise(resolve => {
		before();
		assert.plan(1);

		ticker.on('render', () => {
			ready = true;
		});

		ticker.start();

		setTimeout(function () {
			ticker.stop();
			assert.equal(ready, true, 'emits render event');
			resolve();
		}, 1500);
	});
});

test('should keep time accurately with a 50ms margin for error', assert => {
	return new Promise(resolve => {
		before();
		assert.plan(1);

		ticker.on('update', e => {
			timer = e.runtime;
		});

		ticker.start();

		setTimeout(function () {
			ticker.stop();
			// ready = timer;//(timer < 1550 && timer > 1450);
			ready = (timer < 1551 && timer > 1449);
			assert.equal(ready, true);
			resolve();
		}, 1500);
	});
});

test('should ignore calls to start when running', assert => {
	return new Promise(resolve => {
		before();
		assert.plan(1);
		ticker.start();
		ticker.start();
		assert.equal(ticker.isTicking(), true, 'ignores calls to start when already running');
		resolve();
	});
});

test('should ignore calls to start when running', assert => {
	return new Promise(resolve => {
		var t = 1;
		before();
		assert.plan(1);
		ticker.on('render', function () {
			t++;
		});
		ticker.setFps(0.5);
		ticker.start();
		setTimeout(() => {
			assert.equal(t, 2, 'throttles render');
			resolve();
		}, 2100);
	});
});

test('should ignore calls to start when running', assert => {
	return new Promise(resolve => {
		var t = 1;
		before();
		assert.plan(1);
		ticker.on('render', function () {
			t++;
		});
		ticker.on('update', function () {
			ticker.stop();
		});
		ticker.setFps(0.5);
		ticker.start();
		setTimeout(() => {
			assert.equal(t, 1, 'throttles render');
			ticker.start();
			setTimeout(() => {
				assert.equal(t, 2, 'throttles render');
				resolve();
			}, 2000);
		}, 2100);
	});
});

test('should ignore calls to stop when stopped', assert => {
	assert.plan(1);

	return new Promise(resolve => {
		before();
		ticker.start();
		ticker.stop();
		ticker.stop();
		assert.equal(ticker.isTicking(), false, 'ignores stop calls when stopped');
		assert.end();
		return resolve();
	});
});

test('should return accurate FPS setting when set', assert => {
	before();
	assert.plan(2);
	ticker.start();
	ticker.setFps(45);
	assert.equal(ticker.getFps(), 45);

	before();
	ticker = new Ticker(30);
	ticker.start();
	assert.equal(ticker.getFps(), 30);
	close();
});
