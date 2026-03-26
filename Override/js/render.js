function fillMyGroups(grps) {
  var grpSelect = $("#idGroup");
  grpSelect.html(
    `<option selected hidden value=0 grp-id=0>Select Group</option>`,
  );

  if (grps.length > 1) {
    grps = grps.sort(function (a, b) {
      var first = a.abbreviation.toUpperCase();
      var second = b.abbreviation.toUpperCase();
      return first < second ? -1 : first > second ? 1 : 0;
    });
  }

  $.each(grps, function (_, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(item.abbreviation)
      .attr("grp-id", item.id);
    grpSelect.append(option);
  });
}

function fillDispatchLoc(locs, type) {
  var locSelect = $("#idLocation");
  var editLocSel = $("#edit-selLoc");

  if (type == 0) {
    locSelect.html(
      `<option selected hidden value=0 loc-id=0>Select Location</option>`,
    );
    $.each(locs, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.location)
        .attr("loc-id", item.id);
      locSelect.append(option);
    });
  } else {
    editLocSel.html(
      `<option selected hidden value=0 loc-id=0>Select Location</option>`,
    );
    $.each(locs, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.location)
        .attr("loc-id", item.id);
      editLocSel.append(option);
    });
  }
}

function fillEmployees(emps) {
  var empSelect = $("#idEmployee");
  empSelect.html(
    `<option selected hidden value=0 emp-id=0>Select Employee</option>`,
  );

  $.each(emps, function (_, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(formatName(item.fullName))
      .attr("emp-id", item.id);
    empSelect.append(option);
  });
}

function fillProjects(projs, type) {
  var projSelect = $("#idProject");
  var editProjSel = $("#edit-selProj");

  if (type == 0) {
    projSelect.html(
      `<option selected hidden value=0 proj-id=0>Select Project</option>`,
    );
    $.each(projs, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(`${item.projName}${item.groupAppend}`)
        .attr("proj-id", item.id);
      projSelect.append(option);
    });
  } else {
    editProjSel.html(
      `<option selected hidden value=0 proj-id=0>Select Project</option>`,
    );
    $.each(projs, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(`${item.projName}${item.groupAppend}`)
        .attr("proj-id", item.id);
      editProjSel.append(option);
    });
  }
}

function fillItems(items, type) {
  var itemSelect = $("#idItem");
  var editIOWSel = $("#edit-selIOW");

  if (type == 0) {
    itemSelect.html(
      `<option selected hidden value=0 item-id=0>Select Item of Works</option>`,
    );
    $.each(items, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.itemName)
        .attr("item-id", item.id);
      itemSelect.append(option);
    });
  } else {
    editIOWSel.html(
      `<option selected hidden value=0 item-id=0>Select Item of Works</option>`,
    );
    $.each(items, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.itemName)
        .attr("item-id", item.id);
      editIOWSel.append(option);
    });
  }
}

function fillJobs(jobs, type) {
  var jobSelect = $("#idJRD");
  var editJobSel = $("#edit-selJRD");

  if (type == 0) {
    jobSelect.html(
      `<option selected hidden value=0 job-id=0>Select Job Request Description</option>`,
    );
    $.each(jobs, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.jobName)
        .attr("job-id", item.id);
      jobSelect.append(option);
    });
  } else {
    editJobSel.html(
      `<option selected hidden value=0 job-id=0>Select Job Request Description</option>`,
    );
    $.each(jobs, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.jobName)
        .attr("job-id", item.id);
      editJobSel.append(option);
    });
  }
}

function fillTOW(tows, type) {
  var towSelect = $("#idTOW");
  var editTOWSel = $("#edit-selTOW");

  if (type == 0) {
    towSelect.html(
      `<option selected hidden value=0 tow-id=0>Select...</option>`,
    );
    $.each(tows, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.itemName)
        .attr("tow-id", item.id);
      towSelect.append(option);
    });
  } else {
    editTOWSel.html(
      `<option selected hidden value=0 tow-id=0>Select...</option>`,
    );
    $.each(tows, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.itemName)
        .attr("tow-id", item.id);
      editTOWSel.append(option);
    });
  }
}

function fillCheckers(checks, type) {
  var checkSelect = $("#idChecking");
  var editCheckSel = $("#edit-selCheck");

  if (type == 0) {
    checkSelect.html(
      `<option selected hidden value=0 chk-id=0>Select Employee</option>`,
    );
    $.each(checks, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.name)
        .attr("chk-id", item.id);
      checkSelect.append(option);
    });
  } else {
    editCheckSel.html(
      `<option selected hidden value=0 chk-id=0>Select Employee</option>`,
    );
    $.each(checks, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.name)
        .attr("chk-id", item.id);
      editCheckSel.append(option);
    });
  }
}

function fillTRGroups(allgrps, type) {
  var trgrpSelect = $("#trGroup");
  var editTRGrpSel = $("#edit-trGroup");

  if (type == 0) {
    trgrpSelect.html(
      `<option selected hidden value=0 trgrp-id=0>Select Training Group</option>`,
    );
    $.each(allgrps, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.abbreviation)
        .attr("chk-id", item.id);
      trgrpSelect.append(option);
    });
  } else {
    editTRGrpSel.html(
      `<option selected hidden value=0 trgrp-id=0>Select Training Group</option>`,
    );
    $.each(allgrps, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.abbreviation)
        .attr("chk-id", item.id);
      editTRGrpSel.append(option);
    });
  }
}

function fillMHType(type) {
  var mhTypeSelect = $("#idMH");
  var editMHTypeSel = $("#edit-selMHType");

  if (type == 0) {
    mhTypeSelect.html(
      `<option selected hidden value=null mhid=null>Select Manhour Type</option>`,
    );
    $.each(mhtypes, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.type)
        .attr("mhid", item.id);
      mhTypeSelect.append(option);
    });
  } else {
    editMHTypeSel.html(
      `<option selected hidden value=null edtmhid=null>Select Manhour Type</option>`,
    );
    $.each(mhtypes, function (_, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.type)
        .attr("edtmhid", item.id);
      editMHTypeSel.append(option);
    });
  }
}

function getLabel(itemID, type) {
  if (itemID == undefined) {
    return;
  }

  $.ajax({
    type: "POST",
    url: "php/get_label.php",
    data: { itemID: itemID },
    dataType: "json",
    success: function (response) {
      if (response.isSuccess) {
        const lbl = response["result"]["fldLabel"];
        if (type == 0) {
          $("#labell").remove();
          $("#iowLbl").after(
            `<span class="col-12 alert-primary text-primary" id="labell" role="alert">${lbl}</span>`,
          );
        } else {
          $("#edit-labell").remove();
          $(".editIoWLbl").removeClass("hidden").addClass("block");
          $(".editIoWLbl").after(
            `<span class="col-12 alert-primary text-primary" id="edit-labell" role="alert">${lbl}</span>`,
          );
        }
      }
    },
  });
}

function getTOWDesc(typesOfWorkID, type) {
  if (typesOfWorkID == 0) {
    $("#towDesc").html("-");
  }

  $.ajax({
    type: "POST",
    url: "php/get_tow_desc.php",
    data: { towID: typesOfWorkID },
    dataType: "json",
    success: function (response) {
      const towDesc = response["result"];
      if (type == 0) {
        $("#towDesc").html(towDesc);
      } else {
        $("#edit-towDesc").html(towDesc);
      }
    },
  });
}

function fillEntries(entryList) {
  regCount = 0;
  otCount = 0;
  lvCount = 0;

  var entryTable = $("#drEntries");
  entryTable.empty();

  if (entryList == 0) {
    entryTable.append(
      `<tr><td colspan='9'class="text-center py-5 entry-none"><h2>No Entries Found</h2></td></tr>`,
    );
    getMHCount();
    return;
  }

  if (entryList.isSuccess) {
    var currDayEntries = entryList["result"];
    if (currDayEntries.length > 0) {
      $.each(currDayEntries, function (_, item) {
        item.duration = (item.duration / 60).toFixed(2);
        const mhtyp = ["Regular", "OT", "Leave"];

        switch (parseInt(item.MHType)) {
          case 0:
            regCount += parseFloat(item.duration);
            break;
          case 1:
            otCount += parseFloat(item.duration);
            break;
          case 2:
            lvCount += parseFloat(item.duration);
            break;
        }

        var row = $(`<tr entry-id=${item.id}>`);
        row.append(`<td>${item.location}</td>`);
        row.append(`<td>${item.group}</td>`);
        row.append(`<td>${item.projName}</td>`);
        row.append(`<td>${item.itemName ? item.itemName : "-"}</td>`);
        row.append(`<td>${item.jobName ? item.jobName : "-"}</td>`);
        row.append(`<td>${item.towName ? item.towName : "-"}</td>`);
        row.append(`<td>${item.duration}</td>`);
        row.append(`<td>${mhtyp[item.MHType]}</td>`);
        row.append(`
          <td>
            <button class="btn action dupeBut" id="dupeBut" title="Duplicate"><i class="bx bx-duplicate"></i></button>
            <button class="btn action editBut" id="editBut" title="Edit"><i class="fa fa-pencil"></i></button>
            <button class="btn action delBut" id="delBut" title="Delete"><i class="fa fa-trash"></i></button>
          </td>
        `);

        entryTable.append(row);
      });
    } else {
      entryTable.append(
        `<tr><td colspan='9'class="text-center py-5"><h3>No Entries Found</h3></td></tr>`,
      );
    }
    getMHCount();
  } else {
    entryTable.append(
      `<tr><td colspan='9'class="text-center py-5 entry-none"><h2>No Entries Found</h2></td></tr>`,
    );
    getMHCount();
  }
}
