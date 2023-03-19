
//const CORS_API_URL = "https://www.mb-srv.tk/cors-anywhere/";
const CORS_API_URL = "https://cors.mb-srv.tk/";
//const CORS_API_URL = "https://mb-srv.loca.lt/cors-anywhere/";

async function avviaDownload(barid, mp3URL, imgURL, nome, artista, track, qualita) {

    if (mp3URL == null) return;

    var testo = await cercaTestoCanzone(nome + " " + artista);
    var ab_copertina = await cors_get_arraybuffer(imgURL);
    var ab_audio = await cors_get_arraybuffer(mp3URL, barid);
    var reldate = track.album.release_date.split("-");
    const writer = new ID3Writer(ab_audio);
    // #region TAG MP3
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
        }).setFrame('TALB', track.album.name)
        .setFrame('TRCK', track.track_number)
        .setFrame('TPOS', track.disc_number)
        .setFrame('TDAT', reldate[2] + reldate[1])
        .setFrame('TYER', reldate[0]);
    // #endregion
    writer.addTag();
    saveAs(writer.getBlob(), `${nome} - ${artista} [${qualita} kbps].mp3`);
    /*
    let blob = writer.getBlob();
    var reader = new FileReader();
    reader.onload = function (event) {
        let url = event.target.result;
        document.getElementById(elid).innerHTML += `<br><br><a class='btn btn-success' href='${url}' download="">Scarica con metadati</a>`;
    };
    reader.readAsDataURL(blob);
    */
}
async function cors_get_arraybuffer(url, updatebarid = null) {
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
            //console.log(`Ricevuti ${event.loaded} byte su ${event.total}`);
            if (updatebarid != null) {
                updateBar(event.loaded, event.total, updatebarid);
                updateReceived(event.loaded, updatebarid + "-st");
            }    
        }
        xhr.send();
    });
}
async function cercaTestoCanzone(q) {
    try {
        q = q.toLowerCase();
        q = q.split("(")[0];
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
    } catch (e) {
        return "";
    }
}
function updateBar(value, tot, barid) {
    let perc = Math.round(value / tot * 100) + "%";
    document.getElementById(barid).innerHTML = perc;
    document.getElementById(barid).style.width = perc;
}
function updateReceived(value, contentId) {
    var str = "Scaricati <b>" + (value / 1024 / 1024).toFixed(2) + "</b> MB";
    document.getElementById(contentId).innerHTML = str;
}