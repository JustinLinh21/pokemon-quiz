// ===================== Einstellungen =====================
const SPIEL_DAUER = 60;                  // Sekunden pro Spiel
const ANZAHL_POKEMON = 151;              // 1. Generation
const PUNKTE_JE_TIPPS = [100, 70, 40];   // ohne Tipp, mit 1 Tipp, mit 2 Tipps
const SERIEN_BONUS = 10;                 // Extrapunkte pro Treffer in Folge
const MAX_SERIEN_BONUS = 50;
const PAUSE_NACH_RUNDE = 1100;           // Millisekunden, bevor das nächste kommt

// ===================== Elemente aus dem HTML =====================
const el = {
  name: document.getElementById("spieler-name"),
  startFehler: document.getElementById("start-fehler"),
  punkte: document.getElementById("punkte"),
  serie: document.getElementById("serie"),
  zeit: document.getElementById("zeit"),
  zeitBox: document.getElementById("zeit-box"),
  zeitBalken: document.getElementById("zeitbalken-fuellung"),
  bild: document.getElementById("pokemon-bild"),
  meldung: document.getElementById("meldung"),
  tippText: document.getElementById("tipp-text"),
  formular: document.getElementById("rate-formular"),
  tippFeld: document.getElementById("tipp-feld"),
  tippKnopf: document.getElementById("tipp-knopf"),
  ueberspringen: document.getElementById("ueberspringen-knopf"),
  endPunkte: document.getElementById("end-punkte"),
  endDetails: document.getElementById("end-details"),
  endHinweis: document.getElementById("end-hinweis"),
  endBereich: document.getElementById("end-rangliste-bereich"),
  endListe: document.getElementById("end-rangliste"),
  ranglisteListe: document.getElementById("rangliste-liste")
};

// ===================== Spielzustand =====================
let sprache = "de";
let modus = "frei";            // "frei" oder "rangliste"
let spielerName = "";
let punkte = 0;
let serie = 0;
let besteSerie = 0;
let anzahlRichtig = 0;
let tippStufe = 0;             // 0, 1 oder 2 Tipps benutzt
let spielLaeuft = false;
let gesperrt = true;           // true = gerade keine Eingabe möglich
let endZeit = 0;
let timerId = null;
let aktuelles = null;          // Das Pokémon, das man gerade errät
let naechstes = null;          // Das nächste wird schon im Voraus geladen
let gesehen = new Set();       // Damit nicht dasselbe zweimal kommt

// ===================== Hilfsfunktionen =====================

// Text in der aktuellen Sprache holen
function t(schluessel) {
  return TEXTE[sprache][schluessel];
}

function warte(ms) {
  return new Promise(function (fertig) { setTimeout(fertig, ms); });
}

// Macht Namen vergleichbar: "Mr. Mime" → "mrmime", "Flabébé" → "flabebe"
function normalisiere(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Nur einen Bildschirm anzeigen
function zeigeBildschirm(id) {
  document.querySelectorAll(".bildschirm").forEach(function (b) {
    b.classList.toggle("aktiv", b.id === id);
  });
}

// ===================== Sprache =====================
function setzeSprache(neueSprache) {
  sprache = neueSprache;
  speichereEinstellung("sprache", neueSprache);
  document.documentElement.lang = neueSprache;

  document.querySelectorAll("[data-text]").forEach(function (element) {
    element.textContent = t(element.dataset.text);
  });
  document.querySelectorAll("[data-platzhalter]").forEach(function (element) {
    element.placeholder = t(element.dataset.platzhalter);
  });
  document.querySelectorAll("[data-sprache]").forEach(function (knopf) {
    knopf.classList.toggle("aktiv", knopf.dataset.sprache === neueSprache);
  });

  aktualisiereTippKnopf();
  if (aktuelles) zeigeTipp();
  zeigeEndDetails();
}

function speichereEinstellung(schluessel, wert) {
  try { localStorage.setItem("silhouette-" + schluessel, wert); } catch (fehler) {}
}

function ladeEinstellung(schluessel) {
  try { return localStorage.getItem("silhouette-" + schluessel); } catch (fehler) { return null; }
}

// ===================== Pokémon von der API laden =====================
function zufallsId() {
  if (gesehen.size >= ANZAHL_POKEMON - 1) gesehen.clear();
  let id;
  do {
    id = Math.floor(Math.random() * ANZAHL_POKEMON) + 1;
  } while (gesehen.has(id));
  gesehen.add(id);
  return id;
}

async function holePokemon(id) {
  // Beide Anfragen gleichzeitig schicken, das ist schneller
  const [pokemonAntwort, speziesAntwort] = await Promise.all([
    fetch("https://pokeapi.co/api/v2/pokemon/" + id),
    fetch("https://pokeapi.co/api/v2/pokemon-species/" + id)
  ]);
  if (!pokemonAntwort.ok || !speziesAntwort.ok) {
    throw new Error("PokéAPI antwortet nicht richtig");
  }

  const daten = await pokemonAntwort.json();
  const spezies = await speziesAntwort.json();

  function nameIn(sprachCode) {
    return spezies.names.find(function (e) { return e.language.name === sprachCode; }).name;
  }

  const bildAdresse = daten.sprites.other["official-artwork"].front_default;
  await bildVorladen(bildAdresse);

  return {
    bild: bildAdresse,
    namen: { de: nameIn("de"), en: nameIn("en") },
    typen: daten.types.map(function (e) { return e.type.name; })
  };
}

// Bild schon herunterladen, damit es sofort erscheint
function bildVorladen(adresse) {
  return new Promise(function (fertig) {
    const bild = new Image();
    bild.onload = fertig;
    bild.onerror = fertig;
    bild.src = adresse;
  });
}

// Bis zu 3 Versuche, falls das Internet kurz hängt
async function ladeNaechstes() {
  for (let versuch = 1; versuch <= 3; versuch++) {
    try {
      return await holePokemon(zufallsId());
    } catch (fehler) {
      console.warn("Versuch " + versuch + " fehlgeschlagen", fehler);
    }
  }
  throw new Error("Keine Verbindung zur PokéAPI");
}

function starteVorladen() {
  naechstes = ladeNaechstes();
  naechstes.catch(function () {}); // Fehler wird später behandelt
}

// ===================== Spielablauf =====================
async function starteSpiel(neuerModus) {
  if (neuerModus === "rangliste") {
    const name = el.name.value.trim();
    if (name === "") {
      el.startFehler.textContent = t("nameFehlt");
      el.name.focus();
      return;
    }
    spielerName = name;
    speichereEinstellung("name", name);
  }
  el.startFehler.textContent = "";

  modus = neuerModus;
  punkte = 0;
  serie = 0;
  besteSerie = 0;
  anzahlRichtig = 0;
  aktuelles = null;
  gesehen.clear();
  aktualisiereAnzeige();
  el.zeit.textContent = SPIEL_DAUER;
  el.zeitBalken.style.transform = "scaleX(1)";
  el.zeitBox.classList.remove("knapp");
  el.bild.removeAttribute("src");
  el.tippText.textContent = "";
  zeigeMeldung(t("laden"), "");
  zeigeBildschirm("spiel");

  spielLaeuft = true;
  starteVorladen();
  await naechsteRunde();
  if (spielLaeuft) starteTimer(); // Uhr läuft erst, wenn das erste Bild da ist
}

async function naechsteRunde() {
  gesperrt = true;

  // Warten, bis das vorgeladene Pokémon da ist (bei Fehler neu versuchen)
  while (spielLaeuft) {
    try {
      aktuelles = await naechstes;
      break;
    } catch (fehler) {
      zeigeMeldung(t("verbindungFehler"), "fehler");
      await warte(1500);
      starteVorladen();
    }
  }
  if (!spielLaeuft) return;
  starteVorladen(); // schon das übernächste laden

  tippStufe = 0;
  el.bild.classList.remove("aufgedeckt");
  el.bild.src = aktuelles.bild;
  el.tippText.textContent = "";
  el.tippFeld.value = "";
  zeigeMeldung("", "");
  aktualisiereTippKnopf();
  gesperrt = false;
  el.tippFeld.focus();
}

function pruefeTipp(event) {
  event.preventDefault(); // Formular soll die Seite nicht neu laden
  if (gesperrt) return;

  const tipp = normalisiere(el.tippFeld.value);
  if (tipp === "") return;

  if (tipp === normalisiere(aktuelles.namen[sprache])) {
    const bonus = Math.min(serie * SERIEN_BONUS, MAX_SERIEN_BONUS);
    const gewonnen = PUNKTE_JE_TIPPS[tippStufe] + bonus;
    punkte += gewonnen;
    serie++;
    anzahlRichtig++;
    besteSerie = Math.max(besteSerie, serie);
    aktualisiereAnzeige();
    loeseAuf(t("richtig") + " · " + aktuelles.namen[sprache] + "  +" + gewonnen, "erfolg");
  } else {
    zeigeMeldung(t("falsch"), "fehler");
    // Wackel-Animation neu starten
    el.formular.classList.remove("wackeln");
    void el.formular.offsetWidth;
    el.formular.classList.add("wackeln");
    el.tippFeld.select();
  }
}

function ueberspringe() {
  if (gesperrt) return;
  serie = 0;
  aktualisiereAnzeige();
  loeseAuf(t("warEs") + " " + aktuelles.namen[sprache], "");
}

// Pokémon in Farbe zeigen, kurz warten, dann das nächste
async function loeseAuf(text, art) {
  gesperrt = true;
  el.bild.classList.add("aufgedeckt");
  zeigeMeldung(text, art);
  await warte(PAUSE_NACH_RUNDE);
  if (spielLaeuft) naechsteRunde();
}

// ===================== Tipps =====================
function gibTipp() {
  if (gesperrt || tippStufe >= 2) return;
  tippStufe++;
  zeigeTipp();
  aktualisiereTippKnopf();
  el.tippFeld.focus();
}

function zeigeTipp() {
  const teile = [];
  if (tippStufe >= 1) {
    const typen = aktuelles.typen.map(function (typ) { return TYPEN[sprache][typ] || typ; });
    teile.push(t("typ") + ": " + typen.join(" / "));
  }
  if (tippStufe >= 2) {
    const name = aktuelles.namen[sprache];
    teile.push(t("anfang") + ": " + name.charAt(0) + " _".repeat(name.length - 1));
  }
  el.tippText.textContent = teile.join("     ·     ");
}

function aktualisiereTippKnopf() {
  if (tippStufe === 0) {
    el.tippKnopf.textContent = t("tippTyp") + "  −" + (PUNKTE_JE_TIPPS[0] - PUNKTE_JE_TIPPS[1]);
  } else if (tippStufe === 1) {
    el.tippKnopf.textContent = t("tippAnfang") + "  −" + (PUNKTE_JE_TIPPS[1] - PUNKTE_JE_TIPPS[2]);
  } else {
    el.tippKnopf.textContent = t("tippLeer");
  }
  el.tippKnopf.disabled = tippStufe >= 2;
}

// ===================== Anzeige =====================
function aktualisiereAnzeige() {
  el.punkte.textContent = punkte;
  el.serie.textContent = serie;
}

function zeigeMeldung(text, art) {
  el.meldung.textContent = text;
  el.meldung.className = "meldung " + art;
}

// ===================== Timer =====================
function starteTimer() {
  endZeit = Date.now() + SPIEL_DAUER * 1000;
  clearInterval(timerId);
  timerId = setInterval(tick, 100);
  tick();
}

function tick() {
  const rest = Math.max(0, endZeit - Date.now());
  el.zeit.textContent = Math.ceil(rest / 1000);
  el.zeitBalken.style.transform = "scaleX(" + rest / (SPIEL_DAUER * 1000) + ")";
  el.zeitBox.classList.toggle("knapp", rest <= 10000);
  if (rest <= 0) beendeSpiel();
}

