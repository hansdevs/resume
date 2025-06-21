// Note: You need to replace this with your own API key
const apiKey = "973ad735564a942c02b13be685b43bb7";

// Base URL
const api = "https://api.themoviedb.org/3/";

// Image URL
// Read docs here to get full info: https://developer.themoviedb.org/docs/image-basics
const imgUrl = "https://image.tmdb.org/t/p/";


// Don't need to touch this
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
    }
};

// Generic API call
async function makeAPICall(urlExtension, query) {
    const newURL = `${api}${urlExtension}?api_key=${apiKey}&${query}`;
    const result = await fetch(newURL, options);
    return result.json();
}

// Function to get popular movies
async function moviePopular(page) {
    const pageNum = page || 1;
    const urlExtension = "movie/popular";
    const requiredQuery = `language=en-US&page=${pageNum}`;
    return await makeAPICall(urlExtension, `${requiredQuery}`);
}

// Function to get popular people
async function peoplePopular(page) {
    const pageNum = page || 1;
    const urlExtension = "person/popular";
    const requiredQuery = `language=en-US&page=${pageNum}`;
    return await makeAPICall(urlExtension, `${requiredQuery}`);
}

// Function to get popular tv shows
async function tvPopular(page) {
    const pageNum = page || 1;
    const urlExtension = "tv/popular";
    const requiredQuery = `language=en-US&page=${pageNum}`;
    return await makeAPICall(urlExtension, `${requiredQuery}`);
}

// Function to get details for the specific movie
async function movieDetails(movieId) {
    const urlExtension = `movie/${movieId}`;
    const requiredQuery = "language=en-US";
    return await makeAPICall(urlExtension, `${requiredQuery}`);
}

// Function to get list of images for the movie
async function movieImages(movieId) {
    const urlExtension = `movie/${movieId}/images`;
    return await makeAPICall(urlExtension, "");
}

// **Newly Added Function to get credits for a movie**
async function movieCredits(movieId) {
    const urlExtension = `movie/${movieId}/credits`;
    return await makeAPICall(urlExtension, "language=en-US");
}

// Function for searching for movies
async function movieSearch(searchTerm, page) {
    const pageNum = page || 1;
    const urlExtension = "search/movie";
    const requiredQuery = `include_adult=false&language=en-US&page=${pageNum}`;
    const query = `query=${searchTerm}`;
    return await makeAPICall(urlExtension, `${requiredQuery}&${query}`);
}

// Function for searching for people
async function peopleSearch(searchTerm, page) {
    const pageNum = page || 1;
    const urlExtension = "search/person";
    const requiredQuery = `include_adult=false&language=en-US&page=${pageNum}`;
    const query = `query=${searchTerm}`;
    return await makeAPICall(urlExtension, `${requiredQuery}&${query}`);
}

// Function for searching for tv show
async function tvSearch(searchTerm, page) {
    const pageNum = page || 1;
    const urlExtension = "search/tv";
    const requiredQuery = `include_adult=false&language=en-US&page=${pageNum}`;
    const query = `query=${searchTerm}`;
    return await makeAPICall(urlExtension, `${requiredQuery}&${query}`);
}

// Function to get details for the specific person
async function personDetails(personId) {
    const urlExtension = `person/${personId}`;
    const requiredQuery = "language=en-US";
    return await makeAPICall(urlExtension, `${requiredQuery}`);
}

// Function to get list of images for a person
async function personImages(personId) {
    const urlExtension = `person/${personId}/images`;
    return await makeAPICall(urlExtension, "");
}

// Function to get combined credits for a person
async function personCombinedCredits(personId) {
    const urlExtension = `person/${personId}/combined_credits`;
    return await makeAPICall(urlExtension, `language=en-US`);
}

// Function to get details for the specific tv show
async function tvDetails(tvId) {
    const urlExtension = `tv/${tvId}`;
    const requiredQuery = "language=en-US";
    return await makeAPICall(urlExtension, `${requiredQuery}`);
}

// Function to get list of images for the tv show
async function tvImages(seriesId) {
    const urlExtension = `tv/${seriesId}/images`;
    return await makeAPICall(urlExtension, "");
}

// **Newly Added Function to get credits for a tv show**
async function tvCredits(tvId) {
    const urlExtension = `tv/${tvId}/credits`;
    return await makeAPICall(urlExtension, "language=en-US");
}

// Utility function to process a query string into a JSON object
function queryStringToJson(queryString) {
    // Remove the leading '?'
    if (queryString.startsWith("?")) {
        queryString = queryString.substring(1);
    }
    const pairs = queryString.split('&');
    const result = pairs.reduce((acc, pair) => {
        const queryPair = pair.split("=");
        acc[queryPair[0]] = queryPair[1];
        return acc;
    }, {});
    return result;
}
