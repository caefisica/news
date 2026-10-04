-- ISO 639-1 code of the language a source publishes in.
ALTER TABLE sources ADD COLUMN language TEXT NOT NULL DEFAULT 'es';

UPDATE sources SET language = 'en' WHERE url = 'https://www.quantamagazine.org/feed/';
