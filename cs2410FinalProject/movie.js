const queryObj = queryStringToJson(window.location.search);
const movieId = queryObj.id;

const movieDetailsDiv = document.getElementById('movie-details');
const movieGallery = document.getElementById('movie-gallery-inner');
const movieCreditsDiv = document.getElementById('movie-credits');

async function loadMovieDetails() {
    if(!movieId) {
        movieDetailsDiv.innerHTML = "<p>No movie selected.</p>";
        return;
    }

    const details = await movieDetails(movieId);
    const images = await movieImages(movieId);
    const credits = await movieCredits(movieId);

    if(!details || !details.title) {
        movieDetailsDiv.innerHTML = "<p>Could not load movie details.</p>";
        return;
    }

    movieDetailsDiv.innerHTML = `
        <div class="movie-poster">
            <img src="${imgUrl}w300${details.poster_path}" alt="${details.title}">
        </div>
        <div class="movie-info">
            <h2>${details.title} (${(details.release_date || "").split("-")[0]})</h2>
            <p><strong>Release Date:</strong> ${details.release_date}</p>
            <p><strong>Overview:</strong> ${details.overview}</p>
            <p><strong>Runtime:</strong> ${details.runtime} min</p>
            <p><strong>Vote Average:</strong> ⭐ ${details.vote_average}</p>
        </div>
    `;

    // Populate image gallery
    if(images && images.posters) {
        let posters = images.posters.slice(0,10);
        if (posters.length < 3) {
            posters = posters.concat(posters);
        }
        posters.forEach(img => {
            const imgElem = document.createElement('img');
            imgElem.src = `${imgUrl}w185${img.file_path}`;
            movieGallery.appendChild(imgElem);
        });
    }

    // Populate credits
    if(credits && credits.cast) {
        credits.cast.slice(0,16).forEach(person => {
            const cCard = document.createElement('div');
            cCard.className = 'credit-card';
            cCard.onclick = () => {
                window.location.href = `person.html?id=${person.id}`;
            };
            cCard.innerHTML = `
                <img src="${imgUrl}w185${person.profile_path}" alt="${person.name}">
                <div class="credit-info">
                    <h4>${person.name}</h4>
                    <p>as ${person.character}</p>
                </div>
            `;
            movieCreditsDiv.appendChild(cCard);
        });
    }
}

loadMovieDetails();
