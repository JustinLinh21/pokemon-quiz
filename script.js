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

