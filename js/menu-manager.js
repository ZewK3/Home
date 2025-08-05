// Menu Manager
class MenuManager {
    static updateMenuByRole(userRole) {
        console.log('Updating menu visibility for role:', userRole);
        document.querySelectorAll("#menuList .menu-item").forEach(item => {
            const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
            const shouldShow = allowedRoles.includes(userRole);
            item.style.display = shouldShow ? "block" : "none";
            if (shouldShow) {
                console.log('Menu item visible:', item.querySelector('.menu-link')?.textContent?.trim());
            }
        });
        this.updateSubmenusByRole(userRole);
    }

    static updateSubmenusByRole(userRole) {
        ['#openSchedule', '#openTaskProcessing', '#openSubmitRequest', '#openWorkManagement'].forEach(selector => {
            const menuItem = document.querySelector(selector)?.closest('.menu-item');
            if (menuItem) {
                menuItem.querySelectorAll('.submenu-item').forEach(item => {
                    const allowedRoles = item.getAttribute("data-role")?.split(",") || [];
                    const shouldShow = allowedRoles.includes(userRole);
                    
                    // Enhanced visibility control for submenu items
                    if (shouldShow) {
                        item.style.display = 'block';
                        item.style.visibility = 'visible';
                        item.classList.add('role-visible');
                        console.log('Submenu item made visible:', item.querySelector('.submenu-link')?.textContent?.trim());
                    } else {
                        item.style.display = 'none';
                        item.style.visibility = 'hidden';
                        item.classList.remove('role-visible');
                    }
                });
                
                // Check if any submenu items are visible, if not hide the parent menu
                const visibleSubItems = menuItem.querySelectorAll('.submenu-item.role-visible');
                if (visibleSubItems.length === 0) {
                    menuItem.style.display = 'none';
                } else {
                    const parentAllowedRoles = menuItem.getAttribute("data-role")?.split(",") || [];
                    menuItem.style.display = parentAllowedRoles.includes(userRole) ? "block" : "none";
                }
            }
        });
        
        console.log('Role-based submenu visibility updated for role:', userRole);
    }

    static setupMenuInteractions() {
        console.log('Setting up menu interactions...');
        
        // Clear existing event listeners first
        document.querySelectorAll(".menu-link").forEach(link => {
            if (link._menuClickHandler) {
                link.removeEventListener("click", link._menuClickHandler);
                delete link._menuClickHandler;
            }
        });
        
        // Setup click handlers for menu items
        document.querySelectorAll(".menu-item").forEach(item => {
            const link = item.querySelector(".menu-link");
            const submenu = item.querySelector(".submenu");

            if (submenu && link) {
                console.log('Setting up submenu for:', link.textContent.trim());
                
                // Add new event listener
                const handleClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Menu clicked:', link.textContent.trim());
                    
                    // Close all other submenus
                    document.querySelectorAll('.menu-item').forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            console.log('Closed submenu for:', otherItem.querySelector('.menu-link')?.textContent?.trim());
                        }
                    });
                    
                    // Toggle current submenu
                    const wasActive = item.classList.contains('active');
                    item.classList.toggle('active');
                    const isNowActive = item.classList.contains('active');
                    
                    console.log('Submenu toggled, now active:', isNowActive);
                    
                    // Force reflow and ensure proper visibility
                    if (isNowActive) {
                        submenu.offsetHeight; // Force reflow
                        // Make sure all visible submenu items are properly displayed
                        submenu.querySelectorAll('.submenu-item.role-visible').forEach(subItem => {
                            subItem.style.display = 'block';
                            subItem.style.visibility = 'visible';
                            subItem.style.opacity = '1';
                        });
                        console.log('Submenu activated and items made visible');
                    }
                };
                
                link.addEventListener("click", handleClick);
                
                // Store the handler for cleanup
                link._menuClickHandler = handleClick;
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