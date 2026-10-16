-- Migration: Enable pg_net and initialize supabase_functions.http_request for Database Webhooks
-- Fixes Supabase error: ERROR: 42883: function supabase_functions.http_request() does not exist

-- 1. Ensure pg_net extension is enabled
create extension if not exists pg_net;

-- 2. Ensure supabase_functions schema exists
create schema if not exists supabase_functions;

-- 3. Define the http_request trigger function used by Supabase Database Webhooks
create or replace function supabase_functions.http_request()
returns trigger
language plpgsql
security definer
as $$
declare
    request_id bigint;
    payload jsonb;
    url text := tg_argv[0]::text;
    method text := tg_argv[1]::text;
    headers jsonb := tg_argv[2]::jsonb;
    params jsonb := coalesce(tg_argv[3]::jsonb, '{}'::jsonb);
    timeout_ms integer := coalesce(tg_argv[4]::integer, 5000);
begin
    payload := jsonb_build_object(
        'type', tg_op,
        'table', tg_table_name,
        'schema', tg_table_schema,
        'record', case when tg_op in ('INSERT', 'UPDATE') then row_to_json(new) else null end,
        'old_record', case when tg_op in ('UPDATE', 'DELETE') then row_to_json(old) else null end
    );

    if upper(method) = 'POST' then
        select net.http_post(
            url := url,
            body := payload,
            params := params,
            headers := headers,
            timeout_milliseconds := timeout_ms
        ) into request_id;
    elsif upper(method) = 'GET' then
        select net.http_get(
            url := url,
            params := params,
            headers := headers,
            timeout_milliseconds := timeout_ms
        ) into request_id;
    end if;

    if tg_op = 'DELETE' then
        return old;
    else
        return new;
    end if;
end;
$$;
