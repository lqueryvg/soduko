/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function() {

  "use strict";
  //var data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

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

});