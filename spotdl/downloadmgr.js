let url = new URL(location.href);
let spu;
let params = new URLSearchParams(url.search);
if (params.has("id"))
    spu = params.get("id");
else
    document.body.innerHTML = "Specificare un'URL Spotify come parametro GET";
let QUALITA_AUD = params.has("q") ? params.get("q") : 192;
let isTraccia = spu.indexOf("track") != -1;
let id;
if (!isTraccia) id = spu.split("playlist/")[1].split("?")[0];
else id = spu.split("track/")[1].split("?")[0];

function updateStatus(s) {
    document.querySelector("#status").innerHTML = s;
}

async function get_spoti_playlist(id) {
    let r = await fetch("https://www.mb-srv.tk/spotidlapi/spotify_playlist_info.php?id=" + id);
    let t = await r.text();
    return JSON.parse(t).items;
}
async function ricercaTraccia(id, qualita) {
    let r = await fetch("https://www.mb-srv.tk/spotidlapi/?trackid=" + id + "&q=" + qualita);
    let t = await r.text();
    return JSON.parse(t);
}
window.onload = async function () {
    if (!isTraccia) {
        updateStatus("Recupero info sulla playlist...");
        let playlist = await get_spoti_playlist(id);
        updateStatus(`Trovate ${playlist.length} canzoni...`);
        for (var i = 0; i < playlist.length; i++) {
            updateStatus(`Elaboro ${i + 1} di ${playlist.length}: Ricerco`);
            let nomeCanzone = playlist[i].track.name;
            let artista = playlist[i].track.artists[0].name;
            let imgUrl = playlist[i].track.album.images[1].url;
            document.querySelector("#imgCaric").src = imgUrl;
            document.querySelector("#canzoneCaric").innerHTML = nomeCanzone;
            document.querySelector("#artistaCaric").innerHTML = artista;
            let streamUrl;
            var objs = await ricercaTraccia(playlist[i].track.id, QUALITA_AUD)
            streamUrl = objs.mp3url;
            updateStatus(`Trovata traccia audio per ${nomeCanzone} - ${artista}`);
            document.getElementById("results").innerHTML += codiceTabColonna(nomeCanzone, artista, imgUrl, streamUrl, i);
            avviaDownload("pbar" + i, streamUrl, imgUrl, nomeCanzone, artista, playlist[i].track, QUALITA_AUD);
        }
    } else {
        updateStatus("Recupero info sulla traccia...");
        let infoTraccia = await ricercaTraccia(id, QUALITA_AUD);
        document.querySelector("#results").innerHTML = codiceTabColonna(infoTraccia.name, infoTraccia.artists[0].name, infoTraccia.album.images[1].url, infoTraccia.mp3url);
        avviaDownload("pbar0", infoTraccia.mp3url, infoTraccia.album.images[1].url, infoTraccia.name, infoTraccia.artists[0].name, infoTraccia, QUALITA_AUD);
    }
    document.body.style.overflow = "auto";
    location.hash = "#results";
    document.querySelector("#main").style.display = "none";
}
function codiceTabColonna(nomeCanzone, artista, imgUrl, streamUrl, c = 0) {
    return `
                <div class='col-sm-3'>
                      <br>
                      <div class="card text-white bg-dark">
                      <img class="card-img-top" src="${imgUrl}">
                      <div class="card-body" id='card${c}'>
                        <h5 class="card-title">${nomeCanzone}</h5 >
                        <p class="card-text">${artista}</p>
                        <br>
                        <a href="${streamUrl}" class="btn btn-primary" style='display: none;'>Scarica (direttamente)</a>
                        <br>
                        <span id='pbar${c}-st'></span>
                        <br>
                        <div class="progress">
                            <div class="progress-bar" id='pbar${c}' role="progressbar" style="width: 0%;" aria-valuemin="0" aria-valuemax="100">0%</div>
                        </div>
                      </div>
                    </div>
                    <br>
                </div>
            `;
}