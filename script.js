const RSS = `https://www.francetvinfo.fr/titres.rss`;

let links = [];
let titres = [];
let descriptions = [];

let X = getItem("X");
let etiquettes = getItem("etiquettes");
let classifieur = getItem("classifieur");
let length = getItem("length")
if(length === null) length = 0;
if(etiquettes !== null) {
    let tmp = zeros(length)
    for(let i=0; i<length;i++) {
        tmp[i] = etiquettes[i];
    }
    etiquettes = tmp
}
if(classifieur !== null) {
    const priors = zeros(2);
    priors[0] = classifieur.priors[0];
    priors[1] = classifieur.priors[1];
    classifieur = renewObject(classifieur);
    classifieur.labels = [1, -1];
    classifieur.numericlabels = [0, 1];
    classifieur.priors = priors;
}
console.log(classifieur)

//const RSS = `https://codepen.io/picks/feed/`
    fetch(RSS)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
    .then(data => {
        let html = ``;
        console.log(data);
        let items = data.querySelectorAll('item');
        let tab = [];
        let ntab = [];
        if(classifieur !== null) {
            items.forEach(elem => {
                let titre = elem.querySelector('title').innerHTML;
                let desc = elem.querySelector('description').textContent;
                let score;
                vecteur = TexteToVecteurBinaire(titre + " " + desc);
                score = classifieur.predictscore(vecteur);
                console.log(score);
                //let tscore = (score[0] + score[1]) /2;
                tab = insertSorted(tab, [elem, score[1]]);
            })
            //console.log(tab)
            ntab = keepFirstEntry(tab);
            //console.log(ntab)
            items = ntab;
        }
        let i = 1;
        items.forEach(elem => {
            let link = '' + elem.querySelector('link').textContent;
            let title = elem.querySelector('title').innerHTML;
            let description = elem.querySelector('description').textContent;
            let img = elem.querySelector('enclosure').attributes['url'].textContent;
            links.push(link);
            titres.push(title);
            descriptions.push(description);
            html = `
                <div id="article${i}" class="article">
                    <h2 id="titre_article${i}">${title}</h2>
                    <div class="separateur"></div>
                    <div class="container flex-container">
                    <div><img src="${img}"></div>
                    <div><p>${description}</p></div></div>
                    <div class="separateur"></div>
                    <button id="supp_article${i}" onclick="supprimerArticle(${i})">Supprimer</button>
                    <button id="access_article${i}" onclick="ouvrirLien(${i-1})">Visionner</button>
                </div>`;
            document.body.innerHTML += html;
            i++;
        });
    })


    async function ouvrirLien(i) {
        let link = links[i];
        let titre = titres[i];
        let desc = descriptions[i];
        let vecteur = await TexteToVecteurBinaire(titre + " " + desc);
        //if(classifieur !== null) console.log(classifieur.predictscore(mat(vecteur)));
        if(X === null) {
            X = mat(vecteur)
        } else {
            let nX = mat(vecteur)
            X = mat([X, nX], true); 
        }
        if(etiquettes === null) {
            etiquettes = zeros(1);
            etiquettes[length] = '+1';
        } else {
            let tmp = zeros(length + 1);
            for(let i = 0; i<length; i++) {
                tmp[i] = etiquettes[i];
            }
            tmp[length] = '+1';
            etiquettes = tmp;
        }
        if(length >= 6 || classifieur !== null) {
            if(classifieur === null) {
                lancerApprentissage();
            } else {
                let newEtiquette =  zeros(1)
                newEtiquette[0] = '+1';
                classifieur.update(mat(vecteur), newEtiquette);
                console.log("Classifieur mis à jour");
                storeItem("classifieur", classifieur);
            }
        }
        if(classifieur === null) {
            storeItem('X', X);
            storeItem('etiquettes', etiquettes);
            storeItem('length', getItem('length') + 1)
            length++;
        }
        open(link);
    }

    function supprimerArticle(i) {
        const element = document.getElementById("article" + i);
        let titre = titres[i];
        let desc = descriptions[i];
        element.remove();
        let vecteur = TexteToVecteurBinaire(titre + " " + desc);
        if(X === null) {
            X = mat(vecteur)
        } else {
            let nX = mat(vecteur)
            X = mat([X, nX], true); 
        }
        if(etiquettes === null) {
            etiquettes = zeros(1);
            etiquettes[length] = '-1';
        } else {
            let tmp = zeros(length + 1);
            for(let i = 0; i<length; i++) {
                tmp[i] = etiquettes[i];
            }
            tmp[length] = '-1';
            etiquettes = tmp;
        }
        if(length >= 6 || classifieur !== null) {
            if(classifieur === null) {
                lancerApprentissage();
            } else {
                let newEtiquette =  zeros(1)
                newEtiquette[0] = '-1';
                classifieur.update(mat(vecteur), newEtiquette);
                console.log("Classifieur mis à jour");
                storeItem("classifieur", classifieur);
            }
        }
        if(classifieur === null) {
            storeItem('X', X);
            storeItem('etiquettes', etiquettes);
            storeItem('length', getItem('length') + 1)
            length++;
        }
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
     * Fonction servant à charger un dictionnaire de mots français et à retourner un tableau contenants ces mots
     */
    function chargerDictionnaireLocal() {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "dictionnaire.txt", false);
        xmlhttp.send();
        let dictionnaire = xmlhttp.responseText.split("\n");
        return dictionnaire;
    }


    /**
     * Fonction servant à transformer un texte en vecteur binaire selon un dictionnaire de mots chargé préalablement
     */ 
    function TexteToVecteurBinaire(texte) {
        //On charge le dictionnaire de mots français représenté par un tableau des mots dans la variable dictionnaire 
        const dictionnaire = chargerDictionnaireLocal();

        //On initialis notre vecteur binaire avec des 0 uniquement dans la variable vecteurBinaire
        //en regardant la taille de la variable dictionnaire correspondant au tableau des mots du dictionnaire français
        const vecteurBinaire = Array(dictionnaire.length).fill(0);
      
        //On divise le texte en mots en mettant d'abord tous les mots en minuscule puis en ignorant la ponctuation 
        const mots_du_texte = texte.toLowerCase().replace(/[^\w\s]/gi, "").split(" ");
        //console.log(dictionnaire);
      
        //On parcours chaque mot de la variable mots_du_texte et on vérifie s'il est contenu dans la variable dictionnaire
        mots_du_texte.forEach(mot_du_texte => {

        const index = dictionnaire.indexOf(mot_du_texte + "\r");

        //Si le mot est contenu dans le texte alors la valeur pour l'index du mot passe à 1 dans vecteurBinaire
        if (index !== -1) {
            vecteurBinaire[index] = 1;
        }
        });
      
        //On retourne le vecteur binaire obtenu 
        return array2vec(vecteurBinaire);
    }

    function storeItem(n, e) {
        localStorage.setItem(n, JSON.stringify(e));
    }

    function getItem(n) {
        const item = localStorage.getItem(n);
        return item ? JSON.parse(item) : null;
    } 

    function lancerApprentissage() {
        if(classifieur == null) {
            classifieur = new Classifier(NaiveBayes, {distribution: Bernoulli});
        }
        if(etiquettes !== null) {
            let tmp = zeros(length)
            for(let i=0; i<length;i++) {
                tmp[i] = etiquettes[i];
            }
            etiquettes = tmp
        }
        console.log(X)
        console.log(etiquettes)
        classifieur.train(X, etiquettes);
        console.log(classifieur);
        localStorage.removeItem("X");
        localStorage.removeItem("etiquettes");
        localStorage.removeItem("length")
        storeItem("classifieur", classifieur);
    }

    function trierTableau(tableau) {
        tableau.sort(function(a, b) {
          return a[1] - b[1];
        });
        return tableau;
    }

    function keepFirstEntry(arr) {
        return arr.map(elem => elem[0]);
    }

    function insertSorted(arr, newElement) {
        let i = 0;
        while (i < arr.length && newElement[1] < arr[i][1]) {
          i++;
        }
        arr.splice(i, 0, newElement);
        return arr;
      }

    //Fonction servant à tester la fonction TexteToVecteurBinaire
    async function testDictionnaire(vecteur) {
        let count = 0;
        for (let i = 0; i < vecteur.length; i++) {
            if (vecteur[i] === 1) {
            count++;
            }
        }
        console.log(count); 
    }