async function initPage() {
  try {
    showLoader();

    defaults = getDefaults();

    const emp = await checkAccess();

    if (emp.isSuccess) {
      empDetails = emp.result;
      $(".hello-user").text(empDetails["empFName"]);

      var thisEmpID = $($("#idEmployee").find("option:selected")).attr(
        "emp-id",
      );

      initSidebar();
      ifSmallScreen();
      initializeDate();
      sequenceValidation(0);

      var myEmpNum = empDetails["empID"];

      const [grps, locs, entryList, otherVar] = await Promise.all([
        getMyGroups(myEmpNum),
        getDispatchLoc(),
        getEntries(thisEmpID),
        getVariables(),
      ]);

      fillMyGroups(grps);
      fillDispatchLoc(locs, 0);
      fillEntries(entryList);
      getMHCount(thisEmpID);
      fillMHType(0);

      kiaID += parseInt(otherVar.kia_id);
      leaveID += parseInt(otherVar.leaveID);
      mngID += parseInt(otherVar.mngID);
      otherID += parseInt(otherVar.otherProjID);
      oneBUTrainerID += parseInt(otherVar.oneBUTrainerID);
      noMoreInputItems = otherVar.noMoreIOW;

      bindEvents();
      evaluateMonthLock();
    } else {
      alert(emp.message);
      window.location.href = `${rootFolder}/webJMR/`;
    }
  } catch (error) {
    alert(`${error}`);
  } finally {
    hideLoader();
  }
}
