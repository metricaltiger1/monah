document.addEventListener('DOMContentLoaded', function() {
    // Therapist data - in a real app, this would come from an API
    const therapists = [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            specialty: "Clinical Psychologist",
            affiliation: "Nairobi Mental Health Center",
            expertise: ["Anxiety", "Depression", "Trauma"],
            therapyTypes: ["CBT", "Psychodynamic"],
            languages: ["English", "Swahili"],
            availability: "Available Today",
            rating: 4.7,
            reviewCount: 128,
            price: 2500,
            image: "https://randomuser.me/api/portraits/women/44.jpg",
            online: true,
            featured: false,
            bio: "Dr. Sarah Johnson is a licensed clinical psychologist with over 10 years of experience helping clients with anxiety, depression, and trauma-related disorders. She takes a client-centered approach to therapy, creating a safe and non-judgmental space for healing.",
            qualifications: [
                {
                    title: "PhD in Clinical Psychology",
                    institution: "University of Nairobi",
                    year: "2012"
                },
                {
                    title: "Masters in Counseling Psychology",
                    institution: "Kenyatta University",
                    year: "2008"
                }
            ],
            location: "Nairobi",
            sessionTypes: ["virtual", "in-person"],
            availableDates: ["2023-06-15", "2023-06-16", "2023-06-17"],
            timeSlots: ["09:00", "11:00", "14:00", "16:00"]
        },
        {
            id: 2,
            name: "Dr. James Mwangi",
            specialty: "Psychiatrist",
            affiliation: "Aga Khan University Hospital",
            expertise: ["PTSD", "Addiction", "Bipolar"],
            therapyTypes: ["DBT", "EMDR"],
            languages: ["English", "Swahili", "Kikuyu"],
            availability: "Available Tomorrow",
            rating: 4.2,
            reviewCount: 86,
            price: 3200,
            image: "https://randomuser.me/api/portraits/men/32.jpg",
            online: false,
            featured: false,
            bio: "Dr. James Mwangi is a board-certified psychiatrist specializing in PTSD and addiction treatment. He combines medication management with evidence-based psychotherapy for comprehensive care.",
            qualifications: [
                {
                    title: "MD in Psychiatry",
                    institution: "University of Nairobi",
                    year: "2015"
                },
                {
                    title: "Board Certified Psychiatrist",
                    institution: "Kenya Medical Practitioners Board",
                    year: "2017"
                }
            ],
            location: "Nairobi",
            sessionTypes: ["in-person"],
            availableDates: ["2023-06-16", "2023-06-17", "2023-06-18"],
            timeSlots: ["10:00", "13:00", "15:00"]
        },
        {
            id: 3,
            name: "Dr. Amina Hassan",
            specialty: "Marriage & Family Therapist",
            affiliation: "Coast General Hospital",
            expertise: ["Relationships", "Family", "Trauma"],
            therapyTypes: ["Family Systems", "EFT"],
            languages: ["English", "Swahili", "Somali"],
            availability: "Available Now",
            rating: 5.0,
            reviewCount: 214,
            price: 2800,
            image: "https://randomuser.me/api/portraits/women/68.jpg",
            online: true,
            featured: true,
            bio: "Dr. Amina Hassan specializes in helping couples and families navigate relationship challenges. With a warm and compassionate approach, she helps clients build stronger connections and heal from trauma.",
            qualifications: [
                {
                    title: "PhD in Marriage & Family Therapy",
                    institution: "United States International University",
                    year: "2018"
                },
                {
                    title: "Licensed Marriage & Family Therapist",
                    institution: "Kenya Association of Professional Counselors",
                    year: "2016"
                }
            ],
            location: "Mombasa",
            sessionTypes: ["virtual", "in-person"],
            availableDates: ["2023-06-15", "2023-06-16", "2023-06-19"],
            timeSlots: ["08:00", "12:00", "15:00", "17:00"]
        },
        {
            id: 4,
            name: "Dr. Robert Kamau",
            specialty: "Child Psychologist",
            affiliation: "Kenyatta National Hospital",
            expertise: ["Child Therapy", "ADHD", "Autism"],
            therapyTypes: ["Play Therapy", "CBT"],
            languages: ["English", "Swahili"],
            availability: "Available Friday",
            rating: 4.9,
            reviewCount: 176,
            price: 3500,
            image: "https://randomuser.me/api/portraits/men/75.jpg",
            online: true,
            featured: false,
            bio: "Dr. Robert Kamau specializes in working with children and adolescents, helping them navigate emotional and behavioral challenges. His playful approach helps young clients feel comfortable and engaged in therapy.",
            qualifications: [
                {
                    title: "PhD in Child Psychology",
                    institution: "University of Nairobi",
                    year: "2019"
                },
                {
                    title: "Certified Play Therapist",
                    institution: "Association for Play Therapy",
                    year: "2020"
                }
            ],
            location: "Nairobi",
            sessionTypes: ["in-person"],
            availableDates: ["2023-06-16", "2023-06-17", "2023-06-23"],
            timeSlots: ["09:30", "11:30", "14:30"]
        }
    ];

    // DOM Elements
    const finderPage = document.getElementById('finderPage');
    const profilePage = document.getElementById('profilePage');
    const therapistGrid = document.getElementById('therapistGrid');
    const profileContent = document.getElementById('profileContent');
    const bookingModal = document.getElementById('bookingModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const sortSelect = document.getElementById('sortSelect');
    const specializationFilters = document.getElementById('specializationFilters');
    const languageSelect = document.getElementById('languageSelect');
    const applyFilters = document.getElementById('applyFilters');
    const resetFilters = document.getElementById('resetFilters');
    const backToFinder = document.getElementById('backToFinder');
    const closeModal = document.getElementById('closeModal');
    const cancelBooking = document.getElementById('cancelBooking');
    const confirmBooking = document.getElementById('confirmBooking');
    const closeConfirmation = document.getElementById('closeConfirmation');
    const viewAppointments = document.getElementById('viewAppointments');

    // State variables
    let currentTherapist = null;
    let selectedDate = null;
    let selectedTime = null;
    let selectedSessionType = 'virtual';
    let activeFilters = {
        specialization: 'all',
        locationType: 'virtual',
        sessionType: 'virtual',
        language: '',
        searchQuery: ''
    };

    // Initialize the page
    function init() {
        renderTherapists(therapists);
        setupEventListeners();
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Filter panel toggle
        document.getElementById('filterToggle').addEventListener('click', toggleFilterPanel);
        document.getElementById('closeFilter').addEventListener('click', toggleFilterPanel);

        // Search functionality
        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') handleSearch();
        });

        // Sorting
        sortSelect.addEventListener('change', handleSortChange);

        // Filter chips
        const filterChips = specializationFilters.querySelectorAll('.filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', function() {
                filterChips.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                activeFilters.specialization = this.dataset.specialization;
                applyFiltersToTherapists();
            });
        });

        // Location options
        const locationOptions = document.querySelectorAll('.location-options .location-option');
        locationOptions.forEach(option => {
            option.addEventListener('click', function() {
                locationOptions.forEach(o => o.classList.remove('active'));
                this.classList.add('active');
                activeFilters.locationType = this.dataset.locationType;
            });
        });

        // Session options
        const sessionOptions = document.querySelectorAll('.session-options .session-option');
        sessionOptions.forEach(option => {
            option.addEventListener('click', function() {
                sessionOptions.forEach(o => o.classList.remove('active'));
                this.classList.add('active');
                activeFilters.sessionType = this.dataset.sessionType;
            });
        });

        // Language select
        languageSelect.addEventListener('change', function() {
            activeFilters.language = this.value;
        });

        // Apply filters button
        applyFilters.addEventListener('click', function() {
            applyFiltersToTherapists();
            toggleFilterPanel();
        });

        // Reset filters button
        resetFilters.addEventListener('click', resetFiltersHandler);

        // Back to finder button
        backToFinder.addEventListener('click', function() {
            finderPage.style.display = 'block';
            profilePage.style.display = 'none';
        });

        // Modal controls
        closeModal.addEventListener('click', closeBookingModal);
        cancelBooking.addEventListener('click', closeBookingModal);

        // Booking confirmation
        confirmBooking.addEventListener('click', confirmBookingHandler);

        // Confirmation modal controls
        closeConfirmation.addEventListener('click', function() {
            confirmationModal.style.display = 'none';
        });

        viewAppointments.addEventListener('click', function() {
            // In a real app, this would navigate to the appointments page
            alert('Redirecting to appointments page');
            confirmationModal.style.display = 'none';
        });
    }

    // Render therapists to the grid
    function renderTherapists(therapistsToRender) {
        therapistGrid.innerHTML = '';
        
        if (therapistsToRender.length === 0) {
            therapistGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-user-md"></i>
                    <h3>No therapists found</h3>
                    <p>Try adjusting your filters or search criteria</p>
                    <button class="reset-filters" id="resetFiltersFromEmpty">Reset Filters</button>
                </div>
            `;
            
            document.getElementById('resetFiltersFromEmpty').addEventListener('click', resetFiltersHandler);
            return;
        }
        
        therapistsToRender.forEach(therapist => {
            const therapistCard = document.createElement('div');
            therapistCard.className = `therapist-card ${therapist.featured ? 'featured' : ''}`;
            therapistCard.dataset.id = therapist.id;
            
            therapistCard.innerHTML = `
                ${therapist.featured ? '<div class="featured-badge">Featured</div>' : ''}
                <div class="card-header">
                    <div class="therapist-avatar">
                        <img src="${therapist.image}" alt="${therapist.name}">
                        <div class="online-status ${therapist.online ? 'online' : 'offline'}"></div>
                    </div>
                    <div class="therapist-meta">
                        <h3>${therapist.name}</h3>
                        <p class="specialty">${therapist.specialty}</p>
                        <div class="affiliation">
                            <i class="fas fa-hospital"></i>
                            <span>${therapist.affiliation}</span>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="expertise">
                        ${therapist.expertise.map(ex => `<span class="expertise-tag">${ex}</span>`).join('')}
                    </div>
                    <div class="therapist-info">
                        <div class="info-item">
                            <i class="fas fa-comments"></i>
                            <span>${therapist.therapyTypes.join(', ')}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-language"></i>
                            <span>${therapist.languages.join(', ')}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>${therapist.availability}</span>
                        </div>
                    </div>
                    <div class="rating">
                        <div class="stars">
                            ${renderStars(therapist.rating)}
                            <span>${therapist.rating.toFixed(1)}</span>
                        </div>
                        <span class="review-count">(${therapist.reviewCount} reviews)</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="pricing">
                        <span class="price">KSh ${therapist.price.toLocaleString()}</span>
                        <span class="session">/ session</span>
                    </div>
                    <button class="view-profile-btn">View Profile</button>
                </div>
            `;
            
            therapistCard.addEventListener('click', function(e) {
                if (e.target.closest('.view-profile-btn')) {
                    e.stopPropagation();
                    showTherapistProfile(therapist.id);
                }
            });
            
            therapistGrid.appendChild(therapistCard);
        });
    }

    // Render star ratings
    function renderStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    // Show therapist profile
    function showTherapistProfile(therapistId) {
        currentTherapist = therapists.find(t => t.id === therapistId);
        
        if (!currentTherapist) return;
        
        profileContent.innerHTML = `
            <div class="profile-header-section">
                <div class="profile-avatar">
                    <img src="${currentTherapist.image}" alt="${currentTherapist.name}">
                    <div class="online-status ${currentTherapist.online ? 'online' : 'offline'}"></div>
                </div>
                <div class="profile-info">
                    <h1 class="profile-name">${currentTherapist.name}</h1>
                    <p class="profile-specialty">${currentTherapist.specialty}</p>
                    <div class="profile-affiliation">
                        <i class="fas fa-hospital"></i>
                        <span>${currentTherapist.affiliation}</span>
                    </div>
                    <div class="profile-meta">
                        <div class="profile-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${currentTherapist.location}</span>
                        </div>
                        <div class="profile-meta-item">
                            <i class="fas fa-comments"></i>
                            <span>${currentTherapist.therapyTypes.join(', ')}</span>
                        </div>
                        <div class="profile-meta-item">
                            <i class="fas fa-language"></i>
                            <span>${currentTherapist.languages.join(', ')}</span>
                        </div>
                    </div>
                    <div class="profile-rating">
                        <div class="stars">
                            ${renderStars(currentTherapist.rating)}
                            <span class="review-count">${currentTherapist.reviewCount} reviews</span>
                        </div>
                    </div>
                    <div class="profile-price">
                        KSh ${currentTherapist.price.toLocaleString()} <span>per session</span>
                    </div>
                    <div class="profile-actions">
                        <button class="book-now-btn" id="bookNowBtn">Book Now</button>
                        <button class="message-btn">Send Message</button>
                    </div>
                </div>
            </div>
            
            <div class="profile-section">
                <h2>About</h2>
                <p class="profile-bio">${currentTherapist.bio}</p>
            </div>
            
            <div class="profile-section">
                <h2>Areas of Expertise</h2>
                <div class="expertise-list">
                    ${currentTherapist.expertise.map(ex => `<span class="expertise-tag">${ex}</span>`).join('')}
                </div>
            </div>
            
            <div class="profile-section">
                <h2>Qualifications</h2>
                <div class="qualifications-list">
                    ${currentTherapist.qualifications.map(q => `
                        <div class="qualification-item">
                            <div class="qualification-icon">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                            <div class="qualification-content">
                                <h3>${q.title}</h3>
                                <p>${q.institution} · ${q.year}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="profile-section">
                <h2>Reviews</h2>
                <div class="reviews-container">
                    <div class="review-item">
                        <div class="review-header">
                            <span class="reviewer-name">John M.</span>
                            <span class="review-date">2 weeks ago</span>
                        </div>
                        <div class="review-rating">
                            ${renderStars(5)}
                        </div>
                        <p class="review-text">Dr. ${currentTherapist.name.split(' ')[1]} has been incredibly helpful in my journey. She creates a safe space and provides practical tools to manage my anxiety.</p>
                    </div>
                    <div class="review-item">
                        <div class="review-header">
                            <span class="reviewer-name">Mary W.</span>
                            <span class="review-date">1 month ago</span>
                        </div>
                        <div class="review-rating">
                            ${renderStars(4)}
                        </div>
                        <p class="review-text">Professional and compassionate. I've made more progress in 3 months with Dr. ${currentTherapist.name.split(' ')[1]} than I did in years with previous therapists.</p>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('bookNowBtn').addEventListener('click', showBookingModal);
        
        finderPage.style.display = 'none';
        profilePage.style.display = 'block';
    }

    // Show booking modal
    function showBookingModal() {
        if (!currentTherapist) return;
        
        // Set therapist info in modal
        document.getElementById('bookingTherapistImage').src = currentTherapist.image;
        document.getElementById('bookingTherapistName').textContent = currentTherapist.name;
        document.getElementById('bookingTherapistSpecialty').textContent = currentTherapist.specialty;
        document.getElementById('bookingFee').textContent = `KSh ${currentTherapist.price.toLocaleString()}`;
        
        // Clear previous selections
        selectedDate = null;
        selectedTime = null;
        
        // Render available dates
        const datePicker = document.getElementById('datePicker');
        datePicker.innerHTML = '';
        
        currentTherapist.availableDates.forEach(dateStr => {
            const date = new Date(dateStr);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = date.getDate();
            
            const dateOption = document.createElement('div');
            dateOption.className = 'date-option';
            dateOption.dataset.date = dateStr;
            dateOption.innerHTML = `
                <span class="date-day">${dayName}</span>
                <span class="date-number">${dayNumber}</span>
            `;
            
            dateOption.addEventListener('click', function() {
                document.querySelectorAll('.date-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                selectedDate = this.dataset.date;
                renderTimeSlots();
            });
            
            datePicker.appendChild(dateOption);
        });
        
        // Render time slots (will be updated when date is selected)
        renderTimeSlots();
        
        // Set up session type selection
        const sessionOptions = document.querySelectorAll('.session-type-selector .session-option');
        sessionOptions.forEach(option => {
            option.addEventListener('click', function() {
                sessionOptions.forEach(o => o.classList.remove('active'));
                this.classList.add('active');
                selectedSessionType = this.dataset.sessionType;
            });
        });
        
        // Show modal
        bookingModal.style.display = 'flex';
    }

    // Render time slots based on selected date
    function renderTimeSlots() {
        const timeSlotsContainer = document.getElementById('timeSlots');
        timeSlotsContainer.innerHTML = '';
        
        if (!selectedDate) {
            timeSlotsContainer.innerHTML = '<p>Please select a date first</p>';
            return;
        }
        
        currentTherapist.timeSlots.forEach(time => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = time;
            timeSlot.dataset.time = time;
            
            // In a real app, we'd check if the slot is already booked
            const isUnavailable = Math.random() < 0.2; // 20% chance of being unavailable for demo
            
            if (isUnavailable) {
                timeSlot.classList.add('unavailable');
            } else {
                timeSlot.addEventListener('click', function() {
                    document.querySelectorAll('.time-slot').forEach(slot => {
                        if (!slot.classList.contains('unavailable')) {
                            slot.classList.remove('active');
                        }
                    });
                    this.classList.add('active');
                    selectedTime = this.dataset.time;
                });
            }
            
            timeSlotsContainer.appendChild(timeSlot);
        });
    }

    // Close booking modal
    function closeBookingModal() {
        bookingModal.style.display = 'none';
    }

    // Confirm booking handler
    function confirmBookingHandler() {
        if (!selectedDate || !selectedTime) {
            alert('Please select a date and time');
            return;
        }
        
        // In a real app, this would send the booking to your backend
        const date = new Date(selectedDate);
        const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        
        document.getElementById('confirmationDetails').textContent = `
            Your appointment with ${currentTherapist.name} is confirmed for ${formattedDate} at ${selectedTime}.
            ${selectedSessionType === 'virtual' ? 'A video call link will be sent to your email.' : 'Please arrive at the clinic 10 minutes early.'}
        `;
        
        bookingModal.style.display = 'none';
        confirmationModal.style.display = 'flex';
    }

    // Toggle filter panel
    function toggleFilterPanel() {
        document.getElementById('filterPanel').classList.toggle('active');
    }

    // Handle search
    function handleSearch() {
        activeFilters.searchQuery = searchInput.value.trim().toLowerCase();
        applyFiltersToTherapists();
    }

    // Handle sort change
    function handleSortChange() {
        applyFiltersToTherapists();
    }

    // Apply filters to therapists
    function applyFiltersToTherapists() {
        let filteredTherapists = [...therapists];
        
        // Apply search filter
        if (activeFilters.searchQuery) {
            filteredTherapists = filteredTherapists.filter(therapist => {
                return therapist.name.toLowerCase().includes(activeFilters.searchQuery) ||
                       therapist.specialty.toLowerCase().includes(activeFilters.searchQuery) ||
                       therapist.location.toLowerCase().includes(activeFilters.searchQuery) ||
                       therapist.expertise.some(ex => ex.toLowerCase().includes(activeFilters.searchQuery));
            });
        }
        
        // Apply specialization filter
        if (activeFilters.specialization !== 'all') {
            filteredTherapists = filteredTherapists.filter(therapist => 
                therapist.expertise.map(e => e.toLowerCase()).includes(activeFilters.specialization)
            );
        }
        
        // Apply session type filter
        if (activeFilters.sessionType !== 'both') {
            filteredTherapists = filteredTherapists.filter(therapist => 
                therapist.sessionTypes.includes(activeFilters.sessionType)
            );
        }
        
        // Apply language filter
        if (activeFilters.language) {
            filteredTherapists = filteredTherapists.filter(therapist => 
                therapist.languages.map(l => l.toLowerCase()).includes(activeFilters.language)
            );
        }
        
        // Apply sorting
        const sortValue = sortSelect.value;
        switch (sortValue) {
            case 'rating':
                filteredTherapists.sort((a, b) => b.rating - a.rating);
                break;
            case 'distance':
                // In a real app, this would use actual distance calculations
                filteredTherapists.sort(() => Math.random() - 0.5);
                break;
            case 'price-low':
                filteredTherapists.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredTherapists.sort((a, b) => b.price - a.price);
                break;
            case 'recommended':
            default:
                // Default sorting (could be based on multiple factors)
                filteredTherapists.sort((a, b) => {
                    // Sort by featured first, then by rating
                    if (a.featured !== b.featured) return b.featured - a.featured;
                    return b.rating - a.rating;
                });
        }
        
        renderTherapists(filteredTherapists);
    }

    // Reset filters
    function resetFiltersHandler() {
        // Reset UI elements
        searchInput.value = '';
        sortSelect.value = 'recommended';
        
        // Reset filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
        document.querySelector('.filter-chip[data-specialization="all"]').classList.add('active');
        
        // Reset location options
        document.querySelectorAll('.location-option').forEach(opt => opt.classList.remove('active'));
        document.querySelector('.location-option[data-location-type="virtual"]').classList.add('active');
        
        // Reset session options
        document.querySelectorAll('.session-option').forEach(opt => opt.classList.remove('active'));
        document.querySelector('.session-option[data-session-type="virtual"]').classList.add('active');
        
        // Reset language select
        languageSelect.value = '';
        
        // Reset active filters
        activeFilters = {
            specialization: 'all',
            locationType: 'virtual',
            sessionType: 'virtual',
            language: '',
            searchQuery: ''
        };
        
        // Re-render therapists
        applyFiltersToTherapists();
        
        // Close filter panel if open
        document.getElementById('filterPanel').classList.remove('active');
    }

    // Initialize the app
    init();
});