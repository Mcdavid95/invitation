-- The occasion an invitation is for, copied out of its config so the dashboard can show it.
ALTER TABLE invites ADD COLUMN kind TEXT NOT NULL DEFAULT 'wedding';
