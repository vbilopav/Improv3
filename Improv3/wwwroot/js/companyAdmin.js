"use strict";
(function () {
    var data;
    var companyInput = $("#company-input");
    var sectorSelect = $("#sector-select");
    var editCompany = function (value) {
        console.log("editCompany", value);
        $.post("test.php", { name: "John", time: "2pm" })
            .done(function (data) {
            alert("Data Loaded: " + data);
        });
    };
    var inputDialog = $("#modal-input-dlg");
    var modalOk = inputDialog.find(".btn-primary");
    var modalTitle = inputDialog.find("#model-input-center-title");
    var modalInput = inputDialog.find("#modal-input")
        .focus(function () { return modalInput.select(); })
        .keypress(function (e) {
        modalInput.tooltip("dispose");
        e.keyCode === 13 && modalOk.click();
        return true;
    });
    var editCompanyBtn = $("#edit-company").click(function () {
        modalTitle.html("Enter company name");
        inputDialog.modal("show").on("shown.bs.modal", function () { return modalInput
            .data("type", editCompany)
            .data("value", data.company.name)
            .val(data.company.name)
            .attr("placeholder", "company title")
            .focus(); });
    });
    var tooltip = function (e, title) { return e
        .tooltip("dispose")
        .attr("title", title)
        .tooltip("show")
        .focus(); };
    modalOk.click(function () {
        var val = modalInput.val();
        if (!val) {
            tooltip(modalInput, "value cannot be empty!");
            return;
        }
        if (modalInput.data("value") === val) {
            tooltip(modalInput, "enter different value and try again!");
            return;
        }
        inputDialog.modal("hide");
        modalInput.data("type")(val);
    });
    $.getJSON("/api/default/", function (response) {
        $("#loading").hide();
        $(".container-fluid").show("fast", "swing");
        if (response.company) {
            companyInput.val(response.company.name);
        }
        else {
            editCompanyBtn.click();
        }
        if (response.sectors.length) {
            for (var _i = 0, _a = response.sectors; _i < _a.length; _i++) {
                var entry = _a[_i];
                sectorSelect.append("<option value=" + entry.id + ">" + entry.name + "</option>");
            }
        }
        data = response;
    });
})();
