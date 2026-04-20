document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

        // Burger Animation
        burger.classList.toggle('toggle');

        // Accessibility
        const expanded = nav.classList.contains('nav-active');
        burger.setAttribute('aria-expanded', expanded);
    });

    // Close nav when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-active');
            burger.classList.remove('toggle');
            burger.setAttribute('aria-expanded', 'false');
        });
    });

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (!entry.target.classList.contains('fade-in-up')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Fade up animations for sections
    const animElements = document.querySelectorAll('.card, .theme-card, .text-content, .quote-card, .timeline-item, .presenter-card-large, .fade-in-up');
    animElements.forEach(el => {
        if (!el.classList.contains('fade-in-up')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        }
        observer.observe(el);
    });

    // Modified observer callback to handle opacity directly
    const observer_v2 = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (!entry.target.classList.contains('fade-in-up')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
                observer_v2.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animElements.forEach(el => observer_v2.observe(el));

    // Removed redundant scroll listener for animation trigger

    // --- Countdown Timer Logic ---
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        // Function to start/update countdown
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

                if (isNaN(days) || isNaN(hours) || isNaN(minutes)) {
                    countdownElement.innerHTML = "Counting down to Symposium...";
                    return;
                }

                countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m remaining`;
            }

            if (window.countdownInterval) clearInterval(window.countdownInterval);
            updateCountdown();
            window.countdownInterval = setInterval(updateCountdown, 60000);
        };

        // Initial call with fallback
        window.initCountdown();
    }

    // --- Invitation and Schedule Modal Logic ---
    const invitationModal = document.getElementById('invitation-modal');
    const openInvitationBtn = document.getElementById('open-invitation-btn');
    const closeInvitationBtn = invitationModal ? invitationModal.querySelector('.modal-close') : null;
    const modalOverlay = invitationModal ? invitationModal.querySelector('.modal-overlay') : null;

    if (invitationModal && openInvitationBtn) {
        const card = invitationModal.querySelector('.invitation-card');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const zoomResetBtn = document.getElementById('zoom-reset');
        
        let currentScale = 1;

        const calculateFitScale = () => {
            if (!card) return 1;
            const containerWidth = window.innerWidth * 0.95;
            const containerHeight = window.innerHeight * 0.95;
            const cardWidth = 842;
            const cardHeight = 1191;
            
            // Prefer Fit to Width on laptops for immediate readability
            if (window.innerWidth > 1024) {
               return Math.min(containerWidth / cardWidth, 1);
            }
            
            return Math.min(containerWidth / cardWidth, containerHeight / cardHeight, 1);
        };

        const updateZoom = (scale) => {
            currentScale = Math.max(0.2, Math.min(scale, 3));
            if (card) {
                card.style.transform = `scale(${currentScale})`;
            }
        };

        const toggleModal = (show) => {
            if (show) {
                invitationModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                // Reset to fit on open
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

        if (zoomInBtn) zoomInBtn.addEventListener('click', () => updateZoom(currentScale + 0.1));
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => updateZoom(currentScale - 0.1));
        if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => {
            currentScale = calculateFitScale();
            updateZoom(currentScale);
        });

        if (closeInvitationBtn) {
            closeInvitationBtn.addEventListener('click', () => toggleModal(false));
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => toggleModal(false));
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && invitationModal.classList.contains('active')) {
                toggleModal(false);
            }
        });
    }

    // --- Search and Filter Functionality (Handled by data_integration.js) ---

    // --- Typing Animation Logic ---
    const quoteElement = document.getElementById('pope-quote');
    if (quoteElement) {
        const fullText = quoteElement.getAttribute('data-text') || "";
        let index = 0;
        const typingSpeed = 60; // Deliberate typing speed for better visibility

        function typeWriter() {
            if (index < fullText.length) {
                quoteElement.textContent += fullText.charAt(index);
                index++;
                setTimeout(typeWriter, typingSpeed);
            } else {
                quoteElement.classList.add('typing-done');
            }
        }

        const quoteObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    quoteElement.textContent = ''; 
                    setTimeout(typeWriter, 600); // Wait for card fade-in to finish
                    quoteObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 }); 

        quoteObserver.observe(quoteElement);
    }

    // --- Visitor Counter Logic ---
    const vCountEl = document.getElementById('v-count');
    if (vCountEl) {
        const updateCount = async () => {
            try {
                // Fetch from our local proxy to avoid CORS issues and handle fallback
                const response = await fetch('/api/counter');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.count) {
                        vCountEl.textContent = data.count;
                        return;
                    }
                }
                throw new Error('Local proxy failed');
            } catch (err) {
                console.error("Counter Error:", err);
                // Fallback text if everything fails
                vCountEl.textContent = "Active"; 
            }
        };
        updateCount();
    }
});

