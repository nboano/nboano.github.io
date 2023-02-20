//const CORS_API_URL = "https://www.mb-srv.tk/cors-anywhere/";

const CORS_API_URL = "https://mb-srv.loca.lt/cors-anywhere/";

let url = new URL(location.href);
let mp3URL, imgURL;
let ab_copertina, ab_audio;

window.onload = async function () {
    let params = new URLSearchParams(url.search);
    if (params.has("url"))
        mp3URL = params.get("url");
    else
        document.body.innerHTML = "Specificare un'URL di un file come parametro GET";
    if (params.has("imgurl"))
        imgURL = params.get("imgurl");

    document.querySelector("#imgCopertina").src = imgURL;

    if (params.has("nome")) {
        document.querySelector("#txtNome").value = params.get("nome");
    }
    if (params.has("artista")) {
        document.querySelector("#txtArtista").value = params.get("artista");
    }

    document.getElementById("txtTestoCanz").value = await cercaTestoCanzone(params.get("nome") + " " + params.get("artista"));

    updateInfo("Recupero copertina...");
    ab_copertina = await cors_get_arraybuffer(imgURL);
    updateInfo("Recupero traccia audio...");
    ab_audio = await cors_get_arraybuffer(mp3URL);
    updateInfo("");
    document.querySelector("#progressbar").parentElement.style.display = "none";
    document.querySelector("form").style.display = "block";
}

function aggiungiTag(nome, artista, testo = "") {
    const writer = new ID3Writer(ab_audio);
    writer.setFrame('TIT2', nome)
        .setFrame('TPE1', [artista])
        .setFrame('APIC', {
            type: 3,
            data: ab_copertina,
            description: ""
        }).setFrame('USLT', {
            description: '',
            lyrics: testo,
            language: ''
        });
    writer.addTag();
    let blob = writer.getBlob();
    var reader = new FileReader();
    reader.onload = function (event) {
        let url = event.target.result;
        let link = document.querySelector("#lnkScarica");
        link.href = url;
        link.setAttribute("download", `${nome} - ${artista}.mp3`);
        link.style.display = "inline";
    };
    reader.readAsDataURL(blob);
}
async function cors_get_arraybuffer(url) {
    url = url.replace("http://", "");
    url = url.replace("https://", "");
    url = CORS_API_URL + url;
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.responseType = "arraybuffer";
        xhr.open("GET", url);
        xhr.onload = () => {
            resolve(xhr.response);
        };
        xhr.onerror = () => {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.onprogress = (event) => {
            console.log(`Ricevuti ${event.loaded} byte su ${event.total}`);
            updateBar(event.loaded, event.total);
        }
        xhr.send();
    });
}
async function cercaTestoCanzone(q) {
    q = q.toLowerCase();
    let r = await fetch("ottieniTesto.php?q=" + q.replace(/ /g, "+"));
    let t = await r.text();
    let dp = new DOMParser();
    let d = dp.parseFromString(t, "text/html");
    let lyrics = d.querySelector("div[data-lyrics-container='true']").innerHTML;
    lyrics = lyrics.replace(/<br>/g, "\n");
    let tmp = document.createElement("DIV");
    tmp.innerHTML = lyrics;
    lyrics = tmp.innerText || "";
    return lyrics;
}
function updateInfo(i) {
    document.querySelector("#statusText").innerHTML = i;
}
function updateBar(value, tot) {
    let perc = Math.round(value / tot * 100) + "%";
    document.querySelector("#progressbar").innerHTML = perc;
    document.querySelector("#progressbar").style.width = perc;
}