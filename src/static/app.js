// Function to show a message
function showMessage(text, type) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = text;
  messageDiv.className = type;
  messageDiv.classList.remove("hidden");

  // Hide message after 5 seconds
  setTimeout(() => {
    messageDiv.classList.add("hidden");
  }, 5000);
}

// Function to remove a participant from an activity
async function removeParticipant(activityName, email) {
  try {
    const response = await fetch(
      `/activities/${encodeURIComponent(activityName)}/participants/${encodeURIComponent(email)}`,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();

    if (response.ok) {
      showMessage(result.message, "success");
      // Get reference to fetchActivities function and call it
      await window.refreshActivities();
    } else {
      showMessage(result.detail || "Ocorreu um erro", "error");
    }
  } catch (error) {
    showMessage("Falha ao remover participante. Por favor, tente novamente.", "error");
    console.error("Erro ao remover participante:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Cria a lista de participantes
        let participantsSection = "";
        if (details.participants.length > 0) {
          participantsSection = `
            <div class="participants-section">
              <strong>Participantes:</strong>
              <ul class="participants-list">
                ${details.participants.map(email => `
                  <li class="participant-item">
                    <span>${email}</span>
                    <span class="delete-participant" onclick="removeParticipant('${name}', '${email}')">×</span>
                  </li>`).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsSection = `
            <div class="participants-section">
              <strong>Participantes:</strong>
              <p class="no-participants">Nenhum participante inscrito ainda.</p>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Agenda:</strong> ${details.schedule}</p>
          <p><strong>Disponibilidade:</strong> ${spotsLeft} vagas disponíveis</p>
          ${participantsSection}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Falha ao carregar atividades. Por favor, tente novamente mais tarde.</p>";
      console.error("Erro ao buscar atividades:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities to show updated list
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Ocorreu um erro";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Falha na inscrição. Por favor, tente novamente.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Erro na inscrição:", error);
    }
  });

  // Make fetchActivities available globally for removeParticipant function
  window.refreshActivities = fetchActivities;

  // Initialize app
  fetchActivities();
});
