-- RLS: Allow public read for matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_public_read" ON matches FOR SELECT USING (true);
CREATE POLICY "matches_public_insert" ON matches FOR INSERT WITH CHECK (true);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "predictions_public_read" ON predictions FOR SELECT USING (true);
CREATE POLICY "predictions_public_insert" ON predictions FOR INSERT WITH CHECK (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_public_read" ON users FOR SELECT USING (true);
CREATE POLICY "users_public_insert" ON users FOR INSERT WITH CHECK (true);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scores_public_read" ON scores FOR SELECT USING (true);
CREATE POLICY "scores_public_insert" ON scores FOR INSERT WITH CHECK (true);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_public_read" ON badges FOR SELECT USING (true);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_badges_public_read" ON user_badges FOR SELECT USING (true);
CREATE POLICY "user_badges_public_insert" ON user_badges FOR INSERT WITH CHECK (true);

ALTER TABLE special_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "special_predictions_public_read" ON special_predictions FOR SELECT USING (true);
CREATE POLICY "special_predictions_public_insert" ON special_predictions FOR INSERT WITH CHECK (true);
