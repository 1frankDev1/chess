import { SceneManager } from './scene.js';
import { Board } from './board.js';
import { PieceManager } from './pieces.js';
import { Game } from './game.js';
import { InputHandler } from './input.js';

class Main {
    constructor() {
        this.initUI();
        this.initGame();
        this.showGame();
    }

    initUI() {
        this.gameUI = document.getElementById('game-ui');
        this.btnReset = document.getElementById('btn-reset');
        this.turnDisplay = document.getElementById('current-turn-display');
        this.loadingOverlay = document.getElementById('loading-overlay');

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

    async handleReset() {
        if (confirm('¿Reiniciar partida?')) {
            await this.game.startNewGame();
        }
    }

    async showGame() {
        this.gameUI.classList.remove('hidden');
        this.loadingOverlay.classList.remove('hidden');

        await this.pieceManager.loadModels();
        this.loadingOverlay.classList.add('hidden');

        if (!this.game.gameId) {
            await this.game.startNewGame();
        }
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
