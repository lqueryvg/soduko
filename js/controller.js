var Controller = (function() {"use strict";

	var pub = {};
	// public interface

	var interval = 250;
	// default interval

	var event_queue = [];

	pub.add_event = function add_event(event_fn) {
		event_queue.push(event);
	};

	pub.do_next_event = function do_next_event(milliseconds) {
		if ( typeof milliseconds !== "undefined") {
			interval = milliseconds;
		} else {
			interval = 250;
		}

		console.log("do_next_event() called");
		var event_fn = event_queue.shift();
		if ( typeof event_fn === "function") {
			event_fn();
		}
		window.setTimeout(do_next_event, interval);
	};

	return pub;
})();
