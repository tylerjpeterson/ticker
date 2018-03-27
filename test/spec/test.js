'use strict';

const test = require('tape');
const Ticker = require('./../..');

let ticker = null;
let ready = null;
let timer = null;

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

test('should instantiate an object properly', assert => {
	assert.plan(1);

	before();
	assert.equal('object', typeof ticker, 'instantiated to an object');
});

test('should maintain a reasonably accurate runtime property', assert => {
	assert.plan(1);
	before();

	ticker.start();

	setTimeout(() => {
		const runtime = ticker.runtime;
		ready = (runtime < 2150 && runtime > 1850);
		assert.equal(ready, true, 'keeps accurate runtime within 100ms threshold');
	}, 2000);
});

test('should keep accurate time with a 50ms margin for error', assert => {
	before();
	assert.plan(1);

	ticker.on('update', e => {
		timer = e.runtime;
	});

	ticker.start();

	setTimeout(() => {
		ready = (timer < 1551 && timer > 1449);
		assert.equal(ready, true, 'runtime property accurate within 50ms threshold');
	}, 1500);
});

test('should emit update and render events', assert => {
	assert.plan(2);
	let updated = false;
	let rendered = false;

	before();

	ticker.on('render', () => {
		rendered = true;
	});

	ticker.on('update', () => {
		updated = true;
	});

	ticker.start();

	setTimeout(() => {
		ticker.stop();
		assert.equal(rendered, true, 'emitted render event');
		assert.equal(updated, true, 'emitted update event');
	}, 200);
});

test('should throttle render events based on its "fps" property', assert => {
	let t = 1;
	const ticked = () => {
		ticker.stop();
	};
	before();
	assert.plan(3);
	ticker.on('render', () => {
		t++;
	});
	ticker.setFps(0.5);
	ticker.start();
	setTimeout(() => {
		ticker.on('update', ticked);
		assert.equal(t, 2, 'throttled first render event properly');

		setTimeout(() => {
			ticker.removeListener('update', ticked);
			ticker.start();
			assert.equal(t, 2, 'stop call prevented subsequent event properly');
			setTimeout(() => {
				assert.equal(t, 3, 'throttled second render event properly after restart');
			}, 2100);
		}, 100);
	}, 2100);
});

test('should ignore calls to start / stop start based on state', assert => {
	assert.plan(2);

	before();
	ticker.start();
	ticker.start();
	assert.equal(ticker.isTicking(), true, 'ignored calls to start when already running');

	ticker.stop();
	ticker.stop();
	assert.equal(ticker.isTicking(), false, 'ignored stop call when stopped');
});

test('should return accurate FPS setting when set', assert => {
	before();
	assert.plan(2);
	ticker.start();
	ticker.setFps(45);
	assert.equal(ticker.getFps(), 45, 'returned accurate FPS property value on first instance');

	before();
	ticker = new Ticker(30);
	ticker.start();
	assert.equal(ticker.getFps(), 30, 'returned accurate FPS property value on second instance');
	close();
});
