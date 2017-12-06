'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

/**
 * Optionally sets instance's fps setting and initializes the ticker.
 *
 * @class
 * Ticker
 *
 * @classdesc
 * Ticker is an internal clock that emits update and render events to group measure and paint browser actions.
 * Ticker also provides detailed time information stepped to an optional fps setting.
 * Emitted events always pass a ticker object with the properties defined below:
 *
 *  - `fps`: the current fps setting
 *  - `trueFps`: the current render cycle rate independent of fps throttling
 *  - `delta`: the amount of time passed since the last render cycle
 *  - `runtime`: the total duration of the ticker while ticking
 *  - `time`: the current lifespan of the ticker
 *  - `now`: the current time
 *
 * @augments
 * {EventEmitter}
 *
 * @param {number} fps - Initial frames per second setting
 */
function Ticker(fps) {
	EventEmitter.call(this);

	this.fps = fps || null;
	this.fpsInTicks = null;
	this.animFrame = null;
	this.startTime = null;
	this.lastTime = null;
	this.fpsCycle = null;
	this.ticking = false;
	this.runtime = 0;

	this._throttledRender = this._throttledRender.bind(this);
	this._animFrame = this._animFrame.bind(this);
	this._init();
}

inherits(Ticker, EventEmitter);

module.exports = Ticker;

/**
 * Starts a stopped ticker
 * @return {null}
 */
Ticker.prototype.start = function () {
	if (!this.ticking) {
		this.startTime = Date.now();
		this._tick();
	}
};

/**
 * Stops a ticking ticker
 * @return {null}
 */
Ticker.prototype.stop = function () {
	if (this.ticking) {
		window.cancelAnimationFrame(this.animFrame);
	}

	this.animFrame = null;
	this.lastTime = null;
	this.ticking = false;
};

/**
 * Update the instance's fps setting
 * @param {number} fps - Desired fps setting
 * @return {null}
 */
Ticker.prototype.setFps = function (fps) {
	var wasTicking = false;

	if (this.ticking) {
		wasTicking = true;
		this.stop();
	}

	this.fps = fps;
	this.fpsInTicks = 1000 / this.fps;

	if (wasTicking) {
		this.start();
	}
};

/**
 * Retrieve instance's current fps
 * @return {number} - fps
 */
Ticker.prototype.getFps = function () {
	return this.fps;
};

/**
 * Retrieve current ticking state
 * @return {boolean} - Whether or not instance is currently ticking
 */
Ticker.prototype.isTicking = function () {
	return this.ticking;
};

/**
 * Removes all event listeners to prevent memory leaks.
 * Once complete, instance can be safely nulled for garbage collection.
 *
 * @return {null}
 */
Ticker.prototype.destroy = function () {
	this.removeAllListeners();
	this.stop();
};

/**
 * Recreates Date.now if not available to browser.
 * Sets fpsInTicks based on instance's fps.
 * @private
 *
 * @return {null}
 */
Ticker.prototype._init = function () {
	/* istanbul ignore if  */
	if (!Date.now) {
		Date.now = function () {
			return new Date().getTime();
		};
	}

	if (this.fps) {
		this.fpsInTicks = 1000 / this.fps;
	}
};

/**
 * Starts ticker if not already ticking, and stores reference to requestAnimationFrame
 * @private
 *
 * @return {null}
 */
Ticker.prototype._tick = function () {
	if (!this.ticking) {
		this.ticking = true;
	}

	this.animFrame = window.requestAnimationFrame(this._animFrame);
};

/**
 * RequestAnimationFrame callback to determine if an event should be fired.
 * @private
 *
 * @param {DOMHighResTimeStamp} evt - RequestAnimationFrame's DOMHighResTimeStamp parameter
 * @return {null}
 */
Ticker.prototype._animFrame = function (evt) {
	var now = this.startTime + evt;
	var data = null;
	var fps = null;
	var delta = 0;

	if (this.lastTime === null) {
		this.lastTime = now;
	} else {
		delta = now - this.lastTime;
		this.lastTime = now;
	}

	if (delta !== 0) {
		fps = 1000 / delta;
	}

	this.fpsCycle += delta;
	this.runtime += delta;

	data = {
		fps: this.fps || fps,
		trueFps: fps,
		runtime: this.runtime,
		delta: delta,
		time: evt,
		now: now
	};

	if (this.fps || this.listenerCount('update') > 0) {
		/**
	     * update event
	     * @event Ticker#update
	     * @type {object}
	     *
	     * @property {object} data - Event data
	     * @property {number} data.fps - Frames per second
	     * @property {number} data.trueFps - Un-throttled frames per second
	     * @property {number} data.runtime - The total duration of the ticker while ticking
	     * @property {number} data.delta - Time since last render
	     * @property {number} data.time - Current lifespan of render cycle
	     * @property {number} data.now - Current time
	     */
		this.emit('update', data);
	}

	if (this.fps || this.listenerCount('render') > 0) {
		if (this.fps && this.fpsInTicks) {
			if (this.fpsInTicks < this.fpsCycle) {
				this.once('_render', this._throttledRender);
				this.fpsCycle = 0;
			} else {
				this.emit('_render', data);
			}
		} else {
			/**
		     * render event
		     * @event Ticker#render
		     * @type {object}
		     *
		     * @property {object} data - Event data
		     * @property {number} data.fps - Frames per second
		     * @property {number} data.trueFps - Un-throttled frames per second
		     * @property {number} data.runtime - The total duration of the ticker while ticking
		     * @property {number} data.delta - Time since last render
		     * @property {number} data.time - Current lifespan of render cycle
		     * @property {number} data.now - Current time
		     */
			this.emit('render', data);
		}
	}

	this.animFrame = null;

	if (this.ticking) {
		this._tick();
	} else {
		this.lastTime = null;
	}
};

/**
 * Emit a throttled render event (to avoid rendering more frequently than fps)
 * @private
 *
 * @param {object} data - Event data object
 * @return {null}
 */
Ticker.prototype._throttledRender = function (data) {
	this.emit('render', data);
};
