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
            console.log(elem.querySelector('enclosure').attributes['url'].textContent);
            html += `
                <div id="article${i}" style="border: solid black;">
                    <h3 id="titre_article${i}">${elem.querySelector('title').innerHTML}</h3>
                    <img src="${elem.querySelector('enclosure').attributes['url'].textContent}">
                    <p>${elem.querySelector('description').textContent}</p>
                    <button id="supp_article1" onclick="supprimerArticle()">Supprimer</button>
                    <button id="access_article1" onclick="ouvrirLien()">Visionner</button>
                </div>`;
            i++;
        });
        document.body.innerHTML = html;
    })
