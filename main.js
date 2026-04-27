document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    if (burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            burger.classList.toggle('toggle');
            const expanded = nav.classList.contains('nav-active');
            burger.setAttribute('aria-expanded', expanded);
        });
    }

    // --- Cultural Event Modal Logic (Modern 3D & Glass) ---
    const culturalModal = document.getElementById('cultural-event-modal');
    const openCulturalBtn = document.getElementById('open-cultural-btn');
    let threeRenderer, threeAnimationId;

    if (culturalModal && openCulturalBtn) {
        const toggleCulturalModal = (show) => {
            if (show) {
                culturalModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                setTimeout(() => {
                    initThreeBackground();
                    if (window.lucide) window.lucide.createIcons();
                }, 100);
            } else {
                culturalModal.classList.remove('active');
                document.body.style.overflow = '';
                if (threeAnimationId) cancelAnimationFrame(threeAnimationId);
                const container = document.getElementById('cultural-three-bg');
                if (container && threeRenderer) {
                    container.innerHTML = '';
                    threeRenderer.dispose();
                }
            }
        };

        const initThreeBackground = () => {
            const container = document.getElementById('cultural-three-bg');
            if (!container || !window.THREE) return;
            container.innerHTML = '';

            const width = window.innerWidth;
            const height = window.innerHeight;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            camera.position.z = 5;

            threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            threeRenderer.setSize(width, height);
            threeRenderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(threeRenderer.domElement);

            const partGeo = new THREE.BufferGeometry();
            const partCount = 1500;
            const posArray = new Float32Array(partCount * 3);
            for (let i = 0; i < partCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 15;
            }
            partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            const partMat = new THREE.PointsMaterial({ size: 0.015, color: 0x4f46e5, transparent: true, opacity: 0.5 });
            const particles = new THREE.Points(partGeo, partMat);
            scene.add(particles);

            const ribbons = [];
            const createRibbon = (color, yPos) => {
                const curve = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(-10, yPos, 0),
                    new THREE.Vector3(-5, yPos + Math.random() * 2, 2),
                    new THREE.Vector3(0, yPos - Math.random() * 2, -2),
                    new THREE.Vector3(5, yPos + Math.random() * 2, 2),
                    new THREE.Vector3(10, yPos, 0),
                ]);
                const geometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
                const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2 });
                const mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);
                return { mesh, offset: Math.random() * Math.PI * 2 };
            };
            ribbons.push(createRibbon(0x3b82f6, 2));
            ribbons.push(createRibbon(0xf59e0b, -2));

            const notes = [];
            for (let i = 0; i < 8; i++) {
                const geo = new THREE.SphereGeometry(0.1, 16, 16);
                const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
                const sphere = new THREE.Mesh(geo, mat);
                sphere.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5);
                scene.add(sphere);
                notes.push({ mesh: sphere, speed: 0.01 + Math.random() * 0.02 });
            }

            const animate = () => {
                threeAnimationId = requestAnimationFrame(animate);
                particles.rotation.y += 0.001;
                particles.rotation.x += 0.0005;
                ribbons.forEach((r) => {
                    r.mesh.rotation.z = Math.sin(Date.now() * 0.001 + r.offset) * 0.1;
                    r.mesh.position.y += Math.sin(Date.now() * 0.001 + r.offset) * 0.002;
                });
                notes.forEach((n) => {
                    n.mesh.position.y += Math.sin(Date.now() * n.speed) * 0.005;
                    n.mesh.position.x += Math.cos(Date.now() * n.speed) * 0.002;
                });
                threeRenderer.render(scene, camera);
            };
            animate();

            const onMouseMove = (e) => {
                const mouseX = (e.clientX / window.innerWidth) - 0.5;
                const mouseY = (e.clientY / window.innerHeight) - 0.5;
                camera.position.x += (mouseX - camera.position.x) * 0.05;
                camera.position.y += (-mouseY - camera.position.y) * 0.05;
                camera.lookAt(scene.position);
            };
            window.addEventListener('mousemove', onMouseMove);
        };

        openCulturalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCulturalModal(true);
        });

        const closeCulturalBtn = culturalModal.querySelector('.modal-close');
        const culturalOverlay = culturalModal.querySelector('.modal-overlay');
        if (closeCulturalBtn) closeCulturalBtn.addEventListener('click', () => toggleCulturalModal(false));
        if (culturalOverlay) culturalOverlay.addEventListener('click', () => toggleCulturalModal(false));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && culturalModal.classList.contains('active')) {
                toggleCulturalModal(false);
            }
        });
    }

    // Close nav when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-active');
            burger.classList.remove('toggle');
            burger.setAttribute('aria-expanded', 'false');
        });
    });

    // Scroll Animations (Intersection Observer)
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (!entry.target.classList.contains('fade-in-up')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animElements = document.querySelectorAll('.card, .theme-card, .text-content, .quote-card, .timeline-item, .presenter-card-large, .fade-in-up');
    animElements.forEach(el => {
        if (!el.classList.contains('fade-in-up')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        }
        scrollObserver.observe(el);
    });

    // --- Countdown Timer Logic ---
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        window.initCountdown = function (targetDateStr) {
            const targetDate = new Date(targetDateStr || '2026-05-07T09:00:00').getTime();
            function updateCountdown() {
                const now = new Date().getTime();
                const distance = targetDate - now;
                if (distance < 0) {
                    countdownElement.innerHTML = "Symposium has started!";
                    return;
                }
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m remaining`;
            }
            if (window.countdownInterval) clearInterval(window.countdownInterval);
            updateCountdown();
            window.countdownInterval = setInterval(updateCountdown, 60000);
        };
        window.initCountdown();
    }

    // --- Invitation and Schedule Modal Logic ---
    const invitationModal = document.getElementById('invitation-modal');
    const openInvitationBtn = document.getElementById('open-invitation-btn');
    if (invitationModal && openInvitationBtn) {
        const card = invitationModal.querySelector('.invitation-card');
        let currentScale = 1;
        const calculateFitScale = () => {
            const containerWidth = window.innerWidth * 0.95;
            const cardWidth = 842;
            return Math.min(containerWidth / cardWidth, 1);
        };
        const updateZoom = (scale) => {
            currentScale = Math.max(0.2, Math.min(scale, 3));
            if (card) card.style.transform = `scale(${currentScale})`;
        };
        const toggleModal = (show) => {
            if (show) {
                invitationModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                setTimeout(() => {
                    currentScale = calculateFitScale();
                    updateZoom(currentScale);
                }, 10);
            } else {
                invitationModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        };
        openInvitationBtn.addEventListener('click', () => toggleModal(true));
        const closeBtn = invitationModal.querySelector('.modal-close');
        const overlay = invitationModal.querySelector('.modal-overlay');
        const zIn = document.getElementById('zoom-in');
        const zOut = document.getElementById('zoom-out');
        const zReset = document.getElementById('zoom-reset');

        if (zIn) zIn.addEventListener('click', () => updateZoom(currentScale + 0.1));
        if (zOut) zOut.addEventListener('click', () => updateZoom(currentScale - 0.1));
        if (zReset) zReset.addEventListener('click', () => { currentScale = calculateFitScale(); updateZoom(currentScale); });
        if (closeBtn) closeBtn.addEventListener('click', () => toggleModal(false));
        if (overlay) overlay.addEventListener('click', () => toggleModal(false));
    }

    // --- Typing Animation Logic ---
    const quoteElement = document.getElementById('pope-quote');
    if (quoteElement) {
        const fullText = quoteElement.getAttribute('data-text') || "";
        let index = 0;
        function typeWriter() {
            if (index < fullText.length) {
                quoteElement.textContent += fullText.charAt(index);
                index++;
                setTimeout(typeWriter, 60);
            } else {
                quoteElement.classList.add('typing-done');
            }
        }
        const quoteObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    quoteElement.textContent = ''; 
                    setTimeout(typeWriter, 600);
                    quoteObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 }); 
        quoteObserver.observe(quoteElement);
    }

    // --- Visitor Counter Logic (localStorage-based, no external CORS dependency) ---
    const vCountEl = document.getElementById('v-count');
    if (vCountEl) {
        const BASE_COUNT = 200;
        try {
            // Track unique daily visits using localStorage
            const today = new Date().toISOString().slice(0, 10);
            const lastVisit = localStorage.getItem('crwi_last_visit');
            let storedCount = parseInt(localStorage.getItem('crwi_visit_count') || '0', 10);

            // Increment only once per day per browser
            if (lastVisit !== today) {
                storedCount += 1;
                localStorage.setItem('crwi_visit_count', storedCount);
                localStorage.setItem('crwi_last_visit', today);
            }

            vCountEl.textContent = (BASE_COUNT + storedCount).toLocaleString();
        } catch (e) {
            // If localStorage is unavailable, show base count
            vCountEl.textContent = BASE_COUNT.toLocaleString();
        }
    }
});
