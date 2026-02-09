/* ============================================================
   SCRIPT.JS — Developer Portfolio
   Creative interactivity: custom cursor, typewriter, 3D tilt,
   particle canvas, magnetic buttons, counter animation, scroll
   progress, theme toggle, and staggered reveals.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Cache DOM
  const body     = document.body;
  const header   = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const navList   = document.getElementById('nav-list');

  /* ----------------------------------------------------------
     1. MOBILE NAVIGATION TOGGLE
  ---------------------------------------------------------- */
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navList.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ----------------------------------------------------------
     2. HEADER SHADOW ON SCROLL
  ---------------------------------------------------------- */
  const updateHeaderShadow = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  updateHeaderShadow();

  /* ----------------------------------------------------------
     3. ACTIVE NAV LINK HIGHLIGHT ON SCROLL
  ---------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const setActiveLink = () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top    = section.offsetTop - 100;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.toggle('active', scrollY >= top && scrollY < bottom);
        }
      });
    });
  };

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ----------------------------------------------------------
     4. SCROLL PROGRESS BAR
  ---------------------------------------------------------- */
  const scrollBar = document.getElementById('scroll-progress');

  const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollBar.style.width = progress + '%';
  };

  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  /* ----------------------------------------------------------
     5. FADE-IN ON SCROLL (Staggered via Intersection Observer)
  ---------------------------------------------------------- */
  const fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    // Apply stagger delays to siblings
    const parentGroups = new Map();
    fadeElements.forEach(el => {
      const parent = el.parentElement;
      if (!parentGroups.has(parent)) parentGroups.set(parent, []);
      parentGroups.get(parent).push(el);
    });

    parentGroups.forEach(children => {
      children.forEach((child, i) => {
        child.style.setProperty('--stagger-delay', `${i * 100}ms`);
        child.setAttribute('data-delay', '');
      });
    });

    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    fadeElements.forEach(el => fadeObserver.observe(el));
  } else {
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  /* ----------------------------------------------------------
     6. CUSTOM CURSOR (desktop only)
  ---------------------------------------------------------- */
  const cursor     = document.getElementById('cursor');
  const cursorGlow = document.getElementById('cursor-glow');
  let cursorX = 0, cursorY = 0;
  let glowX = 0, glowY = 0;

  const isTouch = matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (!isTouch && cursor && cursorGlow) {
    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursor.style.left = cursorX + 'px';
      cursor.style.top  = cursorY + 'px';
    });

    // Smooth trailing glow
    const animateGlow = () => {
      glowX += (cursorX - glowX) * 0.15;
      glowY += (cursorY - glowY) * 0.15;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top  = glowY + 'px';
      requestAnimationFrame(animateGlow);
    };
    animateGlow();

    // Hover state on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-card, .highlight-card, input, textarea');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        cursorGlow.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
        cursorGlow.classList.remove('hovering');
      });
    });
  }

  /* ----------------------------------------------------------
     7. TYPEWRITER EFFECT — Hero Name
  ---------------------------------------------------------- */
  const heroName = document.getElementById('hero-name');
  if (heroName) {
    const text = heroName.dataset.typewriter;
    let i = 0;
    const typeSpeed = 90;

    const typeName = () => {
      if (i <= text.length) {
        heroName.textContent = text.slice(0, i);
        i++;
        setTimeout(typeName, typeSpeed);
      }
    };

    // Start after a short delay so the fade-in plays first
    setTimeout(typeName, 600);
  }

  /* ----------------------------------------------------------
     8. ROLE ROTATOR — Hero Subtitle
  ---------------------------------------------------------- */
  const heroRole = document.getElementById('hero-role');
  if (heroRole) {
    const roles = JSON.parse(heroRole.dataset.roles);
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeDelay   = 70;
    const deleteDelay = 40;
    const pauseDelay  = 2000;

    const typeRole = () => {
      const current = roles[roleIndex];

      if (!isDeleting) {
        heroRole.textContent = current.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(typeRole, pauseDelay);
          return;
        }
      } else {
        heroRole.textContent = current.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(typeRole, isDeleting ? deleteDelay : typeDelay);
    };

    setTimeout(typeRole, 1400);
  }

  /* ----------------------------------------------------------
     9. 3D TILT EFFECT ON PROJECT CARDS
  ---------------------------------------------------------- */
  const projectCards = document.querySelectorAll('.project-card');

  if (!isTouch) {
    projectCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;  // max ±6°
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  /* ----------------------------------------------------------
     10. SPOTLIGHT / GLOW FOLLOW ON SKILL CARDS
  ---------------------------------------------------------- */
  const skillCards = document.querySelectorAll('.skill-card');

  if (!isTouch) {
    skillCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
      });
    });
  }

  /* ----------------------------------------------------------
     11. MAGNETIC BUTTONS
  ---------------------------------------------------------- */
  const magneticBtns = document.querySelectorAll('[data-magnetic]');

  if (!isTouch) {
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ----------------------------------------------------------
     12. ANIMATED NUMBER COUNTERS
  ---------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el     = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 1600; // ms
            const start  = performance.now();

            const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

            const animate = (now) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const value = Math.round(easeOutQuart(progress) * target);
              el.textContent = value + suffix;
              if (progress < 1) requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => counterObserver.observe(el));
  }

  /* ----------------------------------------------------------
     13. PARTICLE CANVAS — Hero Background
  ---------------------------------------------------------- */
  const canvas = document.getElementById('hero-canvas');

  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    const maxParticles = 70;
    const connectionDist = 120;

    const resize = () => {
      canvas.width  = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    if (!isTouch) {
      canvas.parentElement.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });

      canvas.parentElement.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
      });
    }

    class Particle {
      constructor() {
        this.x  = Math.random() * canvas.width;
        this.y  = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.r  = Math.random() * 2 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Subtle attraction to mouse
        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            this.vx += dx * 0.00015;
            this.vy += dy * 0.00015;
          }
        }

        // Speed cap
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1.2) {
          this.vx *= 0.98;
          this.vy *= 0.98;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(88, 166, 255, 0.6)';
        ctx.fill();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(88, 166, 255, ${0.15 * (1 - dist / connectionDist)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Connect to mouse
        if (mouse.x !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist * 1.5) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(88, 166, 255, ${0.25 * (1 - dist / (connectionDist * 1.5))})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      requestAnimationFrame(animateParticles);
    };

    animateParticles();
  }

  /* ----------------------------------------------------------
     14. THEME TOGGLE (Light / Dark)
  ---------------------------------------------------------- */
  const themeToggle = document.getElementById('theme-toggle');

  if (themeToggle) {
    // Check for saved preference
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next    = current === 'light' ? 'dark' : 'light';

      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('portfolio-theme', next);
    });
  }

  /* ----------------------------------------------------------
     15. CONTACT FORM HANDLING — Sends via Formspree
  ---------------------------------------------------------- */
  const form       = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formStatus.textContent = '';
    formStatus.className   = 'form-status';

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = 'Please fill in all fields.';
      formStatus.classList.add('error');
      shakeElement(form);
      return;
    }

    if (!isValidEmail(email)) {
      formStatus.textContent = 'Please enter a valid email address.';
      formStatus.classList.add('error');
      shakeElement(form);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending\u2026';

    // Send to Formspree (emails arrive at joshuaoyewole20@gmail.com)
    fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
    .then(response => {
      if (response.ok) {
        formStatus.textContent = 'Message sent successfully! I\'ll get back to you soon.';
        formStatus.classList.add('success');
        form.reset();
      } else {
        return response.json().then(data => {
          const errorMsg = data.errors
            ? data.errors.map(err => err.message).join(', ')
            : 'Something went wrong. Please try again.';
          formStatus.textContent = errorMsg;
          formStatus.classList.add('error');
        });
      }
    })
    .catch(() => {
      formStatus.textContent = 'Network error. Please check your connection and try again.';
      formStatus.classList.add('error');
    })
    .finally(() => {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send Message';
    });
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /** Shake an element briefly on validation error */
  function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = 'shake 0.4s ease';
  }

  /* ----------------------------------------------------------
     16. SMOOTH PARALLAX ON HERO TEXT
  ---------------------------------------------------------- */
  if (!isTouch) {
    const heroInner = document.querySelector('.hero__inner');
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        const offset = scrollY * 0.3;
        heroInner.style.transform = `translateY(${offset}px)`;
        heroInner.style.opacity   = 1 - scrollY / (window.innerHeight * 0.8);
      }
    }, { passive: true });
  }

});
