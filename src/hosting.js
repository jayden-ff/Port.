export function newsHosting({ mode, apiUrl } = {}) {
  const staticSite = mode === 'pages';
  if (apiUrl) {
    const endpoint = new URL(apiUrl);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
      throw new Error('Der Nachrichtendienst benötigt eine HTTPS-URL ohne Zugangsdaten, Query oder Fragment.');
    }
    return { staticSite, available: true, endpoint: endpoint.href };
  }
  return { staticSite, available: !staticSite, endpoint: staticSite ? null : '/api/news' };
}

export function newsRequestUrl(endpoint, symbols) {
  if (!endpoint) throw new Error('Noch kein Nachrichtendienst verbunden.');
  return `${endpoint}?symbols=${encodeURIComponent(symbols)}`;
}
