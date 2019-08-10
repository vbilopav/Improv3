do $$
begin

    drop function if exists select_company_and_sectors(int);
    drop function if exists update_company(int, json);
    drop function if exists update_sectors(json);
    drop function if exists select_employees_by_sector(int);
    drop function if exists update_employees(_employee json);
    drop function if exists delete_employees(int);
    drop table if exists employees;
    drop table if exists sectors;
    drop table if exists companies;

end
$$;
