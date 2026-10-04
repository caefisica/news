INSERT OR IGNORE INTO sources (name, url, parser, category, language) VALUES
  ('IPEN',         'https://www.gob.pe/busquedas.rss?contenido[]=noticias&institucion[]=ipen&sheet=1&sort_by=recent',     'gobpe',    'institucional', 'es'),
  ('IGP',          'https://www.gob.pe/busquedas.rss?contenido[]=noticias&institucion[]=igp&sheet=1&sort_by=recent',      'gobpe',    'institucional', 'es'),
  ('CONCYTEC',     'https://www.gob.pe/busquedas.rss?contenido[]=noticias&institucion[]=concytec&sheet=1&sort_by=recent', 'gobpe',    'becas',         'es'),
  ('CERN',         'https://home.cern/feed/',                   'identity', 'ciencia', 'en'),
  ('REPU Program', 'https://www.repuprogram.org/blog-feed.xml', 'identity', 'becas',   'es');
