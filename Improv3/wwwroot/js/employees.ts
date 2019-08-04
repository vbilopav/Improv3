(window as any).subscribe("/sector/change", (id: number | null, name: string) => {

    const
        wrap = $("#table-wrap"),
        loader = wrap.find("div"),
        table = wrap.find("table");
    loader.show();
    table.hide();
    if (id == null) {
        loader.hide();
        return;
    }



    $.getJSON("api/company-and-sectors", (response: IDefaultDataType) => {
        loader.hide();
        table.show();

    });
});
