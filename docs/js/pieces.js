import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { getModelUrl } from './supabase.js';

export class PieceManager {
    constructor(scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.models = new Map(); // Cache for models
        this.pieces = []; // Active pieces in the scene
    }

    async loadModels() {
        const pieceTypes = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
        const colors = ['white', 'black'];
        const promises = [];

        for (const type of pieceTypes) {
            for (const color of colors) {
                const path = `${type}_${color}.glb`;
                promises.push(this.loadModel(type, color, path));
            }
        }

        try {
            await Promise.all(promises);
            console.log('All models loaded successfully');
        } catch (error) {
            console.error('Error loading models:', error);
            // In a real scenario, we might want to show an error to the user
        }
    }

    async loadModel(type, color, path) {
        try {
            const url = await getModelUrl(path);
            return new Promise((resolve, reject) => {
                this.loader.load(
                    url,
                    (gltf) => {
                        const model = gltf.scene;
                        model.traverse((node) => {
                            if (node.isMesh) {
                                node.castShadow = true;
                                node.receiveShadow = true;
                                // Reutilizar materiales/geometrías si es posible
                                // node.material = ...
                            }
                        });
                        this.models.set(`${type}_${color}`, model);
                        resolve(model);
                    },
                    undefined,
                    (error) => {
                        console.error(`Error loading model ${path}:`, error);
                        // Usar un placeholder si falla
                        this.createPlaceholder(type, color);
                        resolve();
                    }
                );
            });
        } catch (error) {
            console.error(`Error getting URL for ${path}:`, error);
            this.createPlaceholder(type, color);
        }
    }

    createPlaceholder(type, color) {
        // Crear una geometría básica como fallback
        const geometry = type === 'pawn' ? new THREE.CylinderGeometry(0.2, 0.3, 0.5) : new THREE.BoxGeometry(0.4, 0.8, 0.4);
        const material = new THREE.MeshStandardMaterial({ color: color === 'white' ? 0xeeeeee : 0x333333 });
        const mesh = new THREE.Mesh(geometry, material);
        this.models.set(`${type}_${color}`, mesh);
    }

    createPiece(type, color, position) {
        const originalModel = this.models.get(`${type}_${color}`);
        if (!originalModel) return null;

        const piece = originalModel.clone();
        piece.position.set(position.x, 0, position.z);
        piece.userData = { type, color, gridX: position.gridX, gridZ: position.gridZ };
        this.scene.add(piece);
        this.pieces.push(piece);
        return piece;
    }

    clearPieces() {
        this.pieces.forEach(piece => this.scene.remove(piece));
        this.pieces = [];
    }

    removePieceAt(gridX, gridZ) {
        const index = this.pieces.findIndex(p => p.userData.gridX === gridX && p.userData.gridZ === gridZ);
        if (index !== -1) {
            this.scene.remove(this.pieces[index]);
            this.pieces.splice(index, 1);
        }
    }

    getPieceAt(gridX, gridZ) {
        return this.pieces.find(p => p.userData.gridX === gridX && p.userData.gridZ === gridZ);
    }

    update(deltaTime) {
        const lerpSpeed = 10;
        this.pieces.forEach(piece => {
            if (piece.userData.targetPosition) {
                piece.position.lerp(piece.userData.targetPosition, lerpSpeed * deltaTime);
                
                // Check if reached destination
                if (piece.position.distanceTo(piece.userData.targetPosition) < 0.01) {
                    piece.position.copy(piece.userData.targetPosition);
                    delete piece.userData.targetPosition;
                }
            }
        });
    }
}
