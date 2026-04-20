document.addEventListener("click", function (event) {

    const dropdowns = document.querySelectorAll(".user-dropdown");

    dropdowns.forEach(dropdown => {
        const menu = dropdown.querySelector(".menu");
        const toggle = dropdown.querySelector(".dropdown-toggle");

        // check if click is inside this dropdown
        const isInside = dropdown.contains(event.target);

        if (!isInside) {
            menu.classList.add("hidden");
        }
    });
});

// toggle only clicked dropdown
document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
    toggle.addEventListener("click", function (event) {
        event.stopPropagation();

        const dropdown = this.closest(".user-dropdown");
        const menu = dropdown.querySelector(".menu");

        // close others first (optional but professional UX)
        document.querySelectorAll(".menu").forEach(m => {
            if (m !== menu) m.classList.add("hidden");
        });

        menu.classList.toggle("hidden");
    });
});