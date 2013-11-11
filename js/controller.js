var Controller = (function() {"use strict";

	var pub = {};
	// public interface
	
	var event_queue = [];

	pub.add_event = function add_event(event) {
		events.push(event);
	};

	pub.start_dispatcher = function start_dispatcher(interval) {
	};

	return pub;
})();
