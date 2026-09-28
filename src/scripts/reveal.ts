// Fa comparire gli elementi [data-reveal] quando entrano nello schermo.
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  },
  { rootMargin: '0px 0px -8% 0px' },
);
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
