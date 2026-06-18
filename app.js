/**
 * VibeFlix — connexion à l'API TMDb
 * Remplacez YOUR_API_KEY par votre clé : https://www.themoviedb.org/settings/api
 */
const TMDB_API_KEY = "8c89760ca24abfe0512b0a2a26e67835";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_LANGUAGE = "fr-FR";
const PLACEHOLDER_POSTER = "https://via.placeholder.com/500x750/1a1f3a/d4af37?text=Pas+d%27affiche";

const moviesGrid = document.getElementById("movies-grid");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resetBtn = document.getElementById("reset-btn");
const genreFilter = document.getElementById("genre-filter");
const sortSelect = document.getElementById("sort-select");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const resultCountEl = document.getElementById("result-count");

let genreMap = {};
let currentMovies = [];
let currentQuery = "";

/**
 * Construit l'URL d'une requête TMDb avec la clé API et la langue.
 */
function buildUrl(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", TMDB_LANGUAGE);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

/**
 * Extrait un message d'erreur lisible depuis une réponse TMDb.
 */
async function parseApiError(response) {
  try {
    const data = await response.json();
    if (data.status_message) {
      return data.status_message;
    }
  } catch {
    /* ignore JSON parse errors */
  }
  return `${response.status} ${response.statusText}`;
}

/**
 * Récupère la liste des genres depuis l'API TMDb.
 */
async function fetchGenres() {
  const response = await fetch(buildUrl("/genre/movie/list"));

  if (!response.ok) {
    throw new Error(`Erreur genres (${await parseApiError(response)})`);
  }

  const data = await response.json();
  return data.genres ?? [];
}

/**
 * Remplit le menu déroulant des genres.
 */
function populateGenreFilter(genres) {
  genreMap = Object.fromEntries(genres.map((g) => [String(g.id), g.name]));

  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = String(genre.id);
    option.textContent = genre.name;
    genreFilter.appendChild(option);
  });
}

/**
 * Récupère les films depuis l'API TMDb.
 */
async function fetchMovies(query = "") {
  const endpoint = query ? "/search/movie" : "/movie/popular";
  const params = query ? { query } : {};

  const response = await fetch(buildUrl(endpoint, params));

  if (!response.ok) {
    throw new Error(`Erreur API : ${await parseApiError(response)}`);
  }

  const data = await response.json();
  return data.results ?? [];
}

/**
 * Formate la note sur 10 avec une décimale.
 */
function formatRating(voteAverage) {
  if (voteAverage == null || Number.isNaN(voteAverage)) {
    return "N/A";
  }
  return `${voteAverage.toFixed(1)}/10`;
}

/**
 * Retourne l'URL de l'affiche ou une image de remplacement.
 */
function getPosterUrl(posterPath) {
  if (!posterPath) {
    return PLACEHOLDER_POSTER;
  }
  return `${TMDB_IMAGE_BASE}${posterPath}`;
}

/**
 * Retourne les noms de genres pour un film.
 */
function getGenreNames(genreIds = []) {
  return genreIds.map((id) => genreMap[String(id)]).filter(Boolean);
}

/**
 * Filtre les films par genre sélectionné.
 */
function filterByGenre(movies, genreId) {
  if (!genreId) {
    return movies;
  }
  return movies.filter((movie) => (movie.genre_ids ?? []).includes(Number(genreId)));
}

/**
 * Trie les films selon l'option choisie.
 */
function sortMovies(movies, sortBy) {
  const sorted = [...movies];

  switch (sortBy) {
    case "rating-desc":
      return sorted.sort((a, b) => b.vote_average - a.vote_average);
    case "rating-asc":
      return sorted.sort((a, b) => a.vote_average - b.vote_average);
    case "release-desc":
      return sorted.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
    case "title-asc":
      return sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? "", "fr"));
    case "popularity":
    default:
      return sorted.sort((a, b) => b.popularity - a.popularity);
  }
}

/**
 * Applique filtres et tri puis affiche les films.
 */
function applyFiltersAndRender() {
  const genreId = genreFilter.value;
  const sortBy = sortSelect.value;

  const filtered = filterByGenre(currentMovies, genreId);
  const sorted = sortMovies(filtered, sortBy);

  renderMovies(sorted);

  if (currentMovies.length > 0) {
    const countLabel =
      filtered.length === 1 ? "1 film affiché" : `${filtered.length} films affichés`;
    resultCountEl.textContent = countLabel;
    resultCountEl.hidden = false;
  } else {
    resultCountEl.hidden = true;
  }
}

/**
 * Crée la carte DOM d'un film (titre, affiche, note, genres).
 */
function createMovieCard(movie, index = 0) {
  const card = document.createElement("article");
  card.className = "movie-card";
  card.style.setProperty("--fade-delay", `${Math.min(index * 0.05, 0.6)}s`);

  const img = document.createElement("img");
  img.className = "movie-poster";
  img.src = getPosterUrl(movie.poster_path);
  img.alt = `Affiche de ${movie.title ?? "film inconnu"}`;
  img.loading = "lazy";
  img.addEventListener("error", () => {
    img.src = PLACEHOLDER_POSTER;
  });

  const info = document.createElement("div");
  info.className = "movie-info";

  const title = document.createElement("h3");
  title.className = "movie-title";
  title.textContent = movie.title ?? "Sans titre";

  const rating = document.createElement("p");
  rating.className = "movie-rating";
  const ratingText = formatRating(movie.vote_average);
  rating.textContent = ratingText;
  rating.setAttribute(
    "aria-label",
    movie.vote_average != null
      ? `Note : ${movie.vote_average.toFixed(1)} sur 10`
      : "Note non disponible",
  );

  info.appendChild(title);
  info.appendChild(rating);

  if (movie.release_date) {
    const year = document.createElement("p");
    year.className = "movie-year";
    year.textContent = movie.release_date.slice(0, 4);
    info.appendChild(year);
  }

  const genreNames = getGenreNames(movie.genre_ids);
  if (genreNames.length > 0) {
    const genresEl = document.createElement("ul");
    genresEl.className = "movie-genres";
    genresEl.setAttribute("aria-label", "Genres");

    genreNames.slice(0, 3).forEach((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      genresEl.appendChild(li);
    });

    info.appendChild(genresEl);
  }

  card.appendChild(img);
  card.appendChild(info);

  return card;
}

/**
 * Affiche la liste de films dans la grille.
 */
function renderMovies(movies) {
  moviesGrid.replaceChildren();

  if (movies.length === 0) {
    const empty = document.createElement("p");
    empty.className = "no-results";
    empty.textContent = "Aucun film trouvé.";
    moviesGrid.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  movies.forEach((movie, index) => {
    fragment.appendChild(createMovieCard(movie, index));
  });
  moviesGrid.appendChild(fragment);
}

function setLoading(isLoading) {
  loadingEl.hidden = !isLoading;
  moviesGrid.classList.toggle("is-loading", isLoading);
  moviesGrid.setAttribute("aria-busy", String(isLoading));
}

function showError(message = "") {
  errorEl.textContent = message;
  errorEl.hidden = !message;
}

function isApiKeyMissing() {
  return !TMDB_API_KEY || TMDB_API_KEY === "YOUR_API_KEY";
}

/**
 * Charge et affiche les films (populaires ou résultats de recherche).
 */
async function loadMovies(query = "") {
  if (isApiKeyMissing()) {
    showError("Ajoutez votre clé API TMDb dans app.js (const TMDB_API_KEY).");
    return;
  }

  setLoading(true);
  showError("");
  resultCountEl.hidden = true;

  try {
    currentQuery = query.trim();
    currentMovies = await fetchMovies(currentQuery);
    applyFiltersAndRender();
  } catch (error) {
    console.error(error);
    currentMovies = [];
    moviesGrid.replaceChildren();
    showError(error.message || "Impossible de charger les films.");
  } finally {
    setLoading(false);
  }
}

function resetFilters() {
  genreFilter.value = "";
  sortSelect.value = "popularity";
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadMovies(searchInput.value);
});

resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  resetFilters();
  loadMovies("");
});

genreFilter.addEventListener("change", () => {
  if (currentMovies.length > 0) {
    applyFiltersAndRender();
  }
});

sortSelect.addEventListener("change", () => {
  if (currentMovies.length > 0) {
    applyFiltersAndRender();
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  if (isApiKeyMissing()) {
    showError("Ajoutez votre clé API TMDb dans app.js (const TMDB_API_KEY).");
    return;
  }

  try {
    const genres = await fetchGenres();
    populateGenreFilter(genres);
  } catch (error) {
    console.error(error);
    showError("Impossible de charger les genres.");
  }

  loadMovies();
});
