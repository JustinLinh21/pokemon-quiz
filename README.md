# Wer ist das Pokémon?

Ein Browser-Quiz im Stil eines Silhouetten-Rätsels: Ein zufälliges Pokémon erscheint als schwarze Silhouette, und du hast **60 Sekunden**, um so viele wie möglich zu erraten.

**[Jetzt online spielen](https://justinlinh21.github.io/pokemon-quiz/)**

## Features

- **60-Sekunden-Runden** mit Zeitbalken
- **Punktesystem**: 100 Punkte pro Treffer, dazu ein Serienbonus für Treffer in Folge
- **Tipps**: Typ oder Anfangsbuchstabe, die aber Punkte kosten
- **Deutsch und Englisch** wählbar, für die Pokémon-Namen und die ganze Oberfläche
- **Rangliste** mit Spielernamen, oder ein freies Spiel ohne Rangliste
- Das nächste Pokémon wird im Hintergrund vorgeladen, deshalb gibt es keine Wartezeit
- Läuft auch auf dem Handy

## Technik

- **HTML, CSS und JavaScript** ohne Frameworks
- **[PokéAPI](https://pokeapi.co/)**, eine gratis REST-API
  - `/api/v2/pokemon/{id}` für Bild und Typen
  - `/api/v2/pokemon-species/{id}` für die Namen in allen Sprachen
- **[Supabase](https://supabase.com/)** als Datenbank für die weltweite Rangliste, mit Row Level Security (siehe [SUPABASE.md](SUPABASE.md))
- `fetch` mit `async`/`await`, `Promise.all` für parallele Anfragen

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Aufbau der vier Bildschirme (Start, Spiel, Ende, Rangliste) |
| `style.css` | Design |
| `script.js` | Spiellogik: Timer, Punkte, Tipps, API-Aufrufe |
| `texte.js` | Alle Texte auf Deutsch und Englisch |
| `rangliste.js` | Rangliste speichern und laden (online oder lokal) |
| `config.js` | Zugangsdaten für Supabase |

## Lokal starten

1. Repository klonen und den Ordner in VS Code öffnen
2. Mit der Erweiterung **Live Server**: Rechtsklick auf `index.html` → *Open with Live Server*

## Was ich dabei gelernt habe

- Daten von einer REST-API holen und JSON auswerten
- Mehrere API-Aufrufe kombinieren und parallel ausführen
- Das HTML mit JavaScript verändern (DOM), Bildschirme wechseln
- Eine Datenbank sicher an eine Webseite anbinden
- Eine Seite mehrsprachig machen
