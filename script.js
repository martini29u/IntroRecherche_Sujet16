const RSS = `https://www.francetvinfo.fr/titres.rss`;

let links = [];

//const RSS = `https://codepen.io/picks/feed/`
fetch(RSS)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
    .then(data => {
        let html = ``;
        const items = data.querySelectorAll('item');
        let i = 1;
        items.forEach(elem => {
            let link = '' + elem.querySelector('link').textContent;
            links.push(link);
            html = `
                <div id="article${i}" class="article">
                    <h2 id="titre_article${i}">${elem.querySelector('title').innerHTML}</h2>
                    <div class="separateur"></div>
                    <div class="container flex-container">
                    <div><img src="${elem.querySelector('enclosure').attributes['url'].textContent}"></div>
                    <div><p>${elem.querySelector('description').textContent}</p></div></div>
                    <div class="separateur"></div>
                    <button id="supp_article${i}" onclick="supprimerArticle(${i})">Supprimer</button>
                    <button id="access_article${i}" onclick="ouvrirLien(${i-1})">Visionner</button>
                    <button onclick="test()">Test Dictionnaire</button>
                </div>`;
            document.body.innerHTML += html;
            i++;
        });
    })

    function ouvrirLien(i) {
        let link = links[i]
        open(link);
    }

    function supprimerArticle(i) {
        const element = document.getElementById("article" + i);
        element.remove();
    }

    /**
     * Fonction servant à charger un dictionnaire de mots français et à retourner un tableau contenants ces mots
     */
    async function chargerDictionnaire() {
        try {
            //Chargement du dictionnaire de mots français utilisé par le logiciel LibreOffice 
            const response = await fetch('https://raw.githubusercontent.com/Taknok/French-Wordlist/master/francais.txt');

            //Récupération du texte correspondant à la liste des mots du dictionnaire dans la variable texte
            const texte = await response.text();

            //Séparation des mots du texte contenu dans la variable texte dans un tableau de chaînes de caractères dans la variable dictionnaire 
            const dictionnaire = texte.split('\n');

            //On retourne le tableau contenants les mots du dictionnaire 
            return dictionnaire;

        } catch (error) {
            //Gestion de l'erreur lors du chargement du dictionnaire
            console.error('Erreur lors du chargement du dictionnaire', error);
            //En cas d'erreur on retourne une tableau vide 
            return [];
        }
    }


    /**
     * Fonction servant à transformer un texte en vecteur binaire selon un dictionnaire de mots chargé préalablement
     */ 
    async function TexteToVecteurBinaire(texte) {
        //On charge le dictionnaire de mots français représenté par un tableau des mots dans la variable dictionnaire 
        const dictionnaire = await chargerDictionnaire();

        //On initialis notre vecteur binaire avec des 0 uniquement dans la variable vecteurBinaire
        //en regardant la taille de la variable dictionnaire correspondant au tableau des mots du dictionnaire français
        const vecteurBinaire = Array(dictionnaire.length).fill(0);
      
        //On divise le texte en mots en mettant d'abord tous les mots en minuscule puis en ignorant la ponctuation 
        const mots_du_texte = texte.toLowerCase().replace(/[^\w\s]/gi, "").split(" ");
        console.log(dictionnaire);
      
        //On parcours chaque mot de la variable mots_du_texte et on vérifie s'il est contenu dans la variable dictionnaire
        mots_du_texte.forEach(mot_du_texte => {

        const index = dictionnaire.indexOf(mot_du_texte + "\r");

        //Si le mot est contenu dans le texte alors la valeur pour l'index du mot passe à 1 dans vecteurBinaire
        if (index !== -1) {
            vecteurBinaire[index] = 1;
        }
        });
      
        //On retourne le vecteur binaire obtenu 
        return vecteurBinaire;
    }

    //Fonction servant à tester la fonction TexteToVecteurBinaire
    async function testDictionnaire() {
        const text = "Voici un exemple de texte avec des mots.";
        const binaryVector = await TexteToVecteurBinaire(text);
        let count = 0;
        for (let i = 0; i < binaryVector.length; i++) {
            if (binaryVector[i] === 1) {
            count++;
            }
        }
        console.log(count); 
    }

