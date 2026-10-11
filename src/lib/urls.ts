// 兼容根站点和 GitHub Pages 项目子路径；客户端仅包含路径，不含内容数据。
const rawBase = import.meta.env?.BASE_URL ?? process.env.SITE_BASE_PATH ?? '/';
export const siteBase = '/' + rawBase.split('/').filter(Boolean).join('/') + (rawBase.split('/').filter(Boolean).length ? '/' : '');
export function siteUrl(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('内部路径必须以单个 / 开头');
  return siteBase + path.slice(1);
}
export const repositoryUrl = import.meta.env?.PUBLIC_REPOSITORY_URL ?? process.env.PUBLIC_REPOSITORY_URL ?? '';
export function repositoryLink(path = ''): string {
  if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(repositoryUrl)) return '';
  return repositoryUrl.replace(/\/$/,'') + path;
}
