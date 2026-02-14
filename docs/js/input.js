import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class InputHandler {
    constructor(sceneManager, game, board) {
        this.sceneManager = sceneManager;
        this.game = game;
        this.board = board;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.setupEventListeners();
    }

    setupEventListeners() {
        const canvas = this.sceneManager.renderer.domElement;

        canvas.addEventListener('mousedown', (e) => this.onPointerDown(e));
        canvas.addEventListener('touchstart', (e) => {
            // touchstart event doesn't have clientX/Y in the same way as mouse
            const touch = e.touches[0];
            this.onPointerDown(touch);
        }, { passive: false });
    }

    onPointerDown(event) {
        // Calcular posición normalizada del ratón (-1 a +1)
        const rect = this.sceneManager.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

        // Interectar con objetos en la escena
        const intersects = this.raycaster.intersectObjects(this.sceneManager.scene.children, true);

        if (intersects.length > 0) {
            let object = intersects[0].object;
            
            // Subir por la jerarquía hasta encontrar un objeto con userData relevante
            while (object && object.userData.gridX === undefined && !object.userData.isSquare) {
                if (object.parent && object.parent.userData.gridX !== undefined) {
                    object = object.parent;
                    break;
                }
                object = object.parent;
            }

            if (!object) return;

            const gridX = object.userData.gridX;
            const gridZ = object.userData.gridZ;

            if (this.game.selectedPiece) {
                // Intentar mover si ya hay una pieza seleccionada
                const moved = this.game.moveSelectedPiece(gridX, gridZ);
                if (!moved) {
                    // Si no se pudo mover, intentar seleccionar una nueva pieza (del mismo turno)
                    this.game.selectPiece(gridX, gridZ);
                }
            } else {
                // Seleccionar pieza
                this.game.selectPiece(gridX, gridZ);
            }
        } else {
            // Click fuera de objetos relevantes, limpiar selección
            this.game.selectedPiece = null;
            this.board.clearHighlights();
        }
    }
}
