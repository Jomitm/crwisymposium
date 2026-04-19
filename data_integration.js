// Prefetch data immediately as script is parsed to eliminate network delay
const prefetchDataPromise = fetch(`data.json?v=${new Date().getTime()}`)
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    });

async function fetchAndPopulateData() {
    try {
        const data = await prefetchDataPromise;

        // --- Populate Global Settings ---
        if (data.Global_Settings) {
            const settings = {};
            data.Global_Settings.forEach(item => {
                // Primary keys
                if (item.Setting_Key) {
                    settings[item.Setting_Key] = item.Setting_Value;
                    if (item.__EMPTY) settings[item.Setting_Key + '_status'] = item.__EMPTY;
                }
                
                // Secondary keys (from columns E/F)
                if (item.Setting_Key_1) {
                    settings[item.Setting_Key_1] = item.Setting_Value_1;
                    if (item.__EMPTY_1) settings[item.Setting_Key_1 + '_status'] = item.__EMPTY_1;
                } else if (item.__EMPTY_1 && item.__EMPTY_2 && item.__EMPTY_1.startsWith('Parallax')) {
                    // Support original fallback if column E & F has no headers
                    settings[item.__EMPTY_1] = item.__EMPTY_2;
                }
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

            const heroOverlay = document.querySelector('.hero-overlay');
            const heroSection = document.querySelector('.hero');
            const waveContainer = document.querySelector('.waves-container');
            const heroStatus = settings.Hero_Background_status?.trim().toLowerCase();
            const heroIsActive = (heroStatus === 'active' || typeof heroStatus === 'undefined');

            if (heroSection && heroOverlay) {
                if (heroIsActive && settings.Hero_Background) {
                    heroOverlay.style.backgroundImage = `url('${settings.Hero_Background}')`;
                    heroSection.style.background = ''; // Keep default CSS gradient
                    if (waveContainer) waveContainer.style.display = ''; // Show waves
                } else if (!heroIsActive) {
                    heroOverlay.style.backgroundImage = 'none';
                    heroSection.style.background = 'transparent'; // Allow global video to show through
                    if (waveContainer) waveContainer.style.display = 'none'; // Hide waves
                }
            }

            // Populate all 4 Parallax Dividers dynamically
            const dividers = [
                { id: 'parallax-divider', key: 'Parallax_Background' },
                { id: 'parallax-divider-2', key: 'Parallax_Background_2' },
                { id: 'parallax-divider-3', key: 'Parallax_Background_3' },
                { id: 'parallax-divider-4', key: 'Parallax_Background_4' }
            ];

            let activeMediaList = [];
            
            // First pass: Detect all active parallax backgrounds
            dividers.forEach(div => {
                const url = settings[div.key];
                const status = settings[div.key + '_status']?.trim().toLowerCase();
                
                // If NO status column exists, we default to active to not break backwards compatibility
                const isActive = (status === 'active' || typeof status === 'undefined');
                
                if (url && isActive) {
                    activeMediaList.push(url);
                }
            });

            const stage = document.getElementById('global-video-stage');
            const stageVideo = document.getElementById('stage-video');

            let useGlobalStage = false;
            
            // If exactly 1 active media AND it's a video, use global stage
            if (activeMediaList.length === 1 && /\.(mp4|webm|ogg)$/i.test(activeMediaList[0])) {
                useGlobalStage = true;
                if (stage && stageVideo) {
                    stageVideo.src = activeMediaList[0];
                    stageVideo.playbackRate = 0.5; // Slow down background video
                    stage.classList.add('active');
                    document.body.classList.add('has-global-video');
                }
            } else {
                if (stage) {
                    stage.classList.remove('active');
                    if (stageVideo) stageVideo.pause();
                    document.body.classList.remove('has-global-video');
                }
            }

            // Second pass: Apply individual elements dynamically
            dividers.forEach((div, index) => {
                const el = document.getElementById(div.id);
                if (el) {
                    let assignedMediaUrl = null;
                    
                    if (activeMediaList.length > 0) {
                        // Distribute media continuously based on section and active count
                        const mediaIndex = Math.floor(index / (4 / activeMediaList.length));
                        const safeIndex = Math.min(mediaIndex, activeMediaList.length - 1);
                        assignedMediaUrl = activeMediaList[safeIndex];
                    }

                    if (!assignedMediaUrl) {
                        // Clear section if nothing to show
                        el.style.backgroundImage = 'none';
                        const localVideo = el.querySelector('video.parallax-bg-video');
                        if (localVideo) localVideo.remove();
                        return;
                    }

                    const isVideo = /\.(mp4|webm|ogg)$/i.test(assignedMediaUrl);
                    
                    if (isVideo && useGlobalStage) {
                        // Section is handled by the global stage, make it a transparent window
                        el.style.backgroundImage = 'none';
                        const localVideo = el.querySelector('video.parallax-bg-video');
                        if (localVideo) localVideo.remove();
                    } else if (isVideo) {
                        // Handled locally since more than 1 active (or fallback)
                        el.style.backgroundImage = 'none';
                        let video = el.querySelector('video.parallax-bg-video');
                        if (!video) {
                            video = document.createElement('video');
                            video.className = 'parallax-bg-video';
                            video.autoplay = true;
                            video.muted = true;
                            video.loop = true;
                            video.playsInline = true;
                            video.playbackRate = 0.5; // Slow down background video
                            el.insertBefore(video, el.firstChild);
                        }
                        if (!video.src.endsWith(assignedMediaUrl)) {
                            video.src = assignedMediaUrl;
                            video.playbackRate = 0.5; // Ensure it applies on update
                        }
                    } else {
                        // Standard parallax image for this section
                        el.style.backgroundImage = `url('${assignedMediaUrl}')`;
                        const localVideo = el.querySelector('video.parallax-bg-video');
                        if (localVideo) localVideo.remove();
                    }
                }
            });

            const councilTitle = document.getElementById('council-title');
            if (councilTitle && settings.Council_Title) councilTitle.textContent = settings.Council_Title;

            const enginesTitle = document.getElementById('engines-title');
            if (enginesTitle && settings.Engines_Section_Title) enginesTitle.textContent = settings.Engines_Section_Title;

            const trusteesTitle = document.getElementById('trustees-title');
            if (trusteesTitle && settings.Trustees_Title) trusteesTitle.textContent = settings.Trustees_Title;

            const aboutTitle = document.getElementById('about-title');
            if (aboutTitle && settings.About_Title) aboutTitle.textContent = settings.About_Title;

            const leadershipTitle = document.getElementById('leadership-title');
            if (leadershipTitle && settings.Leadership_Title) leadershipTitle.textContent = settings.Leadership_Title;

            const themesTitle = document.getElementById('themes-title');
            if (themesTitle && settings.Themes_Title) themesTitle.textContent = settings.Themes_Title;

            const objectivesTitle = document.getElementById('objectives-title');
            if (objectivesTitle && settings.Objectives_Title) objectivesTitle.textContent = settings.Objectives_Title;

            const presentersSTitle = document.getElementById('presenters-section-title');
            if (presentersSTitle && settings.Presenters_Section_Title) presentersSTitle.textContent = settings.Presenters_Section_Title;

            const keySpeakersTitle = document.getElementById('key-speakers-title');
            if (keySpeakersTitle && settings.Key_Speakers_Title) {
                // Force "Key Speakers" if the data says "Guest Lecturers"
                keySpeakersTitle.textContent = settings.Key_Speakers_Title === "Guest Lecturers" ? "Key Speakers" : settings.Key_Speakers_Title;
            }

            const devPartnersTitle = document.getElementById('dev-partners-title');
            if (devPartnersTitle && settings.Development_Partners_Title) {
                devPartnersTitle.textContent = settings.Development_Partners_Title;
            }

            const callPapersTitle = document.getElementById('call-for-papers-title');
            if (callPapersTitle && settings.Call_For_Papers_Title) callPapersTitle.textContent = settings.Call_For_Papers_Title;

            const heroEyebrow = document.getElementById('hero-eyebrow');
            if (heroEyebrow && settings.Hero_Eyebrow) heroEyebrow.textContent = settings.Hero_Eyebrow;

            const heroTitle = document.getElementById('hero-title');
            if (heroTitle && settings.Hero_Title) heroTitle.innerHTML = settings.Hero_Title;

            const themesSubtitle = document.getElementById('themes-subtitle');
            if (themesSubtitle && settings.Themes_Subtitle) themesSubtitle.textContent = settings.Themes_Subtitle;

            const presentersSubtitle = document.getElementById('presenters-subtitle');
            if (presentersSubtitle && settings.Presenters_Subtitle) presentersSubtitle.textContent = settings.Presenters_Subtitle;

            const callPapersDesc = document.getElementById('call-for-papers-description');
            if (callPapersDesc && settings.Call_For_Papers_Description) callPapersDesc.textContent = settings.Call_For_Papers_Description;

            const guidelinesTitle = document.getElementById('guidelines-title');
            if (guidelinesTitle && settings.Guidelines_Title) guidelinesTitle.textContent = settings.Guidelines_Title;

            const contactsTitle = document.getElementById('contacts-title');
            if (contactsTitle && settings.Contacts_Title) contactsTitle.textContent = settings.Contacts_Title;
            
            // Store size globally so the marquee can access it
            window.councilPhotoSize = settings.Council_Photo_Size || '150';
        }

        // --- Populate Hero Section ---
        if (data.Hero_Section && data.Hero_Section.length > 0) {
            const heroData = data.Hero_Section[0];
            const eyebrow = document.querySelector('.hero-main-column .eyebrow');
            if (eyebrow) eyebrow.textContent = heroData.Eyebrow_Text;

            const h1 = document.querySelector('.hero-main-column h1');
            if (h1) h1.innerHTML = `${heroData.Main_Title_Line1}<br>${heroData.Main_Title_Line2}`;

            const btn = document.getElementById('submit-abstract-btn');
            if (btn) {
                btn.textContent = heroData.Button_Text;
                btn.href = heroData.Button_Link;
            }

            // Set countdown target globally and update the timer
            let target = heroData.Countdown_Target;

            // Smart Fallback: If Hero_Section target is the old default or empty, 
            // try to use the start date from Important_Dates "Conference Dates"
            if (!target || target.includes('2026-05-07')) {
                const confDate = data.Important_Dates?.find(d =>
                    d.Event_Description && d.Event_Description.toLowerCase().includes('conference')
                );
                if (confDate && confDate.Date_String) {
                    // Try to parse something like "06-08 May 2026" or "15 May 2026"
                    const dateMatch = confDate.Date_String.match(/(\d{1,2})(-(\d{1,2}))?\s+([A-Za-z]+)\s+(\d{4})/);
                    if (dateMatch) {
                        const day = dateMatch[1];
                        const month = dateMatch[4];
                        const year = dateMatch[5];
                        // Use a more widely supported format for new Date()
                        target = `${month} ${day}, ${year} 09:00:00`;
                    }
                }
            }

            window.countdownTarget = target;
            if (window.initCountdown) {
                window.initCountdown(window.countdownTarget);
            }
        }

        // --- Populate Collaborator Logos ---
        if (data.Collaborator_Logos) {
            const logosContainer = document.querySelector('.logo-group');
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
            const quotesContainer = document.querySelector('.about-section .quotes-container');
            if (quotesContainer) {
                quotesContainer.innerHTML = '';
                // Support multiple quotes if there are multiple rows OR Quote_Text_2 columns!
                data.About_Section.forEach(row => {
                    if (row.Quote_Text) {
                        quotesContainer.innerHTML += `
                        <div class="quote-card">
                            <blockquote>${row.Quote_Text}</blockquote>
                            <cite>${row.Quote_Author || ''}</cite>
                        </div>`;
                    }
                    if (row.Quote_Text_2) {
                        quotesContainer.innerHTML += `
                        <div class="quote-card">
                            <blockquote>${row.Quote_Text_2}</blockquote>
                            <cite>${row.Quote_Author_2 || ''}</cite>
                        </div>`;
                    }
                });
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
                            <img src="${leader.Image_Path}" alt="${leader.Name}" class="leader-photo">
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
                        <div class="icon-box">${obj.Icon_Emoji || '💠'}</div>
                        <h4>${obj.Title}</h4>
                        <p>${obj.Description}</p>
                    </div>`;
                });
            }
        }

        // --- Populate Key Speakers ---
        if (data.Key_Speakers) {
            const grid = document.querySelector('#presenters .key-speakers-grid');
            if (grid) {
                grid.innerHTML = '';
                data.Key_Speakers.forEach(speaker => {
                    const bgImage = speaker.Image_Path ? `background-image: url('${speaker.Image_Path}'); background-position: center top;` : '';
                    grid.innerHTML += `
                    <div class="presenter-card-static">
                        <div class="presenter-photo" style="${bgImage}"></div>
                        <div class="presenter-info">
                            <h5>${speaker.Speaker_Name}</h5>
                            <p class="role">${speaker.Speaker_Role}</p>
                            <hr class="divider-small">
                            <p class="paper-title">${speaker.Paper_Title}</p>
                        </div>
                    </div>`;
                });
            }
        }

        // --- Populate Development Partners ---
        if (data["Development Partners"]) {
            const grid = document.getElementById('dev-partners-grid');
            if (grid) {
                grid.innerHTML = '';
                data["Development Partners"].forEach(partner => {
                    const bgImage = partner.Image_Path ? `background-image: url('${partner.Image_Path}'); background-position: center 20%;` : '';
                    grid.innerHTML += `
                    <div class="presenter-card-static">
                        <div class="presenter-photo" style="${bgImage}"></div>
                        <div class="presenter-info">
                            <h5>${partner.Speaker_Name}</h5>
                            <p class="role">${partner.Speaker_Role}</p>
                            <hr class="divider-small">
                            <p class="paper-title">${partner.Paper_Title || ''}</p>
                        </div>
                    </div>`;
                });
            }
        }

        if (data.Presenters) {
            // Filter out any presenter that explicitly contains the word 'inactive' in their data
            window.allPresenters = data.Presenters.filter(p => {
                let isInactive = false;
                for (let key in p) {
                    const value = String(p[key]).trim().toLowerCase();
                    // We check if the column value is exactly "inactive" or if it contains "inactive"
                    if (value === 'inactive') {
                        isInactive = true;
                        break;
                    }
                }
                return !isInactive;
            });

            console.log("Speakers after filtering 'inactive':", window.allPresenters.length);
            
            // Set default theme to Formation
            window.filteredPresenters = window.allPresenters.filter(p => p.Theme_Category === 'Formation');
            
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

        // --- Populate Trustees ---
        if (data.Trustees) {
            const marqueeInner = document.getElementById('trustees-marquee');
            if (marqueeInner) {
                let html = '';
                const pSize = window.councilPhotoSize || '150';
                for (let i = 0; i < 2; i++) {
                    data.Trustees.forEach(member => {
                        html += `
                        <div class="card council-card council-card-marquee">
                            <img src="${member.Image_Path}" alt="${member.Name}" class="council-photo">
                            <div style="padding: 1rem; text-align: center;">
                                <h5 style="margin-bottom: 0.25rem; color: var(--primary-color);">${member.Name}</h5>
                                <p style="font-size: 0.9rem; font-weight: bold; color: var(--accent-color);">${member.Role || ''}</p>
                                <p class="role" style="font-size: 0.8rem;">${member.Congregation || ''}</p>
                            </div>
                        </div>`;
                    });
                }
                marqueeInner.innerHTML = html;
            }
        }

        // --- Populate Executive Council ---
        if (data.Executive_Council) {
            const marqueeInner = document.getElementById('council-marquee');
            if (marqueeInner) {
                let html = '';
                const pSize = window.councilPhotoSize || '150';
                // Need two sets for the scrolling effect
                for (let i = 0; i < 2; i++) {
                    data.Executive_Council.forEach(member => {
                        html += `
                        <div class="card council-card council-card-marquee">
                            <img src="${member.Image_Path}" alt="${member.Name}" class="council-photo">
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
                let cardsHtml = '';

                data.Contacts_And_Footer.filter(c => c.Contact_Type === 'Submission_Contact').forEach(contact => {
                    cardsHtml += `
                    <div class="contact-card-small" style="flex: 1; min-width: 180px;">
                        <img src="${contact.Image_Path_Or_Link}" alt="${contact.Name_Or_Title}" class="contact-avatar">
                        <div class="contact-details">
                            <p class="contact-name">${contact.Name_Or_Title}</p>
                            <p class="contact-phone"><a href="mailto:${contact.Value_Or_Description}"
                                    style="font-size: 0.85rem; text-decoration: none; color: inherit;">${contact.Value_Or_Description}</a>
                            </p>
                        </div>
                    </div>`;
                });

                const rowWrapper = `<div style="display: flex; flex-direction: row; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start; margin-top: 1rem;">${cardsHtml}</div>`;
                contactsContainer.innerHTML = title + p + rowWrapper;
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

        // --- Populate The Invisible Engines ---
        populateInvisibleEngines(data);

        setupFilters();
    } catch (error) {
        console.error('Error fetching or populating data:', error);
    }
}

function populateInvisibleEngines(data) {
    const engineData = data["The Invisible Engines"];
    if (!engineData) return;

    const staffGrid = document.getElementById('staff-grid');
    const volunteersGrid = document.getElementById('volunteers-grid');

    if (!staffGrid || !volunteersGrid) return;

    let currentCategory = ''; // 'staff' or 'volunteers'

    engineData.forEach(person => {
        // Switch category markers
        if (person.ID === "CRWI Staff") {
            currentCategory = 'staff';
            return;
        } else if (person.ID === "Volunteers") {
            currentCategory = 'volunteers';
            return;
        }

        // If it's a data row and has a name
        if (person.Name && currentCategory) {
            const card = document.createElement('div');
            card.className = 'staff-card';
            
            const imagePath = person.Image_Path || 'images/The Invisible Engines/logo.png';
            const role = person.Role || '';

            card.innerHTML = `
                <img src="${imagePath}" alt="${person.Name}" class="staff-photo">
                <div class="staff-info">
                    <h5>${person.Name}</h5>
                    <p>${role}</p>
                </div>
            `;

            if (currentCategory === 'staff') {
                staffGrid.appendChild(card);
            } else {
                volunteersGrid.appendChild(card);
            }
        }
    });
}

function renderPresenters() {
    const filterBar = document.querySelector('.search-filter-bar');
    if (!filterBar) return;

    // We use the hidden theme-filter to keep state
    const filterSelect = document.getElementById('theme-filter');
    const selectedTheme = filterSelect ? filterSelect.value : 'all';

    // Disable the Load More button completely since we are grouping them
    const loadMoreContainer = document.getElementById('load-more-container');
    if (loadMoreContainer) loadMoreContainer.style.display = 'none';

    // Clear any existing grids after the filter bar
    let next = filterBar.nextElementSibling;
    while (next) {
        if (next.id === 'load-more-container') {
            next = next.nextElementSibling;
            continue;
        }
        const el = next;
        next = next.nextElementSibling;
        el.remove();
    }

    const container = filterBar.parentElement;

    // Group presenters by theme
    const groups = {};
    window.filteredPresenters.forEach(presenter => {
        const theme = presenter.Theme_Category || 'Other / General';
        // If a specific theme is selected, only keep that one
        if (selectedTheme !== 'all' && theme !== selectedTheme) return;

        if (!groups[theme]) {
            groups[theme] = [];
        }
        groups[theme].push(presenter);
    });

    Object.keys(groups).forEach(theme => {
        // Sort within each theme: "Chair person" first
        groups[theme].sort((a, b) => {
            const titleA = (a.Paper_Title || "").toLowerCase();
            const titleB = (b.Paper_Title || "").toLowerCase();
            const isChairA = titleA.includes("chair person") || titleA.includes("chairperson");
            const isChairB = titleB.includes("chair person") || titleB.includes("chairperson");
            if (isChairA && !isChairB) return -1;
            if (!isChairA && isChairB) return 1;
            return 0;
        });

        // Create the theme header title (only if showing ALL or if there are multiple people)
        const header = document.createElement('h4');
        header.textContent = theme;
        header.style.textAlign = 'left';
        header.style.marginTop = '0.75rem';
        header.style.marginBottom = '1rem';
        header.style.color = 'var(--primary-color)';
        header.style.borderBottom = '2px solid var(--accent-color)';
        header.style.paddingBottom = '0.5rem';
        header.style.fontSize = '1.5rem';
        header.style.fontWeight = 'bold';
        container.insertBefore(header, loadMoreContainer);

        // Create the grid for this specific theme
        const grid = document.createElement('div');
        grid.className = 'presenters-grid-large';
        grid.style.marginBottom = '2rem';
        
        groups[theme].forEach(presenter => {
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
                        </div>
                    </div>
                    <div class="presenter-card-back">
                        <h5>Profile</h5>
                        <div class="profile-text">
                            <p style="margin-bottom: 1rem;"><strong>Theme:</strong> ${presenter.Theme_Category}</p>
                            <p style="font-size: 0.85rem;">${presenter.Abstract_Link && presenter.Abstract_Link !== '#' ? presenter.Abstract_Link : 'Profile information coming soon...'}</p>
                        </div>
                    </div>
                </div>
            </article>`;
        });
        container.insertBefore(grid, loadMoreContainer);
    });
}

function setupFilters() {
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('theme-filter');
    const themeNavItems = document.querySelectorAll('.theme-nav-item');

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

    // Handle Tab Clicks
    themeNavItems.forEach(item => {
        item.onclick = () => {
            // Remove active from others
            themeNavItems.forEach(n => n.classList.remove('active'));
            // Add to this one
            item.classList.add('active');
            
            // Update hidden select
            filterSelect.value = item.getAttribute('data-theme');
            
            // Trigger filter
            filterHandler();
        };
    });

    searchInput.oninput = filterHandler;
    filterSelect.onchange = filterHandler;
}

// Execute immediately since the script tag is at the end of the body
fetchAndPopulateData();
