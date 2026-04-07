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
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Fade up animations for sections
    const animElements = document.querySelectorAll('.card, .theme-card, .text-content, .quote-card, .timeline-item, .presenter-card-large, .fade-in-up');
    animElements.forEach(el => {
        // Only apply if not already handled by CSS classes like .fade-in-up logic
        if (!el.classList.contains('fade-in-up')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        } else {
            // If it has fade-in-up, we still want to trigger the 'visible' class
            observer.observe(el);
        }
    });

    // Add visible class to trigger CSS animations if they use it
    const cssAnimElements = document.querySelectorAll('.fade-in-up');
    cssAnimElements.forEach(el => {
        observer.observe(el);
    });


    // Custom helper to trigger the transition for JS-styled elements
    document.addEventListener('scroll', () => {
        animElements.forEach(el => {
            if (el.classList.contains('visible') && !el.classList.contains('fade-in-up')) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    });

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

    // --- Search and Filter Functionality (Handled by data_integration.js) ---
});

