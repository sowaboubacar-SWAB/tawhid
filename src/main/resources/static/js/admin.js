const YOUTUBE_API_KEY = 'AIzaSyBvWTqN01Qk9YdQ3yOcSRc1o35P8ig768o';
const token = localStorage.getItem('token');

async function importerPlaylistYouTube() {
    const url = prompt("Collez l'URL de la playlist YouTube (ex: https://www.youtube.com/playlist?list=PL...):");
    if (!url) return;

    // 1. Extraire l'ID de la playlist (ce qui suit "list=")
    let playlistId = null;
    const match = url.match(/[&?]list=([^&]+)/);
    if (match) {
        playlistId = match[1];
    } else {
        alert("URL invalide. Assurez-vous que c'est une playlist YouTube (avec 'list=' dans l'URL).");
        return;
    }

    try {
        // 2. Appeler l'API YouTube pour récupérer les vidéos
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`);

        if (!response.ok) throw new Error("Erreur API YouTube");

        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            alert("Aucune vidéo trouvée dans cette playlist.");
            return;
        }

        // 3. Remplir la liste des vidéos à ajouter (pour l'interface admin)
        const container = document.getElementById('imported-videos-container');
        container.innerHTML = '<h3>Vidéos trouvées :</h3>';

        data.items.forEach(item => {
            const videoId = item.snippet.resourceId.videoId;
            const title = item.snippet.title;
            const div = document.createElement('div');
            div.style.padding = '5px';
            div.innerHTML = `<input type="checkbox" checked value="${videoId}" data-title="${title}"> ${title} (${videoId})`;
            container.appendChild(div);
        });

        // Afficher le bouton pour importer
        document.getElementById('import-btn-confirm').style.display = 'block';

    } catch (error) {
        console.error(error);
        alert("Impossible de récupérer la playlist. Vérifie ta clé API et que l'API YouTube est activée.");
    }
}

// Fonction pour ajouter les vidéos sélectionnées à la playlist active
async function confirmerImportation() {
    const playlistId = document.getElementById('playlist-select').value;
    if (!playlistId) {
        alert("Sélectionnez une playlist de destination dans le menu déroulant.");
        return;
    }

    const checkboxes = document.querySelectorAll('#imported-videos-container input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert("Aucune vidéo sélectionnée.");
        return;
    }

    let successCount = 0;
    for (const cb of checkboxes) {
        const youtubeId = cb.value;
        const titre = cb.getAttribute('data-title');

        const response = await fetch(`/api/videos/playlists/${playlistId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({titre: titre, youtubeId: youtubeId})
        });

        if (response.ok) successCount++;
    }

    alert(`${successCount} vidéos importées avec succès !`);
    document.getElementById('imported-videos-container').innerHTML = '';
    document.getElementById('import-btn-confirm').style.display = 'none';
    chargerPlaylistsSelect(); // Rafraîchir
}


// Charger les playlists dans le menu déroulant
async function chargerPlaylistsSelect() {
    try {
        const response = await fetch('/api/playlists', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const playlists = await response.json();
        const select = document.getElementById('playlist-select');
        select.innerHTML = '';

        if (playlists.length === 0) {
            select.innerHTML = '<option value="">Aucune playlist</option>';
            return;
        }

        playlists.forEach(p => {
            select.innerHTML += `<option value="${p.id}">${p.titre}</option>`;
        });
    } catch (e) {
        console.error(e);
    }
}

// Créer une playlist
async function creerPlaylist() {
    const titre = document.getElementById('new-playlist-title').value;
    const desc = document.getElementById('new-playlist-desc').value;

    if (!titre) {
        alert('Le titre est obligatoire');
        return;
    }

    try {
        const response = await fetch('/api/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ titre: titre, description: desc })
        });

        if (response.ok) {
            alert('Playlist créée avec succès !');
            document.getElementById('new-playlist-title').value = '';
            document.getElementById('new-playlist-desc').value = '';
            chargerPlaylistsSelect(); // Rafraîchir la liste
        } else {
            alert('Erreur lors de la création. Vérifie tes droits admin.');
        }
    } catch (e) {
        console.error(e);
        alert('Erreur réseau');
    }
}

// Ajouter une vidéo
async function ajouterVideo() {
    const playlistId = document.getElementById('playlist-select').value;
    const titre = document.getElementById('new-video-title').value;
    const youtubeId = document.getElementById('new-video-youtube-id').value;

    if (!playlistId) {
        alert('Veuillez sélectionner une playlist');
        return;
    }
    if (!titre || !youtubeId) {
        alert('Titre et ID YouTube sont obligatoires');
        return;
    }

    try {
        const response = await fetch(`/api/videos/playlists/${playlistId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ titre: titre, youtubeId: youtubeId })
        });

        if (response.ok) {
            alert('Vidéo ajoutée avec succès !');
            document.getElementById('new-video-title').value = '';
            document.getElementById('new-video-youtube-id').value = '';
        } else {
            alert('Erreur lors de l\'ajout. Vérifie tes droits admin.');
        }
    } catch (e) {
        console.error(e);
        alert('Erreur réseau');
    }
}

// Au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    chargerPlaylistsSelect();
});

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}
// Remplir le second menu déroulant pour la gestion
async function chargerPlaylistsSelectManage() {
    try {
        const response = await fetch('/api/playlists', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const playlists = await response.json();
        const select = document.getElementById('playlist-select-manage');
        select.innerHTML = '<option value="">Sélectionnez une playlist</option>';

        playlists.forEach(p => {
            select.innerHTML += `<option value="${p.id}">${p.titre}</option>`;
        });
    } catch (e) { console.error(e); }
}

// Charger les vidéos de la playlist sélectionnée pour les gérer
async function chargerVideosAdmin() {
    const playlistId = document.getElementById('playlist-select-manage').value;
    const container = document.getElementById('admin-video-list');

    if (!playlistId) {
        container.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`/api/videos/playlists/${playlistId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const videos = await response.json();

        container.innerHTML = '';
        if (videos.length === 0) {
            container.innerHTML = '<p>Aucune vidéo dans cette playlist.</p>';
            return;
        }

        videos.forEach(video => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.padding = '10px';
            div.style.borderBottom = '1px solid #444';

            div.innerHTML = `
                <span>${video.titre} (${video.youtubeId})</span>
                <button onclick="supprimerVideo(${video.id})" style="background: #ff4444; width: auto; padding: 5px 10px; font-size: 12px; margin: 0;">🗑️ Supprimer</button>
            `;
            container.appendChild(div);
        });
    } catch (e) { console.error(e); }
}

// Supprimer une vidéo
async function supprimerVideo(videoId) {
    if (!confirm('Voulez-vous vraiment supprimer cette vidéo ?')) return;

    try {
        const response = await fetch(`/api/videos/${videoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Vidéo supprimée !');
            chargerVideosAdmin(); // Rafraîchir la liste
        } else {
            alert('Erreur lors de la suppression (êtes-vous admin ?)');
        }
    } catch (e) {
        console.error(e);
        alert('Erreur réseau');
    }
}

// Modifier l'initialisation pour charger le second menu
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    chargerPlaylistsSelect();
    chargerPlaylistsSelectManage(); // <-- Nouvelle ligne
});