
//--- SPECS -------------------------

describe("Candidates tests", function() {
  var cand;

  beforeEach(function() {
    cand = new Candidates([100, 200, 300, 400, 500]);
  });

  it("count_candidates()).toBe(5)", function() {
    expect(cand.count_candidates()).toBe(5);
  });

  it("value_is_a_candidate(200)).toBe(true)", function() {
    expect(cand.value_is_a_candidate(200)).toBe(true);
  });

  it("value_is_a_candidate(600)).toBe(false)", function() {
    expect(cand.value_is_a_candidate(600)).toBe(false);
  });

  it("value_is_a_candidate(200)).toBe(false) after remove", function() {
    cand.remove_candidate(200);
    expect(cand.value_is_a_candidate(200)).toBe(false);
  });

  it("count_candidates().toBe(4) after remove", function() {
    cand.remove_candidate(500);
    expect(cand.count_candidates()).toBe(4);
  });
});

describe("Cell tests", function() {
  var cell;

  beforeEach(function() {
    cell = new Cell([100, 200, 300, 400, 500]);
  });

  it("value_is_a_candidate(200)).toBe(true)", function() {
    expect(cell.value_is_a_candidate(200)).toBe(true);
  });

  it("value_is_a_candidate(600)).toBe(false)", function() {
    expect(cell.value_is_a_candidate(600)).toBe(false);
  });

  it("get_only_remaining_candidate()).toBe(null)", function() {
    expect(cell.get_only_remaining_candidate()).toBe(null);
  });

  it("get_value()).toBe(300)", function() {
    cell.remove_candidate(100);
    cell.remove_candidate(200);
    cell.remove_candidate(400);
    cell.remove_candidate(500);
    expect(cell.get_value()).toBe(300);
  });

  it("value_is_a_candidate(200)).toBe(false) after remove", function() {
    cell.remove_candidate(200);
    expect(cell.value_is_a_candidate(200)).toBe(false);
  });
});

describe("Candidate tests", function() {
  var cell1, cell2, cell3;
  var grp1, grp2;
  beforeEach(function() {
    cell1 = new Cell([1, 2]);
    cell2 = new Cell([1, 2]);
    cell3 = new Cell([1, 2]);
    grp1 = new ConstraintGroup([cell1, cell2]);
    grp2 = new ConstraintGroup([cell2, cell3]);
  });

  it("cell1.get_value().toBe(1) after cell1.set_value(1)", function() {
    cell1.set_value(1);
    expect(cell1.get_value(1)).toBe(1);
  });

  it("cell2.value_is_a_candidate(1)).toBe(false)", function() {
    cell1.set_value(1);
    expect(cell2.value_is_a_candidate(1)).toBe(false);
  });

  it("cell2.get_value()).toBe(2)", function() {
    cell1.set_value(1);
    expect(cell2.get_value()).toBe(2);
  });

  it("cell3.get_value()).toBe(1)", function() {
    cell1.set_value(1);
    expect(cell3.get_value()).toBe(1);
  });

});
