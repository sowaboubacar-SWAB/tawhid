// --- VARIABLES GLOBALES ---
let playlists = [];
let currentPlaylistVideos = [];
let currentVideoIndex = 0;
let ytPlayer = null;
let isPlaying = false;
let currentToken = localStorage.getItem('token');

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (!currentToken) {
        window.location.href = '/login.html';
        return;
    }
    document.getElementById('welcome-msg').textContent = `Dalal ak jamm, ${localStorage.getItem('username')}`;

    // NOUVEAU : Afficher le bouton Admin si l'utilisateur est admin
    if (isUserAdmin()) {
        document.getElementById('admin-btn').style.display = 'inline-block';
    }

    chargerPlaylists();
});

// --- CHARGEMENT DES PLAYLISTS ---
async function chargerPlaylists() {
    try {
        const response = await fetch('/api/playlists', {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (!response.ok) throw new Error('Erreur de chargement');

        playlists = await response.json();
        const container = document.getElementById('playlists-container');
        container.innerHTML = '';

        if (playlists.length === 0) {
            container.innerHTML = '<p>Aucune playlist pour le moment.</p>';
            return;
        }

        playlists.forEach(playlist => {
            const card = document.createElement('div');
            card.className = 'playlist-card';
            // Quand on clique sur une carte, on charge ses vidéos
            card.onclick = () => chargerVideos(playlist.id, playlist.titre);
            card.innerHTML = `
                <h3>${playlist.titre}</h3>
                <p>${playlist.description || 'Pas de description'}</p>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erreur:", error);
        alert('Impossible de charger les playlists. Vérifie que tu es connecté.');
    }
}

// --- CHARGEMENT DES VIDÉOS D'UNE PLAYLIST ---
async function chargerVideos(playlistId, playlistTitle) {
    try {
        const response = await fetch(`/api/videos/playlists/${playlistId}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (!response.ok) throw new Error('Erreur de chargement');

        currentPlaylistVideos = await response.json();

        if (currentPlaylistVideos.length === 0) {
            alert(`La playlist "${playlistTitle}" est vide.`);
            return;
        }

        // 1. Afficher le conteneur de la liste
        const listContainer = document.getElementById('video-list-container');
        listContainer.style.display = 'block';
        document.getElementById('current-playlist-title').textContent = `Vidéos de : ${playlistTitle}`;

        // 2. Remplir la liste
        const listElement = document.getElementById('video-list');
        listElement.innerHTML = '';

        currentPlaylistVideos.forEach((video, index) => {
            const li = document.createElement('li');
            li.style.padding = '8px';
            li.style.cursor = 'pointer';
            li.style.borderBottom = '1px solid #444';
            li.textContent = `${index + 1}. ${video.titre}`;

            // Quand on clique sur une vidéo de la liste, on la lance
            li.onclick = () => {
                currentVideoIndex = index;
                lancerVideo(video.youtubeId, video.titre);
            };

            listElement.appendChild(li);
        });

        // 3. Afficher le lecteur et lancer la première vidéo
        document.getElementById('player-container').style.display = 'block';
        currentVideoIndex = 0;
        lancerVideo(currentPlaylistVideos[0].youtubeId, currentPlaylistVideos[0].titre);

    } catch (error) {
        console.error("Erreur:", error);
        alert('Impossible de charger les vidéos.');
    }
}
// --- LECTEUR YOUTUBE (AUDIO) ---
// Cette fonction est appelée automatiquement par l'API YouTube
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '10',  // <-- Change 1 en 200
        width: '25',   // <-- Change 1 en 300
        videoId: '',
        playerVars: {
            'autoplay': 0,
            'controls': 1, // <-- Mets 1 pour voir les contrôles
            'disablekb': 1,
            'fs': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log("Lecteur YouTube prêt !");
}

function onPlayerStateChange(event) {
    // Si la vidéo se termine, on passe à la suivante
    if (event.data === YT.PlayerState.ENDED) {
        playNext();
    }
}

// --- SCREEN WAKE LOCK (Empêche l'écran de s'éteindre tout seul) ---
let wakeLock = null;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock activé');
        } catch (err) {
            console.log('Wake Lock non disponible:', err.message);
        }
    }
}

function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
    }
}



function lancerVideo(videoId, titre) {
    if (ytPlayer && ytPlayer.loadVideoById) {
        ytPlayer.loadVideoById(videoId);
        document.getElementById('now-playing').textContent = `En cours : ${titre}`;
        document.getElementById('progress-bar').value = 0;
        document.getElementById('current-time').textContent = '0:00';
        isPlaying = true;
        document.getElementById('play-pause-btn').textContent = '⏸️';

        // Met à jour l'écran de verrouillage
        updateMediaSession(titre);
        requestWakeLock();
    }
}
function togglePlay() {
    if (!ytPlayer) return;

    if (isPlaying) {
        ytPlayer.pauseVideo();
        document.getElementById('play-pause-btn').textContent = '▶️';
    } else {
        ytPlayer.playVideo();
        document.getElementById('play-pause-btn').textContent = '⏸️';
    }
    isPlaying = !isPlaying;
}

function playNext() {
    if (currentPlaylistVideos.length === 0) return;
    currentVideoIndex = (currentVideoIndex + 1) % currentPlaylistVideos.length;
    const video = currentPlaylistVideos[currentVideoIndex];
    lancerVideo(video.youtubeId, video.titre);
}

function playPrevious() {
    if (currentPlaylistVideos.length === 0) return;
    currentVideoIndex = (currentVideoIndex - 1 + currentPlaylistVideos.length) % currentPlaylistVideos.length;
    const video = currentPlaylistVideos[currentVideoIndex];
    lancerVideo(video.youtubeId, video.titre);
}
// Fonction pour savoir si l'utilisateur est admin
function isUserAdmin() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        // On décode la partie "payload" du token JWT (la 2ème partie)
        const payload = JSON.parse(atob(token.split('.')[1]));
        // On vérifie si le rôle contient ADMIN
        return payload.role === 'ROLE_ADMIN';
    } catch (e) {
        return false;
    }
}
// Formater le temps en mm:ss
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Mettre à jour la barre de progression
function updateProgressBar() {
    if (!ytPlayer || !ytPlayer.getDuration) return;

    const duration = ytPlayer.getDuration();
    const current = ytPlayer.getCurrentTime();

    if (duration > 0) {
        const percent = (current / duration) * 100;
        document.getElementById('progress-bar').value = percent;
        document.getElementById('current-time').textContent = formatTime(current);
        document.getElementById('total-time').textContent = formatTime(duration);
    }
}

// Écouter le clic sur la barre pour se déplacer dans la vidéo
document.getElementById('progress-bar')?.addEventListener('input', function() {
    if (!ytPlayer || !ytPlayer.getDuration) return;
    const seekTo = (this.value / 100) * ytPlayer.getDuration();
    ytPlayer.seekTo(seekTo, true);
});

// Lancer une boucle pour mettre à jour la barre toutes les secondes
setInterval(updateProgressBar, 1000);

// --- MEDIA SESSION API (Contrôles sur l'écran de verrouillage) ---
function updateMediaSession(titre) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: titre,
            artist: 'Tawhid',
            album: 'Zikr Layenes'
        });

        // Boutons sur l'écran de verrouillage
        navigator.mediaSession.setActionHandler('play', () => {
            if (ytPlayer && ytPlayer.playVideo) {
                ytPlayer.playVideo();
                document.getElementById('play-pause-btn').textContent = '⏸️';
                isPlaying = true;
            }
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            if (ytPlayer && ytPlayer.pauseVideo) {
                ytPlayer.pauseVideo();
                document.getElementById('play-pause-btn').textContent = '▶️';
                isPlaying = false;
            }
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
        navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    }
}
// --- DÉCONNEXION ---
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
}