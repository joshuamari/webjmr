function bindSearchEvents() {
  $(document).on("keyup search", "#searchproj", handleProjectSearch);
  $(document).on("keyup search", "#searchitem", handleItemSearch);
  $(document).on("keyup search", "#searchjrd", handleJrdSearch);
}
function handleProjectSearch() {
  fetchProjects({ searchProj: $("#searchproj").val() }).then((projects) => {
    resetProjectOptions();
    fillProj(projects);
  });
}

function handleItemSearch() {
  const projID = $("#idProject option:selected").attr("proj-id");

  getItemSearch(projID).then((items) => {
    fillItem(items);
  });
}

function handleJrdSearch() {
  const itemID = $("#idItem option:selected").attr("item-id");
  const projID = $("#idProject option:selected").attr("proj-id");

  getJRDSearch(projID, itemID).then((jobs) => {
    fillJobs(jobs);
  });
}
