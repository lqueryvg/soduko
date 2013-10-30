
// test comment
// and another

//--- CODE --------------------------

function assert(condition, message) {
    if (!condition) {
        console.log(message);
        //alert(message);
    }
}


function trace(message) {
  console.log(message);
}

/*---------------------------------------------------------*/
// BEGIN: Candidates Object
var Candidates = function (possible_values_arr) { // Constructor
  this.possible_values = {};
  this.num_candidates = 0;
  for (var i = 0; i < possible_values_arr.length; i++) {
    var value = possible_values_arr[i];
    this.possible_values[value] = null;
    this.num_candidates++;
  }
};

Candidates.prototype.remove_candidate = function (value) {
  console.log("in Candidates.prototype.remove_candidate()");
  delete this.possible_values[value];
  this.num_candidates--;
  assert(this.num_candidates >= 1, "cell has 0 remaining candidates");
};

Candidates.prototype.count_candidates = function () {
  return this.num_candidates;
};

Candidates.prototype.get_only_remaining_candidate = function (value) {
  if (this.num_candidates > 1) {
    return null;
  }
  for (var elt in this.possible_values) {
    // There should only be one, so return it.
    return Number(elt);
  }
};

Candidates.prototype.remove_all_candidates = function (value) {
  this.possible_values = {};
  this.num_candidates = 0;
};

Candidates.prototype.value_is_a_candidate = function (value) {
  return this.possible_values.hasOwnProperty(value);
};
// End: Candidates Object

/*---------------------------------------------------------*/
// Begin: Cell Object
var Cell = function (possible_values_arr) { // Constructor
  Candidates.call(this, possible_values_arr);
  this.value = null; // no value yet
  this.constraint_groups = [];
};

// Inheritance
Cell.prototype = Object.create(Candidates.prototype);

Cell.prototype.add_constraint_group = function (grp) {
  this.constraint_groups.push(grp);
};

Cell.prototype.get_value = function (new_value) {
  return this.value;
};

Cell.prototype.remove_candidate = function (value) {
  trace("in Cell.prototype.remove_candidate()");
  Candidates.prototype.remove_candidate.call(this, value);
  if (this.num_candidates === 1) {
    var must_be_value = this.get_only_remaining_candidate();
    console.log("value must be " + must_be_value);
    
    // DANGER: recursion
    this.set_value(must_be_value);
  }
};

Cell.prototype.set_value = function (new_value) {
  assert(this.value === null, "attempt to set cell value after already set");
  assert(this.value_is_a_candidate(new_value), "attempt to set cell to a value which is not a candidate");
  
  this.value = new_value;
  this.remove_all_candidates();
  
  var grps = this.constraint_groups;
  assert(grps.length > 0, "cell has no constraint groups");
  for (var i = 0; i < grps.length; i++) {
    grps[i].cell_changed(this, new_value);
  }
};
// End: Cell Object

/*---------------------------------------------------------*/
// Begin: ConstraintGroup
var ConstraintGroup = function (cells_array) { // Constructor
  this.cells = cells_array;
  // hook cells up to constraint group
  for (var i = 0; i < cells_array.length; i++) {
    
    cells_array[i].add_constraint_group(this);
    
  }
};

ConstraintGroup.prototype.cell_changed = function (cell, new_value) {
  // Apply constraint for all other cells in this group.
  
  // For Sudoku, when a cell value has been set, we have to remove
  // the value from the candidate list of all other cells in this
  // constraint group.
  for (var i = 0; i < this.cells.length; i++) {
    if (cell !== this.cells[i]) {
      this.cells[i].remove_candidate(new_value);
    }
  }
  // TODO:
  // Check to see if any candidate appears only once.
};
// End: ConstraintGroup
/*---------------------------------------------------------*/


//--- SPECS -------------------------

describe("Candidates tests", function () {
  var cand;
  
  beforeEach(function () {
    cand = new Candidates([100, 200, 300, 400, 500]);
  });
  
  it("count_candidates()).toBe(5)", function () {
    expect(cand.count_candidates()).toBe(5);
  });
  
  it("value_is_a_candidate(200)).toBe(true)", function () {
    expect(cand.value_is_a_candidate(200)).toBe(true);
  });
  
  it("value_is_a_candidate(600)).toBe(false)", function () {
    expect(cand.value_is_a_candidate(600)).toBe(false);
  });
  
  it("value_is_a_candidate(200)).toBe(false) after remove", function () {
    cand.remove_candidate(200);
    expect(cand.value_is_a_candidate(200)).toBe(false);
  });
  
  it("count_candidates().toBe(4) after remove", function () {
    cand.remove_candidate(500);
    expect(cand.count_candidates()).toBe(4);
  });
});

describe("Cell tests", function () {
  var cell;
  
  beforeEach(function () {
    cell = new Cell([100, 200, 300, 400, 500]);
  });
  
  it("value_is_a_candidate(200)).toBe(true)", function () {
    expect(cell.value_is_a_candidate(200)).toBe(true);
  });
  
  it("value_is_a_candidate(600)).toBe(false)", function () {
    expect(cell.value_is_a_candidate(600)).toBe(false);
  });
  
  it("get_only_remaining_candidate()).toBe(null)", function () {
    expect(cell.get_only_remaining_candidate()).toBe(null);
  });
  
  it("get_value()).toBe(300)", function () {
    cell.remove_candidate(100);
    cell.remove_candidate(200);
    cell.remove_candidate(400);
    cell.remove_candidate(500);
    expect(cell.get_value()).toBe(300);
  });
  
  it("value_is_a_candidate(200)).toBe(false) after remove", function () {
    cell.remove_candidate(200);
    expect(cell.value_is_a_candidate(200)).toBe(false);
  });
});

describe("Candidate tests", function () {
  var cell1, cell2, cell3;
  var grp1, grp2;
  beforeEach(function () {
    cell1 = new Cell([1, 2]);
    cell2 = new Cell([1, 2]);
    cell3 = new Cell([1, 2]);
    grp1 = new ConstraintGroup([cell1, cell2]);
    grp2 = new ConstraintGroup([cell2, cell3]);
  });
  
  it("cell1.get_value().toBe(1) after cell1.set_value(1)", function () {
    cell1.set_value(1);
    expect(cell1.get_value(1)).toBe(1);
  });
  
  it("cell2.value_is_a_candidate(1)).toBe(false)", function () {
    cell1.set_value(1);
    expect(cell2.value_is_a_candidate(1)).toBe(false);
  });
  
  it("cell2.get_value()).toBe(2)", function () {
    cell1.set_value(1);
    expect(cell2.get_value()).toBe(2);
  });
  
  it("cell3.get_value()).toBe(1)", function () {
    cell1.set_value(1);
    expect(cell3.get_value()).toBe(1);
  });
  
});
