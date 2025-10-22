/**
 * Stage 1 - String Analyzer Service
 * Author: Abdullateef Dauda
 */

const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// In-memory data store
const stringsDB = new Map();

/**
 * Utility functions
 */
function analyzeString(value) {
  const cleanValue = value.toLowerCase().replace(/\s+/g, " ").trim();
  const length = value.length;
  const is_palindrome = cleanValue === cleanValue.split("").reverse().join("");
  const unique_characters = new Set(value).size;
  const word_count = value.trim().split(/\s+/).length;
  const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");

  const character_frequency_map = {};
  for (let char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}

/**
 * 1️⃣ POST /strings — Analyze or Create
 */
app.post("/strings", (req, res) => {
  const { value } = req.body;

  if (typeof value === "undefined") {
    return res.status(400).json({ error: 'Missing "value" field' });
  }

  if (typeof value !== "string") {
    return res.status(422).json({ error: '"value" must be a string' });
  }

  const { sha256_hash, ...props } = analyzeString(value);

  if (stringsDB.has(sha256_hash)) {
    return res.status(409).json({ error: "String already exists" });
  }

  const record = {
    id: sha256_hash,
    value,
    properties: { ...props, sha256_hash },
    created_at: new Date().toISOString(),
  };

  stringsDB.set(sha256_hash, record);
  return res.status(201).json(record);
});

/**
 * 2️⃣ GET /strings/:string_value — Get specific string
 */
app.get("/strings/:string_value", (req, res) => {
  const { string_value } = req.params;
  const sha256_hash = crypto.createHash("sha256").update(string_value).digest("hex");

  if (!stringsDB.has(sha256_hash)) {
    return res.status(404).json({ error: "String not found" });
  }

  return res.status(200).json(stringsDB.get(sha256_hash));
});

/**
 * 3️⃣ GET /strings — Filtering with query parameters
 */
app.get("/strings", (req, res) => {
  let results = Array.from(stringsDB.values());
  const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;

  if (is_palindrome) {
    results = results.filter(
      (r) => r.properties.is_palindrome === (is_palindrome === "true")
    );
  }

  if (min_length) {
    results = results.filter((r) => r.properties.length >= Number(min_length));
  }

  if (max_length) {
    results = results.filter((r) => r.properties.length <= Number(max_length));
  }

  if (word_count) {
    results = results.filter((r) => r.properties.word_count === Number(word_count));
  }

  if (contains_character) {
    results = results.filter((r) => r.value.includes(contains_character));
  }

  return res.status(200).json({
    data: results,
    count: results.length,
    filters_applied: req.query,
  });
});

/**
 * 4️⃣ GET /strings/filter-by-natural-language — Natural language parsing
 */
app.get("/strings/filter-by-natural-language", (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Missing 'query' parameter" });

  const q = query.toLowerCase();
  const filters = {};

  if (q.includes("palindromic")) filters.is_palindrome = true;
  if (q.includes("single word")) filters.word_count = 1;
  if (q.includes("longer than")) {
    const match = q.match(/longer than (\d+)/);
    if (match) filters.min_length = parseInt(match[1]) + 1;
  }
  if (q.includes("containing the letter")) {
    const match = q.match(/letter\s([a-z])/);
    if (match) filters.contains_character = match[1];
  }
  if (q.includes("containing the first vowel")) filters.contains_character = "a";

  if (Object.keys(filters).length === 0)
    return res.status(400).json({ error: "Unable to parse query" });

  // Reuse existing filter logic
  let results = Array.from(stringsDB.values());
  if (filters.is_palindrome)
    results = results.filter((r) => r.properties.is_palindrome === true);
  if (filters.word_count)
    results = results.filter((r) => r.properties.word_count === filters.word_count);
  if (filters.min_length)
    results = results.filter((r) => r.properties.length >= filters.min_length);
  if (filters.contains_character)
    results = results.filter((r) => r.value.includes(filters.contains_character));

  return res.status(200).json({
    data: results,
    count: results.length,
    interpreted_query: {
      original: query,
      parsed_filters: filters,
    },
  });
});

/**
 * 5️⃣ DELETE /strings/:string_value — Delete a string
 */
app.delete("/strings/:string_value", (req, res) => {
  const { string_value } = req.params;
  const sha256_hash = crypto.createHash("sha256").update(string_value).digest("hex");

  if (!stringsDB.has(sha256_hash)) {
    return res.status(404).json({ error: "String not found" });
  }

  stringsDB.delete(sha256_hash);
  return res.status(204).send();
});

/**
 * Server setup
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`String Analyzer API running on port ${PORT}`));
