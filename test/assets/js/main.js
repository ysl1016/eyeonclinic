
        document.addEventListener('DOMContentLoaded', function() {
            // --- Header Style Logic ---
            const header = document.getElementById('header');
            const headerLogo = document.getElementById('header-logo');
            const navLinks = document.querySelectorAll('.nav-link');
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileMenuButtonSvg = mobileMenuButton ? mobileMenuButton.querySelector('svg') : null;

            const updateHeaderStyle = () => {
                if (!header) return;
                const isScrolled = window.scrollY > 50;
                header.classList.toggle('header-scrolled', isScrolled);

                const logoColor = isScrolled ? 'text-gray-800' : 'text-white';
                if(headerLogo) {
                    headerLogo.classList.remove('text-white', 'text-gray-800');
                    headerLogo.classList.add(logoColor);
                }

                if (mobileMenuButtonSvg) {
                    const iconColor = isScrolled ? 'text-gray-700' : 'text-white';
                    mobileMenuButtonSvg.classList.remove('text-white', 'text-gray-700');
                    mobileMenuButtonSvg.classList.add(iconColor);
                }

                navLinks.forEach(link => {
                    const isActive = link.classList.contains('nav-active');
                    if (!isActive) {
                        const textColor = isScrolled ? 'text-gray-700' : 'text-white';
                        const hoverColor = isScrolled ? 'hover:text-blue-600' : 'hover:text-gray-300';
                        link.classList.remove('text-white', 'hover:text-gray-300', 'text-gray-700', 'hover:text-blue-600');
                        link.classList.add(textColor, hoverColor);
                    } else {
                        link.classList.remove('text-white');
                        link.classList.add(isScrolled ? 'text-emerald-teal' : 'text-white');
                    }
                });
            };

            // --- Basic UI Interactions ---
            if (mobileMenuButton && mobileMenu) {
                mobileMenuButton.addEventListener('click', () => {
                    mobileMenu.classList.toggle('hidden');
                });
            }

            const topBtn = document.getElementById('top-btn');
            if (topBtn) {
                window.addEventListener('scroll', () => {
                    topBtn.classList.toggle('opacity-100', window.scrollY > 400);
                    topBtn.classList.toggle('opacity-0', window.scrollY <= 400);
                });
                topBtn.addEventListener('click', () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }

            // --- Scroll Animation Logic ---
            const animatedElements = document.querySelectorAll('.reveal, .reveal-journal, .fade-in');
            if (animatedElements.length > 0) {
                const animationObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });
                animatedElements.forEach(el => animationObserver.observe(el));
            }

            // --- Tab Navigation Logic ---
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');
            if (tabButtons.length > 0 && tabContents.length > 0) {
                function switchTab(tabId) {
                    tabButtons.forEach(button => button.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
                    const activeContent = document.getElementById(tabId);
                    if (activeButton && activeContent) {
                        activeButton.classList.add('active');
                        activeContent.classList.add('active');
                    }
                }

                tabButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        switchTab(button.dataset.tab);
                    });
                });
                
                // Activate the first tab by default if none are active
                if(document.querySelector('.tab-button.active') === null) {
                   if(tabButtons[0]){
                       switchTab(tabButtons[0].dataset.tab);
                   }
                }
            }

            // --- Image Modal Logic ---
            const modal = document.getElementById("imageModal");
            const modalImg = document.getElementById("modalImage");
            const images = document.querySelectorAll('.enlargeable-image');
            const closeBtn = document.querySelector(".close-modal-btn");

            if(modal && modalImg && images.length > 0) {
                images.forEach(image => {
                    image.onclick = function(){
                        modal.style.display = "flex";
                        modalImg.src = this.src;
                    }
                });

                if(closeBtn) {
                    closeBtn.onclick = function() {
                      modal.style.display = "none";
                    }
                }
                
                window.onclick = function(event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                    }
                }
            }

            // --- Initial Execution ---
            updateHeaderStyle();
            window.addEventListener('scroll', updateHeaderStyle);
        });
