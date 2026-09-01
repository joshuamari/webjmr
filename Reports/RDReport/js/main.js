const rootFolder = `//${document.location.hostname}`;
let empDetails = [];
let tableTimer = null;

checkAccess()
  .then((result) => {
    if (result.isSuccess) {
      empDetails = result.data;
      $(document).ready(function () {
        setDate();
        getGroups()
          .then((grps) => {
            if (grps.isSuccess) {
              fillGroups(grps.data || []);
              getTable();
              return;
            }
            alert(grps.message || "Could not load groups.");
          })
          .catch((error) => {
            alert(rdAlertText(error));
          });
      });
    } else {
      alert(result.message);
      window.location.href = `${rootFolder}/webJMR/DailyReport`;
    }
  })
  .catch((error) => {
    alert(rdAlertText(error));
  });

$(document).on("change", "#monthSel", function () {
  scheduleTable();
});
$(document).on("change", "#chkAllGroups", function () {
  $(".grp-check").prop("checked", $(this).prop("checked"));
  updateGroupDropdownLabel();
  scheduleTable();
});
$(document).on("change", ".grp-check", function () {
  syncSelectAll();
  updateGroupDropdownLabel();
  scheduleTable();
});
$(document).on("click", ".rd-group-dropdown", function (e) {
  if ($(e.target).closest(".rd-dropdown-menu").length) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  $(this).toggleClass("open");
  $("#buSelDisplay").attr(
    "aria-expanded",
    $(this).hasClass("open") ? "true" : "false"
  );
});
$(document).on("click", ".rd-dropdown-menu", function (e) {
  e.stopPropagation();
});
$(document).on("click", function () {
  $(".rd-group-dropdown").removeClass("open");
  $("#buSelDisplay").attr("aria-expanded", "false");
});

function rdAlertText(error) {
  if (!error) {
    return "Could not load R&D Manhour Report data.";
  }
  if (typeof error === "string") {
    return error;
  }
  return error.message || "Could not load R&D Manhour Report data.";
}

function rdAjaxMessage(xhr, fallback) {
  if (xhr && xhr.responseJSON && xhr.responseJSON.message) {
    return xhr.responseJSON.message;
  }
  if (xhr && xhr.responseText) {
    try {
      var parsed = JSON.parse(xhr.responseText);
      if (parsed && parsed.message) {
        return parsed.message;
      }
    } catch (ignore) {}
  }
  if (xhr && xhr.status === 404) {
    return "Not Found Error: The requested resource was not found.";
  }
  return fallback;
}

function escapeHtml(value) {
  return $("<div>").text(value == null ? "" : String(value)).html();
}

function formatHours(hours) {
  var num = Number(hours);
  if (!isFinite(num)) {
    num = 0;
  }
  return num.toFixed(2);
}

function monthLabel(ym) {
  var parts = String(ym || "").split("-");
  if (parts.length < 2) {
    return ym || "";
  }
  var date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
  if (isNaN(date.getTime())) {
    return ym;
  }
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function selectedGroups() {
  var groups = [];
  $(".grp-check:checked").each(function () {
    groups.push($(this).val());
  });
  return groups;
}

function selectedGroupLabel() {
  var selected = selectedGroups();
  var total = $(".grp-check").length;
  if (selected.length === 0) {
    return "";
  }
  if (total > 0 && selected.length === total) {
    return "All Groups";
  }
  if (selected.length === 1) {
    return selected[0];
  }
  if (selected.length <= 4) {
    return selected.join(", ");
  }
  return selected.length + " Groups";
}

function syncSelectAll() {
  var total = $(".grp-check").length;
  var checked = $(".grp-check:checked").length;
  var allBox = document.getElementById("chkAllGroups");
  if (!allBox) {
    return;
  }
  allBox.indeterminate = checked > 0 && checked < total;
  allBox.checked = total > 0 && checked === total;
}

function scheduleTable() {
  clearTimeout(tableTimer);
  tableTimer = setTimeout(getTable, 200);
}

function checkAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_access.php",
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (xhr) {
        reject(
          rdAjaxMessage(
            xhr,
            "An error occurred in the PHP script while checking login details."
          )
        );
      },
    });
  });
}

function setDate() {
  var today = new Date();
  var rawMonth = `${today.getMonth() + 1}`;
  var dateString = `${today.getFullYear()}-${rawMonth.padStart(2, "0")}`;
  $("#monthSel").val(dateString);
}

function getGroups() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_user_groups.php",
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (xhr) {
        reject(
          rdAjaxMessage(
            xhr,
            "An error occurred in the PHP script while fetching group details."
          )
        );
      },
    });
  });
}

function updateGroupDropdownLabel() {
  $("#buSelDisplay").val(selectedGroupLabel());
}

function fillGroups(grps) {
  var html = "";
  $.each(grps, function (index, group) {
    html += `<label class="rd-dropdown-item" title="${escapeHtml(group.name)}">
      <input type="checkbox" class="grp-check" value="${escapeHtml(
        group.abbreviation
      )}" data-grp-id="${escapeHtml(group.group_id)}" />
      ${escapeHtml(group.abbreviation)}
    </label>`;
  });
  $("#groupChecks").html(html);

  var own = $(`.grp-check[data-grp-id="${empDetails.group_id}"]`);
  if (own.length) {
    own.prop("checked", true);
  } else if (grps.length) {
    $(".grp-check").prop("checked", true);
  }
  syncSelectAll();
  updateGroupDropdownLabel();
}

function cellAttrs(extra) {
  return `data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-v="middle" ${extra || ""}`;
}

function renderEmpty(message) {
  $("#mainTable").empty();
  $("#reportCaption").text("").addClass("d-none");
  if (message) {
    $("#emptyState").text(message).removeClass("d-none");
  } else {
    $("#emptyState").text("").addClass("d-none");
  }
  $("#btnPrint, #btnExport").prop("disabled", true);
}

function groupTitle(group) {
  return (group && group.name) || (group && group.abbreviation) || "";
}

function renderReport(data) {
  var groups = data.groups || [];
  if (groups.length === 0) {
    renderEmpty("No R&D hours for this month.");
    return;
  }

  $("#emptyState").addClass("d-none");
  $("#btnPrint, #btnExport").prop("disabled", false);
  $("#reportCaption")
    .text(`${monthLabel(data.month)}  ·  ${selectedGroupLabel()}`)
    .removeClass("d-none");

  var bodyHtml = "";

  groups.forEach(function (group) {
    var title = groupTitle(group);

    bodyHtml += `
      <tr class="rd-group-header">
        <td colspan="3" ${cellAttrs('data-a-h="left" data-fill-color="E6E6E6" data-f-bold="true"')}>${escapeHtml(
          title
        )}</td>
      </tr>`;

    (group.employees || []).forEach(function (emp) {
      bodyHtml += `
        <tr class="rd-emp-row">
          <td class="rd-emp" ${cellAttrs('data-t="n" data-a-h="left"')}>${escapeHtml(
            emp.empNum
          )}</td>
          <td class="rd-name" ${cellAttrs('data-a-h="left" data-a-wrap="false"')}>${escapeHtml(
            emp.name
          )}</td>
          <td class="rd-hours" ${cellAttrs('data-t="n" data-a-h="right"')}>${formatHours(
            emp.hours
          )}</td>
        </tr>`;
    });

    bodyHtml += `
      <tr class="rd-group-total">
        <td colspan="2" ${cellAttrs('data-a-h="left" data-f-bold="true" data-fill-color="F7F7F7"')}>Total</td>
        <td class="rd-hours" ${cellAttrs('data-t="n" data-a-h="right" data-f-bold="true" data-fill-color="F7F7F7"')}>${formatHours(
          group.totalHours
        )}</td>
      </tr>`;
  });

  if (data.showGrandTotal) {
    bodyHtml += `
      <tr class="rd-grand-total">
        <td colspan="2" ${cellAttrs('data-a-h="left" data-f-bold="true" data-fill-color="E8E8E8"')}>${escapeHtml(
          data.grandTotalLabel || "Selected Groups Total"
        )}</td>
        <td class="rd-hours" ${cellAttrs('data-t="n" data-a-h="right" data-f-bold="true" data-fill-color="E8E8E8"')}>${formatHours(
          data.grandTotalHours
        )}</td>
      </tr>`;
  }

  $("#mainTable").html(`
    <thead>
      <tr class="rd-col-header">
        <th class="rd-emp" ${cellAttrs('data-a-h="left" data-fill-color="E8E8E8" data-f-bold="true"')}>Emp No.</th>
        <th class="rd-name" ${cellAttrs('data-a-h="left" data-fill-color="E8E8E8" data-f-bold="true"')}>Name</th>
        <th class="rd-hours" ${cellAttrs('data-a-h="right" data-fill-color="E8E8E8" data-f-bold="true"')}>Hours</th>
      </tr>
    </thead>
    <tbody>
      ${bodyHtml}
    </tbody>
  `);
}

function getTable() {
  var groups = selectedGroups();
  if (!$("#monthSel").val()) {
    return;
  }
  if (groups.length === 0) {
    renderEmpty("Select at least one group.");
    return;
  }

  $.ajax({
    type: "POST",
    url: "php/get_rd_hours.php",
    data: {
      getGroups: groups,
      getYMSel: $("#monthSel").val(),
    },
    dataType: "json",
    success: function (response) {
      if (!response || !response.isSuccess) {
        renderEmpty("");
        alert((response && response.message) || "Could not load R&D hours.");
        return;
      }
      renderReport(response);
    },
    error: function (xhr) {
      renderEmpty("");
      alert(rdAjaxMessage(xhr, "Could not load R&D hours."));
    },
  });
}

$(document).on("click", "#btnPrint", function () {
  if (!$("#mainTable tbody").length) {
    return;
  }
  $(".xPrint").toggle();
  $(".lower").toggleClass("lower lower_");
  print();
  $(".lower_").toggleClass("lower lower_");
  $(".xPrint").toggle();
});

$(document).on("click", "#btnExport", function () {
  if (!$("#mainTable tbody").length) {
    return;
  }
  var groupLabel = selectedGroupLabel().replace(/\s+/g, "");
  var xlsName = `${$("#monthSel").val()}_${groupLabel} R&D Manhour Report.xlsx`;
  TableToExcel.convert(document.getElementById("mainTable"), {
    name: xlsName,
    sheet: {
      name: groupLabel || "RD",
    },
  });
});
