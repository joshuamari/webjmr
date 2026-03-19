function bindDropdownEvents() {
  $(document).on("click", "#idProject", handleProjectDropdownClick);
  $(document).on("click", "#idItem", handleItemDropdownClick);
  $(document).on("click", "#idJRD", handleJrdDropdownClick);

  $(document).on("click", "#projOptions li", handleProjectOptionClick);
  $(document).on("click", "#itemOptions li", handleItemOptionClick);
  $(document).on("click", "#jrdOptions li", handleJrdOptionClick);

  $(document).on("click", "body", handleBodyClick);
}
function handleProjectDropdownClick(event) {
  event.stopPropagation();
  $(".proj").toggleClass("active");
  $(".jord").removeClass("active");
  $(".iow").removeClass("active");
  $(this).blur();
}

function handleItemDropdownClick(event) {
  event.stopPropagation();
  $(".iow").toggleClass("active");
  $(".proj").removeClass("active");
  $(".jord").removeClass("active");
  $(this).blur();
}

function handleJrdDropdownClick(event) {
  event.stopPropagation();
  $(".jord").toggleClass("active");
  $(".iow").removeClass("active");
  $(".proj").removeClass("active");
  $(this).blur();
}

function handleProjectOptionClick() {
  $(".proj").removeClass("active");

  const projID = $(this).attr("proj-id");
  $(`#idProject option[proj-id="${projID}"]`).prop("selected", true).change();
}

function handleItemOptionClick() {
  $(".iow").removeClass("active");

  const itemID = $(this).attr("item-id");
  $(`#idItem option[item-id="${itemID}"]`).prop("selected", true).change();
}

function handleJrdOptionClick() {
  $(".jord").removeClass("active");

  const jrdID = $(this).attr("job-id");
  $(`#idJRD option[job-id="${jrdID}"]`).prop("selected", true).change();
}

function handleBodyClick(event) {
  if (
    !$(".proj .content").is(event.target) &&
    $(".proj .content").has(event.target).length === 0
  ) {
    $(".proj").removeClass("active");
  }

  if (
    !$(".iow .content").is(event.target) &&
    $(".iow .content").has(event.target).length === 0
  ) {
    $(".iow").removeClass("active");
  }

  if (
    !$(".jord .content").is(event.target) &&
    $(".jord .content").has(event.target).length === 0
  ) {
    $(".jord").removeClass("active");
  }
}
