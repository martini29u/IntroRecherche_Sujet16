const RSS = `https://www.francetvinfo.fr/titres.rss`;

//const RSS = `https://codepen.io/picks/feed/`
fetch(RSS)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
    .then(data => {
        let html = ``;
        const items = data.querySelectorAll('item');
        let i = 1;
        items.forEach(elem => {
            link = elem.querySelector('link').textContent
            console.log(link);
            html = `
                <div id="article${i}" class="article">
                    <h2 id="titre_article${i}">${elem.querySelector('title').innerHTML}</h2>
                    <div class="separateur"></div>
                    <div class="container flex-container">
                    <div><img src="${elem.querySelector('enclosure').attributes['url'].textContent}"></div>
                    <div><p>${elem.querySelector('description').textContent}</p></div></div>
                    <div class="separateur"></div>
                    <button id="supp_article${i}" onclick="supprimerArticle()">Supprimer</button>
                    <button id="access_article${i}">Visionner</button>
                </div>`;
            document.body.innerHTML += html;
            //document.getElementById("access_article" + i).addEventListener("click", function() {alert("Tu as cliqué")});
            //document.getElementById("access_article" + i).onclick = function() {ouvrirLien(link)};
            i++;
        });
    })

    function ouvrirLien(link) {
        console.log("Tu as cliqué");
        //open(link);
    }