export async function loadTranslations(lang) {
    try {
        const response = await fetch(`/../templates/translations/${lang}.json`);
        const translations = await response.json();

        // Translations for home page
        const homeTitle = document.getElementById('online-game-title');
        if (homeTitle) {
            homeTitle.innerHTML = translations.online_game_title;
            document.getElementById('online-game-description').innerHTML = translations.online_game_description;
            document.getElementById('online-game-button').innerHTML = translations.online_game_button;

            document.getElementById('tournament-title').innerHTML = translations.tournament_title;
            document.getElementById('tournament-description').innerHTML = translations.tournament_description;
            document.getElementById('tournament-button').innerHTML = translations.tournament_button;

            document.getElementById('local-game-title').innerHTML = translations.local_game_title;
            document.getElementById('local-game-description').innerHTML = translations.local_game_description;
            document.getElementById('local-game-button').innerHTML = translations.local_game_button;

            document.getElementById('score-title').innerHTML = translations.score_title;
        }

        // Translations for login page
        const loginTitle = document.querySelector('.login-title');
        if (loginTitle) {
            loginTitle.innerHTML = translations.login_hello;
            document.querySelector('.login-welcome-message').innerHTML = translations.login_welcome_message;
            document.querySelector('input[ref="username"]').placeholder = translations.login_username_placeholder;
            document.querySelector('input[ref="password"]').placeholder = translations.login_password_placeholder;
            document.querySelector('label[for="remember-me"]').innerHTML = translations.login_remember_me;
            document.querySelector('.button[type="submit"]').innerHTML = translations.login_button;
            document.getElementById('ft_auth').innerHTML = translations.login_with_42;
            document.querySelector('.signup-link').innerHTML = translations.login_signup_message;
            document.querySelector('.forgot-password-link').innerHTML = translations.forgot_password;
        }

    } catch (error) {
        console.error("Erreur lors du chargement des traductions :", error);
    }
}
