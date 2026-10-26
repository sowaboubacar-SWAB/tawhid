// ==========================================
// VARIABLES GLOBALES
// ==========================================
let playlists = [];
let currentPlaylistVideos = [];
let currentVideoIndex = 0;
let ytPlayer = null;
let isPlaying = false;
let currentToken = localStorage.getItem('token');
let currentAudioPlayer = null; // 'youtube' ou 'audio'
let wakeLock = null;

// Variables pour le lecteur plein écran
let isShuffleOn = false;
let loopMode = 0; // 0 = pas de boucle, 1 = boucle playlist, 2 = boucle piste

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (!currentToken) {
        window.location.href = '/login.html';
        return;
    }
    document.getElementById('welcome-msg').textContent = `Dalal ak jamm, ${localStorage.getItem('username')}`;

    if (isUserAdmin()) {
        document.getElementById('admin-btn').style.display = 'inline-block';
    }

    chargerPlaylists();

    // Lancer la boucle de mise à jour de la barre
    setInterval(updateProgressBar, 1000);

    // Synchronisation de la vue plein écran
    setInterval(() => {
        const fs = document.getElementById('fullscreen-player');
        if (fs && fs.classList.contains('active')) {
            syncProgressBar();
            updateFsTrackList();
        }
    }, 1000);

    // Gérer le clic sur la barre de progression principale
    document.getElementById('progress-bar')?.addEventListener('input', function() {
        if (currentAudioPlayer === 'audio') {
            const audioPlayer = document.getElementById('html-audio-player');
            if (audioPlayer.duration) {
                audioPlayer.currentTime = (this.value / 100) * audioPlayer.duration;
            }
        } else if (currentAudioPlayer === 'youtube') {
            if (!ytPlayer || !ytPlayer.getDuration) return;
            const seekTo = (this.value / 100) * ytPlayer.getDuration();
            ytPlayer.seekTo(seekTo, true);
        }
    });

    // Gérer le clic sur la barre de progression plein écran
    document.getElementById('fs-progress-bar')?.addEventListener('input', function() {
        if (currentAudioPlayer === 'audio') {
            const audioPlayer = document.getElementById('html-audio-player');
            if (audioPlayer.duration) {
                audioPlayer.currentTime = (this.value / 100) * audioPlayer.duration;
            }
        } else if (currentAudioPlayer === 'youtube') {
            if (!ytPlayer || !ytPlayer.getDuration) return;
            const seekTo = (this.value / 100) * ytPlayer.getDuration();
            ytPlayer.seekTo(seekTo, true);
        }
    });
});

// ==========================================
// GESTION DES PLAYLISTS
// ==========================================
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
            card.onclick = () => chargerVideos(playlist.id, playlist.titre, playlist.description);
            card.innerHTML = `
                <div class="cover">🎵</div>
                <h3>${playlist.titre}</h3>
                <p>${playlist.description || 'Pas de description'}</p>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erreur:", error);
    }
}

// ==========================================
// CHARGEMENT DES VIDÉOS ET AUDIOS D'UNE PLAYLIST
// ==========================================
async function chargerVideos(playlistId, playlistTitle, playlistDesc) {
    document.getElementById('playlists-view').style.display = 'none';
    document.getElementById('playlist-detail-view').style.display = 'block';

    document.getElementById('detail-playlist-title').textContent = playlistTitle;
    document.getElementById('detail-playlist-desc').textContent = playlistDesc || '';

    try {
        const response = await fetch(`/api/videos/playlists/${playlistId}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (!response.ok) throw new Error('Erreur de chargement');

        currentPlaylistVideos = await response.json();
        const videoList = document.getElementById('video-list');
        videoList.innerHTML = '';

        if (currentPlaylistVideos.length === 0) {
            videoList.innerHTML = '<li style="color: #888;">Aucune vidéo dans cette playlist.</li>';
        } else {
            currentPlaylistVideos.forEach((video, index) => {
                const li = document.createElement('li');
                li.textContent = `${index + 1}. ${video.titre}`;
                li.onclick = () => {
                    currentVideoIndex = index;
                    lancerVideo(video.youtubeId, video.titre);
                };
                videoList.appendChild(li);
            });
        }

        chargerAudios(playlistId, playlistTitle);

    } catch (error) {
        console.error("Erreur:", error);
    }
}

async function chargerAudios(playlistId, playlistTitle) {
    try {
        const response = await fetch(`/api/audios/playlists/${playlistId}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (!response.ok) throw new Error('Erreur de chargement des audios');

        const audios = await response.json();
        const list = document.getElementById('audio-list');
        list.innerHTML = '';

        if (audios.length === 0) {
            document.getElementById('audios-section').style.display = 'none';
            return;
        }
        document.getElementById('audios-section').style.display = 'block';

        audios.forEach(audio => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="flex: 1; display: flex; align-items: center; gap: 15px;">
                    <span style="color: #1DB954; font-size: 20px;">▶</span>
                    <div>
                        <strong>${audio.titre}</strong><br>
                        <small style="color: #b3b3b3;">${audio.artiste || 'Artiste inconnu'}</small>
                    </div>
                </div>
            `;
            li.onclick = () => lancerAudio(audio.urlFichier, audio.titre, audio.artiste);
            list.appendChild(li);
        });

    } catch (error) {
        console.error(error);
    }
}

// ==========================================
// LECTEUR YOUTUBE
// ==========================================
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '200',
        width: '200',
        videoId: '',
        playerVars: {
            'autoplay': 0,
            'controls': 1,
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
    console.log("✅ Lecteur YouTube prêt !");
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        if (loopMode === 2) {
            lancerVideo(currentPlaylistVideos[currentVideoIndex].youtubeId, currentPlaylistVideos[currentVideoIndex].titre);
        } else if (loopMode === 1 || currentVideoIndex < currentPlaylistVideos.length - 1) {
            playNext();
        }
    }
}

// ==========================================
// LANCEMENT DES MÉDIAS
// ==========================================
function lancerVideo(videoId, titre) {
    // Arrêter l'audio s'il jouait
    const audioPlayer = document.getElementById('html-audio-player');
    if (audioPlayer) audioPlayer.pause();
    currentAudioPlayer = 'youtube';

    if (ytPlayer && ytPlayer.loadVideoById) {
        ytPlayer.loadVideoById(videoId);
        document.getElementById('now-playing-title').textContent = titre;
        document.getElementById('now-playing-artist').textContent = 'YouTube';
        document.getElementById('progress-bar').value = 0;
        document.getElementById('current-time').textContent = '0:00';
        isPlaying = true;
        document.getElementById('play-pause-btn').textContent = '⏸️';
        updateMediaSession(titre);
        requestWakeLock();
    } else {
        console.log("Lecteur YouTube pas prêt, nouvelle tentative dans 1s...");
        setTimeout(() => lancerVideo(videoId, titre), 1000);
    }
}

function lancerAudio(filename, titre, artiste) {
    // Arrêter YouTube s'il jouait
    if (ytPlayer && ytPlayer.pauseVideo) {
        ytPlayer.pauseVideo();
    }

    const audioPlayer = document.getElementById('html-audio-player');
    audioPlayer.src = `/api/files/${filename}`;
    audioPlayer.load();
    audioPlayer.play().catch(e => console.error("Erreur lecture audio:", e));

    document.getElementById('now-playing-title').textContent = titre;
    document.getElementById('now-playing-artist').textContent = artiste || 'Artiste inconnu';
    document.getElementById('progress-bar').value = 0;
    document.getElementById('current-time').textContent = '0:00';
    document.getElementById('play-pause-btn').textContent = '⏸️';

    currentAudioPlayer = 'audio';
    isPlaying = true;
    updateMediaSession(titre);
    requestWakeLock();
}

// ==========================================
// CONTRÔLES PLAY / PAUSE
// ==========================================
function togglePlay() {
    const audioPlayer = document.getElementById('html-audio-player');

    if (currentAudioPlayer === 'audio') {
        if (audioPlayer.paused) {
            audioPlayer.play();
            document.getElementById('play-pause-btn').textContent = '⏸️';
            isPlaying = true;
        } else {
            audioPlayer.pause();
            document.getElementById('play-pause-btn').textContent = '▶️';
            isPlaying = false;
        }
    } else if (currentAudioPlayer === 'youtube') {
        if (!ytPlayer) return;
        if (isPlaying) {
            ytPlayer.pauseVideo();
            document.getElementById('play-pause-btn').textContent = '▶️';
            isPlaying = false;
        } else {
            ytPlayer.playVideo();
            document.getElementById('play-pause-btn').textContent = '⏸️';
            isPlaying = true;
        }
    }

    // Synchroniser le bouton du lecteur plein écran
    const fsBtn = document.getElementById('fs-play-pause-btn');
    const mainBtn = document.getElementById('play-pause-btn');
    if (fsBtn && mainBtn) {
        fsBtn.textContent = mainBtn.textContent;
    }
}

// ==========================================
// SUIVANT / PRÉCÉDENT
// ==========================================
function playNext() {
    if (currentAudioPlayer === 'audio') return;
    if (currentPlaylistVideos.length === 0) return;

    if (isShuffleOn) {
        // Lecture aléatoire
        currentVideoIndex = Math.floor(Math.random() * currentPlaylistVideos.length);
    } else {
        currentVideoIndex = (currentVideoIndex + 1) % currentPlaylistVideos.length;
    }

    const video = currentPlaylistVideos[currentVideoIndex];
    lancerVideo(video.youtubeId, video.titre);
}

function playPrevious() {
    if (currentAudioPlayer === 'audio') return;
    if (currentPlaylistVideos.length === 0) return;
    currentVideoIndex = (currentVideoIndex - 1 + currentPlaylistVideos.length) % currentPlaylistVideos.length;
    const video = currentPlaylistVideos[currentVideoIndex];
    lancerVideo(video.youtubeId, video.titre);
}

// ==========================================
// BARRE DE PROGRESSION
// ==========================================
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function updateProgressBar() {
    if (currentAudioPlayer === 'audio') {
        const audioPlayer = document.getElementById('html-audio-player');
        if (audioPlayer.duration > 0) {
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            document.getElementById('progress-bar').value = percent;
            document.getElementById('current-time').textContent = formatTime(audioPlayer.currentTime);
            document.getElementById('total-time').textContent = formatTime(audioPlayer.duration);
        }
    } else if (currentAudioPlayer === 'youtube') {
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
}

// ==========================================
// WAKE LOCK
// ==========================================
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

// ==========================================
// MEDIA SESSION API
// ==========================================
function updateMediaSession(titre) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: titre,
            artist: 'Tawhid',
            album: 'Zikr Layenes'
        });

        navigator.mediaSession.setActionHandler('play', () => togglePlay());
        navigator.mediaSession.setActionHandler('pause', () => togglePlay());
        navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
        navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    }
}

// ==========================================
// LECTEUR PLEIN ÉCRAN
// ==========================================
function openFullscreenPlayer(event) {
    if (event && (event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT')) return;

    const fs = document.getElementById('fullscreen-player');
    fs.classList.add('active');

    document.getElementById('fs-title').textContent = document.getElementById('now-playing-title').textContent;
    document.getElementById('fs-artist').textContent = document.getElementById('now-playing-artist').textContent;

    updateFsTrackList();
    syncProgressBar();
}

function closeFullscreenPlayer() {
    document.getElementById('fullscreen-player').classList.remove('active');
}

function updateFsTrackList() {
    const list = document.getElementById('fs-track-list');
    list.innerHTML = '';

    if (currentAudioPlayer === 'youtube' && currentPlaylistVideos.length > 0) {
        currentPlaylistVideos.forEach((video, index) => {
            const li = document.createElement('li');
            li.textContent = video.titre;
            if (index === currentVideoIndex) li.classList.add('playing');
            li.onclick = () => {
                currentVideoIndex = index;
                lancerVideo(video.youtubeId, video.titre);
                closeFullscreenPlayer();
            };
            list.appendChild(li);
        });
    } else {
        list.innerHTML = '<li style="color: #888; justify-content: center;">Aucune piste en cours</li>';
    }
}

function syncProgressBar() {
    const mainBar = document.getElementById('progress-bar');
    const fsBar = document.getElementById('fs-progress-bar');
    const mainCurrent = document.getElementById('current-time');
    const mainTotal = document.getElementById('total-time');
    const fsCurrent = document.getElementById('fs-current-time');
    const fsTotal = document.getElementById('fs-total-time');

    if (mainBar && fsBar) {
        fsBar.value = mainBar.value;
        fsCurrent.textContent = mainCurrent.textContent;
        fsTotal.textContent = mainTotal.textContent;
    }
}

function toggleShuffle() {
    isShuffleOn = !isShuffleOn;
    document.getElementById('shuffle-btn').classList.toggle('active');
}

function toggleLoop() {
    loopMode = (loopMode + 1) % 3;
    const btn = document.getElementById('loop-btn');
    btn.classList.remove('active');

    if (loopMode === 1) {
        btn.textContent = '🔁';
        btn.classList.add('active');
    } else if (loopMode === 2) {
        btn.textContent = '🔂';
        btn.classList.add('active');
    } else {
        btn.textContent = '🔁';
    }
}

// ==========================================
// RETOUR & DÉCONNEXION
// ==========================================
function retourAccueil() {
    document.getElementById('playlists-view').style.display = 'block';
    document.getElementById('playlist-detail-view').style.display = 'none';
    document.getElementById('player-container').style.display = 'flex';
}

function isUserAdmin() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role === 'ROLE_ADMIN';
    } catch (e) {
        return false;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
}