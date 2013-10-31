
//--- CODE --------------------------

function assert(condition, message) {
  if (!condition) {
    console.log(message);
    //alert(message);
  }
}

/*---------------------------------------------------------*/
// BEGIN: Candidates Object
var Candidates = function(possible_values_arr) { // Constructor
  var that = this;
  that.possible_values = {};
  that.num_candidates = 0;

  possible_values_arr.forEach(function(value) {
    that.possible_values[value] = null;
    that.num_candidates++;
  });
};

Candidates.prototype.remove_candidate = function(value) {
  delete this.possible_values[value];
  this.num_candidates--;
  assert(this.num_candidates >= 1, "cell has 0 remaining candidates");
};

Candidates.prototype.count_candidates = function() {
  return this.num_candidates;
};

Candidates.prototype.get_only_remaining_candidate = function(value) {
  if (this.num_candidates > 1) {
    return null;
  }
  for (var elt in this.possible_values) {
    // There should only be one, so return it.
    return Number(elt);
  }
};

Candidates.prototype.remove_all_candidates = function(value) {
  this.possible_values = {};
  this.num_candidates = 0;
};

Candidates.prototype.value_is_a_candidate = function(value) {
  return this.possible_values.hasOwnProperty(value);
};
// End: Candidates Object

/*---------------------------------------------------------*/
// Begin: Cell Object
var Cell = function(possible_values_arr) { // Constructor
  Candidates.call(this, possible_values_arr);
  this.value = null; // no value yet
  this.constraint_groups = [];
};

// Inheritance
Cell.prototype = Object.create(Candidates.prototype);

Cell.prototype.add_constraint_group = function(grp) {
  this.constraint_groups.push(grp);
};

Cell.prototype.get_value = function(new_value) {
  return this.value;
};

Cell.prototype.remove_candidate = function(value) {
  Candidates.prototype.remove_candidate.call(this, value);

  // Technique #2: Single Candidate
  if (this.num_candidates === 1) {
    var must_be_value = this.get_only_remaining_candidate();

    // DANGER: recursion
    this.set_value(must_be_value);
  }
};

Cell.prototype.set_value = function(new_value) {
  var that = this;
  assert(this.value === null, "attempt to set cell value after already set");
  assert(this.value_is_a_candidate(new_value),
          "attempt to set cell to a value which is not a candidate");

  this.value = new_value;
  this.remove_all_candidates();

  var grps = this.constraint_groups;
  assert(grps.length > 0, "cell has no constraint groups");
  grps.forEach(function(grp) {
    grp.cell_changed(that, new_value);
  });
};
// End: Cell Object

/*---------------------------------------------------------*/
// Begin: ConstraintGroup
var ConstraintGroup = function(cells_array) { // Constructor
  var that = this;
  that.cells = cells_array;
  // hook cells up to constraint group

  cells_array.forEach(function(cell) {
    cell.add_constraint_group(that);
  });
};

ConstraintGroup.prototype.cell_changed = function(changed_cell, new_value) {
  // Apply constraint for all other cells in this group.

  // For Sudoku, when a cell value has been set, we have to remove
  // the value from the candidate list of all other cells in this
  // constraint group.

  this.cells.forEach(function(cell) {
    if (cell !== changed_cell) {
      cell.remove_candidate(new_value);
    }
  });
  // TODO:
  // 
  // Technique #1: Single Position
  // See http://www.sudokuoftheday.com/pages/techniques-overview.php
  // When a candidate appears in only one cell in the constraint group, then
  // that cell's value must be that candidate.

};
// End: ConstraintGroup
/*---------------------------------------------------------*/
