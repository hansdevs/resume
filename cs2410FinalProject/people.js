const peopleResults = document.getElementById('people-results');
const peopleQueryObj = queryStringToJson(window.location.search);
const peopleName = peopleQueryObj.query || "";

const peoplePagination = document.getElementById('people-pagination');

let currentPeoplePage = 1;
let totalPeoplePages = 1;

async function loadPeople(page=1) {
    currentPeoplePage = page;
    peopleResults.innerHTML = "<p>Loading...</p>";
    peoplePagination.innerHTML = "";

    let res;
    if (peopleName) {
        res = await peopleSearch(peopleName, page);
    } else {
        res = await peoplePopular(page);
    }

    peopleResults.innerHTML = "";
    res.results.forEach(p => {
        peopleResults.appendChild(createCard(p, 'person'));
    });

    totalPeoplePages = res.total_pages;
    const paginationElem = createPaginationButtons(currentPeoplePage, totalPeoplePages, loadPeople);
    peoplePagination.appendChild(paginationElem);
}

loadPeople();
