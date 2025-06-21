const personQuery = queryStringToJson(window.location.search);
const personId = personQuery.id;
const personDetailsDiv = document.getElementById('person-details');
const personCreditsDiv = document.getElementById('person-credits');

async function loadPersonDetails() {
    const details = await personDetails(personId);
    const images = await personImages(personId);
    const combined = await personCombinedCredits(personId);

    personDetailsDiv.innerHTML = `
        <div class="person-image">
            <img src="${imgUrl}w300${details.profile_path}" alt="${details.name}">
        </div>
        <div class="person-info">
            <h2>${details.name}</h2>
            <p><strong>Birthday:</strong> ${details.birthday || "N/A"}</p>
            <p><strong>Deathday:</strong> ${details.deathday || "N/A"}</p>
            <p><strong>Place of Birth:</strong> ${details.place_of_birth || "N/A"}</p>
            <p><strong>Biography:</strong> ${details.biography}</p>
        </div>
    `;

    combined.cast.forEach(item => {
        if(item.media_type === "movie" || item.media_type === "tv") {
            const cCard = document.createElement('div');
            cCard.className = 'credit-card';
            cCard.onclick = () => {
                if(item.media_type === "movie") {
                    window.location.href = `movie.html?id=${item.id}`;
                } else {
                    window.location.href = `series.html?id=${item.id}`;
                }
            };
            let title = (item.media_type === "movie") ? item.title : item.name;
            let date = (item.media_type === "movie") ? item.release_date : item.first_air_date;
            let imgPath = (item.poster_path) ? item.poster_path : item.profile_path;
            cCard.innerHTML = `
                <img src="${imgUrl}w185${imgPath}" alt="${title}">
                <div class="credit-info">
                    <h4>${title}</h4>
                    <p>${date || "N/A"}</p>
                    <p>as ${item.character || "N/A"}</p>
                </div>
            `;
            personCreditsDiv.appendChild(cCard);
        }
    });
}

loadPersonDetails();
