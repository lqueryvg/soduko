
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

  pub.Cell.prototype.toString = function() {
    return this.name;
  };

  pub.Cell.prototype.remove_candidate = function(value) {
    pub.Candidates.prototype.remove_candidate.call(this, value);

    // Technique #2: Single Candidate
    // When there is only one remaining candidate for this cell set
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

  pub.ConstraintGroup.prototype.add_cell = function(cell) {
    this.cells.push(cell);
    cell.add_constraint_group(this);
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

  pub.Puzzle = function() { // Constructor
    var that = this;
    that.possible_values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    that.cells = [];
    that.cols = [];
    that.rows = [];
    that.boxes = [];

    // Initialise empty constraint groups.
    [1, 2, 3].forEach(function(boxcol) {
      var col = [];
      [1, 2, 3].forEach(function() {  // row
        col.push(new pub.ConstraintGroup([]));
      });
      that.boxes.push(col);
    });

    that.possible_values.forEach(function() {
      that.cols.push(new pub.ConstraintGroup([]));
      that.rows.push(new pub.ConstraintGroup([]));
    });

    that.possible_values.forEach(function(col) {
      that.cells.push([]);
      that.possible_values.forEach(function(row) {

        var cell = new Sud.Cell(that.possible_values);
        cell.name = "c" + col.toString() + row.toString();
        that.cells[col - 1][row - 1] = cell;
        that.cols[col - 1].add_cell(cell);
        that.rows[row - 1].add_cell(cell);
        that.get_box_group(col, row).add_cell(cell);
      });
    });
  };  // Puzzle

  pub.Puzzle.prototype.get_possible_values = function() {
    return this.possible_values;
  };

  pub.Puzzle.prototype.get_box_coord_from_cell_coord = function(cell_i) {
    // cell_i is a row or column number of a cell
    return(Math.floor((cell_i - 1) / 3) + 1);
  };

  pub.Puzzle.prototype.get_box_group = function(col, row) {
    var bcol, brow;

    bcol = this.get_box_coord_from_cell_coord(col);
    brow = this.get_box_coord_from_cell_coord(row);
    console.log("col,row = bcol,brow => " + col + "," + row +
        " = " + bcol + "," + brow);
    return this.boxes[bcol - 1][brow - 1];
  };

  pub.Puzzle.prototype.get_cell = function(col, row) {
    return this.cells[col-1][row-1];
  };

})();

var Solver = (function() {
  "use strict";
  var puzz;
  var q = PriorityQueue;   // just a shortcut
  var coords = [0,1,2,3,4,5,6,7,8];   // TODO need a better way

  var Pri = { // TODO fix these priorities
    FINISHED:                  0,
    SET_CELL_VALUE:            1,
    DEL_ONE_GROUP_CANDS:       2,
    DEL_CELL_CAND:             3,
    DEL_ALL_CELL_GROUP_CANDS:  4,
    SCAN_ALL_FOR_VALUES:       5,
  };

  // public functions

  return {
    solve: function(puzzle) {
      puzz = puzzle;
      q.push(Pri.SCAN, this.scan);
    },
    remove_constraint_group_candidates: function(grp, cell) {
    },
    remove_candidates_around_cell: function(cell) {
      // TODO
      // foreach constraint group of cell...
      // q.push(
      //   for each cell in constraint group not this cell
      //     q.push(2, cell.delete_candidate(value));

    },
    scan: function() {  // scan entire puzzle looking for cells already set
      _.each(coords, function(x) {
        _.each(coords, function(y) {
          var val = puzz.get_cell_value(x,y);
          if (val !== undefined) {
            this.remove_candidates_around(x,y,value);   // TODO where is this implemented?
          }
        });
      });
    },
    delete_candidate: function(x, y, candidate_value) {
      // TODO
      // *P2*
      // delete candidate
      // if only one candidate remains, queue up set_value()
      //
    },
    set_value: function(x, y, value) {
      // TODO
      // *P1*
      // set the cell value
      // if puzzle solved, queue finish function *P0*
      // queue up row/column delete candidates
      // (lower priority than set_value())
    }
  };
}());
