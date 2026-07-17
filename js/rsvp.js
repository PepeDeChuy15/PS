(() => {
  const config = window.RSVP_CONFIG || {};
  const dialog = document.getElementById("rsvp-dialog");
  const openButton = document.getElementById("open-rsvp");
  const closeButton = document.getElementById("close-rsvp");
  const lookupForm = document.getElementById("rsvp-lookup-form");
  const attendanceForm = document.getElementById("rsvp-attendance-form");
  const codeInput = document.getElementById("invitation-code");
  const lookupView = document.getElementById("rsvp-lookup-view");
  const guestsView = document.getElementById("rsvp-guests-view");
  const guestsList = document.getElementById("rsvp-guests-list");
  const familyMessage = document.getElementById("rsvp-family-message");
  const status = document.getElementById("rsvp-status");
  const backButton = document.getElementById("rsvp-back");

  let invitation = null;
  let invitationCode = "";

  const configured = () => Boolean(config.supabaseUrl && config.supabaseAnonKey);

  const showStatus = (message, success = false) => {
    status.textContent = message;
    status.classList.toggle("success", success);
  };

  const rpc = async (functionName, body) => {
    if (!configured()) {
      throw new Error("El sistema de confirmación aún no está configurado.");
    }

    const response = await fetch(`${config.supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`
      },
      body: JSON.stringify(body)
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.message || "No pudimos conectar con las confirmaciones. Intenta de nuevo.");
    }
    return payload;
  };

  const setLoading = (form, loading, label) => {
    const button = form.querySelector("button[type='submit']");
    button.disabled = loading;
    button.textContent = loading ? "Un momento..." : label;
  };

  const showLookup = () => {
    invitation = null;
    invitationCode = "";
    lookupView.hidden = false;
    guestsView.hidden = true;
    status.textContent = "";
    guestsList.replaceChildren();
    codeInput.focus();
  };

  const showGuests = (data) => {
    invitation = data;
    lookupView.hidden = true;
    guestsView.hidden = false;
    status.textContent = "";
    guestsList.replaceChildren();
    familyMessage.textContent = `Hola, ${data.family_name}. Seleccionen a las personas que asistirán.`;

    data.guests.forEach((guest) => {
      const label = document.createElement("label");
      label.className = "rsvp-guest-option";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "guests";
      checkbox.value = guest.id;
      checkbox.checked = Boolean(guest.is_attending);
      const name = document.createElement("span");
      name.textContent = guest.full_name;
      label.append(checkbox, name);
      guestsList.append(label);
    });
  };

  const openDialog = () => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    showLookup();
    const codeFromLink = new URLSearchParams(window.location.search).get("codigo");
    if (codeFromLink) codeInput.value = codeFromLink.toUpperCase();
  };

  const closeDialog = () => {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };

  openButton.addEventListener("click", openDialog);
  closeButton.addEventListener("click", closeDialog);
  backButton.addEventListener("click", showLookup);

  lookupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    invitationCode = codeInput.value.trim().toUpperCase();
    if (!invitationCode) return;

    setLoading(lookupForm, true, "Continuar");
    showStatus("");
    try {
      const data = await rpc("rsvp_get_invitation", { p_access_code: invitationCode });
      if (!data) throw new Error("No encontramos ese código. Revísalo e intenta de nuevo.");
      showGuests(data);
    } catch (error) {
      showStatus(error.message);
    } finally {
      setLoading(lookupForm, false, "Continuar");
    }
  });

  attendanceForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!invitation) return;

    const selectedGuests = [...attendanceForm.querySelectorAll("input[name='guests']:checked")]
      .map((input) => input.value);
    setLoading(attendanceForm, true, "Enviar confirmación");
    showStatus("");
    try {
      await rpc("rsvp_confirm_attendance", {
        p_access_code: invitationCode,
        p_selected_guest_ids: selectedGuests
      });
      guestsView.hidden = true;
      showStatus("¡Gracias! Su confirmación fue registrada correctamente.", true);
    } catch (error) {
      showStatus(error.message);
    } finally {
      setLoading(attendanceForm, false, "Enviar confirmación");
    }
  });
})();
