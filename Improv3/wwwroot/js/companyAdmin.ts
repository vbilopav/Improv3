(() => {

    type IdAndNameType = {
        id: number,
        name: string;
    };
    type DefaultDataType = {
        company: IdAndNameType,
        sectors: Array<IdAndNameType>;
    };


    let data: DefaultDataType;

    const companyInput = $("#company-input");
    const sectorSelect = $("#sector-select");

    const editCompany = (value: string) => {
        console.log("editCompany", value);
        $.post("test.php", { name: "John", time: "2pm" })
            .done(function (data) {
                alert("Data Loaded: " + data);
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

    const editCompanyBtn = $("#edit-company").click(() => {
        modalTitle.html("Enter company name");
        inputDialog.modal("show").on("shown.bs.modal", () => modalInput
            .data("type", editCompany)
            .data("value", data.company.name)
            .val(data.company.name)
            .attr("placeholder", "company title")
            .focus());
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

    $.getJSON("/api/default/", (response: DefaultDataType) => {
        $("#loading").hide();
        $(".container-fluid").show("fast", "swing");
        if (response.company) {
            companyInput.val(response.company.name);
        } else {
            editCompanyBtn.click();
        }
        if (response.sectors.length) {
            for (let entry of response.sectors) {
                sectorSelect.append(`<option value=${entry.id}>${entry.name}</option>`);
            }
        }
        data = response;
    });

})();