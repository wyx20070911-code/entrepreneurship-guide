import { filterRecords } from '../lib/search';
import type { Filters, SearchRecord } from '../lib/search';
const library = document.querySelector<HTMLElement>('#library');
if (library) {
  const form = document.querySelector<HTMLFormElement>('#filters')!;
  const input = document.querySelector<HTMLInputElement>('#search')!;
  const volume = document.querySelector<HTMLSelectElement>('#volume-filter')!;
  const type = document.querySelector<HTMLSelectElement>('#type-filter')!;
  const grade = document.querySelector<HTMLSelectElement>('#grade-filter')!;
  const state = document.querySelector<HTMLSelectElement>('#state-filter')!;
  const drafts = document.querySelector<HTMLInputElement>('#show-drafts');
  const results = document.querySelector<HTMLElement>('#results')!;
  const empty = document.querySelector<HTMLElement>('#empty-results')!;
  const count = document.querySelector<HTMLElement>('#result-count')!;
  const error = document.querySelector<HTMLElement>('#search-error')!;
  let official: SearchRecord[] = [];
  let draftIndex: SearchRecord[] | null = null;
  let loadingDrafts: Promise<SearchRecord[]> | null = null;
  const params = new URLSearchParams(location.search);
  input.value = params.get('q') ?? '';
  for (const control of [volume, type, grade, state]) {
    const value = params.get(control.name);
    if (value && Array.from(control.options).some(option => option.value === value && !option.disabled)) control.value = value;
  }
  const showError = () => { error.hidden = false; error.textContent = '检索数据暂时无法加载。请刷新重试，或通过图书目录浏览。'; };
  async function loadIndex(url: string): Promise<SearchRecord[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Index HTTP ${response.status}`);
    return await response.json() as SearchRecord[];
  }
  function element<K extends keyof HTMLElementTagNameMap>(tag: K, text: string, className = ''): HTMLElementTagNameMap[K] {
    const result = document.createElement(tag); result.textContent = text; result.className = className; return result;
  }
  function render() {
    const showDrafts = drafts?.checked ?? false;
    const draftOption = state.querySelector<HTMLOptionElement>('option[value="draft"]');
    if (draftOption) draftOption.disabled = !showDrafts;
    if (!showDrafts && state.value === 'draft') state.value = 'all';
    const filters: Filters = { query: input.value, volume: volume.value, type: type.value, grade: grade.value, state: state.value, showDrafts };
    const data = filterRecords([...official, ...(showDrafts ? draftIndex ?? [] : [])], filters);
    results.replaceChildren();
    for (const record of data) {
      const card = element('a', '', 'result-card'); card.href = record.href;
      const meta = element('div', '', 'result-meta');
      meta.append(element('span', record.id, 'mono'), element('span', record.state === 'published' ? '已自动发布' : '草稿', record.state === 'published' ? 'badge' : 'badge draft-badge'), element('span', `${record.grade} 级证据 · AI 自动初评`));
      const footer = element('div', '', 'result-footer');
      footer.append(element('span', `第 ${record.volume} 卷 · 第 ${record.chapter} 章 · ${record.type}`), element('span', record.tags.join(' / ')));
      card.append(meta, element('h2', record.title), element('p', record.summary), footer); results.append(card);
    }
    empty.hidden = data.length > 0;
    count.textContent = `${data.length} 篇结果${showDrafts ? ' · 含草稿' : ''}`;
    const url = new URL(location.href);
    for (const [key,value] of Object.entries({ q: input.value, volume: volume.value, type: type.value, grade: grade.value, state: state.value })) {
      if (value && value !== 'all') url.searchParams.set(key,value); else url.searchParams.delete(key);
    }
    history.replaceState(null,'',url);
  }
  async function loadDrafts() {
    if (!drafts?.checked || library?.dataset.draftEnabled !== 'true') return;
    try {
      const draftIndexUrl=library.dataset.draftIndexUrl;
      if (!draftIndexUrl) throw new Error('Draft index unavailable');
      if (!draftIndex) { loadingDrafts ??= loadIndex(draftIndexUrl); draftIndex = await loadingDrafts; }
      render();
    } catch { loadingDrafts = null; if (drafts) drafts.checked = false; render(); showError(); }
  }
  form.addEventListener('submit', event => { event.preventDefault(); render(); });
  input.addEventListener('input', render);
  for (const select of [volume,type,grade,state]) select.addEventListener('change',render);
  drafts?.addEventListener('change', () => { error.hidden = true; render(); void loadDrafts(); });
  document.querySelector('#clear-filters')?.addEventListener('click', () => { input.value = ''; for (const control of [volume,type,grade,state]) control.value = 'all'; error.hidden = true; render(); input.focus(); });
  try { official = await loadIndex(library.dataset.searchIndexUrl!); if (drafts?.checked) await loadDrafts(); else render(); }
  catch { showError(); }
}
