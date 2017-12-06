![100% test coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

# ticker
> Event-emitting time keeper for browser friendly render cycles

Browser-based module that fires events at a given interval to facilitate interactions on a timeline.
Tries to help facilitate measure/render grouping by firing two separate events at different moments in the process tick.

- The `update` event is when any measurement or calculations should occur.
- The `render` event is when the results of any measurements are applied to the DOM.


## Installation
Install via npm:

```sh
$ npm i ticker-js --save
```


## API
All properties should be accessed via the getter and setter methods.

| method      | params         | description                                           |
|-------------|----------------|-------------------------------------------------------|
| `start`     |                | Starts the instance, firing its events                |
| `stop`      |                | Stops the instance, stopping events from firing       |
| `setFps`    | `number: fps`  | Throttles the ticker to the passed value              |
| `getFps`    |                | Returns the current fps setting as a number or null   |
| `isTicking` |                | Returns boolean indicating if the instance is running |
| `destroy`   |                | Destroys the instance, removing all listeners         |


## Events
All events pass the same event object defined below.

| event    | description                                                |
|----------|------------------------------------------------------------|
| `update` | DOM measurements and calculations should occur when fired. |
| `render` | DOM modification should occur when fired.                  |


## Event object
The two events pass listeners an event object as defined below.

| type               | name           | description                                    |
|--------------------|----------------|------------------------------------------------|
| @property {object} | `data`         | event data object                              |
| @property {number} | `data.fps`     | frames per second                              |
| @property {number} | `data.trueFps` | un-throttled frames per second                 |
| @property {number} | `data.runtime` | the total duration of the ticker while ticking |
| @property {number} | `data.delta`   | time since last render                         |
| @property {number} | `data.time`    | current lifespan of render cycle               |
| @property {number} | `data.now`     | current time                                   |


## Usage
Instantiate and attach any listeners.

```js
var Ticker = require('ticker-js');
var ticker = new Ticker(30);

ticker.on('update', function (evt) {
  // measure
});

ticker.on('render', function (evt) {
  // render
});
```

Instances do not auto-run.
You must call the `start` method for the events to begin firing.

```js
ticker.start();
```

Once running, the update and render events will begin firing at the ticker's `fps` interval.
If `fps` is unset, the ticker is not throttled, and will `tick` as close to 60 fps as possible.

