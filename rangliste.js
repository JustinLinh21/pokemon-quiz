// Die Rangliste kann an zwei Orten gespeichert werden:
// - online in einer Supabase-Datenbank (alle Spieler sehen alle Punkte)
// - lokal im Browser (nur auf diesem Gerät), falls config.js leer ist

const LOKALER_SCHLUESSEL = "silhouette-rangliste";
const ANZAHL_PLAETZE = 20;

const Rangliste = {
  online: SUPABASE_URL !== "" && SUPABASE_KEY !== "",

  // Gibt die besten Einträge zurück: [{ name, punkte }, ...]
  async laden() {
    if (!this.online) {
      return lokalLesen().slice(0, ANZAHL_PLAETZE);
    }

    const adresse = SUPABASE_URL + "/rest/v1/scores"
      + "?select=name,score&order=score.desc,created_at.asc&limit=" + ANZAHL_PLAETZE;
    const antwort = await fetch(adresse, { headers: supabaseKoepfe() });
    if (!antwort.ok) {
      throw new Error("Rangliste laden fehlgeschlagen: " + antwort.status);
    }
    const zeilen = await antwort.json();
    return zeilen.map(function (zeile) {
      return { name: zeile.name, punkte: zeile.score };
    });
  },

  // Speichert einen neuen Punktestand
  async speichern(name, punkte) {
    if (!this.online) {
      const liste = lokalLesen();
      liste.push({ name: name, punkte: punkte });
      liste.sort(function (a, b) { return b.punkte - a.punkte; });
      lokalSchreiben(liste.slice(0, 100));
      return;
    }

    const antwort = await fetch(SUPABASE_URL + "/rest/v1/scores", {
      method: "POST",
      headers: Object.assign(supabaseKoepfe(), {
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      }),
      body: JSON.stringify({ name: name, score: punkte })
    });
    if (!antwort.ok) {
      throw new Error("Speichern fehlgeschlagen: " + antwort.status);
    }
  }
};

// Supabase will den Schlüssel in jeder Anfrage sehen
function supabaseKoepfe() {
  const koepfe = { apikey: SUPABASE_KEY };
  // Alte Schlüssel (beginnen mit "eyJ") brauchen zusätzlich diesen Kopf
  if (SUPABASE_KEY.startsWith("eyJ")) {
    koepfe.Authorization = "Bearer " + SUPABASE_KEY;
  }
  return koepfe;
}

// localStorage kann in manchen Browsern blockiert sein, darum try/catch
function lokalLesen() {
  try {
    return JSON.parse(localStorage.getItem(LOKALER_SCHLUESSEL)) || [];
  } catch (fehler) {
    return [];
  }
}

function lokalSchreiben(liste) {
  try {
    localStorage.setItem(LOKALER_SCHLUESSEL, JSON.stringify(liste));
  } catch (fehler) {
    // Nicht schlimm, dann wird eben nichts gespeichert
  }
}
