window.addEventListener("pageshow", async (event) => {
  if (!event.persisted) return;

  document.documentElement.style.visibility = "hidden";

  try {
    const response = await fetch("/auth/session", {
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) {
      window.location.replace("/login");
      return;
    }

    document.documentElement.style.visibility = "visible";
  } catch {
    document.documentElement.style.visibility = "visible";
  }
});