let timer: number | undefined;

export function toast(message: string) {
  const el = document.querySelector<HTMLElement>('.toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(timer);
  timer = window.setTimeout(() => el.classList.remove('show'), 1800);
}

// bottoni "copia" sparsi nella pagina
document.addEventListener('click', async (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-copy]');
  if (!btn) return;
  const { copy } = await import('./actions');
  copy(btn.dataset.copy!, btn.dataset.copied ?? 'ok');
});
