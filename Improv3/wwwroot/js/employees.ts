(window as any).subscribe("/sector/change", (id: number | null, name: string) => {

    interface IEmployee {
        id: number | null;
        firstName: string;
        lastName: string;
        email: string;
    };

    const rowTemplate = (employee: IEmployee) => `
    <tr>
        <th scope="row">
            <div class="loading spinner-grow text-secondary" role="status" style="display: none">
              <span class="sr-only">Loading...</span>
            </div>
            <div class="row-id">
                ${employee.id ? employee.id : "new"}
            </div>
        </th>
        <td>
            <input type="text" class="form-control" value="${employee.firstName}" placeholder="employee first name" spellcheck="false" autocomplete="on" />
        </td>
        <td>
            <input type="text" class="form-control" value="${employee.lastName}" placeholder="employee last name" spellcheck="false" autocomplete="on" />
        </td>
        <td>
            <input type="text" class="form-control email" value="${employee.email}" placeholder="employee email" spellcheck="false" autocomplete="on" />
        </td>
    </tr>`;

    const validateEmail = (email: string) => {
        var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(String(email).toLowerCase());
    };

    const post = (url: string, request: any, success: ((response: any) => void)) => $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify(request),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: success
        });

    const
        wrap = $("#table-wrap"),
        loader = wrap.find("div"),
        table = wrap.find("table"),
        tbody = table.find("tbody");

    let inputTimeout: number;

    loader.show();
    table.hide();
    if (id == null) {
        loader.hide();
        return;
    }


    const toggleLoadingRow = (row: JQuery, state: boolean) => {
        if (state) {
            row.find("th > div.loading").show();
            row.find("th > div.row-id").hide();
        } else {
            row.find("th > div.loading").hide();
            row.find("th > div.row-id").show();
        }
    };

    const addRow = (employee: IEmployee) => {
        const row = $(rowTemplate(employee)).data("id", employee.id);
        row.find("input").on("input", () => inputChanged(row));
        tbody.append(row);
    };

    const tooltip = (e: JQuery, msg: string) =>
        e.tooltip("dispose").attr("title", msg).tooltip({ trigger: "manual" }).tooltip("show");

    const handleTableInputChange = (row: JQuery, done: (()=>void)) => {
        const inputs = row.find("input");
        const rowEl = row.find("th>div.row-id");
        const employee: any = {
            id: row.data("id"),
            firstName: $(inputs[0]).val() as string,
            lastName: $(inputs[1]).val() as string,
            email: $(inputs[2]).val() as string
        }
        if (!employee.firstName) {
            return done();
        }
        if (!employee.lastName) {
            return done();
        }
        if (!employee.email) {
            return done();
        }
        if (!validateEmail(employee.email)) {
            tooltip($(inputs[2]), "Email is not valid.");
            return done();
        }
        $(inputs[2]).tooltip("dispose");
        employee.attributes = { location: document.location.href };
        employee.sectorId = id;
        post("api/update-employee",
            employee,
            (response: any) => {
                rowEl.css("color", "").html(response.id);
                if (employee.id == null) {
                    addRow({ id: null, firstName: "", lastName: "", email: "" });
                }
                row.data("id", response.id);
            }).always(done).fail((response: any) => {
                console.warn(response.responseJSON);
                tooltip(rowEl.css("color", "red"), "Couldn't update this row. There is something wrong with database.");
            });
    }

    const inputChanged = (row: JQuery) => {
        row.find("input, div").tooltip("dispose");
        toggleLoadingRow(row, true);
        if (inputTimeout) {
            clearTimeout(inputTimeout);
        }
        inputTimeout = setTimeout(() => {
            handleTableInputChange(row, () => toggleLoadingRow(row, false));
        }, 250);
    }

    $.getJSON("api/employees-by-sector?sectorId=" + id, (response: Array<IEmployee>) => {
        tbody.empty();
        for (let employee of response) {
            addRow(employee);
        }
        addRow({ id: null, firstName: "", lastName: "", email: "" });
        loader.hide();
        table.show();
    });
});
