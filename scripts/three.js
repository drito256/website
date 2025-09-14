// Three.js Scene Setup
function initThreeJS() {
    const container = document.getElementById('cubeContainer');
    const containerRect = container.getBoundingClientRect();
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup - adjusted for container size
    const camera = new THREE.PerspectiveCamera(
        75,
        containerRect.width / containerRect.height,
        0.1,
        1000
    );
    camera.position.z = 2;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true // Make background transparent
    });
    renderer.setSize(containerRect.width, containerRect.height);
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.domElement.id = 'threejs-canvas';
    
    // Add canvas to container
    container.appendChild(renderer.domElement);
    
    // Create rhombic bipyramid geometry
    const geometry = new THREE.ConeGeometry(0.7, 1, 4); // radius, height, segments
    geometry.rotateY(Math.PI / 4); // Rotate 45 degrees to align with diamond shape

    const material = new THREE.MeshLambertMaterial({ color: 0x721121 });
    const bipyramid = new THREE.Mesh(geometry, material);
    bipyramid.position.set(0, 0.5, 0); // Move up so base is at center

    // Create second cone (inverted) for the bottom half
    const geometry2 = new THREE.ConeGeometry(0.7, 1, 4);
    geometry2.rotateY(Math.PI / 4);
    geometry2.rotateX(Math.PI); // Flip upside down
    const bipyramid2 = new THREE.Mesh(geometry2, material);
    bipyramid2.position.set(0, -0.5, 0); // Move down so base is at center

    // Group them together
    const rhombicBipyramid = new THREE.Group();
    rhombicBipyramid.add(bipyramid);
    rhombicBipyramid.add(bipyramid2);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0.25, 5);
    rhombicBipyramid.position.set(0, -0.25, 0);

    scene.add(light);
    scene.add(rhombicBipyramid);
    
    // Rotation control variables using quaternions for stable rotation
    let angularVelocity = new THREE.Vector3(0, 0.015, 0);
    let isInteracting = false;
    let lastInteractionTime = 0;
    
    // Mouse/Touch interaction variables
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    
    // Mouse event handlers
    function onMouseDown(event) {
        isDragging = true;
        isInteracting = true;
        lastInteractionTime = Date.now();
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
        event.preventDefault();
    }
    
    function onMouseMove(event) {
        if (!isDragging) return;
        
        const deltaX = event.clientX - previousMouseX;
        const deltaY = event.clientY - previousMouseY;
        
        // Convert screen-space movement to world-space rotation
        // Use camera's coordinate system for consistent rotation
        const rotationSpeed = 0.01;
        angularVelocity.x = deltaY * rotationSpeed;
        angularVelocity.y = deltaX * rotationSpeed;
        
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
        
        event.preventDefault();
    }
    
    function onMouseUp(event) {
        isDragging = false;
        // Keep the current velocities for continued rotation
        event.preventDefault();
    }
    
    // Touch event handlers
    function onTouchStart(event) {
        if (event.touches.length === 1) {
            isDragging = true;
            isInteracting = true;
            lastInteractionTime = Date.now();
            previousMouseX = event.touches[0].clientX;
            previousMouseY = event.touches[0].clientY;
        }
        event.preventDefault();
    }
    
    function onTouchMove(event) {
        if (!isDragging || event.touches.length !== 1) return;
        
        const deltaX = event.touches[0].clientX - previousMouseX;
        const deltaY = event.touches[0].clientY - previousMouseY;
        
        // Convert screen-space movement to world-space rotation
        const rotationSpeed = 0.01;
        angularVelocity.x = deltaY * rotationSpeed;
        angularVelocity.y = deltaX * rotationSpeed;
        
        previousMouseX = event.touches[0].clientX;
        previousMouseY = event.touches[0].clientY;
        
        event.preventDefault();
    }
    
    function onTouchEnd(event) {
        isDragging = false;
        // Keep the current velocities for continued rotation
        event.preventDefault();
    }
    
    // Add event listeners to the canvas
    const canvas = renderer.domElement;
    
    // Mouse events
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp); // Stop dragging when mouse leaves canvas
    
    // Touch events
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });
    
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Apply rotation using world-space axes for consistent behavior
        const rotationQuaternion = new THREE.Quaternion();
        
        // Create rotation around world X-axis
        const xQuaternion = new THREE.Quaternion();
        xQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), angularVelocity.x);
        
        // Create rotation around world Y-axis
        const yQuaternion = new THREE.Quaternion();
        yQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angularVelocity.y);
        
        // Combine rotations and apply to rhombicBipyramid (fixed variable name)
        rotationQuaternion.multiplyQuaternions(yQuaternion, xQuaternion);
        rhombicBipyramid.quaternion.multiplyQuaternions(rotationQuaternion, rhombicBipyramid.quaternion);
        
        renderer.render(scene, camera);
    }
    
    // Handle container resize
    function handleResize() {
        const newRect = container.getBoundingClientRect();
        camera.aspect = newRect.width / newRect.height;
        camera.updateProjectionMatrix();
        renderer.setSize(newRect.width, newRect.height);
    }
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    
    // Start animation
    animate();
    
    return { scene, camera, renderer, rhombicBipyramid, handleResize };
}

// Initialize Three.js when page loads
let threeJSInstance;
window.addEventListener('load', () => {
    threeJSInstance = initThreeJS();
});