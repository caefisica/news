-- Remove the feed because Cloudflare returns HTTP 403 to feed readers.
DELETE FROM sources WHERE url = 'https://www.symmetrymagazine.org/feed';
