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
        // Setup click handlers for menu items
        document.querySelectorAll(".menu-item").forEach(item => {
            const link = item.querySelector(".menu-link");
            const submenu = item.querySelector(".submenu");

            if (submenu) {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Close all other submenus
                    document.querySelectorAll('.menu-item').forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    // Toggle current submenu
                    item.classList.toggle('active');
                });
            }
        });

        // Close submenu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-item')) {
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.classList.remove('active');
                });
            }
        });
    }
}