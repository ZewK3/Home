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
                    } else {
                        item.style.display = 'none';
                        item.style.visibility = 'hidden';
                        item.classList.remove('role-visible');
                    }
                });
                
                // Check if any submenu items are visible, if not hide the parent menu
                const visibleSubItems = menuItem.querySelectorAll('.submenu-item[style*="display: block"], .submenu-item:not([style*="display: none"])');
                if (visibleSubItems.length === 0) {
                    menuItem.style.display = 'none';
                } else {
                    const parentAllowedRoles = menuItem.getAttribute("data-role")?.split(",") || [];
                    menuItem.style.display = parentAllowedRoles.includes(userRole) ? "block" : "none";
                }
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
                
                // Remove any existing event listeners to prevent duplicates
                link.removeEventListener("click", this.handleMenuClick);
                
                // Add new event listener
                const handleClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Menu clicked:', link.textContent.trim());
                    
                    // Close all other submenus
                    document.querySelectorAll('.menu-item').forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            // Also ensure visibility for submenu items in closed menus
                            const otherSubmenu = otherItem.querySelector('.submenu');
                            if (otherSubmenu) {
                                otherSubmenu.style.display = '';
                                otherSubmenu.style.visibility = '';
                            }
                            console.log('Closed submenu for:', otherItem.querySelector('.menu-link')?.textContent?.trim());
                        }
                    });
                    
                    // Toggle current submenu
                    const wasActive = item.classList.contains('active');
                    item.classList.toggle('active');
                    const isNowActive = item.classList.contains('active');
                    
                    console.log('Submenu toggled - was active:', wasActive, 'now active:', isNowActive);
                    
                    // Enhanced submenu visibility handling
                    submenu.style.display = '';
                    submenu.style.visibility = '';
                    
                    // Ensure submenu items are properly visible when menu is active
                    if (isNowActive) {
                        submenu.offsetHeight; // Force reflow
                        submenu.querySelectorAll('.submenu-item').forEach(subItem => {
                            subItem.style.display = '';
                            subItem.style.visibility = 'visible';
                        });
                    } else {
                        // Reset submenu items when closing
                        submenu.querySelectorAll('.submenu-item').forEach(subItem => {
                            subItem.style.display = '';
                            subItem.style.visibility = '';
                        });
                    }
                };
                
                link.addEventListener("click", handleClick);
                
                // Store the handler for potential cleanup
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