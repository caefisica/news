-- Every gob.pe feed uses this parser, not only PRONABEC.
UPDATE sources SET parser = 'gobpe' WHERE parser = 'pronabec';

-- The parser now skips gob.pe collection pages, which have no date. Remove the ones already stored.
DELETE FROM articles
WHERE published_at IS NULL
  AND source_id IN (SELECT id FROM sources WHERE parser = 'gobpe');
