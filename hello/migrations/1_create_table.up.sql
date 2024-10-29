CREATE TABLE todo_item (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false
  -- etc...
);
