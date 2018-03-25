
var bookUrl = 'https://www.googleapis.com/books/v1/volumes?q=';
var bookName = '';
var apiKey = '&key=AIzaSyABtH-bCmkM514qFwTjAqP80v9TIf42GVA';
var maxResults = '&maxResults=40';
var newUrl = bookUrl + bookName + apiKey;




$("#mic").click(function() {
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
        var recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognition.start();
        recognition.onresult = function(e) {
            $("#search").val(e.results[0][0].transcript);
            recognition.stop();
            bookSearch();
        };
        recognition.onerror = function(e) {
            recognition.stop();
        };

    }
});

$("#clickMe").click(function() {
    bookSearch();
});

$('#search').keypress(function(e) {
    if (e.which === 13) {
        bookSearch();
        return false;
    }
});

// Start the book search process
function bookSearch(){
    var search = document.getElementById('search').value;
    if( search !== '') {
        console.log(search);
        newUrl = bookUrl + search + apiKey + maxResults;
        bookName = search;
        bookstore(newUrl);

        document.getElementById('search-results').innerHTML = '';
    }
}

// Google Books Search
function bookstore(newUrl) {
    $.ajax({
        url: newUrl,
        dataType: 'json',
        success: function(data){
            console.log(data);
            //var test = data.items[0];
            //console.log(test.volumeInfo.title);

            var addHere = document.getElementById('search-results');
            addHere.className = 'list-group';

            var numResults = document.createElement("h4");
            numResults.innerHTML = data.items.length + ' Results:';
            addHere.appendChild(numResults);

            // Loop through all results from google book search & create html elements
            for (var i = 0; i < data.items.length; i++) {

                // Add outer link element
                var divCol = document.createElement("a");
                divCol.href = '#';
                divCol.className = 'list-group-item list-group-item-action flex-column align-items-start';
                divCol.id = 'books-img-info' + i;
                divCol.style = 'margin: 10px;';
                //var addBooksHere = document.getElementById('books');
                addHere.appendChild(divCol);

                // Add book image
                var divImg = document.createElement('div');
                var imgUrl = data.items[i].volumeInfo.imageLinks.thumbnail;
                var encryptedImg = imgUrl.replace("http://books.google.com/", "https://encrypted.google.com/");
                divImg.innerHTML += "<img src=" + encryptedImg + "/>";
                divImg.className = 'book-image';
                var addImgHere = document.getElementById(divCol.id);
                addImgHere.appendChild(divImg);

                // Add book title
                var divInfo = document.createElement('div');
                divInfo.className = 'book-info';
                divInfo.id = 'book-info' + i;
                divInfo.innerHTML += "<h3>" + data.items[i].volumeInfo.title + "</h3>";
                var addInfoHere = document.getElementById(divCol.id);
                addInfoHere.appendChild(divInfo);

                // Add authors name
                var pAuthor = document.createElement('p');
                pAuthor.className = 'author';
                divInfo.className = 'card-header';
                var pText = document.createTextNode('by ' + data.items[i].volumeInfo.authors);
                var addPHere = document.getElementById(divInfo.id);
                pAuthor.appendChild(pText);
                addPHere.appendChild(pAuthor);

                // Add description
                var pDescription = document.createElement('p');
                pDescription.className = 'description';
                pText = document.createTextNode(data.items[i].volumeInfo.description);
                pDescription.appendChild(pText);
                addPHere.appendChild(pDescription);

                // Add list price if applicable
                if(data.items[i].saleInfo.hasOwnProperty('listPrice') ){
                    var price = document.createElement('p');
                    price.className = 'price';
                    var currency = data.items[i].saleInfo.listPrice.currencyCode;
                    var priceText = document.createTextNode('Price:  ' + data.items[i].saleInfo.listPrice.amount + '  ' + currency);
                    price.appendChild(priceText);
                    addPHere.appendChild(price);
                }
            }

        }
    })
}