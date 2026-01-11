import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "infobank.db");

export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    choices TEXT NOT NULL,
    correct_answer_index INTEGER NOT NULL,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    settings TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tournament_id TEXT NOT NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    round_number INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    participant1_id TEXT,
    participant2_id TEXT,
    participant1_score INTEGER DEFAULT 0,
    participant2_score INTEGER DEFAULT 0,
    winner_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    next_match_id TEXT,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS participant_help_tools (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    change_question_remaining INTEGER NOT NULL,
    remove_two_answers_remaining INTEGER NOT NULL,
    show_choices_remaining INTEGER NOT NULL,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS game_states (
    id TEXT PRIMARY KEY,
    match_id TEXT UNIQUE NOT NULL,
    current_round INTEGER DEFAULT 1,
    current_question_index INTEGER DEFAULT 0,
    current_round_type TEXT NOT NULL,
    current_turn_participant_id TEXT,
    question_ids TEXT NOT NULL,
    used_question_ids TEXT DEFAULT '[]',
    removed_choices TEXT DEFAULT '[]',
    showing_choices INTEGER DEFAULT 0,
    question_revealed INTEGER DEFAULT 0,
    answer_revealed INTEGER DEFAULT 0,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS game_scores (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    round_number INTEGER NOT NULL,
    question_index INTEGER NOT NULL,
    points INTEGER NOT NULL,
    correct INTEGER NOT NULL,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
  );
`);

export default db;
