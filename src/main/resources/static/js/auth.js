async function login(){
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '';

    if(!username || !password){
        errorDiv.textContent = 'Veillez remplir tous les champs !';
        return;
    }
    try{
        //appel Api connexion
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: username, password: password})
        });
        if(!response.ok){
            throw new Error('Identifiants incorrects ou compte inexistant.');
        }

        const data = await response.json();
        // Stockage du token et du username dans le navigateur
        localStorage.setItem('token', data.token);      // <-- data.token (pas access_token)
        localStorage.setItem('username', username);     // <-- la variable username (pas data.username)

        // Redirection vers la page principale
        window.location.href = '/index.html';

    }catch(error){
        errorDiv.textContent = error.message;
    }
}
// Valider la touche entree !!
document.addEventListener('keypress', function(e) {
    if (e.keyCode == 'Enter') login();
});