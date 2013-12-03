/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//var Sud;

//var View = (function() {
(function( global ) {
  "use strict";
  var View = (function() {
    var cell_element_map = {};
    var candidate_selector_map = {
      1: '#o11',
      2: '#o21',
      3: '#o31',
      4: '#o12',
      5: '#o22',
      6: '#o32',
      7: '#o13',
      8: '#o23',
      9: '#o33'
    };
    var create_grid = function() {

      var create_table = function(cell_class, id_prefix, cell_contents_fn) {
        var outer_table;
        outer_table = document.createElement('table');
        [1, 2, 3].forEach(function foreach_row(row) {
          var outer_tr;
          outer_tr = document.createElement('tr');
          outer_table.appendChild(outer_tr);
          [1, 2, 3].forEach(function foreach_col(col) {
            var td_element, cell_class_attr, cell_contents, cell_id_attr, cell_id;
            td_element = document.createElement('td');
            outer_tr.appendChild(td_element);
            cell_class_attr = document.createAttribute('class');
            cell_class_attr.nodeValue = cell_class;
            cell_id_attr = document.createAttribute('id');
            cell_id = id_prefix + col.toString() + row.toString();
            cell_id_attr.nodeValue = cell_id;
            td_element.setAttributeNode(cell_class_attr);
            td_element.setAttributeNode(cell_id_attr);
            if ((typeof cell_contents_fn) === "function") {
              cell_contents = cell_contents_fn();
              if (typeof (cell_contents) === "string") {
                td_element.innerHTML = cell_contents;
              } else {
                td_element.appendChild(cell_contents);
              }
            }
          });
        });
        return outer_table;
      };
      // 9 boxes, each with 9 cells, each with 9 candidates
      // select a candidate as follows:
      // #b22 #c13 #o32     (column followed by row)
      // select a cell as follows:
      // #b22 #c13

      var tab = create_table('box', 'b', // outer table
                             function create_box_table() {
                               //console.log(box_css_selector);
                               return create_table('cell', 'c',
                                                   function create_candidates_table() {
                                                     //console.log(box_css_selector);
                                                     return create_table('candidate', 'o',
                                                                         function create_empty_cand() {
                                                                           return '8'; // TODO: remove later
                                                                         });
                                                   });
                             });
                             document.body.appendChild(tab);
    };

    var test_some_stuff = function() {

      var aspects;
      var cell1, cell2, cell3;
      var grp1, grp2, aspects;
      aspects = new Aspects();
      aspects.addBefore(function(arg) {
        console.log(this.name + ".set_value(" + arg + ") called");
      }, Sud.Cell, "set_value");
      cell1 = new Sud.Cell([1, 2]);
      cell1.name = "cell1";
      cell2 = new Sud.Cell([1, 2]);
      cell2.name = "cell2";
      cell3 = new Sud.Cell([1, 2]);
      cell3.name = "cell3";
      grp1 = new Sud.ConstraintGroup([cell1, cell2]);
      grp2 = new Sud.ConstraintGroup([cell2, cell3]);
      cell1.set_value(1);
    };

    var visual_glue = function() {
      var aspects;
      var puzzle = new Sud.Puzzle();
      /*
       * Need to glue the model and view together using Aspects so that
       * changes to the model will update the view.
       * Things needing glue:
       *   Candidates.remove_candidate()
       *   Cell.set_value()
       */
      aspects = new Aspects();

      // Cell glue.
      aspects.addBefore(function(new_value) {
        var cell_selector = cell_element_map[this.toString()];

        console.log('cell ' + this.toString() + ' changed');
        console.log('selector = ' + cell_selector);
        $(cell_selector).html(new_value);
      }, Sud.Cell, 'set_value');

      // Candidate glue.
      aspects.addBefore(function(candidate_value) {
        var cell_selector = cell_element_map[this.toString()];
        var cand_selector = cell_selector + ' ' +
          candidate_selector_map[candidate_value];
        //console.log('cell ' + this.toString() +
        //' remove_candidate(' + candidate_value + ')');

        //console.log('selector = ' + cand_selector);

        //$(cand_selector).html('');
        //$(cand_selector).hide();
        $(cand_selector).animate({opacity: '0'}, 'slow');
      }, Sud.Cell, 'remove_candidate');

      // Create lookup table mapping cell names to CSS selectors.
      puzzle.get_possible_values().forEach(function(col) {
        puzzle.get_possible_values().forEach(function(row) {
          var cell = puzzle.get_cell(col, row);
          var cell_name = cell.toString();
          var box_col = Math.floor((col - 1) / 3) + 1;
          var box_row = Math.floor((row - 1) / 3) + 1;
          var box_selector = '#b' + box_col.toString() + box_row.toString();
          var cell_col = 1 + ((col - 1) % 3);
          var cell_row = 1 + ((row - 1) % 3);
          var cell_selector = '#c' + cell_col.toString() + cell_row.toString();
          cell_element_map[cell_name] = box_selector + ' ' + cell_selector;
        });
      });

      puzzle.get_cell(1, 1).set_value(7);
      //puzzle.get_cell(8, 2).set_value(1);
      //puzzle.get_cell(6, 3).set_value(2);
      //puzzle.get_cell(1, 9).set_value(5);
      var q = new Controller.PriorityQueue();
      Solver.solve(puzzle, q);
      Controller.do_next_event(q, 500);
    };

    $(document).ready(function() {

      //test_some_stuff();
      create_grid();
      visual_glue();
    });
  })();
  global.View = View;
  //})();
})(this);
