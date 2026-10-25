async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '';

    // Validation côté client
    if (!username || !password || !confirmPassword) {
        errorDiv.textContent = 'Veuillez remplir tous les champs.';
        return;
    }
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Les mots de passe ne correspondent pas.';
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de l\'inscription.');
        }

        // Succès : on redirige vers la page de login
        alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        window.location.href = '/login.html';

    } catch (error) {
        errorDiv.textContent = error.message;
    }
}

// Permettre de valider avec la touche Entrée
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') register();
});