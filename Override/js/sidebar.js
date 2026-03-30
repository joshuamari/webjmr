function initSidebar() {
  applySidebarPermissions()
  $(document).off(".sidebar");

  $(document).on("click.sidebar", ".menu-one", function () {
    $(".sidebar").toggleClass("close");
    handleResponsiveSidebar();
  });

  $(document).on("click.sidebar", ".menu-two", function () {
    $(".sidebar").addClass("close");
    handleResponsiveSidebar();
  });

  $(document).on("click.sidebar", ".arrow", function (e) {
    const $arrowParent = $(e.target).closest(".iocn-link").parent();
    $arrowParent.toggleClass("showMenu");
  });

  $(document).on("click.sidebar", ".ey", function (e) {
    const $parentLi = $(e.target).closest("li");
    $parentLi.toggleClass("showMenu");
  });
}

function handleResponsiveSidebar() {
  if ($(window).width() < 550) {
    if ($(".sidebar").hasClass("close")) {
      $(".menu-two").addClass("d-none");
    } else {
      $(".menu-two").removeClass("d-none");
    }
  } else {
    $(".menu-two").addClass("d-none");
  }
}
function applySidebarPermissions() {
  const hasPlanning = overrideAccessState?.hasPlanning === true;
  const hasUnlock = overrideAccessState?.hasUnlock === true;
  $("#planningLink").toggle(hasPlanning);
  $("#drapprovals").toggle(hasUnlock);
}