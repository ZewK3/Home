// Menu Manager
class MenuManager {
    static updateMenuByRole(userRole) {
        document.querySelectorAll("#menuList .menu-item").forEach(item => {
            const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
            item.style.display = allowedRoles.includes(userRole) ? "block" : "none";
        });
        this.updateSubmenusByRole(userRole);
    }

    static updateSubmenusByRole(userRole) {
        ['#openSchedule', '#openTaskProcessing'].forEach(selector => {
            const menuItem = document.querySelector(selector)?.closest('.menu-item');
            if (menuItem) {
                menuItem.querySelectorAll('.submenu-item').forEach(item => {
                    const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
                    item.style.display = allowedRoles.includes(userRole) ? "block" : "none";
                });
            }
        });
    }

    static setupMenuInteractions() {
        console.log('Setting up menu interactions...');
        
        // Setup click handlers for menu items
        document.querySelectorAll(".menu-item").forEach(item => {
            const link = item.querySelector(".menu-link");
            const submenu = item.querySelector(".submenu");

            if (submenu && link) {
                console.log('Setting up submenu for:', link.textContent.trim());
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Menu clicked:', link.textContent.trim());
                    
                    // Close all other submenus
                    document.querySelectorAll('.menu-item').forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Toggle current submenu
                    const isActive = item.classList.contains('active');
                    item.classList.toggle('active');
                    
                    console.log('Submenu toggled, now active:', !isActive);
                });
            }
        });

        // Setup mobile menu interactions
        document.querySelectorAll(".mobile-menu-item").forEach(item => {
            const link = item.querySelector(".mobile-menu-link");
            const submenu = item.querySelector(".mobile-submenu");

            if (submenu && link) {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Close all other mobile submenus
                    document.querySelectorAll('.mobile-menu-item').forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Toggle current mobile submenu  
                    item.classList.toggle('active');
                });
            }
        });

        // Close submenu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-item') && !e.target.closest('.mobile-menu-item')) {
                document.querySelectorAll('.menu-item, .mobile-menu-item').forEach(item => {
                    item.classList.remove('active');
                });
            }
        });
        
        console.log('Menu interactions setup complete');
    }
}

// MenuManager will be initialized by main-init.js