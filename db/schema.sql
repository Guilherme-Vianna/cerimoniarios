create table if not exists users (
  id uuid primary key,
  firebase_uid varchar(128) not null unique,
  email varchar(320),
  name varchar(200),
  photo_url varchar(1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quizzes (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  topic varchar(40),
  status varchar(20) not null check (status in ('in_progress', 'completed')),
  total integer not null,
  score integer,
  xp_earned integer,
  cards_created integer,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ix_quizzes_user_id on quizzes (user_id);

create table if not exists quiz_questions (
  id uuid primary key,
  quiz_id uuid not null references quizzes(id) on delete cascade,
  position smallint not null,
  topic varchar(40) not null,
  source varchar(10) not null check (source in ('ai', 'bank')),
  prompt text not null,
  options jsonb not null,
  correct_index smallint not null,
  explanation text not null,
  card_front text not null,
  card_back text not null,
  reference varchar(120),
  selected_index smallint,
  is_correct boolean,
  unique (quiz_id, position)
);

create table if not exists flashcards (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  question_id uuid references quiz_questions(id) on delete set null,
  topic varchar(40) not null,
  front text not null,
  back text not null,
  explanation text,
  reference varchar(120),
  ease double precision not null default 2.5,
  interval_days integer not null default 0,
  repetitions integer not null default 0,
  lapses integer not null default 0,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ix_flashcards_user_id_due_at on flashcards (user_id, due_at);

create table if not exists xp_events (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  amount integer not null,
  reason varchar(20) not null check (reason in ('quiz', 'review')),
  created_at timestamptz not null default now()
);
create index if not exists ix_xp_events_created_at_user_id on xp_events (created_at, user_id);
create index if not exists ix_xp_events_user_id_created_at on xp_events (user_id, created_at);
