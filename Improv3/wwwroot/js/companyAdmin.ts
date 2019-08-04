(() => {

    type IdAndNameType = {
        id: number,
        name: string;
    };
    type DefaultDataType = {
        company: IdAndNameType,
        sectors: Array<IdAndNameType>;
    };

    const companyInput = $("#company-input");
    const editCompanyBtn = $("#edit-company");
    const sectorSelect = $("#sector-select");
    const editSectorBtn = $("#edit-sector");
    const addSectorBtn = $("#add-sector");

    const selectedSectorStorage = (value: string | null | undefined = undefined) => {
        if (value === undefined) {
            return localStorage.getItem("improv3-selected-sector");
        } else {
            localStorage.setItem("improv3-selected-sector", value as string);
        }
    }

    const selectedSector = () => {
        const e = sectorSelect.find("option:selected");
        const id = e.attr("value") ? Number(e.attr("value")) : null;
        return {
            id: id,
            name: e.text()
        }
    }

    const bindSectors = (sectors: Array<IdAndNameType>, selectedValue: string | null | undefined = null) => {
        sectorSelect.html("<option selected class='text-muted'>select sector</option>");
        selectedValue = selectedValue || selectedSectorStorage();
        if (sectors.length) {
            for (let entry of sectors) {
                sectorSelect.append(`<option value=${entry.id} ${selectedValue === String(entry.id) ? "selected" : ""}>${entry.name}</option>`);
            }
        }
    }

    const editCompany = (value: string) => {
        editCompanyBtn.attr("disabled", "").find("span").show();
        $.post("api/update-company",
            JSON.stringify({ name: value, attributes: { location: document.location.href } }),
            (response: IdAndNameType) => {
                editCompanyBtn.removeAttr("disabled").find("span").hide();
                const lastId = companyInput.data("id");
                companyInput.val(response.name).data("id", response.id);
                if (lastId === undefined) {
                    setTimeout(() => addSectorBtn.click(), 500);
                }
            });
    };

    const newSector = (value: string) => {
        addSectorBtn.attr("disabled", "").find("span").show();
        $.post("api/update-sector",
            JSON.stringify({ name: value, company_id: companyInput.data("id"), attributes: {location: document.location.href}}),
            (response: IdAndNameType) => {
                if (!response) {
                    throw response;
                };
                addSectorBtn.removeAttr("disabled").find("span").hide();
                sectorSelect.find("option:selected").removeAttr("selected");
                sectorSelect.append(
                    `<option value=${response.id} selected>${response.name}</option>`);
                sectorSelect.change();
            });
    };

    const editSector = (value: string) => {
        editSectorBtn.attr("disabled", "").find("span").show();
        $.post("api/update-sector",
            JSON.stringify({ name: value, company_id: companyInput.data("id"), attributes: {location: document.location.href}}),
            (response: IdAndNameType) => {
                editSectorBtn.removeAttr("disabled").find("span").hide();
                if (!response) {
                    throw response;
                }
                sectorSelect.find("option:selected").text(response.name);
            });
    };

    const inputDialog = $("#modal-input-dlg");
    const modalOk = inputDialog.find(".btn-primary");
    const modalTitle: JQuery = inputDialog.find("#model-input-center-title");
    const modalInput: JQuery = inputDialog.find("#modal-input")
        .focus(() => modalInput.select())
        .keypress(e => {
            modalInput.tooltip("dispose");
            e.keyCode === 13 && modalOk.click();
            return true;
        });
    const tooltip = (e: JQuery, title: string) => e
        .tooltip("dispose")
        .attr("title", title)
        .tooltip("show")
        .focus();

    modalOk.click(() => {
        const val = modalInput.val();
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

    editCompanyBtn.click(() => {
        modalTitle.html("Enter company name");
        modalInput
            .data("type", editCompany)
            .data("value", companyInput.val() as string)
            .val(companyInput.val() as string)
            .attr("placeholder", "company title");
        inputDialog.modal("show").on("shown.bs.modal", () => modalInput.focus());
    });

    sectorSelect.change(() => {
        const {id} = selectedSector();
        selectedSectorStorage(id == null ? null : String(id));
        if (id == null) {
            editSectorBtn.attr("disabled", "");
        } else {
            editSectorBtn.removeAttr("disabled");
        }
    });

    addSectorBtn.click(() => {
        modalTitle.html("Enter new sector name");
        modalInput
            .data("type", newSector)
            .data("value", "")
            .val("")
            .attr("placeholder", "new sector name");
        inputDialog.modal("show").on("shown.bs.modal", () => modalInput.focus());
    });

    editSectorBtn.click(() => {
        modalTitle.html("Change name for this sector");
        const {id, name} = selectedSector();
        if (id == null) {
            return;
        }
        modalInput
            .data("type", editSector)
            .data("value", name)
            .val(name)
            .attr("placeholder", "new name for this sector");
        inputDialog.modal("show").on("shown.bs.modal", () => modalInput.focus());
    });

    $.getJSON("api/company-and-sectors", (response: DefaultDataType) => {
        $("#loading").hide();
        $(".container-fluid").show("fast", "swing");

        if (!response.company) {
            editCompanyBtn.click();
        } else {
            companyInput.val(response.company.name).data("id", response.company.id);
        }
        bindSectors(response.sectors);
        sectorSelect.change();
    });

})();