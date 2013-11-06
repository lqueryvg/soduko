/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var Sud;
$(document).ready(function() {

  "use strict";

  var aspects;
  var cell1, cell2, cell3;
  var grp1, grp2, aspects;
  var puzzle;

  (function() {
    // Try with high order functions
    var create_table;
    var tab;

    create_table = function(cell_class, id_prefix, cell_contents_fn) {
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
            td_element.appendChild(cell_contents);
          } else {
            td_element.innerHTML = "8";   // TODO: remove later
          }
        });
      });
      return outer_table;
    };

    tab = create_table('box', 'b', // outer table
            function create_box_table() {
              return create_table('cell', 'c',
                      function create_candidates_table() {
                        return create_table('candidate', 'n');
                      });
            });
    document.body.appendChild(tab);
  }());

  aspects = new Aspects();
  aspects.addBefore(function(arg) {
    console.log("Cell.set_value(" + arg + ") called");
  }, Sud.Cell, "set_value");

  cell1 = new Sud.Cell([1, 2]);
  cell2 = new Sud.Cell([1, 2]);
  cell3 = new Sud.Cell([1, 2]);
  grp1 = new Sud.ConstraintGroup([cell1, cell2]);
  grp2 = new Sud.ConstraintGroup([cell2, cell3]);


  cell1.set_value(1);

  puzzle = new Sud.Puzzle();
});