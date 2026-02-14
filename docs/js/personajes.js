import {
    customSignIn,
    getCurrentUser,
    customSignOut,
    getCharacters,
    getUserSelections,
    saveUserSelection
} from './supabase.js';

class PersonajesSelection {
    constructor() {
        this.pieceTypes = ['Rey', 'Reina', 'Torre', 'Alfil', 'Caballo', 'Peón'];
        this.initUI();
        this.checkAuth();
    }

    initUI() {
        this.loginSection = document.getElementById('user-login');
        this.dashboardSection = document.getElementById('selection-dashboard');
        this.usernameInput = document.getElementById('user-username');
        this.passwordInput = document.getElementById('user-password');
        this.btnLogin = document.getElementById('btn-login-user');
        this.btnLogout = document.getElementById('btn-logout-selection');
        this.loginError = document.getElementById('user-login-error');
        this.categoriesContainer = document.getElementById('piece-categories');
        this.btnSave = document.getElementById('btn-save-selections');

        this.btnLogin.addEventListener('click', () => this.handleLogin());
        this.btnLogout.addEventListener('click', () => this.handleLogout());
        this.btnSave.addEventListener('click', () => this.saveSelections());
    }

    async checkAuth() {
        const user = getCurrentUser();
        if (user) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    async handleLogin() {
        const username = this.usernameInput.value;
        const password = this.passwordInput.value;
        try {
            await customSignIn(username, password);
            this.showDashboard();
        } catch (error) {
            this.loginError.textContent = error.message;
        }
    }

    handleLogout() {
        customSignOut();
        window.location.reload();
    }

    showLogin() {
        this.loginSection.classList.remove('hidden');
        this.dashboardSection.classList.add('hidden');
    }

    async showDashboard() {
        this.loginSection.classList.add('hidden');
        this.dashboardSection.classList.remove('hidden');
        await this.loadSelectionMenu();
    }

    async loadSelectionMenu() {
        try {
            const characters = await getCharacters();
            const user = getCurrentUser();
            const currentSelections = await getUserSelections(user.id);

            this.categoriesContainer.innerHTML = '';

            this.pieceTypes.forEach(type => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category-group';
                categoryDiv.innerHTML = `<h3>${type}</h3>`;

                const select = document.createElement('select');
                select.id = `select-${type}`;
                select.innerHTML = `<option value="">Default (Chess Piece)</option>`;

                const typeChars = characters.filter(c => c.piece_type === type);
                typeChars.forEach(char => {
                    const option = document.createElement('option');
                    option.value = char.id;
                    option.textContent = char.name;

                    const isSelected = currentSelections.find(s => s.piece_type === type && s.character_id === char.id);
                    if (isSelected) option.selected = true;

                    select.appendChild(option);
                });

                categoryDiv.appendChild(select);
                this.categoriesContainer.appendChild(categoryDiv);
            });
        } catch (error) {
            console.error('Error loading menu:', error);
        }
    }

    async saveSelections() {
        const user = getCurrentUser();
        if (!user) return;

        try {
            const promises = this.pieceTypes.map(type => {
                const charId = document.getElementById(`select-${type}`).value;
                if (charId) {
                    return saveUserSelection(user.id, type, charId);
                }
                return Promise.resolve();
            });

            await Promise.all(promises);
            alert('Selecciones guardadas correctamente');
        } catch (error) {
            alert('Error al guardar: ' + error.message);
        }
    }
}

new PersonajesSelection();
