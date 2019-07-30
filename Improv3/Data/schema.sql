do $$
begin

    drop table if exists sectors;
    drop table if exists companies;
    drop table if exists employees;

    create table companies (
        id int not null generated always as identity primary key,
        user_id int not null,
        name varchar(256) not null,
        constraint fk_comapnies_user_id__indetity_user_id foreign key (user_id)
        references identity.user (id)
        on update no action
        on delete no action
    );
    drop index if exists idx_companies_user_id;
    create index idx_companies_user_id on companies using btree (user_id);

    create table sectors (
        id int not null generated always as identity primary key,
        company_id int not null,
        name varchar(256) not null,
        constraint fk_sectors_company_id__companies_id foreign key (company_id)
        references companies (id)
        on update no action
        on delete cascade
    );
    drop index if exists idx_sectors_company_id;
    create index idx_sectors_company_id on sectors using btree (company_id);

    create table employees (
        id int not null generated always as identity primary key,
        sector_id int not null,
        user_id int null,
        first_name varchar(256) not null,
        last_name varchar(256) not null,
        constraint fk_employees_sector_id__sectors_id foreign key (sector_id)
        references sectors (id)
        on update no action
        on delete cascade,
        constraint fk_employees_user_id__indetity_user_id foreign key (user_id)
        references identity.user (id)
        on update no action
        on delete no action
    );
    drop index if exists idx_employees_sector_id;
    create index idx_employees_sector_id on employees using btree (sector_id);

end
$$;
