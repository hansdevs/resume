const queryObj = queryStringToJson(window.location.search);
const movieName = queryObj.query || "";

const movieResults = document.getElementById('movie-results');
const moviePagination = document.getElementById('movie-pagination');

let currentMoviePage = 1;
let totalMoviePages = 1;

async function loadMovies(page=1) {
    currentMoviePage = page;
    movieResults.innerHTML = "<p>Loading...</p>";
    moviePagination.innerHTML = "";

    let res;
    if (movieName) {
        res = await movieSearch(movieName, page);
    } else {
        res = await moviePopular(page);
    }

    // Filter out adult results
    const safeMovies = res.results.filter(m => !m.adult);

    movieResults.innerHTML = "";
    if (safeMovies.length > 0) {
        safeMovies.forEach(m => {
            const card = createCard(m, 'movie');
            movieResults.appendChild(card);
        });
        totalMoviePages = res.total_pages;
        const paginationElem = createPaginationButtons(currentMoviePage, totalMoviePages, loadMovies);
        moviePagination.appendChild(paginationElem);
    } else {
        movieResults.innerHTML = "<p>No PG-13 or lower results found.</p>";
    }
}

loadMovies();
