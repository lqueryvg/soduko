
var Sud = (function() {
  "use strict";

  var pub = {}; // public interface

  var assert = function(condition, message) {
    if (!condition) {
      console.log(message);
      //alert(message);
    }
  };

  /*---------------------------------------------------------*/
  // BEGIN: Candidates Object

  pub.Candidates = function(possible_values_arr) { // Constructor
    var that = this;
    that.possible_values = {};
    that.num_candidates = 0;
    possible_values_arr.forEach(function(value) {
      that.possible_values[value] = null;
      that.num_candidates++;
    });
  };
  pub.Candidates.prototype.remove_candidate = function(value) {
    delete this.possible_values[value];
    this.num_candidates--;
    if (this.num_candidates === 0) {
      throw new Error('cell has 0 remaining candidates');
    }

  };
  pub.Candidates.prototype.count_candidates = function() {
    return this.num_candidates;
  };
  pub.Candidates.prototype.get_only_remaining_candidate = function(value) {
    if (this.num_candidates > 1) {
      return null;
    }
    for (var elt in this.possible_values) {
      // There should only be one, so return it.
      return Number(elt);
    }
  };
  pub.Candidates.prototype.remove_all_candidates = function(value) {
    this.possible_values = {};
    this.num_candidates = 0;
  };
  pub.Candidates.prototype.value_is_a_candidate = function(value) {
    return this.possible_values.hasOwnProperty(value);
  };
// End: Candidates Object

  /*---------------------------------------------------------*/
// Begin: Cell Object
  pub.Cell = function(possible_values_arr) { // Constructor
    pub.Candidates.call(this, possible_values_arr);
    this.value = null; // no value yet
    this.constraint_groups = [];
  };
  pub.Cell.prototype = Object.create(pub.Candidates.prototype); // Inheritance
  pub.Cell.prototype.add_constraint_group = function(grp) {
    this.constraint_groups.push(grp);
  };

  pub.Cell.prototype.get_value = function(new_value) {
    return this.value;
  };

  pub.Cell.prototype.remove_candidate = function(value) {
    pub.Candidates.prototype.remove_candidate.call(this, value);

    // Technique #2: Single Candidate
    // When there is only one remaining possible candidate for this cell set
    // the cell's value.
    if (this.num_candidates === 1) {
      var only_possible_value = this.get_only_remaining_candidate();
      this.set_value(only_possible_value);  // Recursion !!!
    }
  };

  pub.Cell.prototype.set_value = function(new_value) {
    var that = this;
    // TODO: use Aspects for these assertions
    assert(this.value === null,
            "attempt to set cell value after already set");
    assert(this.value_is_a_candidate(new_value),
            "attempt to set cell to a value which is not a candidate");
    this.value = new_value;
    this.remove_all_candidates();
    var grps = this.constraint_groups;
    grps.forEach(function(grp) {
      grp.cell_changed(that, new_value);
    });
  };
  // End: Cell Object

  /*---------------------------------------------------------*/
  // Begin: ConstraintGroup
  pub.ConstraintGroup = function(cells_array) { // Constructor
    var that = this;
    that.cells = cells_array;
    // hook cells up to constraint group

    cells_array.forEach(function(cell) {
      cell.add_constraint_group(that);
    });
  };
  pub.ConstraintGroup.prototype.cell_changed = function(changed_cell, new_value) {
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

  pub.get_box_coord = function(coord) {
    return((coord - 1) % 3 + 1);
  };
  /*---------------------------------------------------------*/
  // Begin: ConstraintGroup
  pub.Puzzle = function() { // Constructor
    this.possible_values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.grid = [];
    this.columns = [];
    this.rows = [];
    this.boxes = [];


    this.possible_values.forEach(function(col) {
      this.possible_values.forEach(function(row) {
        var cell = new Sud.Cell(this.possible_values);
        this.grid[col][row] = cell;
        this.columns[col].push(cell);
        this.rows[row].push(cell);
        this.boxes[pub.get_box_coord(col)][pub.get_box_coord(row)].push(cell);
      });
    });
    
    // TODO: add cell method for constraint group would be useful.

    cell1 = new Sud.Cell([1, 2]);
    cell2 = new Sud.Cell([1, 2]);
    cell3 = new Sud.Cell([1, 2]);
    grp1 = new Sud.ConstraintGroup([cell1, cell2]);
    grp2 = new Sud.ConstraintGroup([cell2, cell3]);
  };

  return pub;
})();