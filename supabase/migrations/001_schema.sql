-- WC2026 Predictor - Supabase Schema
-- Run in Supabase SQL Editor

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_emoji TEXT DEFAULT '👤',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL,
  round TEXT DEFAULT 'group',
  home_team TEXT NOT NULL,
  home_flag TEXT,
  home_rank INT,
  away_team TEXT NOT NULL,
  away_flag TEXT,
  away_rank INT,
  kickoff TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'upcoming', -- upcoming, live, finished
  home_score INT,
  away_score INT,
  hot BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Predictions
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  match_id UUID REFERENCES matches(id) NOT NULL,
  home_score INT NOT NULL,
  away_score INT NOT NULL,
  points INT DEFAULT 0,
  is_exact BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- Special predictions (champion, top scorer, MVP)
CREATE TABLE special_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  category TEXT NOT NULL, -- champion, top_scorer, mvp
  value TEXT NOT NULL,
  points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Badges / achievements
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  condition_type TEXT, -- streak, score, accuracy
  condition_value INT
);

-- User badges
CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id) NOT NULL,
  badge_id UUID REFERENCES badges(id) NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- Scores (materialized for leaderboard speed)
CREATE TABLE scores (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_points INT DEFAULT 0,
  total_predictions INT DEFAULT 0,
  correct_predictions INT DEFAULT 0,
  streak INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_scores_points ON scores(total_points DESC);
CREATE INDEX idx_matches_kickoff ON matches(kickoff);
