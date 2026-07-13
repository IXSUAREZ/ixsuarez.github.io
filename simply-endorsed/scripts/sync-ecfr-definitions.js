#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const { JSDOM } = require("../node_modules/jsdom");
const committed = require("../js/regulatory-definitions-data.js");

const args = new Set(process.argv.slice(2));
const TITLES_URL = "https://www.ecfr.gov/api/versioner/v1/titles.json";
if (args.has("--help")) {
  console.log("Usage: node scripts/sync-ecfr-definitions.js [--check|--diff]");
  console.log("Fetches the dated official eCFR XML, validates it, and compares it with committed data. It never writes files.");
  process.exit(0);
}
if ([...args].some((arg) => arg !== "--check" && arg !== "--diff")) {
  throw new Error("Unknown argument. Supported modes are --check and --diff.");
}

const PART1_TERMS = new Set([
  "Aircraft",
  "Category:",
  "Class:",
  "Crewmember",
  "Flight time",
  "Flight training device (FTD)",
  "Full flight simulator (FFS)",
  "Night",
  "Pilot in command",
  "Second in command"
]);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function cleanTerm(value) {
  return String(value || "").trim().replace(/[,:.]$/, "").trim();
}

function slugify(value) {
  return cleanTerm(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseSection(xml, expectedSection) {
  const document = new JSDOM(xml, { contentType: "text/xml" }).window.document;
  const root = document.querySelector('DIV8[TYPE="SECTION"]');
  if (!root || root.getAttribute("N") !== expectedSection) {
    throw new Error("Fail closed: expected section " + expectedSection + " in eCFR XML.");
  }
  const head = root.querySelector(":scope > HEAD");
  if (!head || head.textContent.indexOf("§ " + expectedSection) !== 0) {
    throw new Error("Fail closed: section heading did not match " + expectedSection + ".");
  }

  const paragraphs = Array.from(root.querySelectorAll(":scope > P"));
  const definitions = [];
  let current = null;
  paragraphs.forEach((paragraph) => {
    const first = paragraph.firstElementChild;
    if (first && first.tagName === "I") {
      if (current) definitions.push(current);
      const rawTerm = first.textContent.trim();
      current = {
        rawTerm,
        id: slugify(rawTerm),
        term: cleanTerm(rawTerm),
        officialText: paragraph.textContent.trim()
      };
      return;
    }
    if (current) current.officialText += "\n" + paragraph.textContent.trim();
  });
  if (current) definitions.push(current);

  definitions.forEach((entry) => {
    if (!entry.id || !entry.officialText) {
      throw new Error("Fail closed: invalid parsed definition " + entry.rawTerm + ".");
    }
  });
  return { document, paragraphs, definitions };
}

function compareEntries(label, actual, expected) {
  const differences = [];
  if (actual.length !== expected.length) {
    differences.push(label + " count: API=" + actual.length + " committed=" + expected.length);
  }
  const expectedMap = new Map(expected.map((entry) => [entry.id, entry]));
  actual.forEach((entry) => {
    const prior = expectedMap.get(entry.id);
    if (!prior) {
      differences.push(label + " added: " + entry.term + " [" + entry.id + "]");
      return;
    }
    if (prior.term !== entry.term) differences.push(label + " term changed: " + entry.id);
    if (prior.officialText !== entry.officialText) differences.push(label + " official text changed: " + entry.id);
    expectedMap.delete(entry.id);
  });
  expectedMap.forEach((entry) => differences.push(label + " missing from API: " + entry.term + " [" + entry.id + "]"));
  return differences;
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { Accept: "application/xml" } });
  if (!response.ok) throw new Error("eCFR request failed " + response.status + " for " + url);
  const text = await response.text();
  if (!text.startsWith("<?xml")) throw new Error("Fail closed: eCFR response was not XML for " + url);
  return text;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("eCFR request failed " + response.status + " for " + url);
  const value = await response.json();
  if (!value || typeof value !== "object") throw new Error("Fail closed: eCFR response was not JSON for " + url);
  return value;
}

function datedApiUrl(source, date) {
  return source.apiUrl.replace(/\/full\/\d{4}-\d{2}-\d{2}\//, "/full/" + date + "/");
}

async function main() {
  const source61 = committed.meta.sources.part61;
  const source1 = committed.meta.sources.part1;
  const titleStatus = await fetchJson(TITLES_URL);
  if (!titleStatus.meta || titleStatus.meta.import_in_progress !== false) {
    throw new Error("Fail closed: the eCFR Title import is in progress or its status is unavailable.");
  }
  const title14 = Array.isArray(titleStatus.titles)
    ? titleStatus.titles.find((title) => Number(title.number) === 14)
    : null;
  if (!title14 || !title14.up_to_date_as_of) {
    throw new Error("Fail closed: Title 14 status is missing from the eCFR API.");
  }
  const liveDate = title14.up_to_date_as_of;
  const [xml61, xml1] = await Promise.all([
    fetchText(datedApiUrl(source61, liveDate)),
    fetchText(datedApiUrl(source1, liveDate))
  ]);

  const hash61 = sha256(xml61);
  const hash1 = sha256(xml1);
  const parsed61 = parseSection(xml61, "61.1");
  const parsed1 = parseSection(xml1, "1.1");

  if (parsed61.definitions.length !== 23) {
    throw new Error("Fail closed: expected exactly 23 direct §61.1 definition starters, found " + parsed61.definitions.length + ".");
  }
  if (new Set(parsed61.definitions.map((entry) => entry.id)).size !== 23) {
    throw new Error("Fail closed: duplicate direct §61.1 definition identifiers.");
  }
  const selected1 = parsed1.definitions.filter((entry) => PART1_TERMS.has(entry.rawTerm));
  if (selected1.length !== PART1_TERMS.size) {
    const found = new Set(selected1.map((entry) => entry.rawTerm));
    const missing = [...PART1_TERMS].filter((term) => !found.has(term));
    throw new Error("Fail closed: missing instructor-critical §1.1 terms: " + missing.join(", "));
  }
  if (new Set(selected1.map((entry) => entry.id)).size !== PART1_TERMS.size) {
    throw new Error("Fail closed: duplicate instructor-critical §1.1 definition identifiers.");
  }

  const applicability = parsed61.paragraphs.slice(0, 4).map((paragraph) => paragraph.textContent.trim()).join("\n");
  if (!applicability.startsWith("(a) Except as provided") || parsed61.paragraphs[4].textContent.trim() !== "(b) For the purpose of this part:") {
    throw new Error("Fail closed: §61.1 applicability/definition boundary changed.");
  }

  const differences = [];
  if (titleStatus.meta.date !== committed.meta.currentThrough) {
    differences.push("eCFR completed-import date advanced: API=" + titleStatus.meta.date + " committed=" + committed.meta.currentThrough);
  }
  if (title14.up_to_date_as_of !== committed.meta.title14.upToDateAsOf) {
    differences.push("Title 14 up-to-date date changed: API=" + title14.up_to_date_as_of + " committed=" + committed.meta.title14.upToDateAsOf);
  }
  if (title14.latest_amended_on !== committed.meta.title14.latestAmendedOn) {
    differences.push("Title 14 latest-amended date changed: API=" + title14.latest_amended_on + " committed=" + committed.meta.title14.latestAmendedOn);
  }
  if (title14.latest_issue_date !== committed.meta.title14.latestIssueDate) {
    differences.push("Title 14 latest-issue date changed: API=" + title14.latest_issue_date + " committed=" + committed.meta.title14.latestIssueDate);
  }
  if (hash61 !== source61.sha256) differences.push("§61.1 XML SHA-256 changed: " + hash61);
  if (hash1 !== source1.sha256) differences.push("§1.1 XML SHA-256 changed: " + hash1);
  if (applicability !== committed.applicability.officialText) differences.push("§61.1(a) applicability text changed");
  differences.push(...compareEntries("§61.1", parsed61.definitions, committed.part61Definitions));
  differences.push(...compareEntries("§1.1 curated", selected1, committed.part1Definitions));

  if (differences.length) {
    console.error("eCFR definitions snapshot differs from committed data:");
    differences.forEach((difference) => console.error("- " + difference));
    console.error("No files were written. Review the official change and update official data separately from curation.");
    process.exit(1);
  }

  console.log("eCFR definitions check passed.");
  console.log("- §61.1: 23 definitions; SHA-256 " + hash61);
  console.log("- §1.1: " + selected1.length + " curated terms; SHA-256 " + hash1);
  console.log("- Title 14 completed import through " + liveDate + "; no files written.");
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
});
