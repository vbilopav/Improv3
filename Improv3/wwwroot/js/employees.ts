(window as any).subscribe("/sector/change", (sectorId: number | null, sectorName: string) => {

    interface IEmployee {
        id: number | null;
        firstName: string;
        lastName: string;
        email: string;
    };

    const rowTemplate = (employee: IEmployee) => `
    <tr>
        <th scope="row" style="max-width: 50px; min-width: 50px;">
            <div class="loading spinner-grow text-secondary" role="status" style="display: none; overflow: hidden">
              <span class="sr-only">Loading...</span>
            </div>
            <div class="row-id" style="font-weight: 100;">
                ${employee.id ? employee.id : ""}
            </div>
        </th>
        <td>
            <input type="text" name="firstName" class="form-control" value="${employee.firstName}" placeholder="employee first name" spellcheck="false" autocomplete="off" />
        </td>
        <td>
            <input type="text" name="lastName" class="form-control" value="${employee.lastName}" placeholder="employee last name" spellcheck="false" autocomplete="off" />
        </td>
        <td>
            <input type="text" name="email" class="form-control email" value="${employee.email}" placeholder="employee email" spellcheck="false" autocomplete="off" />
        </td>
        <td>
            <button type="button" class="btn btn-outline-info" title="Remove employee" style="display: ${employee.id === null ? "none" : ""}">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display: none"></span>
                &#10134;
            </button>
        </td>
    </tr>`;
    const deleteModalBodyTemplate = (employee: IEmployee) => `
    <ul class="list-group list-group-flush">
        <li class="list-group-item">
            <ul class="list-inline">
                <li class="list-inline-item"><strong>ID</strong></li>
                <li class="list-inline-item"><mark>${employee.id}</mark></li>
            </ul>
        </li>
        <li class="list-group-item">
            <ul class="list-inline">
                <li class="list-inline-item"><strong>First Name</strong></li>
                <li class="list-inline-item"><mark>${employee.firstName}</mark></li>
            </ul>
        </li>
        <li class="list-group-item">
            <ul class="list-inline">
                <li class="list-inline-item"><strong>Last Name</strong></li>
                <li class="list-inline-item"><mark>${employee.lastName}</mark></li>
            </ul>
        </li>
        <li class="list-group-item">
            <ul class="list-inline">
                <li class="list-inline-item"><strong>Email</strong></li>
                <li class="list-inline-item"><mark>${employee.email}</mark></li>
            </ul>
        </li>
    </ul>`;


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
        tbody = table.find("tbody"),
        confirm = $("#confirm-delete");

    let inputTimeout: number;

    loader.show();
    table.hide();
    if (sectorId == null) {
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

    const tooltip = (e: JQuery, msg: string) =>
        e.tooltip("dispose").attr("title", msg).tooltip({ trigger: "manual", html: true }).tooltip("show");

    const inputKeyUp = (e: JQuery.KeyUpEvent) => {
        const input = $(e.target), index: number = input.data("index");
        let currentRow = input.closest("tr");
        if (e.key === "Enter" /*|| e.key === "ArrowRight"*/) {
            if (index < 2) {
                $(currentRow.find("input")[index + 1]).focus();
            } else {
                currentRow = currentRow.next();
                if (!currentRow.length) {
                    currentRow = tbody.find("tr").first();
                }
                $(currentRow.find("input")[0]).focus();
            }
        //} else if (e.key === "ArrowLeft") {
        //    if (index > 0) {
        //        $(currentRow.find("input")[index - 1]).focus();
        //    } else {
        //        currentRow = currentRow.prev();
        //        if (!currentRow.length) {
        //            currentRow = tbody.find("tr").last();
        //        }
        //        $(currentRow.find("input")[2]).focus();
        //    }
        } else if (e.key === "ArrowUp") {
            currentRow = currentRow.prev();
            if (!currentRow.length) {
                currentRow = tbody.find("tr").last();
            }
            $(currentRow.find("input")[index]).focus();
        } else if (e.key === "ArrowDown") {
            currentRow = currentRow.next();
            if (!currentRow.length) {
                currentRow = tbody.find("tr").first();
            }
            $(currentRow.find("input")[index]).focus();
        }
    };

    const isInvalidInput = (input: JQuery) => {
        const name = input.attr("name");
        const val = input.val() as string;
        if (name === "firstName") {
            if (!val) {
                tooltip(input, "First name cannot be empty!");
                return true;
            }
        } else if (name === "lastName") {
            if (!val) {
                tooltip(input, "Last name cannot be empty!");
                return true;
            }

        } else if (name === "email") {
            if (!val) {
                tooltip(input, "Email name cannot be empty!");
                return true;
            } else if (!validateEmail(val)) {
                tooltip(input, "Email is not valid!");
                return true;
            }
        }
        return false;
    };

    const addRow = (employee: IEmployee) => {
        const row = $(rowTemplate(employee)).data("id", employee.id).data("employee", employee);;
        row.find("input")
            .on("input", e => inputChanged(row, $(e.target)))
            .on("focus", e => {
                const input = $(e.target);
                input.select();
                setTimeout(() => isInvalidInput(input), 100);
                row.find(".row-id").css("font-weight", "bold");
            })
            .on("keyup", inputKeyUp)
            .on("blur", e => {
                let input = $(e.target), original = input.data("original");
                if (original && original !== input.val()) {
                    input.val(original);
                }
                input.tooltip("dispose");
                row.find(".row-id").css("font-weight", "100");
            }).each((index, e) => {
                let input = $(e), val = input.val();
                input.data("index", index).data("original", input.val() as string);

            });
        row.find("button").click(e => {
            const btn = $(e.target);
            const employee = row.data("employee");
            confirm.find(".modal-body").html(deleteModalBodyTemplate(employee)).parent().find(".btn-danger").off("click").click(() => {
                btn.find("span").show();
                $.post(`api/delete-employee?id=${employee.id}`)
                    .always(() => {
                        btn.find("span").hide();
                        confirm.modal("hide");
                    }).done(() => {
                        console.log("deleted");
                        row.remove();
                    });
            });
            confirm.data("employee", employee).modal("show");
        });
        tbody.append(row);
    };

    const handleTableInputChange = (row: JQuery, input: JQuery, done: (()=>void)) => {
        const inputs = row.find("input");
        const rowEl = row.find("th>div.row-id");
        const firstNameElement = row.find("[name=firstName]");
        const lastNameElement = row.find("[name=lastName]");
        const emailElement = row.find("[name=email]");
        let invalid = false;
        invalid = isInvalidInput(firstNameElement);
        invalid = invalid || isInvalidInput(lastNameElement);
        invalid = invalid || isInvalidInput(emailElement);
        if (!invalid) {
            invalid = isInvalidInput(emailElement);
        }
        if (invalid) {
            return done();
        }

        const employee: any = {
            id: row.data("id"),
            firstName: firstNameElement.val() as string,
            lastName: lastNameElement.val() as string,
            email: emailElement.val() as string
        }

        employee.attributes = { location: document.location.href };
        employee.sectorId = sectorId;
        firstNameElement.data("original", "");
        lastNameElement.data("original", "");
        emailElement.data("original", "");
        post("api/update-employee",
            employee,
            (response: IEmployee) => {
                rowEl.css("color", "").html((response.id as number).toString());
                if (employee.id == null) {
                    addRow({ id: null, firstName: "", lastName: "", email: "" });
                    row.find("button").show();
                }
                row.data("id", response.id).data("employee", response);
                firstNameElement.data("original", response.firstName);
                lastNameElement.data("original", response.lastName);
                emailElement.data("original", response.email);
            }).always(done).fail((response: any) => {
            if (response.responseJSON.constraint && response.responseJSON.constraint === "employees_email_key") {
                tooltip($(inputs[2]), "There is already same email in the system, please enter another one!");
            } else if (response.responseJSON.column && response.responseJSON.column === "email") {
                tooltip($(inputs[2]), "Email is not valid.");
            } else {
                console.warn(response.responseJSON);
                tooltip(rowEl.css("color", "red"), "Couldn't update this row. There is something wrong with database.");
            }
        });
    }

    const inputChanged = (row: JQuery, input: JQuery) => {
        row.find("input, div").tooltip("dispose");
        toggleLoadingRow(row, true);
        if (inputTimeout) {
            clearTimeout(inputTimeout);
        }
        inputTimeout = setTimeout(() => {
            handleTableInputChange(row, input, () => toggleLoadingRow(row, false));
        }, 250);
    }

    $.getJSON("api/employees-by-sector?sectorId=" + sectorId, (response: Array<IEmployee>) => {
        tbody.empty();
        for (let employee of response) {
            addRow(employee);
        }
        addRow({ id: null, firstName: "", lastName: "", email: "" });
        loader.hide();
        setTimeout(() => table.show().find("input").first().focus(), 500);

    });

    $(window as any).click(() => {
        tbody.find("input, div").tooltip("dispose");
    });
});
