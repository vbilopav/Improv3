"use strict";
(function () {
    ;
    ;
    var companyInput = $("#company-input");
    var editCompanyBtn = $("#edit-company");
    var sectorSelect = $("#sector-select");
    var editSectorBtn = $("#edit-sector");
    var addSectorBtn = $("#add-sector");
    var selectedSectorStorage = function (value) {
        if (value === void 0) { value = undefined; }
        if (value === undefined) {
            return localStorage.getItem("improv3-selected-sector");
        }
        else {
            localStorage.setItem("improv3-selected-sector", value);
        }
    };
    var selectedSector = function () {
        var e = sectorSelect.find("option:selected");
        var id = e.attr("value") ? Number(e.attr("value")) : null;
        return {
            id: id,
            name: e.text()
        };
    };
    var bindSectors = function (sectors, selectedValue) {
        if (selectedValue === void 0) { selectedValue = null; }
        sectorSelect.html("<option selected class='text-muted'>select sector</option>");
        selectedValue = selectedValue || selectedSectorStorage();
        if (sectors.length) {
            for (var _i = 0, sectors_1 = sectors; _i < sectors_1.length; _i++) {
                var entry = sectors_1[_i];
                sectorSelect.append("<option value=" + entry.id + " " + (selectedValue === String(entry.id) ? "selected" : "") + ">" + entry.name + "</option>");
            }
        }
    };
    var editCompany = function (value) {
        editCompanyBtn.attr("disabled", "").find("span").show();
        $.post("api/update-company", JSON.stringify({ name: value, attributes: { location: document.location.href } }), function (response) {
            editCompanyBtn.removeAttr("disabled").find("span").hide();
            var lastId = companyInput.data("id");
            companyInput.val(response.name).data("id", response.id);
            if (lastId === undefined) {
                setTimeout(function () { return addSectorBtn.click(); }, 500);
            }
        });
    };
    var newSector = function (value) {
        addSectorBtn.attr("disabled", "").find("span").show();
        $.post("api/update-sector", JSON.stringify({ name: value, company_id: companyInput.data("id"), attributes: { location: document.location.href } }), function (response) {
            addSectorBtn.removeAttr("disabled").find("span").hide();
            if (response.error) {
                console.warn(response.error);
                return;
            }
            ;
            sectorSelect.find("option:selected").removeAttr("selected");
            sectorSelect.append("<option value=" + response.id + " selected>" + response.name + "</option>");
            sectorSelect.change();
        });
    };
    var editSector = function (value) {
        editSectorBtn.attr("disabled", "").find("span").show();
        $.post("api/update-sector", JSON.stringify({ name: value, company_id: companyInput.data("id"), attributes: { location: document.location.href } }), function (response) {
            editSectorBtn.removeAttr("disabled").find("span").hide();
            if (response.error) {
                console.warn(response.error);
                return;
            }
            ;
            sectorSelect.find("option:selected").text(response.name);
        });
    };
    var validateSector = function (value) {
        var elements = sectorSelect.find("option");
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var e = elements_1[_i];
            var opt = $(e);
            if (value && opt.text() === value) {
                return "Sector with that name already exists. Try different name.";
            }
        }
        return false;
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
        var validate = modalInput.data("validate");
        if (validate) {
            var result = validate(val);
            if (result) {
                tooltip(modalInput, result);
                return;
            }
        }
        inputDialog.modal("hide");
        modalInput.data("type")(val);
    });
    editCompanyBtn.click(function () {
        modalTitle.html("Enter company name");
        modalInput
            .data("type", editCompany)
            .data("value", companyInput.val())
            .val(companyInput.val())
            .attr("placeholder", "company title");
        inputDialog.modal("show").on("shown.bs.modal", function () { return modalInput.focus(); });
    });
    sectorSelect.change(function () {
        var _a = selectedSector(), id = _a.id, name = _a.name;
        selectedSectorStorage(id == null ? null : String(id));
        if (id == null) {
            editSectorBtn.attr("disabled", "");
        }
        else {
            editSectorBtn.removeAttr("disabled");
        }
        window.publish("/sector/change", id, name);
    });
    addSectorBtn.click(function () {
        modalTitle.html("Enter new sector name");
        modalInput
            .data("type", newSector)
            .data("validate", validateSector)
            .data("value", "")
            .val("")
            .attr("placeholder", "new sector name");
        inputDialog.modal("show").on("shown.bs.modal", function () { return modalInput.focus(); });
    });
    editSectorBtn.click(function () {
        modalTitle.html("Change name for this sector");
        var _a = selectedSector(), id = _a.id, name = _a.name;
        if (id == null) {
            return;
        }
        modalInput
            .data("type", editSector)
            .data("validate", validateSector)
            .data("value", name)
            .val(name)
            .attr("placeholder", "new name for this sector");
        inputDialog.modal("show").on("shown.bs.modal", function () { return modalInput.focus(); });
    });
    $.getJSON("api/company-and-sectors", function (response) {
        $("#loading").hide();
        $(".container-fluid").show("fast", "swing");
        if (!response.company) {
            editCompanyBtn.click();
        }
        else {
            companyInput.val(response.company.name).data("id", response.company.id);
        }
        bindSectors(response.sectors);
        sectorSelect.change();
    });
})();
