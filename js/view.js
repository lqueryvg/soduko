/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function() {

  "use strict";
  
  var aspects;
  var cell1, cell2, cell3;
  var grp1, grp2, aspects;
  
  var html = '<table>', cell_name;

  [1, 2, 3].forEach(function(row) {
    html += '<tr>';
    [1, 2, 3].forEach(function(col) {
      var block_name = "b" + row.toString() + col.toString();
      html += '<td id="' + block_name + '">' + block_name + '</td>';
    });
    html += '</tr>';
  });

  html += '</table>';

  $(html).appendTo('body');
  
  
  
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
});