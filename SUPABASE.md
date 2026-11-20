# Weltweite Rangliste mit Supabase einrichten

Solange `config.js` leer ist, speichert das Spiel die Rangliste nur im eigenen Browser.
Damit **alle Spieler die gleiche Rangliste** sehen, braucht es eine Datenbank im Internet.
Dafür nutzen wir [Supabase](https://supabase.com). Das ist gratis und braucht keine Kreditkarte.

## 1. Projekt erstellen

1. Auf [supabase.com](https://supabase.com) mit GitHub anmelden
2. **New project** → Name z.B. `pokemon-quiz`, Region **Central EU (Zurich)** oder **Frankfurt**
3. Ein Datenbank-Passwort wird verlangt: einfach generieren lassen (wir brauchen es nicht)

## 2. Tabelle anlegen

Links auf **SQL Editor** → **New query**, das hier einfügen und auf **Run** klicken:

```sql
-- Tabelle für die Punkte
create table public.scores (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 20),
  score integer not null check (score between 0 and 20000),
  created_at timestamptz not null default now()
);

-- Sicherheit: Jeder darf lesen und neue Punkte eintragen,
-- aber niemand darf fremde Einträge ändern oder löschen.
alter table public.scores enable row level security;

create policy "Alle duerfen lesen"
  on public.scores for select to anon using (true);

create policy "Alle duerfen eintragen"
  on public.scores for insert to anon with check (true);

grant select, insert on public.scores to anon;
```

## 3. Schlüssel in config.js eintragen

Unter **Project Settings → API Keys** (bzw. **Data API**) findest du:

- die **Project URL**, z.B. `https://abcdefgh.supabase.co`
- den **publishable** Key (oder bei älteren Projekten den **anon public** Key)

Diese zwei Werte in `config.js` eintragen. Dieser Schlüssel darf öffentlich sein: Er erlaubt nur das,
was die Regeln oben erlauben (lesen und eintragen). Den **secret** bzw. **service_role** Key
niemals hier eintragen!
