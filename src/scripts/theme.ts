import { toggleTheme } from './actions';

document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => toggleTheme()));
