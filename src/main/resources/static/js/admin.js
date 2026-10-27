const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Afficher le nom de l'admin en bas de page
    const adminFooter = document.createElement('div');
    adminFooter.style.cssText = 'position: fixed; bottom: 10px; right: 10px; color: #888; font-size: 12px;';
    adminFooter.textContent = `Connecté en tant que : ${username} (Admin)`;
    document.body.appendChild(adminFooter);

    // Charger les menus
    chargerPlaylistsSelect();
    chargerPlaylistsSelectManage();
    chargerPlaylistsSelectUpload();
    chargerPlaylistsSelectManageAudios();
    chargerUtilisateurs();
    chargerPlaylistsAdmin();
});

// ==========================================
// 1. GESTION DES PLAYLISTS
// ==========================================
async function creerPlaylist() {
    const titre = document.getElementById('new-playlist-title').value;
    const desc = document.getElementById('new-playlist-desc').value;
    if (!titre) return alert('Le titre est obligatoire');

    try {
        const response = await fetch('/api/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ titre: titre, description: desc })
        });

        if (response.ok) {
            alert('Playlist créée !');
            document.getElementById('new-playlist-title').value = '';
            document.getElementById('new-playlist-desc').value = '';
            chargerPlaylistsSelect();
            chargerPlaylistsSelectManage();
            chargerPlaylistsSelectUpload();
            chargerPlaylistsSelectManageAudios();
            chargerPlaylistsAdmin();
        } else {
            alert('Erreur lors de la création');
        }
    } catch (e) { console.error(e); }
}

async function chargerPlaylistsAdmin() {
    const container = document.getElementById('playlists-admin-list');
    container.innerHTML = '<p>Chargement...</p>';

    try {
        const response = await fetch('/api/playlists', { headers: { 'Authorization': `Bearer ${token}` } });
        const playlists = await response.json();

        container.innerHTML = '';
        if (playlists.length === 0) {
            container.innerHTML = '<p>Aucune playlist.</p>';
            return;
        }

        playlists.forEach(p => {
            const div = document.createElement('div');
            div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #444;';
            div.innerHTML = `
                <span><strong>${p.titre}</strong> (ID: ${p.id})</span>
                <button onclick="supprimerPlaylist(${p.id})" style="background: #ff4444; width: auto; padding: 5px 10px; font-size: 12px; margin: 0;">🗑️ Supprimer</button>
            `;
            container.appendChild(div);
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p style="color: #ff6b6b;">Erreur de chargement.</p>';
    }
}

async function supprimerPlaylist(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette playlist ? Toutes les vidéos et audios associés seront aussi supprimés.')) return;

    try {
        const response = await fetch(`/api/playlists/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Playlist supprimée !');
            chargerPlaylistsAdmin();
            chargerPlaylistsSelect();
            chargerPlaylistsSelectManage();
            chargerPlaylistsSelectUpload();
            chargerPlaylistsSelectManageAudios();
        } else {
            alert('Erreur lors de la suppression.');
        }
    } catch (e) {
        console.error(e);
        alert('Erreur réseau.');
    }
}

// ==========================================
// 2. VIDÉOS YOUTUBE (Ajout / Import)
// ==========================================
async function chargerPlaylistsSelect() {
    try {
        const response = await fetch('/api/playlists', { headers: { 'Authorization': `Bearer ${token}` } });
        const playlists = await response.json();
        const select = document.getElementById('playlist-select');
        select.innerHTML = '<option value="">Sélectionnez une playlist</option>';
        playlists.forEach(p => select.innerHTML += `<option value="${p.id}">${p.titre}</option>`);
    } catch (e) { console.error(e); }
}

async function ajouterVideo() {
    const playlistId = document.getElementById('playlist-select').value;
    const titre = document.getElementById('new-video-title').value;
    const youtubeId = document.getElementById('new-video-youtube-id').value;
    if (!playlistId) return alert('Sélectionnez une playlist');
    if (!titre || !youtubeId) return alert('Titre et ID YouTube sont obligatoires');

    try {
        const response = await fetch(`/api/videos/playlists/${playlistId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ titre: titre, youtubeId: youtubeId })
        });
        if (response.ok) {
            alert('Vidéo ajoutée !');
            document.getElementById('new-video-title').value = '';
            document.getElementById('new-video-youtube-id').value = '';
        } else {
            const error = await response.text();
            alert('Erreur : ' + error);
        }
    } catch (e) { console.error(e); }
}

// ==========================================
// 3. AUDIOS (Upload / Gestion)
// ==========================================
async function chargerPlaylistsSelectUpload() {
    try {
        const response = await fetch('/api/playlists', { headers: { 'Authorization': `Bearer ${token}` } });
        const playlists = await response.json();
        const select = document.getElementById('upload-audio-playlist-select');
        select.innerHTML = '<option value="">Sélectionnez une playlist</option>';
        playlists.forEach(p => select.innerHTML += `<option value="${p.id}">${p.titre}</option>`);
    } catch (e) { console.error(e); }
}

async function chargerPlaylistsSelectManageAudios() {
    try {
        const response = await fetch('/api/playlists', { headers: { 'Authorization': `Bearer ${token}` } });
        const playlists = await response.json();
        const select = document.getElementById('manage-audio-playlist-select');
        select.innerHTML = '<option value="">Sélectionnez une playlist</option>';
        playlists.forEach(p => select.innerHTML += `<option value="${p.id}">${p.titre}</option>`);
    } catch (e) { console.error(e); }
}

async function uploadAudio() {
    const playlistId = document.getElementById('upload-audio-playlist-select').value;
    const titre = document.getElementById('audio-title').value;
    const artiste = document.getElementById('audio-artist').value;
    const fileInput = document.getElementById('audio-file');

    if (!playlistId || fileInput.files.length === 0) {
        alert('Playlist et au moins un fichier sont obligatoires.');
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('files', fileInput.files[i]);
    }
    if (titre.trim() !== '') formData.append('titre', titre);
    formData.append('artiste', artiste);
    formData.append('playlistId', playlistId);

    try {
        const response = await fetch('/api/files/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) throw new Error('Erreur lors de l\'upload');

        const message = await response.text();
        alert(message);

        document.getElementById('audio-title').value = '';
        document.getElementById('audio-artist').value = '';
        document.getElementById('audio-file').value = '';
        chargerAudiosAdmin();
    } catch (error) {
        console.error(error);
        alert('Erreur lors de l\'upload.');
    }
}

async function chargerAudiosAdmin() {
    const playlistId = document.getElementById('manage-audio-playlist-select').value;
    const container = document.getElementById('admin-audio-list');
    if (!playlistId) { container.innerHTML = ''; return; }

    try {
        const response = await fetch(`/api/audios/playlists/${playlistId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const audios = await response.json();

        container.innerHTML = '';
        if (audios.length === 0) {
            container.innerHTML = '<p>Aucun audio dans cette playlist.</p>';
            return;
        }

        audios.forEach(a => {
            const div = document.createElement('div');
            div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #444;';
            div.innerHTML = `
                <span><strong>${a.titre}</strong> - ${a.artiste || 'Artiste inconnu'}</span>
                <button onclick="supprimerAudio(${a.id})" style="background: #ff4444; width: auto; padding: 5px 10px; font-size: 12px; margin: 0;">🗑️</button>
            `;
            container.appendChild(div);
        });
    } catch (e) { console.error(e); }
}

async function supprimerAudio(id) {
    if (!confirm('Voulez-vous vraiment supprimer cet audio ?')) return;

    try {
        const response = await fetch(`/api/audios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Audio supprimé !');
            chargerAudiosAdmin();
        } else {
            alert('Erreur lors de la suppression.');
        }
    } catch (e) {
        console.error(e);
        alert('Erreur réseau.');
    }
}

// ==========================================
// 4. GESTION DES VIDÉOS EXISTANTES
// ==========================================
async function chargerPlaylistsSelectManage() {
    try {
        const response = await fetch('/api/playlists', { headers: { 'Authorization': `Bearer ${token}` } });
        const playlists = await response.json();
        const select = document.getElementById('playlist-select-manage');
        select.innerHTML = '<option value="">Sélectionnez une playlist</option>';
        playlists.forEach(p => select.innerHTML += `<option value="${p.id}">${p.titre}</option>`);
    } catch (e) { console.error(e); }
}

async function chargerVideosAdmin() {
    const playlistId = document.getElementById('playlist-select-manage').value;
    const container = document.getElementById('admin-video-list');
    if (!playlistId) { container.innerHTML = ''; return; }

    try {
        const response = await fetch(`/api/videos/playlists/${playlistId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const videos = await response.json();
        container.innerHTML = '';
        if (videos.length === 0) {
            container.innerHTML = '<p>Aucune vidéo dans cette playlist.</p>';
            return;
        }
        videos.forEach(video => {
            const div = document.createElement('div');
            div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #444;';
            div.innerHTML = `
                <span>${video.titre} (${video.youtubeId})</span>
                <button onclick="supprimerVideo(${video.id})" style="background: #ff4444; width: auto; padding: 5px 10px; font-size: 12px; margin: 0;">🗑️</button>
            `;
            container.appendChild(div);
        });
    } catch (e) { console.error(e); }
}

async function supprimerVideo(videoId) {
    if (!confirm('Voulez-vous vraiment supprimer cette vidéo ?')) return;
    try {
        const response = await fetch(`/api/videos/${videoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert('Vidéo supprimée !');
            chargerVideosAdmin();
        } else {
            alert('Erreur lors de la suppression');
        }
    } catch (e) { console.error(e); }
}

// ==========================================
// 5. GESTION DES UTILISATEURS
// ==========================================
async function chargerUtilisateurs() {
    const container = document.getElementById('users-list');
    container.innerHTML = '<p>Chargement...</p>';
    try {
        const response = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error('Erreur de chargement');
        const users = await response.json();
        container.innerHTML = '';
        if (users.length === 0) {
            container.innerHTML = '<p>Aucun utilisateur inscrit.</p>';
            return;
        }
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.innerHTML = `
            <thead><tr style="border-bottom: 2px solid #4CAF50; text-align: left;">
                <th style="padding: 8px;">ID</th><th style="padding: 8px;">Nom</th><th style="padding: 8px;">Rôle</th><th style="padding: 8px;">Action</th>
            </tr></thead>
            <tbody>
                ${users.map(u => `
                    <tr style="border-bottom: 1px solid #444;">
                        <td style="padding: 8px;">${u.id}</td>
                        <td style="padding: 8px;">${u.username}</td>
                        <td style="padding: 8px;">${u.role === 'ROLE_ADMIN' ? '👑 Admin' : '👤 User'}</td>
                        <td style="padding: 8px;"><button onclick="supprimerUtilisateur(${u.id})" style="background: #ff4444; width: auto; padding: 5px 10px; font-size: 12px;">🗑️</button></td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.appendChild(table);
    } catch (error) {
        container.innerHTML = '<p style="color: #ff6b6b;">Erreur lors du chargement des utilisateurs.</p>';
    }
}

async function supprimerUtilisateur(id) {
    if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert('Utilisateur supprimé !');
            chargerUtilisateurs();
        } else {
            alert('Erreur lors de la suppression');
        }
    } catch (e) { console.error(e); }
}

// ==========================================
// 6. IMPORT YOUTUBE
// ==========================================
const YOUTUBE_API_KEY = 'AIzaSyAJ8V0dRSDoAq9RlO5hjj6UeK7T1pS7aEE';

async function importerPlaylistYouTube() {
    const url = prompt("Collez l'URL de la playlist YouTube (ex: https://www.youtube.com/playlist?list=PL...):");
    if (!url) return;

    let playlistId = null;
    const match = url.match(/[&?]list=([^&]+)/);
    if (match) { playlistId = match[1]; }
    else { alert("URL invalide. Assurez-vous que c'est une playlist YouTube."); return; }

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`);
        if (!response.ok) throw new Error("Erreur API YouTube");
        const data = await response.json();
        if (!data.items || data.items.length === 0) { alert("Aucune vidéo trouvée."); return; }

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
        document.getElementById('import-btn-confirm').style.display = 'block';
    } catch (error) {
        console.error(error);
        alert("Impossible de récupérer la playlist. Vérifie ta clé API.");
    }
}

async function confirmerImportation() {
    const playlistId = document.getElementById('playlist-select').value;
    if (!playlistId) { alert("Sélectionnez une playlist de destination."); return; }
    const checkboxes = document.querySelectorAll('#imported-videos-container input[type="checkbox"]:checked');
    if (checkboxes.length === 0) { alert("Aucune vidéo sélectionnée."); return; }

    let successCount = 0;
    for (const cb of checkboxes) {
        const youtubeId = cb.value;
        const titre = cb.getAttribute('data-title');
        const response = await fetch(`/api/videos/playlists/${playlistId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ titre: titre, youtubeId: youtubeId })
        });
        if (response.ok) successCount++;
    }
    alert(`${successCount} vidéos importées !`);
    document.getElementById('imported-videos-container').innerHTML = '';
    document.getElementById('import-btn-confirm').style.display = 'none';
    chargerVideosAdmin();
}

// ==========================================
// 7. DÉCONNEXION
// ==========================================
function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}