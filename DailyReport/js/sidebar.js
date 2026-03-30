//#region SIDEBAR
function initSidebar() {
  applySidebarVisibility();
  bindSidebarEvents();
  handleResponsiveSidebar();
}

function bindSidebarEvents() {
  $(document).on("click", ".arrow", function (e) {
    const $arrowParent = $(e.target).closest(".iocn-link").parent();
    $arrowParent.toggleClass("showMenu");
  });

  $(document).on("click", ".ey", function (e) {
    const $parentLi = $(e.target).closest("li");
    $parentLi.toggleClass("showMenu");
  });

  $(document).on("click", ".menu-one", function () {
    $(".sidebar").toggleClass("close");
    handleResponsiveSidebar();
  });

  $(document).on("click", ".menu-two", function () {
    $(".sidebar").addClass("close");
    handleResponsiveSidebar();
  });
}

function applySidebarVisibility() {
  const hasPlanning = AppState?.empDetails?.hasPlanning === true;
  const hasUnlock = AppState?.empDetails?.hasUnlock === true;
  $("#planningLink").toggle(hasPlanning);
  $("#drapprovals").toggle(hasUnlock);
}

function handleResponsiveSidebar() {
  if ($(window).width() < 550) {
    if ($(".sidebar").hasClass("close")) {
      $(".menu-two-wrap").addClass("hidden");
    } else {
      $(".menu-two-wrap").removeClass("hidden");
    }
  } else {
    $(".menu-two-wrap").addClass("hidden");
  }
}
//#endregion