document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  const modal = document.getElementById('booking-modal');
  const modalOpenBtns = document.querySelectorAll('.open-booking');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalOverlay = document.getElementById('modal-overlay-close');
  const reservationForm = document.getElementById('reservation-form');

  // --- Sticky Header Effect ---
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- Mobile Menu Toggle ---
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when a link is clicked
  const navLinks = navMenu.querySelectorAll('a:not(.btn)');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // --- Scroll Reveal Animations ---
  const reveals = document.querySelectorAll('.reveal');
  
  const revealOnScroll = () => {
    const triggerBottom = (window.innerHeight / 10) * 8.5; // Trigger point 85% down viewport
    
    reveals.forEach(reveal => {
      const revealTop = reveal.getBoundingClientRect().top;
      
      if (revealTop < triggerBottom) {
        reveal.classList.add('active');
      }
    });
  };

  // Run on initial load to reveal above-the-fold content
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Trigger once on load

  // --- Custom Calendar Logic ---
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let selectedDate = null;

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const monthYearDisplay = document.getElementById('month-year-display');
  const daysGrid = document.getElementById('calendar-days-grid');
  const prevMonthBtn = document.getElementById('prev-month-btn-top'); // We'll double-check IDs or match below
  const nextMonthBtn = document.getElementById('next-month-btn-top');
  const selectedDateDisplay = document.getElementById('selected-date-display');
  const resDateInput = document.getElementById('res-date');

  // Let's get the buttons directly by matching their IDs from index.html:
  // prev-month-btn and next-month-btn
  const prevMonth = document.getElementById('prev-month-btn');
  const nextMonth = document.getElementById('next-month-btn');

  const renderCalendar = (month, year) => {
    if (!monthYearDisplay || !daysGrid) return;
    
    // Set display month and year
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
    
    // Clear grid
    daysGrid.innerHTML = '';
    
    // Disable previous month button if we are looking at current month
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    if (prevMonth) prevMonth.disabled = isCurrentMonth;
    
    // Get first day of the month index (0 = Sun, 1 = Mon...)
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    // Get total number of days in the month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Render spacer columns for offset of month start
    for (let i = 0; i < firstDayIndex; i++) {
      const spacer = document.createElement('div');
      spacer.className = 'calendar-day-tile empty';
      daysGrid.appendChild(spacer);
    }
    
    // Render month day tiles
    for (let day = 1; day <= totalDays; day++) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'calendar-day-tile';
      tile.textContent = day;
      
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      tile.setAttribute('data-date', dateString);
      
      // Check if past date
      const tileDate = new Date(year, month, day);
      const comparisonDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      if (tileDate < comparisonDate) {
        tile.classList.add('disabled');
      } else {
        // Check if selected
        if (selectedDate === dateString) {
          tile.classList.add('active');
        }
        
        tile.addEventListener('click', () => {
          // Remove active from others
          const activeTiles = daysGrid.querySelectorAll('.calendar-day-tile.active');
          activeTiles.forEach(t => t.classList.remove('active'));
          
          // Select this tile
          tile.classList.add('active');
          selectDate(dateString);
        });
      }
      
      daysGrid.appendChild(tile);
    }
  };

  const selectDate = (dateString) => {
    selectedDate = dateString;
    if (resDateInput) resDateInput.value = dateString;
    
    if (selectedDateDisplay) {
      const dateObj = new Date(dateString);
      const formatted = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      selectedDateDisplay.textContent = formatted;
    }
  };

  if (prevMonth) {
    prevMonth.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(currentMonth, currentYear);
    });
  }

  if (nextMonth) {
    nextMonth.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar(currentMonth, currentYear);
    });
  }

  // --- Booking Modal Interactions ---
  const openModal = (e) => {
    e.preventDefault();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Disable background scrolling
    
    // Set default selected date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Reset calendar to tomorrow's month/year
    currentMonth = tomorrow.getMonth();
    currentYear = tomorrow.getFullYear();
    
    selectDate(tomorrowStr);
    renderCalendar(currentMonth, currentYear);
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Re-enable background scrolling
  };

  modalOpenBtns.forEach(btn => btn.addEventListener('click', openModal));
  modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // --- Tabbed Menu Logic ---
  const menuTabBtns = document.querySelectorAll('.menu-tab-btn');
  const menuPanels = document.querySelectorAll('.menu-grid-panel');

  menuTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Update active button
      menuTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show matching panel
      menuPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `panel-${targetTab}`) {
          panel.classList.add('active');
        }
      });
    });
  });

  // --- Form Submission ---
  reservationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('res-name').value;
    const date = document.getElementById('res-date').value;
    const time = document.getElementById('res-time').value;
    const guests = document.getElementById('res-guests').value;
    const cuisine = document.getElementById('res-cuisine').options[document.getElementById('res-cuisine').selectedIndex].text;
    
    // Format date for confirmation message
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Elegant and premium confirmation message
    alert(`Thank you, ${name}!\n\nWe have reserved a table for ${guests} on ${formattedDate} at ${time}.\nCuisine preference: ${cuisine}.\n\nWe look forward to welcoming you to The British Bakes. See you soon!`);
    
    reservationForm.reset();
    closeModal();
  });
});
