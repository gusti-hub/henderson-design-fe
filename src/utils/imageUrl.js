/**
 * Converts a raw.githubusercontent.com URL to a jsDelivr CDN URL for faster,
 * more reliable image delivery. Returns the URL unchanged if it doesn't match.
 *
 * Input:  https://raw.githubusercontent.com/owner/repo/refs/heads/branch/path/file.jpg
 * Output: https://cdn.jsdelivr.net/gh/owner/repo@branch/path/file.jpg
 */
export function toJsDelivrUrl(url) {
  if (!url) return url;
  const pattern = /https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/(?:refs\/heads\/)?([^/]+)\/(.+)/;
  const match = url.match(pattern);
  if (!match) return url;
  const [, owner, repo, branch, path] = match;
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`;
}
