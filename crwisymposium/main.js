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
    });

    // Close nav when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-active');
            burger.classList.remove('toggle');
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
    const animElements = document.querySelectorAll('.card, .theme-card, .text-content, .quote-card, .timeline-item');
    animElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Custom helper to trigger the transition
    document.addEventListener('scroll', () => {
        animElements.forEach(el => {
            if (el.classList.contains('visible')) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    });

    // Search and Filter Functionality
    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    const presenterCards = document.querySelectorAll('.presenter-card-large');

    function filterPresenters() {
        // Escape special regex characters to prevent errors
        const escapeRegExp = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        const searchText = searchInput.value.trim();
        const selectedTheme = filterSelect.value.toLowerCase();

        presenterCards.forEach(card => {
            const name = card.querySelector('h5').textContent;
            const congregation = card.querySelector('.role').textContent;
            const title = card.querySelector('.paper-title').textContent;

            // Combine text for searching
            // Note: We use original case for display but can use case-insensitive regex
            const cardText = `${name} ${congregation} ${title}`;

            // Theme matching (simplified)
            const matchesTheme = selectedTheme === 'all themes' || cardText.toLowerCase().includes(selectedTheme);

            // Search matching with Word Boundaries
            let matchesSearch = true;
            if (searchText) {
                // creating a regex for the search term with word boundaries
                // 'i' flag for case-insensitive matching
                try {
                    const safeSearchText = escapeRegExp(searchText);
                    const regex = new RegExp(`\\b${safeSearchText}`, 'i');
                    // Note: Using \b only at start or depending on requirement. 
                    // User asked result for "Name 1". "Name 1" is two words.
                    // If user searches "Name 1", we want it to match "Sr. Presenter Name 1"
                    // But NOT "Sr. Presenter Name 11".
                    // The '1' effectively needs the word boundary.

                    // Let's use a simpler approach: check if the cardText contains the EXACT phrase if it's potentially partial
                    // But for the specific case "1" vs "11", \b is key.
                    // If we use RegExp(`\\b${safeSearchText}\\b`, 'i'), "Name 1" matches "Name 1" but not "Name 11".

                    const strictRegex = new RegExp(`\\b${safeSearchText}\\b`, 'i');
                    matchesSearch = strictRegex.test(cardText);
                } catch (e) {
                    // Fallback to simple includes if regex fails (unlikely with escape)
                    matchesSearch = cardText.toLowerCase().includes(searchText.toLowerCase());
                }
            }

            if (matchesTheme && matchesSearch) {
                card.style.display = 'block';
                // Re-trigger animation if needed, or ensure it's visible
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
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
