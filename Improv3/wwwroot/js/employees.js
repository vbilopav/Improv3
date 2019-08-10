"use strict";
window.subscribe("/sector/change", function (sectorId, sectorName) {
    ;
    var rowTemplate = function (employee) { return "\n    <tr>\n        <th scope=\"row\" style=\"max-width: 50px; min-width: 50px;\">\n            <div class=\"loading spinner-grow text-secondary\" role=\"status\" style=\"display: none; overflow: hidden\">\n              <span class=\"sr-only\">Loading...</span>\n            </div>\n            <div class=\"row-id\" style=\"font-weight: 100;\">\n                " + (employee.id ? employee.id : "") + "\n            </div>\n        </th>\n        <td>\n            <input type=\"text\" name=\"firstName\" class=\"form-control\" value=\"" + employee.firstName + "\" placeholder=\"employee first name\" spellcheck=\"false\" autocomplete=\"off\" />\n        </td>\n        <td>\n            <input type=\"text\" name=\"lastName\" class=\"form-control\" value=\"" + employee.lastName + "\" placeholder=\"employee last name\" spellcheck=\"false\" autocomplete=\"off\" />\n        </td>\n        <td>\n            <input type=\"text\" name=\"email\" class=\"form-control email\" value=\"" + employee.email + "\" placeholder=\"employee email\" spellcheck=\"false\" autocomplete=\"off\" />\n        </td>\n        <td>\n            <button type=\"button\" class=\"btn btn-outline-info\" title=\"Remove employee\" style=\"display: " + (employee.id === null ? "none" : "") + "\">\n                <span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\" style=\"display: none\"></span>\n                &#10134;\n            </button>\n        </td>\n    </tr>"; };
    var deleteModalBodyTemplate = function (employee) { return "\n    <ul class=\"list-group list-group-flush\">\n        <li class=\"list-group-item\">\n            <ul class=\"list-inline\">\n                <li class=\"list-inline-item\"><strong>ID</strong></li>\n                <li class=\"list-inline-item\"><mark>" + employee.id + "</mark></li>\n            </ul>\n        </li>\n        <li class=\"list-group-item\">\n            <ul class=\"list-inline\">\n                <li class=\"list-inline-item\"><strong>First Name</strong></li>\n                <li class=\"list-inline-item\"><mark>" + employee.firstName + "</mark></li>\n            </ul>\n        </li>\n        <li class=\"list-group-item\">\n            <ul class=\"list-inline\">\n                <li class=\"list-inline-item\"><strong>Last Name</strong></li>\n                <li class=\"list-inline-item\"><mark>" + employee.lastName + "</mark></li>\n            </ul>\n        </li>\n        <li class=\"list-group-item\">\n            <ul class=\"list-inline\">\n                <li class=\"list-inline-item\"><strong>Email</strong></li>\n                <li class=\"list-inline-item\"><mark>" + employee.email + "</mark></li>\n            </ul>\n        </li>\n    </ul>"; };
    var validateEmail = function (email) {
        var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(String(email).toLowerCase());
    };
    var post = function (url, request, success) { return $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(request),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: success
    }); };
    var wrap = $("#table-wrap"), loader = wrap.find("div"), table = wrap.find("table"), tbody = table.find("tbody"), confirm = $("#confirm-delete");
    var inputTimeout;
    loader.show();
    table.hide();
    if (sectorId == null) {
        loader.hide();
        return;
    }
    var toggleLoadingRow = function (row, state) {
        if (state) {
            row.find("th > div.loading").show();
            row.find("th > div.row-id").hide();
        }
        else {
            row.find("th > div.loading").hide();
            row.find("th > div.row-id").show();
        }
    };
    var tooltip = function (e, msg) {
        return e.tooltip("dispose").attr("title", msg).tooltip({ trigger: "manual", html: true }).tooltip("show");
    };
    var inputKeyUp = function (e) {
        var input = $(e.target), index = input.data("index");
        var currentRow = input.closest("tr");
        if (e.key === "Enter" /*|| e.key === "ArrowRight"*/) {
            if (index < 2) {
                $(currentRow.find("input")[index + 1]).focus();
            }
            else {
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
        }
        else if (e.key === "ArrowUp") {
            currentRow = currentRow.prev();
            if (!currentRow.length) {
                currentRow = tbody.find("tr").last();
            }
            $(currentRow.find("input")[index]).focus();
        }
        else if (e.key === "ArrowDown") {
            currentRow = currentRow.next();
            if (!currentRow.length) {
                currentRow = tbody.find("tr").first();
            }
            $(currentRow.find("input")[index]).focus();
        }
    };
    var isInvalidInput = function (input) {
        var name = input.attr("name");
        var val = input.val();
        if (name === "firstName") {
            if (!val) {
                tooltip(input, "First name cannot be empty!");
                return true;
            }
        }
        else if (name === "lastName") {
            if (!val) {
                tooltip(input, "Last name cannot be empty!");
                return true;
            }
        }
        else if (name === "email") {
            if (!val) {
                tooltip(input, "Email name cannot be empty!");
                return true;
            }
            else if (!validateEmail(val)) {
                tooltip(input, "Email is not valid!");
                return true;
            }
        }
        return false;
    };
    var addRow = function (employee) {
        var row = $(rowTemplate(employee)).data("id", employee.id).data("employee", employee);
        ;
        row.find("input")
            .on("input", function (e) { return inputChanged(row, $(e.target)); })
            .on("focus", function (e) {
            var input = $(e.target);
            input.select();
            setTimeout(function () { return isInvalidInput(input); }, 100);
            row.find(".row-id").css("font-weight", "bold");
        })
            .on("keyup", inputKeyUp)
            .on("blur", function (e) {
            var input = $(e.target), original = input.data("original");
            if (original && original !== input.val()) {
                input.val(original);
            }
            input.tooltip("dispose");
            row.find(".row-id").css("font-weight", "100");
        }).each(function (index, e) {
            var input = $(e), val = input.val();
            input.data("index", index).data("original", input.val());
        });
        row.find("button").click(function (e) {
            var btn = $(e.target);
            var employee = row.data("employee");
            confirm.find(".modal-body").html(deleteModalBodyTemplate(employee)).parent().find(".btn-danger").off("click").click(function () {
                btn.find("span").show();
                $.post("api/delete-employee?id=" + employee.id)
                    .always(function () {
                    btn.find("span").hide();
                    confirm.modal("hide");
                }).done(function () {
                    console.log("deleted");
                    row.remove();
                });
            });
            confirm.data("employee", employee).modal("show");
        });
        tbody.append(row);
    };
    var handleTableInputChange = function (row, input, done) {
        var inputs = row.find("input");
        var rowEl = row.find("th>div.row-id");
        var firstNameElement = row.find("[name=firstName]");
        var lastNameElement = row.find("[name=lastName]");
        var emailElement = row.find("[name=email]");
        var invalid = false;
        invalid = isInvalidInput(firstNameElement);
        invalid = invalid || isInvalidInput(lastNameElement);
        invalid = invalid || isInvalidInput(emailElement);
        if (!invalid) {
            invalid = isInvalidInput(emailElement);
        }
        if (invalid) {
            return done();
        }
        var employee = {
            id: row.data("id"),
            firstName: firstNameElement.val(),
            lastName: lastNameElement.val(),
            email: emailElement.val()
        };
        employee.attributes = { location: document.location.href };
        employee.sectorId = sectorId;
        firstNameElement.data("original", "");
        lastNameElement.data("original", "");
        emailElement.data("original", "");
        post("api/update-employee", employee, function (response) {
            rowEl.css("color", "").html(response.id.toString());
            if (employee.id == null) {
                addRow({ id: null, firstName: "", lastName: "", email: "" });
                row.find("button").show();
            }
            row.data("id", response.id).data("employee", response);
            firstNameElement.data("original", response.firstName);
            lastNameElement.data("original", response.lastName);
            emailElement.data("original", response.email);
        }).always(done).fail(function (response) {
            if (response.responseJSON.constraint && response.responseJSON.constraint === "employees_email_key") {
                tooltip($(inputs[2]), "There is already same email in the system, please enter another one!");
            }
            else if (response.responseJSON.column && response.responseJSON.column === "email") {
                tooltip($(inputs[2]), "Email is not valid.");
            }
            else {
                console.warn(response.responseJSON);
                tooltip(rowEl.css("color", "red"), "Couldn't update this row. There is something wrong with database.");
            }
        });
    };
    var inputChanged = function (row, input) {
        row.find("input, div").tooltip("dispose");
        toggleLoadingRow(row, true);
        if (inputTimeout) {
            clearTimeout(inputTimeout);
        }
        inputTimeout = setTimeout(function () {
            handleTableInputChange(row, input, function () { return toggleLoadingRow(row, false); });
        }, 250);
    };
    $.getJSON("api/employees-by-sector?sectorId=" + sectorId, function (response) {
        tbody.empty();
        for (var _i = 0, response_1 = response; _i < response_1.length; _i++) {
            var employee = response_1[_i];
            addRow(employee);
        }
        addRow({ id: null, firstName: "", lastName: "", email: "" });
        loader.hide();
        setTimeout(function () { return table.show().find("input").first().focus(); }, 500);
    });
    $(window).click(function () {
        tbody.find("input, div").tooltip("dispose");
    });
});
