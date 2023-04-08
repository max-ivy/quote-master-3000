let quotes = [];

function fetchQuotes() {
  fetch("/quotes")
    .then((response) => response.json())
    .then((data) => {
      quotes = data;
      displayQuotes(quotes);
    });
}

function displayQuotes(quotes) {
  const quoteList = document.querySelector(".quote-list");
  quoteList.innerHTML = "";

  for (const quote of quotes) {
    const quoteCard = document.createElement("div");
    quoteCard.classList.add("quote-card");
    quoteCard.dataset.category = quote.category;
    quoteCard.id = quote.quote;

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerText = "x";
    deleteButton.addEventListener("click", () => {
      const quoteIndex = quotes.findIndex((item) => item.quote === quote.quote);
      deleteQuote(quoteIndex);
    });

    const quoteText = document.createElement("p");
    quoteText.innerText = quote.quote;

    const author = document.createElement("h4");
    author.innerText = `- ${quote.author}`;

    const category = document.createElement("h5");
    category.innerText = `Category: ${quote.category}`;

    quoteCard.appendChild(deleteButton);
    quoteCard.appendChild(quoteText);
    quoteCard.appendChild(author);
    quoteCard.appendChild(category);
    quoteList.appendChild(quoteCard);
  }
}

function nextQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  document.getElementById("featured-quote-text").innerText = randomQuote.quote;
  document.getElementById("featured-author").innerText = `- ${randomQuote.author}`;
  document.getElementById("featured-category").innerText = `Category: ${randomQuote.category}`;
}


function deleteQuote(quoteIndex) {
  const quoteToDelete = document.querySelectorAll('.quote-card')[quoteIndex];
  const quoteId = quoteToDelete.id;

  if (confirm("Are you sure you want to delete this quote?")) {
    fetch('/delete_quote', {
      method: 'POST',
      body: JSON.stringify({'quote_id': quoteId}),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(() => {
      quoteToDelete.remove();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
}



function clearFilters() {
  const filterValue = document.querySelector(".search-filter-form input[name=filter_value]");
  const filterType = document.querySelector(".search-filter-form select[name=filter_type]");
  const filterCategory = document.querySelector(".filter-form select");

  filterValue.value = "";
  filterType.value = "author";
  filterCategory.value = "all";
  filterQuotes();
}




function filterQuotes() {
  const search = document.querySelector(".search-filter-form input[name=filter_value]").value.toLowerCase();
  const filterType = document.querySelector(".search-filter-form select[name=filter_type]").value;
  const filterCategory = document.getElementById("filter_category").value;

  const filteredQuotes = quotes.filter((quote) => {
    if (filterType === "author") {
      return quote.author.toLowerCase().includes(search);
    } else if (filterType === "keyword") {
      return quote.quote.toLowerCase().includes(search);
    } else {
      return true;
    }
  }).filter((quote) => {
    if (filterCategory === "all") {
      return true;
    } else {
      return quote.category === filterCategory;
    }
  });

  displayQuotes(filteredQuotes);
}

window.onload = function () {
  fetchQuotes();
  document.getElementById("next-quote").addEventListener("click", nextQuote);
  document.querySelector(".search-filter-form").addEventListener("submit", (event) => {
    event.preventDefault();
    filterQuotes();
  });
  document.getElementById("clear-filters").addEventListener("click", clearFilters);
  document.getElementById("filter_category").addEventListener("change", filterQuotes);
};
