class MyFrame extends HTMLElement {
    id

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        // Este método se llama cuando el elemento se conecta al DOM
        // Aquí puedes inicializar elementos, establecer eventos, etc.
    }

    static get observedAttributes() {
        return ["uri"];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        let [, , id] = newVal.split(":");
        const uri = this.getAttribute("uri");
        const type = uri.split(":")[1];
        this.id = id;
        this.type = type;
        this.shadowRoot.innerHTML = `
            <iframe class="spotify-iframe" 
            width="100%" 
            height="100%" 
            src="https://open.spotify.com/embed/${this.type}/${this.id}" 
            frameborder="0" 
            allowtransparency="true" 
            allow="encrypted-media"></iframe>
        `;
        if (type === "track") {
            this.shadowRoot.innerHTML = `
                <iframe class="spotify-iframe" 
                width="70%" 
                height="400" 
                src="https://open.spotify.com/embed/${this.type}/${this.id}" 
                frameborder="0" 
                allowtransparency="true" 
                allow="encrypted-media"></iframe>
            `;
        }
    }
}
customElements.define("my-frame", MyFrame);

const searchInput = document.querySelector('.search-header__input');
const searchButton = document.querySelector('.search-header__button');

// Llamar a mostrarAlbums con el valor inicial de code al cargar la página
let code = "%3CREQUIRED%3E";
document.addEventListener('DOMContentLoaded', () => {
    mostrarAlbums(code);
});

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        code = query.replace(" ", "%20");
        mostrarAlbums(code);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            code = query.replace(" ", "%20");
            mostrarAlbums(code);
        }
    }
});

async function mostrarAlbums(code) {
    let url = `https://spotify23.p.rapidapi.com/search/?q=${code}&type=albums&offset=0&limit=10&numberOfTopResults=5`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '344560f223msh07d868d593e096bp1a2c08jsnaa43079d40fd',
            'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        const albums = result.albums.items;
        listarAlbum.innerHTML = '';
        for (let i = 0; i < albums.length; i++) {
            const getImage = albums[i]?.data.coverArt.sources[i]?.url;
            const firstImage = albums[i]?.data.coverArt.sources[0]?.url;
            const imagen = getImage ?? firstImage;
            const nombre = albums[i].data.name;
            const nombreArtista = albums[i].data.artists.items[i]?.profile.name ?? albums[i].data.artists.items[0]?.profile.name;
            const fecha = albums[i].data.date.year;
            const uri = albums[i].data.uri;

            const div = document.createElement("div");
            div.classList.add("album");
            div.innerHTML = `
                <div class="album_order" data-uri="${uri}">
                    <div class="imagen_album">
                        <img src="${imagen}" alt="" class="portada">
                    </div>
                    <div class="info_album">
                        <h3>${nombre}</h3>
                        <p>${nombreArtista}</p>
                        <p>${fecha}</p>
                    </div>
                </div>
            `;
            listarAlbum.append(div);
            div.querySelector('.album_order').addEventListener('click', async () => {
                await reproducirPrimerTrack(uri); // Espera a que se reproduzca el primer track
                mostrarTracks(uri); // Mostrar los tracks del álbum
            });
        }
    } catch (error) {
        console.error(error);
    }
}

async function reproducirPrimerTrack(albumUri){
    let albumId = albumUri.split(":")[2];
    let url = `https://spotify23.p.rapidapi.com/albums/?ids=${albumId}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '344560f223msh07d868d593e096bp1a2c08jsnaa43079d40fd',
            'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        const tracks = result.albums[0].tracks.items;
        const uri = tracks[0]?.uri; // URI del primer track
        const frame = document.querySelector("my-frame");
        frame.setAttribute("uri", uri); // Establecer la URI del primer track
    } catch (error) {
        console.error(error);
    }
}

async function mostrarTracks(albumUri) {
    let albumId = albumUri.split(":")[2];
    let url = `https://spotify23.p.rapidapi.com/albums/?ids=${albumId}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '344560f223msh07d868d593e096bp1a2c08jsnaa43079d40fd',
            'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        const tracks = result.albums[0].tracks.items;
        listarTrack.innerHTML = '';
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            const nombre = track.name;
            const nombreArtista = track.artists[0].name;
            const uri = track.uri;

            const div = document.createElement("div");
            div.classList.add("track");
            div.innerHTML = `
                <div class="track_order" data-id="${uri}">
                    <div class="info_track">
                        <h3>${nombre}</h3>
                        <p>${nombreArtista}</p>
                    </div>
                </div>
            `;
            listarTrack.append(div);
            div.querySelector('.track_order').addEventListener('click', () => {
                const frame = document.querySelector("my-frame");
                frame.setAttribute("uri", uri);
            });
        }
    } catch (error) {
        console.error(error);
    }
}


// Código para mostrar recomendaciones y playlist (sin cambios significativos)

const listarAlbum = document.querySelector('#listarAlbum');
const listarTrack = document.querySelector('#listarTrack');
const listarPlayList = document.querySelector('#listarPlayList');

const urlRecommendations = `https://spotify23.p.rapidapi.com/recommendations/?limit=20&seed_tracks=0c6xIDDpzE81m2q797ordA&seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=classical%2Ccountry`;
const optionsRecommendations = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': '344560f223msh07d868d593e096bp1a2c08jsnaa43079d40fd',
        'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
    }
};

try {
    const response = await fetch(urlRecommendations, optionsRecommendations);
    const result = await response.json();
    const tracks = result.tracks;
    for (let i = 0; i < 10; i++) {
        const img = tracks[i]?.album.images[0]?.url;
        const img2 = tracks[i]?.album.images[i]?.url;
        const imagen = img ?? img2;
        const nombre = tracks[i].name;
        const nombreArtista = tracks[i].artists[0].name;
        const uri = tracks[i].uri;
        const div = document.createElement("div");
        div.classList.add("track_Recomendations");
        div.innerHTML = `
            <div class="track_order" data-id="${uri}">
                <div class="imagen_track">
                    <img src="${imagen}" alt="" class="portada">
                </div>
                <div class="info_track">
                    <h3>${nombre}</h3>
                    <p>${nombreArtista}</p>
                </div>
            </div>
        `;
        listarTrack.append(div);
        div.querySelector('.track_order').addEventListener('click', () => {
            const frame = document.querySelector("my-frame");
            frame.setAttribute("uri", uri);
        });
    }
} catch (error) {
    console.error(error);
}

const urlPlaylists = 'https://spotify23.p.rapidapi.com/playlist_tracks/?id=37i9dQZF1DX4Wsb4d7NKfP&offset=0&limit=100';
const optionsPlaylists = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': '344560f223msh07d868d593e096bp1a2c08jsnaa43079d40fd',
        'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
    }
};

try {
    const response = await fetch(urlPlaylists, optionsPlaylists);
    const result = await response.json();
    const playlist = result.items;
    for (let i = 0; i < 10; i++) {
        const img = playlist[i]?.track.album?.images[0].url;
        const imagen = img;
        const nombre = playlist[i].track.album.name;
        const uri = playlist[i].track.album.uri;
        const div = document.createElement("div");
        div.classList.add("PlayList");
        div.innerHTML = `
            <div class="track_order" data-id="${uri}">
                <div class="imagen_playlist">
                    <img src="${imagen}" alt="" class="portada">
                </div>
                <div class="info_track">
                    <h3>${nombre}</h3>
                </div>
            </div>
        `;
        listarPlayList.append(div);
        div.querySelector('.track_order').addEventListener('click', () => {
            const frame = document.querySelector("my-frame");
            frame.setAttribute("uri", uri);
        });
    }
} catch (error) {
    console.error(error);
}






// class Myframe extends HTMLElement {
//     constructor() {
//         super();
//         this.attachShadow({ mode: "open" });
//     }

//     connectedCallback() {
//         // Inicializar el iframe cuando el componente se agrega por primera vez al DOM
//         this.updateIframe();
//     }

//     static get observedAttributes() {
//         return ["uri"];
//     }

//     attributeChangedCallback(name, oldVal, newVal) {
//         // Actualizar iframe cuando cambia el atributo 'uri'
//         if (name === "uri" && oldVal !== newVal) {
//             this.updateIframe();
//         }
//     }

//     updateIframe() {
//         // Extraer tipo e id de la URI
//         const uri = this.getAttribute("uri");
//         if (!uri) return;

//         const [, type, id] = uri.split(":");
//         this.type = type;
//         this.id = id;

//         // Determinar dimensiones del iframe según el tipo
//         let width = "100%";
//         let height = "100%";

//         if (type === "track") {
//             width = "70%";
//             height = "400";
//         } else if (type === "album") {
//             width = "454";
//             height = "690";
//         }

//         // Establecer el innerHTML para el shadow DOM
//         this.shadowRoot.innerHTML = `
//             <iframe class="spotify-iframe"
//                 width="${width}"
//                 height="${height}"
//                 src="https://open.spotify.com/embed/${this.type}/${this.id}"
//                 frameborder="0"
//                 allowtransparency="true"
//                 allow="encrypted-media">
//             </iframe>
//         `;
//     }
// }

// customElements.define("my-frame", Myframe);