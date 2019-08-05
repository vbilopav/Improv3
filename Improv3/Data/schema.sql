do $$
begin

    drop function if exists select_company_and_sectors(int);
    drop function if exists update_company(int, json);
    drop function if exists update_sectors(json);
    drop function if exists select_employees_by_sector(int);
    drop function if exists update_employees(_employee json);
    drop table if exists employees;
    drop table if exists sectors;
    drop table if exists companies;

    create table companies (
        id int not null generated always as identity primary key,
        user_id int not null,
        name varchar(256) not null,
        attributes jsonb not null,
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
        attributes jsonb not null,
        constraint fk_sectors_company_id__companies_id foreign key (company_id)
        references companies (id)
        on update no action
        on delete cascade,
        unique (company_id, name)
    );
    drop index if exists idx_sectors_company_id;
    create index idx_sectors_company_id on sectors using btree (company_id);

    create table employees (
        id int not null generated always as identity primary key,
        sector_id int not null,
        first_name varchar(256) not null,
        last_name varchar(256) not null,
        email varchar(512) not null,
        attributes jsonb not null,
        constraint fk_employees_sector_id__sectors_id foreign key (sector_id)
        references sectors (id)
        on update no action
        on delete cascade,
        unique (email)
    );
    drop index if exists idx_employees_sector_id;
    create index idx_employees_sector_id on employees using btree (sector_id);

end
$$;

create function select_company_and_sectors(_user_id int)
returns json as
$$
declare _company json;
declare _company_id int;
begin
    select to_json(c), c.id
    into _company, _company_id
    from (
        select id, name from companies c where user_id = _user_id limit 1
    ) c;

    return json_build_object(
        'company', _company,
        'sectors', (
            select coalesce(json_agg(s), '[]') from (
                select id, name from sectors where company_id = _company_id order by company_id
            ) s
        )
    );
end
$$ language plpgsql;

create or replace function extract_record_attributes(_input json) returns json as
$$
begin
    return json_build_object('timestamp', now() at time zone 'utc')::jsonb || (coalesce(_input#>'{attributes}', '{}'))::jsonb;
end
$$ language plpgsql;

create function update_company(_user_id int, _company json)
returns json as
$$
declare _result json;
declare _attributes json;
begin
    _attributes = extract_record_attributes(_company);
    with cte as (
        update companies 
        set name = _company->>'name', attributes = _attributes where user_id = _user_id
        returning id, name
    )
    select to_json(cte) into _result from cte;

    if _result is null then
        with cte as (
            insert into companies (name, user_id, attributes) values (_company->>'name', _user_id, _attributes)
            returning id, name
        )
        select to_json(cte) into _result from cte;
    end if;

    return _result;
end
$$ language plpgsql;

create function update_sectors(_sector json)
returns json as
$$
declare _result json;
declare _company_id int;
declare _id int;
declare _attributes json;
begin

    _company_id = (_sector->>'companyId')::int;
    _id = (_sector->>'id')::int;
    raise info 'id=%, company_id=%, name=%', _id, _company_id, _sector->>'name';
    _attributes = extract_record_attributes(_sector);

    if _id is null then
        with cte as (
            insert into sectors (name, company_id, attributes) 
            values (_sector->>'name', _company_id, _attributes)
            returning id, name
        )
        select to_json(cte) into _result from cte;
        
    else
        with cte as (
            update sectors 
            set name = _sector->>'name', company_id = _company_id, attributes = _attributes
            where id = _id
            returning id, name
        )
        select to_json(cte) into _result from cte;
    end if;

    return _result;
    
    exception when unique_violation then
        raise warning 'unique_violation for sector %s', _sector;
        return '{"error": "unique_violation"}'::json;
end
$$ language plpgsql;

create function select_employees_by_sector(_sector_id int)
returns json as
$$
begin
    raise info '_sector_id=%', _sector_id;
    return (
        select coalesce(json_agg(e), '[]') from (
            select id, first_name as "firstName", last_name as "lastName", email 
            from employees 
            where sector_id = _sector_id 
            order by id asc
        ) e
    );
end
$$ language plpgsql;

create function update_employees(_employee json)
returns json as
$$
declare _result json;
declare _sector_id int;
declare _id int;
declare _attributes json;
begin

    _sector_id = (_employee->>'sectorId')::int;
    _id = (_employee->>'id')::int;
    raise info 'id=%, sector_id=%, first_name=%, last_name=%, email=%', 
               _id,  _sector_id,  _employee->>'firstName', _employee->>'lastName', _employee->>'email';
    _attributes = extract_record_attributes(_employee);

    if _id is null then
        with cte as (
            insert into employees (first_name, last_name, email, sector_id, attributes) 
            values (_employee->>'firstName', _employee->>'lastName', _employee->>'email', _sector_id, _attributes)
            returning id, first_name as "firstName", last_name as "lastName", email
        )
        select to_json(cte) into _result from cte;
        
    else
        with cte as (
            update employees 
            set  
                sector_id = _sector_id, 
                first_name = _employee->>'firstName',
                last_name = _employee->>'lastName', 
                email = _employee->>'email',
                attributes = _attributes
            where id = _id
            returning id, first_name as "firstName", last_name as "lastName", email
        )
        select to_json(cte) into _result from cte;
    end if;

    return _result;
    
    exception when unique_violation then
        raise warning 'unique_violation for sector %s', _sector;
        return '{"error": "unique_violation"}'::json;
end
$$ language plpgsql;


