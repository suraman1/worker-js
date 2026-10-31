create table jobs (
    id bigserial primary key,
    type text not null,
    payload jsonb not null,
    status text not null default 'pending',
    attempts int not null default 0,
    run_at timestamp not null default now(),
    created_at timestamp not null default now()
);

create index index_on_pending on jobs(status, run_at)  where status = 'pending';