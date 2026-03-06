async function fetchAndPopulateData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // --- Populate Global Settings ---
        if (data.Global_Settings) {
            const settings = {};
            data.Global_Settings.forEach(item => {
                settings[item.Setting_Key] = item.Setting_Value;
            });

            document.title = settings.Site_Title || document.title;
            // Note: Metatags are better set server-side for SEO, but we can do it client-side too
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription && settings.Site_Description) metaDescription.content = settings.Site_Description;

            const navLogoImg = document.querySelector('.nav-logo-img');
            if (navLogoImg && settings.Nav_Logo_Image) navLogoImg.src = settings.Nav_Logo_Image;

            const heroDate = document.getElementById('hero-date');
            if (heroDate) {
                if (settings.Event_Date_Text) {
                    heroDate.textContent = settings.Event_Date_Text;
                } else if (data.Important_Dates) {
                    // Fallback: Use the "Conference Dates" from Important_Dates sheet
                    const confDate = data.Important_Dates.find(d =>
                        d.Event_Description && d.Event_Description.toLowerCase().includes('conference')
                    );
                    if (confDate) {
                        heroDate.textContent = confDate.Date_String;
                    }
                }
            }

            const heroLocation = document.getElementById('hero-location');
            if (heroLocation && settings.Location_Name && settings.Location_City) {
                heroLocation.textContent = `${settings.Location_Name}, ${settings.Location_City}`;
            }

            const heroSection = document.getElementById('hero');
            if (heroSection && settings.Hero_Background) {
                // If you are setting background via css vars or style
                // heroSection.style.backgroundImage = `url('${settings.Hero_Background}')`;
            }
        }

        // --- Populate Hero Section ---
        if (data.Hero_Section && data.Hero_Section.length > 0) {
            const heroData = data.Hero_Section[0];
            const eyebrow = document.querySelector('.hero-main-column .eyebrow');
            if (eyebrow) eyebrow.textContent = heroData.Eyebrow_Text;

            const h1 = document.querySelector('.hero-main-column h1');
            if (h1) h1.innerHTML = `${heroData.Main_Title_Line1}<br>${heroData.Main_Title_Line2}`;

            const btn = document.querySelector('.hero-main-column .btn-primary');
            if (btn) {
                btn.textContent = heroData.Button_Text;
                btn.href = heroData.Button_Link;
            }

            // Set countdown target globally and update the timer
            window.countdownTarget = heroData.Countdown_Target;
            if (window.initCountdown) {
                window.initCountdown(window.countdownTarget);
            }
        }

        // --- Populate Collaborator Logos ---
        if (data.Collaborator_Logos) {
            const logosContainer = document.querySelector('.hero-logos-top');
            if (logosContainer) {
                logosContainer.innerHTML = '';
                data.Collaborator_Logos.sort((a, b) => a.Sort_Order - b.Sort_Order).forEach(logo => {
                    logosContainer.innerHTML += `<img src="${logo.Logo_Image_Path}" alt="${logo.Alt_Text}" class="collab-logo">`;
                });
            }
        }

        // --- Populate Important Dates ---
        if (data.Important_Dates) {
            const datesContainer = document.querySelector('.hero-timeline-card');
            if (datesContainer) {
                const titleEl = datesContainer.querySelector('h3');
                const linkEl = datesContainer.querySelector('a[href="#call-for-papers"]')?.parentElement;

                let datesHTML = titleEl ? titleEl.outerHTML : '<h3>Important Dates</h3>';
                data.Important_Dates.sort((a, b) => a.Sort_Order - b.Sort_Order).forEach(date => {
                    datesHTML += `
                     <div class="timeline-item-hero">
                        <strong>${date.Date_String}</strong><br>${date.Event_Description}
                     </div>`;
                });

                if (linkEl) datesHTML += linkEl.outerHTML;
                datesContainer.innerHTML = datesHTML;
            }
        }

        // --- Populate About Section ---
        if (data.About_Section && data.About_Section.length > 0) {
            const about = data.About_Section[0];
            const textContent = document.querySelector('.about-section .text-content');
            if (textContent) {
                textContent.innerHTML = `
                    <p class="lead">${about.Paragraph_1_Lead}</p>
                    <p>${about.Paragraph_2}</p>
                    <p>${about.Paragraph_3}</p>
                `;
            }
            const quoteCard = document.querySelector('.about-section .quote-card');
            if (quoteCard) {
                quoteCard.innerHTML = `
                    <blockquote>${about.Quote_Text}</blockquote>
                    <cite>${about.Quote_Author}</cite>
                `;
            }
        }

        // --- Populate Leadership Messages ---
        if (data.Leadership_Messages && data.Leadership_Messages.length > 0) {
            const grid = document.querySelector('.leadership-grid');
            if (grid) {
                grid.innerHTML = '';
                data.Leadership_Messages.forEach((leader, index) => {
                    const isReverse = index % 2 === 0 ? 'reverse' : '';
                    grid.innerHTML += `
                    <div class="leader-card ${isReverse}">
                        <div class="leader-photo-frame">
                            <img src="${leader.Image_Path}" alt="${leader.Name}"
                                style="height: 250px; width: 100%; object-fit: cover;">
                        </div>
                        <div class="leader-content">
                            <h4>${leader.Role}</h4>
                            <h5>${leader.Name}</h5>
                            <p class="role">${leader.Role_Company}</p>
                            <p class="message-text">${leader.Message_Text}</p>
                        </div>
                    </div>`;
                });
            }
        }

        // --- Populate Thematic Areas ---
        if (data.Thematic_Areas) {
            const grid = document.querySelector('.themes-grid');
            if (grid) {
                grid.innerHTML = '';
                data.Thematic_Areas.forEach(theme => {
                    grid.innerHTML += `
                    <article class="theme-card">
                        <h4>${theme.Theme_Title}</h4>
                        <p class="sub-theme">${theme.Sub_Theme}</p>
                        <p>${theme.Description}</p>
                    </article>`;
                });
            }
            // Update filter options
            const filterSelect = document.getElementById('theme-filter');
            if (filterSelect) {
                filterSelect.innerHTML = '<option value="all">All Themes</option>';
                data.Thematic_Areas.forEach(theme => {
                    filterSelect.innerHTML += `<option value="${theme.Theme_Title}">${theme.Theme_Title}</option>`;
                });
            }
        }

        // --- Populate Objectives ---
        if (data.Objectives) {
            const grid = document.querySelector('.obj-card').parentElement; // div.grid-3
            if (grid) {
                grid.innerHTML = '';
                data.Objectives.forEach(obj => {
                    grid.innerHTML += `
                    <div class="card obj-card">
                        <div class="icon-box">${obj.Icon_Emoji}</div>
                        <h4>${obj.Title}</h4>
                        <p>${obj.Description}</p>
                    </div>`;
                });
            }
        }

        // --- Populate Key Speakers ---
        if (data.Key_Speakers) {
            const grid = document.querySelector('#presenters .presenters-grid-large');
            if (grid) {
                grid.innerHTML = '';
                data.Key_Speakers.forEach(speaker => {
                    const bgImage = speaker.Image_Path ? `background-image: url('${speaker.Image_Path}');` : '';
                    grid.innerHTML += `
                    <div class="presenter-card-large">
                        <div class="presenter-card-inner">
                            <div class="presenter-card-front">
                                <div class="presenter-photo" style="${bgImage}"></div>
                                <div class="presenter-info">
                                    <h5>${speaker.Speaker_Name}</h5>
                                    <p class="role">${speaker.Speaker_Role}</p>
                                    <hr class="divider-small">
                                    <p class="paper-title">${speaker.Paper_Title}</p>
                                    <span class="read-more">Profile</span>
                                </div>
                            </div>
                            <div class="presenter-card-back">
                                <h5>Profile</h5>
                                <div class="profile-text">
                                    <p><strong>Paper Title:</strong> ${speaker.Paper_Title}</p>
                                    <p>${speaker.Abstract_Link && speaker.Abstract_Link !== '#' ? speaker.Abstract_Link : 'Profile information coming soon...'}</p>
                                </div>
                            </div>
                        </div>
                    </div>`;
                });
            }
        }

        // --- Populate Presenters (with Pagination) ---
        if (data.Presenters) {
            window.allPresenters = data.Presenters;
            window.filteredPresenters = data.Presenters;
            window.itemsToShow = 8;

            renderPresenters();
            setupFilters();

            const loadMoreBtn = document.getElementById('load-more-btn');
            if (loadMoreBtn) {
                loadMoreBtn.onclick = () => {
                    window.itemsToShow += 8;
                    renderPresenters();
                };
            }
        }

        // --- Populate Call For Papers ---
        if (data.Call_For_Papers && data.Call_For_Papers.length > 0) {
            const info = data.Call_For_Papers[0];
            const p = document.querySelector('#call-for-papers .info-block > p');
            if (p) p.textContent = info.Section_Intro;

            const ul = document.querySelector('#call-for-papers .guidelines ul');
            if (ul) {
                ul.innerHTML = `
                    <li>${info.Guideline_1}</li>
                    <li>${info.Guideline_2}</li>
                    <li>${info.Guideline_3}</li>
                    <li>${info.Guideline_4}</li>
                `;
            }
        }

        // --- Populate Executive Council ---
        if (data.Executive_Council) {
            const marqueeInner = document.querySelector('.marquee-content');
            if (marqueeInner) {
                let html = '';
                // Need two sets for the scrolling effect
                for (let i = 0; i < 2; i++) {
                    data.Executive_Council.forEach(member => {
                        html += `
                        <div class="card council-card council-card-marquee">
                            <img src="${member.Image_Path}" alt="${member.Name}"
                                style="height: 250px; width: 100%; object-fit: cover;">
                            <div style="padding: 1rem; text-align: center;">
                                <h5 style="margin-bottom: 0.25rem; color: var(--primary-color);">${member.Name}</h5>
                                <p style="font-size: 0.9rem; font-weight: bold; color: var(--accent-color);">${member.Role}</p>
                                <p class="role" style="font-size: 0.8rem;">${member.Congregation}</p>
                            </div>
                        </div>`;
                    });
                }
                marqueeInner.innerHTML = html;
            }
        }

        // --- Populate Contacts and Footer ---
        if (data.Contacts_And_Footer) {
            // Contacts in Call for papers
            const contactsContainer = document.querySelector('.contacts');
            if (contactsContainer) {
                // Keep the h4 and p
                const title = contactsContainer.querySelector('h4').outerHTML;
                const p = contactsContainer.querySelector('p').outerHTML;
                let html = title + p;

                data.Contacts_And_Footer.filter(c => c.Contact_Type === 'Submission_Contact').forEach(contact => {
                    html += `
                    <div class="contact-card-small">
                        <img src="${contact.Image_Path_Or_Link}" alt="${contact.Name_Or_Title}" class="contact-avatar">
                        <div class="contact-details">
                            <p class="contact-name">${contact.Name_Or_Title}</p>
                            <p class="contact-phone"><a href="mailto:${contact.Value_Or_Description}"
                                    style="font-size: 0.85rem; text-decoration: none; color: inherit;">${contact.Value_Or_Description}</a>
                            </p>
                        </div>
                    </div>`;
                });
                contactsContainer.innerHTML = html;
            }

            // Footer Cols
            const footerCols = document.querySelectorAll('footer .col');
            if (footerCols.length >= 3) {
                // Col 1: Queries
                let queriesHtml = '<h4>For Queries</h4>';
                data.Contacts_And_Footer.filter(c => c.Contact_Type === 'General_Query').forEach(q => {
                    queriesHtml += `<p>${q.Name_Or_Title}: ${q.Value_Or_Description}</p>`;
                });
                footerCols[0].innerHTML = queriesHtml;

                // Col 2: Org
                let orgHtml = '<h4>Organized By</h4>';
                data.Contacts_And_Footer.filter(c => c.Contact_Type === 'Footer_Org_Name').forEach(o => {
                    orgHtml += `<p>${o.Value_Or_Description}</p>`;
                });
                footerCols[1].innerHTML = orgHtml;

                // Col 3: Venue
                let venueHtml = '<h4>Venue</h4>';
                data.Contacts_And_Footer.filter(c => c.Contact_Type === 'Footer_Venue').forEach(v => {
                    venueHtml += `<p>${v.Value_Or_Description}</p>`;
                });
                footerCols[2].innerHTML = venueHtml;
            }

            // Copyright
            const copyEl = document.querySelector('.bottom-bar p');
            const copyData = data.Contacts_And_Footer.find(c => c.Contact_Type === 'Footer_Copyright');
            if (copyEl && copyData) {
                copyEl.textContent = copyData.Value_Or_Description;
            }
        }

    } catch (error) {
        console.error('Error fetching or populating data:', error);
    }
}

function renderPresenters() {
    const grids = document.querySelectorAll('#presenters .presenters-grid-large');
    if (grids.length > 1) {
        const grid = grids[1];
        grid.innerHTML = '';

        const items = window.filteredPresenters.slice(0, window.itemsToShow);

        items.forEach(presenter => {
            const bgImage = presenter.Image_Path ? `background-image: url('${presenter.Image_Path}');` : '';
            grid.innerHTML += `
            <article class="presenter-card-large" data-theme="${presenter.Theme_Category}">
                <div class="presenter-card-inner">
                    <div class="presenter-card-front">
                        <div class="presenter-photo" style="${bgImage}"></div>
                        <div class="presenter-info">
                            <h5>${presenter.Presenter_Name}</h5>
                            <p class="role">${presenter.Congregation_Name}</p>
                            <hr class="divider-small">
                            <p class="paper-title">${presenter.Paper_Title}</p>
                            <span class="read-more">Profile</span>
                        </div>
                    </div>
                    <div class="presenter-card-back">
                        <h5>Profile</h5>
                        <div class="profile-text">
                            <p><strong>Theme:</strong> ${presenter.Theme_Category}</p>
                            <p>${presenter.Abstract_Link && presenter.Abstract_Link !== '#' ? presenter.Abstract_Link : 'Profile information coming soon...'}</p>
                        </div>
                    </div>
                </div>
            </article>`;
        });

        const loadMoreContainer = document.getElementById('load-more-container');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = (window.itemsToShow < window.filteredPresenters.length) ? 'block' : 'none';
        }
    }
}

function setupFilters() {
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('theme-filter');

    if (!searchInput || !filterSelect) return;

    const filterHandler = () => {
        const searchText = searchInput.value.toLowerCase().trim();
        const selectedTheme = filterSelect.value;

        window.filteredPresenters = window.allPresenters.filter(p => {
            const matchesTheme = (selectedTheme === 'all') || (p.Theme_Category === selectedTheme);
            const cardText = `${p.Presenter_Name} ${p.Congregation_Name} ${p.Paper_Title} ${p.Abstract_Link}`.toLowerCase();
            const matchesSearch = !searchText || cardText.includes(searchText);
            return matchesTheme && matchesSearch;
        });

        window.itemsToShow = 8;
        renderPresenters();
    };

    searchInput.oninput = filterHandler;
    filterSelect.onchange = filterHandler;
}

// Ensure the data is populated when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchAndPopulateData();
});
