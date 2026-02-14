import { supabase, signIn, signUp, signOut, onAuthStateChange, getActiveGame } from './supabase.js';
import { SceneManager } from './scene.js';
import { Board } from './board.js';
import { PieceManager } from './pieces.js';
import { Game } from './game.js';
import { InputHandler } from './input.js';

class Main {
    constructor() {
        this.initUI();
        this.initGame();
        this.setupAuth();
    }

    initUI() {
        this.authContainer = document.getElementById('auth-container');
        this.gameUI = document.getElementById('game-ui');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.btnLogin = document.getElementById('btn-login');
        this.btnRegister = document.getElementById('btn-register');
        this.btnLogout = document.getElementById('btn-logout');
        this.btnReset = document.getElementById('btn-reset');
        this.authError = document.getElementById('auth-error');
        this.turnDisplay = document.getElementById('current-turn-display');
        this.loadingOverlay = document.getElementById('loading-overlay');

        this.btnLogin.addEventListener('click', () => this.handleLogin());
        this.btnRegister.addEventListener('click', () => this.handleRegister());
        this.btnLogout.addEventListener('click', () => this.handleLogout());
        this.btnReset.addEventListener('click', () => this.handleReset());
    }

    async initGame() {
        const container = document.getElementById('canvas-container');
        this.sceneManager = new SceneManager(container);
        this.board = new Board(this.sceneManager.scene);
        this.pieceManager = new PieceManager(this.sceneManager.scene);
        this.game = new Game(this.sceneManager, this.board, this.pieceManager);
        this.inputHandler = new InputHandler(this.sceneManager, this.game, this.board);

        this.animate();
    }

    setupAuth() {
        onAuthStateChange((event, session) => {
            if (session) {
                this.showGame(session.user);
            } else {
                this.showAuth();
            }
        });
    }

    async handleLogin() {
        const email = this.emailInput.value;
        const password = this.passwordInput.value;
        try {
            await signIn(email, password);
        } catch (error) {
            this.authError.textContent = error.message;
        }
    }

    async handleRegister() {
        const email = this.emailInput.value;
        const password = this.passwordInput.value;
        try {
            await signUp(email, password);
            alert('Registro exitoso. Revisa tu email para confirmar (si está activado).');
        } catch (error) {
            this.authError.textContent = error.message;
        }
    }

    async handleLogout() {
        try {
            await signOut();
        } catch (error) {
            console.error(error);
        }
    }

    async handleReset() {
        if (confirm('¿Reiniciar partida?')) {
            const user = (await supabase.auth.getUser()).data.user;
            if (user) {
                await this.game.startNewGame(user.id, user.id); // Para demo, mismo jugador
            }
        }
    }

    async showGame(user) {
        this.authContainer.classList.add('hidden');
        this.gameUI.classList.remove('hidden');
        this.loadingOverlay.classList.remove('hidden');

        await this.pieceManager.loadModels();
        this.loadingOverlay.classList.add('hidden');

        // Intentar retomar partida activa
        const activeGame = await getActiveGame(user.id);
        if (activeGame) {
            await this.game.loadGame(activeGame.id);
        } else if (!this.game.gameId) {
            await this.game.startNewGame(user.id, user.id);
        }
    }

    showAuth() {
        this.authContainer.classList.remove('hidden');
        this.gameUI.classList.add('hidden');
    }

    animate(time) {
        requestAnimationFrame((t) => this.animate(t));
        
        const deltaTime = this.lastTime ? (time - this.lastTime) / 1000 : 0;
        this.lastTime = time;

        if (this.pieceManager) {
            this.pieceManager.update(deltaTime);
        }

        this.sceneManager.render();
        
        // Update turn display
        if (this.game) {
            const turnText = this.game.turn === 'white' ? 'Blanco' : 'Negro';
            this.turnDisplay.textContent = `Turno: ${turnText}`;
        }
    }
}

// Start the application
new Main();
