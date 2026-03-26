$(document).ready(function () {
  initStateRefs();
  initPage();
});

$(window).on("resize", function () {
  ifSmallScreen();
  handleResponsiveSidebar();
});
