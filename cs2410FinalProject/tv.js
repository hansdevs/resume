const tvResults = document.getElementById('tv-results');
const tvQueryObj = queryStringToJson(window.location.search);
const tvName = tvQueryObj.query || "";

const tvPagination = document.getElementById('tv-pagination');

let currentTvPage = 1;
let totalTvPages = 1;

async function loadTV(page=1) {
    currentTvPage = page;
    tvResults.innerHTML = "<p>Loading...</p>";
    tvPagination.innerHTML = "";

    let res;
    if (tvName) {
        res = await tvSearch(tvName, page);
    } else {
        res = await tvPopular(page);
    }

    // Filter out adult tv if any field is present - saving you Dr.Mano and TA from scaring things, lmao
    const safeTV = res.results.filter(t => !t.adult);

    tvResults.innerHTML = "";
    if (safeTV.length > 0) {
        safeTV.forEach(t => {
            tvResults.appendChild(createCard(t, 'tv'));
        });
        totalTvPages = res.total_pages;
        const paginationElem = createPaginationButtons(currentTvPage, totalTvPages, loadTV);
        tvPagination.appendChild(paginationElem);
    } else {
        tvResults.innerHTML = "<p>No PG-13 or lower results found.</p>";
    }
}

loadTV();
