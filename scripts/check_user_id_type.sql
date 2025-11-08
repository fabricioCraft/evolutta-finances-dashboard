select column_name, data_type, udt_name
from information_schema.columns
where table_schema = 'public' and table_name = 'User' and column_name = 'id';