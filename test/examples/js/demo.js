'use strict';

var Ticker = require('./../../../');
var ticker = new Ticker();
var output = null;

var fpsEl = document.getElementById('fps');
var outputEl = document.getElementById('output');
var toggleEl = document.getElementById('toggle');
var throttleEl = document.getElementById('throttle');

ticker.on('update', function (evt) {
	output = JSON.stringify(evt, null, '\t');
});

ticker.on('render', function () {
	outputEl.textContent = output;
});

toggleEl.addEventListener('click', function (evt) {
	evt.preventDefault();
	toggleEl.classList.toggle('active');

	if (ticker.isTicking()) {
		ticker.stop();
	} else {
		ticker.start();
	}
});

throttleEl.addEventListener('click', function (evt) {
	evt.preventDefault();

	if (!toggleEl.classList.contains('active')) {
		return;
	}

	throttleEl.classList.toggle('active');

	if (ticker.getFps()) {
		ticker.setFps(null);
		fpsEl.textContent = 'full-speed';
	} else {
		ticker.setFps(0.5);
		fpsEl.textContent = 'throttled to 0.5fps';
	}
});
