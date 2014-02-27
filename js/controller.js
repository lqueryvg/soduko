var Controller = (function() {
  "use strict";


  var pub = {}; // public interface
  pub.run = function(q, interval) {
    console.log("q.run() called");
    var event_fn = q.get_next_item();
    if ( typeof event_fn === "function") {
      event_fn();
      window.setTimeout(function() {
        pub.run(q, interval);
      }, interval);
    }
  };

  pub.PriorityQueue = function() {
      this.queue = [];  // array of arrays
                        // Index is the priority.
                        // Inner lists are items.
  };
  pub.PriorityQueue.prototype._ensure_sublist_exists = function(pri) {    // private ?
    if (!_.isArray(this.queue[pri])) {
      this.queue[pri] = [];
    }
  };
  pub.PriorityQueue.prototype.get_next_item = function() {
    // get first elt of first none empty list
    function not_empty(list) {
      return !_.isEmpty(list);
    }
    var first_none_empty_list = _.find(this.queue, not_empty);
    if (_.isArray(first_none_empty_list)) {
      return first_none_empty_list.shift();
    } else {
      return undefined;
    }
  };
  pub.PriorityQueue.prototype.append_item = function(priority, item) {
    this._ensure_sublist_exists(priority);
    this.queue[priority].push(item);
  };
  pub.PriorityQueue.prototype.replace_items = function(pri, items) {
    this.queue[pri] = items;
  };
  return pub;
}());
