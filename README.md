# Wer ist das Pokémon? 🎮

Ein kleines Browser-Quiz: Ein zufälliges Pokémon erscheint als schwarze Silhouette und du musst seinen **deutschen Namen** erraten. Bei richtigem Tipp wird das Pokémon in Farbe angezeigt.

▶️ **[Jetzt online spielen](https://justinlinh21.github.io/pokemon-quiz/)**

## Features

- Zufälliges Pokémon aus der 1. Generation (Nr. 1–151)
- Silhouetten-Effekt mit CSS (`filter: brightness(0)`)
- Deutsche Namen über einen zweiten API-Aufruf
- Gross- und Kleinschreibung egal, Raten auch mit der Enter-Taste

## Technik

- **HTML, CSS und JavaScript** ohne Frameworks
- **[PokéAPI](https://pokeapi.co/)**, eine gratis REST-API ohne API-Key
  - `/api/v2/pokemon/{id}` für Bild und Grunddaten
  - `/api/v2/pokemon-species/{id}` für die Namen in allen Sprachen
- `fetch` mit `async`/`await`

## Starten

1. Repository herunterladen oder klonen
2. Ordner in VS Code öffnen
3. Mit der Erweiterung **Live Server**: Rechtsklick auf `index.html` → *Open with Live Server*

## Was ich dabei gelernt habe

- Wie man Daten von einer API mit `fetch` holt
- JSON-Antworten lesen und die richtigen Daten herausholen
- Zwei API-Aufrufe kombinieren
- Das HTML mit JavaScript verändern (DOM)
