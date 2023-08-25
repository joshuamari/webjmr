//#region GLOBALS
switch (document.location.hostname) {
  case "kdt-ph":
    rootFolder = "//kdt-ph/";
    break;
  case "localhost":
    rootFolder = "//localhost/";
    break;
  default:
    rootFolder = "//kdt-ph/";
    break;
}

$(document).ready(function () {});
$(document).on("click", ".bu", function () {
  getID = $(this).attr("id");

  // $(`.${getID}.collapse`).removeClass("collapse");
  // $(`.${getID}.collapse`).addClass("collapsing");
  // $(`.${getID}.collapse`).removeClass("collapsing");
  $(`.${getID}.collapse`).toggleClass("show");
});
var tary = `<tr class="collapse bu2 show">
<td>Employee B</td>
<td>40</td>
<td></td>
<td></td>
<td>20</td>
<td>50%</td>
<td></td>
<td></td>
<td>20</td>
<td>50%</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>`;
$(tary).insertBefore(".total");
