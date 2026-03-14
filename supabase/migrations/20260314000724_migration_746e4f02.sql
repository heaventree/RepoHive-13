-- Create repos table with user ownership
CREATE TABLE repos (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WATCHLIST', 'ARCHIVED')),
  score INTEGER DEFAULT 0,
  language TEXT,
  license TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  issues INTEGER DEFAULT 0,
  last_push TIMESTAMP WITH TIME ZONE,
  description TEXT,
  readme TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, url)
);

-- Create index for faster queries
CREATE INDEX repos_user_id_idx ON repos(user_id);
CREATE INDEX repos_score_idx ON repos(score DESC);

-- Enable RLS
ALTER TABLE repos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for repos
CREATE POLICY "Users can view their own repos" ON repos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own repos" ON repos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repos" ON repos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repos" ON repos
  FOR DELETE USING (auth.uid() = user_id);