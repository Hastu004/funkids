async function loadSiteInfo() {
  const status = document.getElementById("api-status");
  const contactLink = document.getElementById("contact-link");

  try {
    const response = await fetch("/api/info");
    if (!response.ok) {
      throw new Error("No se pudo cargar la informacion");
    }

    const data = await response.json();
    contactLink.href = `mailto:${data.contactEmail}`;
    contactLink.textContent = data.contactEmail;
    status.textContent = `${data.message} Horario: ${data.schedule}.`;
  } catch (error) {
    status.textContent = "Backend no disponible en este momento.";
  }
}

loadSiteInfo();
