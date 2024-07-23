function validateFormSignUp(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const pseudo = document.getElementById('pseudo').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const repassword = document.getElementById('repassword').value.trim();
    let errorMessage = '';

    if (!name || !pseudo || !email || !password || !repassword) {
        errorMessage += 'Tous les champs doivent être remplis.\n';
    }

    if (password.length < 8) {
        errorMessage += 'Le mot de passe doit contenir au moins 8 caractères.\n';
        
    }else{
        if (password !== repassword) {
            errorMessage += 'Les mots de passe ne correspondent pas.\n';
        }
    }
    if (errorMessage) {
        alert(errorMessage);
    } else {
        document.getElementById('signUpForm').submit();
    }
}

function validateFormLogin(event) {
    event.preventDefault(); 
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    let errorMessage = '';

    if (!email || !password) {
        errorMessage += 'Tous les champs doivent être remplis.\n';
    }
    if (errorMessage) {
        alert(errorMessage);
    } else {
        document.getElementById('loginForm').submit();
    }
}