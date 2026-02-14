import {
    customSignIn,
    getCurrentUser,
    customSignOut,
    getCharacters,
    saveCharacter,
    deleteCharacter,
    listStorageFiles
} from './supabase.js';

class AdminChess {
    constructor() {
        this.initUI();
        this.checkAuth();
    }

    initUI() {
        // Login elements
        this.loginSection = document.getElementById('admin-login');
        this.dashboardSection = document.getElementById('admin-dashboard');
        this.usernameInput = document.getElementById('admin-username');
        this.passwordInput = document.getElementById('admin-password');
        this.btnLogin = document.getElementById('btn-login-admin');
        this.btnLogout = document.getElementById('btn-logout-admin');
        this.loginError = document.getElementById('admin-login-error');

        // Dashboard elements
        this.formAdd = document.getElementById('form-add-character');
        this.gltfSelect = document.getElementById('char-gltf-path');
        this.tableBody = document.querySelector('#table-characters tbody');

        this.btnLogin.addEventListener('click', () => this.handleLogin());
        this.btnLogout.addEventListener('click', () => this.handleLogout());
        this.formAdd.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async checkAuth() {
        const user = getCurrentUser();
        if (user && user.role === 'admin') {
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    async handleLogin() {
        const username = this.usernameInput.value;
        const password = this.passwordInput.value;
        try {
            const user = await customSignIn(username, password);
            if (user.role === 'admin') {
                this.showDashboard();
            } else {
                this.loginError.textContent = 'No tienes permisos de administrador';
                customSignOut();
            }
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
        await this.loadGltfList();
        await this.loadCharacters();
    }

    async loadGltfList() {
        try {
            const files = await listStorageFiles();
            this.gltfSelect.innerHTML = '<option value="">Seleccionar GLTF del Storage...</option>';
            files.forEach(file => {
                const option = document.createElement('option');
                option.value = file.name;
                option.textContent = file.name;
                this.gltfSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error listing files:', error);
        }
    }

    async loadCharacters() {
        try {
            const characters = await getCharacters();
            this.tableBody.innerHTML = '';
            characters.forEach(char => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${char.name}</td>
                    <td>${char.piece_type}</td>
                    <td>${char.gltf_path}</td>
                    <td>
                        <button class="btn-delete" data-id="${char.id}">Eliminar</button>
                    </td>
                `;
                tr.querySelector('.btn-delete').addEventListener('click', (e) => this.handleDelete(e.target.dataset.id));
                this.tableBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading characters:', error);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const character = {
            name: document.getElementById('char-name').value,
            piece_type: document.getElementById('char-piece-type').value,
            gltf_path: document.getElementById('char-gltf-path').value
        };

        try {
            await saveCharacter(character);
            this.formAdd.reset();
            await this.loadCharacters();
            alert('Personaje guardado con éxito');
        } catch (error) {
            alert('Error al guardar: ' + error.message);
        }
    }

    async handleDelete(id) {
        if (confirm('¿Estás seguro de eliminar este personaje?')) {
            try {
                await deleteCharacter(id);
                await this.loadCharacters();
            } catch (error) {
                alert('Error al eliminar: ' + error.message);
            }
        }
    }
}

new AdminChess();
