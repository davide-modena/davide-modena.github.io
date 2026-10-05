---
# ─── Intestazione dell'articolo ──────────────────────────────────────────────
# Il titolo e la data sono già compilati da `npm run new "titolo"`.
title: "{{title}}"
description: "Una frase che riassume l'articolo: compare nella lista e nelle anteprime."
date: {{date}}              # data di pubblicazione (AAAA-MM-GG), mostrata sull'articolo
# updated: 2026-12-01       # facoltativo: toglilo dal commento se modifichi l'articolo in seguito
tags: [web, appunti]        # facoltativo
lang: {{lang}}              # it oppure en
draft: true                 # true = lo vedi solo con `npm run dev`; metti false per pubblicarlo
---

Scrivi qui l'articolo in Markdown. Il titolo è già nell'intestazione, quindi si parte direttamente dal testo:
paragrafi normali, **grassetto**, *corsivo* e [link](https://davide-modena.github.io).

## Titoli di sezione

Ogni `##` diventa un titolo di sezione (con il piccolo `##` viola davanti). Per i sottotitoli usa `###`.

### Un sottotitolo

Il codice nella riga si scrive così: `npm run dev`. Compare in arancione.

## Codice

I blocchi di codice sono colorati da soli: basta indicare il linguaggio dopo i tre apici.

```ts
// i tipi, le funzioni, tutto evidenziato
export function saluta(nome: string) {
  return `Ciao ${nome}!`;
}
```

```bash
npm run new "Il mio prossimo articolo"
```

## Liste e citazioni

- una lista ha le frecce davanti
- ogni voce è una riga che inizia con `-`
- si possono mettere anche link e `codice`

> Una citazione ha la riga viola a sinistra. Va bene per una frase importante o una battuta.

1. Anche le liste numerate
2. funzionano

## Immagini

Metti il file in `src/assets/blog/` e richiamalo così (ottimizzato in automatico):

```md
![Descrizione dell'immagine](../../assets/blog/nome-file.png)
```

## Tabelle

| Cosa      | Come            |
| --------- | --------------- |
| Scrivi    | un file `.md`   |
| Pubblichi | `git push`      |

---

Una riga orizzontale separa le parti. Per pubblicare: `draft: false`, poi `git add -A`, `git commit` e `git push`:
il sito si aggiorna da solo in un paio di minuti.
