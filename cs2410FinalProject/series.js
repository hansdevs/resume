const seriesQuery = queryStringToJson(window.location.search);
const seriesId = seriesQuery.id;

const seriesDetailsDiv = document.getElementById('series-details');
const seriesCreditsDiv = document.getElementById('series-credits');

async function loadSeriesDetails() {
    if(!seriesId) {
        seriesDetailsDiv.innerHTML = "<p>No series selected.</p>";
        return;
    }

    const details = await tvDetails(seriesId);
    const images = await tvImages(seriesId);
    const credits = await tvCredits(seriesId);

    if(!details || !details.name) {
        seriesDetailsDiv.innerHTML = "<p>Could not load series details.</p>";
        return;
    }

    let startYear = (details.first_air_date || "").split('-')[0];
    let endYear = details.status === "Ended" ? (details.last_air_date || "").split('-')[0] : "Present";

    seriesDetailsDiv.innerHTML = `
        <div class="series-poster">
            <img src="${imgUrl}w300${details.poster_path}" alt="${details.name}">
        </div>
        <div class="series-info">
            <h2>${details.name} (${startYear}-${endYear})</h2>
            <p><strong>Number of Seasons:</strong> ${details.number_of_seasons}</p>
            <p><strong>Number of Episodes:</strong> ${details.number_of_episodes}</p>
            <p><strong>Vote Average:</strong> ⭐ ${details.vote_average}</p>
            <p><strong>Overview:</strong> ${details.overview}</p>
        </div>
    `;

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
            seriesCreditsDiv.appendChild(cCard);
        });
    }
}

loadSeriesDetails();
