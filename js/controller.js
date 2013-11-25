var Controller = (function() {
  "use strict";

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

var PriorityQueue = (function() {
  "use strict";
  var queue = [];       // array of arrays
                        // Index is the priority.
                        // Inner lists are items.

  // public functions

  var _ensure_sublist_exists = function(pri) {
    if (!_.isArray(queue[pri])) {
      queue[pri] = [];
    }
  };

  return {
    get_next_item: function() {    // get first elt of first none empty list
      function not_empty(list) {
        return !_.isEmpty(list);
      }
      var first_none_empty_list = _.find(queue, not_empty);
      if (_.isArray(first_none_empty_list)) {
        return first_none_empty_list.shift();
      } else {
        return undefined;
      }
    },
    append_item: function(priority, item) {
      _ensure_sublist_exists(priority);
      queue[priority].push(item);
    },
    replace_items: function(pri, items) {
      queue[pri] = items;
    }
  };
}());
