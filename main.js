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
        const conferenceDate = new Date('2026-05-07T09:00:00').getTime();

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = conferenceDate - now;

            if (distance < 0) {
                countdownElement.innerHTML = "Symposium has started!";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m remaining`;
        }
        
        updateCountdown(); // Run immediately
        setInterval(updateCountdown, 60000); // Update every minute
    }

    // --- Search and Filter Functionality ---
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('theme-filter');
    const presenterCards = document.querySelectorAll('.presenter-card-large');

    function filterPresenters() {
        const searchText = searchInput.value.toLowerCase().trim();
        const selectedTheme = filterSelect.value; // 'all' or specific theme ('Formation', etc.)

        presenterCards.forEach(card => {
            const name = card.querySelector('h5') ? card.querySelector('h5').textContent.toLowerCase() : '';
            const role = card.querySelector('.role') ? card.querySelector('.role').textContent.toLowerCase() : '';
            const title = card.querySelector('.paper-title') ? card.querySelector('.paper-title').textContent.toLowerCase() : '';
            
            // Get theme from data attribute
            const cardTheme = card.getAttribute('data-theme');

            // 1. Theme Match
            // If selected is 'all', it matches everything.
            // Otherwise, cardTheme must exactly match the selected option.
            const matchesTheme = (selectedTheme === 'all') || (cardTheme === selectedTheme);

            // 2. Search Text Match
            const cardText = `${name} ${role} ${title}`;
            const matchesSearch = !searchText || cardText.includes(searchText);

            // Visibility
            if (matchesTheme && matchesSearch) {
                card.style.display = 'block';
                // Trigger animation reset implementation if needed, but simple display toggle is safer for now
                setTimeout(() => {
                     card.style.opacity = '1';
                     card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterPresenters);
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', filterPresenters);
    }
});
