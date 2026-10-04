INSERT OR IGNORE INTO sources (name, url, parser, category) VALUES
  ('OGCRI-UNMSM',       'https://cooperacion-unmsm.blogspot.com/feeds/posts/default?alt=rss', 'blogspot',  'institucional'),
  ('PRONABEC',          'https://www.gob.pe/busquedas.rss?categoria[]=10-educacion&contenido[]=noticias&institucion[]=pronabec&sheet=1&sort_by=recent', 'pronabec', 'becas'),
  ('Naukas',            'https://feedpress.me/naukas',                   'identity',  'divulgacion'),
  ('Quanta Magazine',   'https://www.quantamagazine.org/feed/',          'identity',  'ciencia');
