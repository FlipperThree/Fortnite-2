import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.player = null;
        this.materials = { wood: 999, brick: 999, metal: 999 }; // Start with max materials for testing
        this.health = 100;
        this.buildMode = false;
        this.currentBuildType = 'wall';
        this.weapons = {
            pickaxe: { damage: 20, range: 2 },
            pistol: { damage: 30, range: 50, ammo: 10 }
        };
        this.currentWeapon = 'pickaxe';
        this.buildPreview = null;
        this.buildings = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();
        this.createWorld();
        this.setupPlayer();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Sky blue background
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        this.scene.add(directionalLight);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Handle keyboard input
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    createWorld() {
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3a5f0b,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add some trees
        for (let i = 0; i < 50; i++) {
            const tree = this.createTree();
            tree.position.x = Math.random() * 1000 - 500;
            tree.position.z = Math.random() * 1000 - 500;
            this.scene.add(tree);
        }
    }

    createTree() {
        const tree = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(1, 1, 8, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 4;
        trunk.castShadow = true;
        tree.add(trunk);

        // Leaves
        const leavesGeometry = new THREE.ConeGeometry(4, 8, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 10;
        leaves.castShadow = true;
        tree.add(leaves);

        return tree;
    }

    setupPlayer() {
        // Create player character
        const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.player = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.position.y = 1;
        this.player.castShadow = true;
        this.scene.add(this.player);

        // Position camera behind player
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(this.player.position);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    setupEventListeners() {
        // Mouse click for building/shooting
        window.addEventListener('click', (e) => this.handleClick(e));
        
        // Mouse move for build preview
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'b') this.toggleBuildMode();
            if (e.key === '1') this.switchWeapon('pickaxe');
            if (e.key === '2') this.switchWeapon('pistol');
            if (e.key === 'q') this.cycleBuildType();
        });
    }

    handleClick(event) {
        if (this.buildMode) {
            this.placeBuilding();
        } else {
            this.useWeapon();
        }
    }

    toggleBuildMode() {
        this.buildMode = !this.buildMode;
        if (this.buildMode) {
            this.createBuildPreview();
        } else if (this.buildPreview) {
            this.scene.remove(this.buildPreview);
            this.buildPreview = null;
        }
    }

    createBuildPreview() {
        if (this.buildPreview) {
            this.scene.remove(this.buildPreview);
        }

        const geometry = new THREE.BoxGeometry(2, 2, 0.2);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5
        });
        this.buildPreview = new THREE.Mesh(geometry, material);
        this.scene.add(this.buildPreview);
    }

    updateBuildPreview() {
        if (!this.buildMode || !this.buildPreview) return;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            this.buildPreview.position.copy(point);
            this.buildPreview.position.y = 1; // Height of the wall
        }
    }

    placeBuilding() {
        if (!this.buildPreview) return;

        const geometry = new THREE.BoxGeometry(2, 2, 0.2);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, // Wood color
            roughness: 0.8,
            metalness: 0.2
        });
        const building = new THREE.Mesh(geometry, material);
        building.position.copy(this.buildPreview.position);
        building.castShadow = true;
        building.receiveShadow = true;
        this.scene.add(building);
        this.buildings.push(building);
    }

    useWeapon() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            const target = intersects[0].object;
            if (target === this.player) return;

            // Create bullet effect
            const bulletGeometry = new THREE.SphereGeometry(0.1);
            const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
            bullet.position.copy(this.camera.position);
            this.scene.add(bullet);

            // Animate bullet
            const targetPosition = intersects[0].point;
            const direction = new THREE.Vector3().subVectors(targetPosition, bullet.position).normalize();
            const speed = 0.5;
            
            const animateBullet = () => {
                bullet.position.add(direction.multiplyScalar(speed));
                if (bullet.position.distanceTo(targetPosition) < 0.1) {
                    this.scene.remove(bullet);
                    return;
                }
                requestAnimationFrame(animateBullet);
            };
            animateBullet();
        }
    }

    switchWeapon(weapon) {
        if (this.weapons[weapon]) {
            this.currentWeapon = weapon;
            console.log(`Switched to ${weapon}`);
        }
    }

    cycleBuildType() {
        const types = ['wall', 'floor', 'ramp'];
        const currentIndex = types.indexOf(this.currentBuildType);
        this.currentBuildType = types[(currentIndex + 1) % types.length];
        console.log(`Build type: ${this.currentBuildType}`);
    }

    handleMovement() {
        const moveSpeed = 0.1;
        const direction = new THREE.Vector3();

        if (this.keys['w']) direction.z -= 1;
        if (this.keys['s']) direction.z += 1;
        if (this.keys['a']) direction.x -= 1;
        if (this.keys['d']) direction.x += 1;

        if (direction.length() > 0) {
            direction.normalize();
            this.player.position.add(direction.multiplyScalar(moveSpeed));
        }
    }

    updateUI() {
        document.getElementById('health').textContent = `Health: ${this.health}`;
        document.getElementById('materials').innerHTML = `
            <span>Wood: ${this.materials.wood}</span>
            <span>Brick: ${this.materials.brick}</span>
            <span>Metal: ${this.materials.metal}</span>
        `;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.handleMovement();
        this.controls.update();
        this.updateBuildPreview();
        this.updateUI();
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
const game = new Game(); 