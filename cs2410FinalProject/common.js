function createCard(item, type) {
    const card = document.createElement('div');
    card.className = 'card';

    let title = '';
    let imgPath = '';
    let infoLine = '';

    if(type === 'movie') {
        title = item.title;
        imgPath = item.poster_path;
        infoLine = (item.release_date || '').split('-')[0];
    } else if(type === 'tv') {
        title = item.name;
        imgPath = item.poster_path;
        infoLine = (item.first_air_date || '').split('-')[0];
    } else if(type === 'person') {
        title = item.name;
        imgPath = item.profile_path;
        infoLine = 'Person';
    }

    card.innerHTML = `
      ${imgPath ? `<img src="https://image.tmdb.org/t/p/w185${imgPath}" alt="${title}" style="border-radius:5px;">` : ''}
      <div class="card-info">
          <h3>${title}</h3>
          <p>${infoLine || 'N/A'}</p>
      </div>
    `;

    // On click go to detail page
    if(type === 'movie') {
        card.onclick = () => window.location.href = `movie.html?id=${item.id}`;
    } else if(type === 'tv') {
        card.onclick = () => window.location.href = `series.html?id=${item.id}`;
    } else if(type === 'person') {
        card.onclick = () => window.location.href = `person.html?id=${item.id}`;
    }

    return card;
}
