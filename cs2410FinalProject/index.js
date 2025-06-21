const movieSection = document.getElementById('movie-section');
const tvSection = document.getElementById('tv-section');
const personSection = document.getElementById('person-section');

async function loadDashboard() {
    const queryObj = queryStringToJson(window.location.search);
    const searchTerm = queryObj.query;

    let movieRes, tvRes, personRes;
    if (searchTerm) {
        movieRes = await movieSearch(searchTerm, 1);
        tvRes = await tvSearch(searchTerm, 1);
        personRes = await peopleSearch(searchTerm, 1);
    } else {
        movieRes = await moviePopular(1);
        tvRes = await tvPopular(1);
        personRes = await peoplePopular(1);
    }

    // Remove adult movies
    const safeMovies = movieRes.results.filter(m => !m.adult);
    safeMovies.slice(0,8).forEach(m => {
        movieSection.appendChild(createCard(m, 'movie'));
    });

    // Remove adult TV shows
    const safeTV = tvRes.results.filter(t => !t.adult);
    safeTV.slice(0,8).forEach(t => {
        tvSection.appendChild(createCard(t, 'tv'));
    });

    // People generally safe, but just in case:
    const safePeople = personRes.results.filter(p => !p.adult);
    safePeople.slice(0,8).forEach(p => {
        personSection.appendChild(createCard(p, 'person'));
    });
}

loadDashboard();
