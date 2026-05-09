const chatWindow = document.querySelector("#chatWindow");
const promptButtons = document.querySelectorAll("[data-prompt]");

const responses = {
  misunderstanding: {
    user: "My group went quiet after I gave direct feedback. Did I offend them?",
    bot:
      "Possibly, but silence can mean many things. In some contexts, direct feedback can feel personal, especially in a new group. Try a repair message: acknowledge the moment, explain your intention, and invite their view. I can also show student stories about group work expectations.",
  },
  friends: {
    user: "I want to make friends but I feel awkward joining conversations.",
    bot:
      "Start with low-pressure settings where conversation has a shared purpose: study circles, food exchange events, language swap, or club workshops. The goal is not instant friendship; it is repeated, safe contact that builds confidence over time.",
  },
  event: {
    user: "Suggest an event that does not feel intimidating.",
    bot:
      "A small peer circle is a better first step than a large networking event. Recommended: Global Lunch Table, Culture Story Night, or a faculty-based study social. Each includes trained peer hosts and conversation prompts.",
  },
  safety: {
    user: "What if the chatbot gives a stereotyped cultural answer?",
    bot:
      "Good concern. This hub should label AI advice as guidance, include multiple possible interpretations, let students flag harmful responses, and send repeated issues to human moderators for review.",
  },
};

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}`;

  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  message.appendChild(paragraph);

  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setActiveJourney(index) {
  document.querySelectorAll(".journey-step").forEach((step, stepIndex) => {
    step.classList.toggle("active", stepIndex === index);
  });
}

promptButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const selected = responses[button.dataset.prompt];
    addMessage(selected.user, "user");

    window.setTimeout(() => {
      addMessage(selected.bot, "bot");
      setActiveJourney(Math.min(index, 2));
    }, 280);
  });
});
