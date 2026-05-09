const chatWindow = document.querySelector("#chatWindow");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const quickPromptButtons = document.querySelectorAll("[data-prompt]");

const promptText = {
  misunderstanding: "I had an awkward group work misunderstanding. What should I do?",
  friends: "I feel isolated and want to make friends at MQ.",
  bmc: "Explain the Business Model Canvas for MQ Global Culture Hub.",
  vpc: "Explain the Value Proposition Canvas for this chatbot.",
  cynefin: "Why is the chatbot domain complex in Cynefin?",
  responsible: "What Responsible AI risks matter for a culture chatbot?",
};

const knowledgeBase = [
  {
    id: "misunderstanding",
    keywords: ["misunderstanding", "awkward", "offend", "offended", "group", "feedback", "culture", "conflict"],
    response:
      "A cultural misunderstanding should be handled as context-dependent, not as proof that one person is wrong.\n\nFor MQ Global Culture Hub, I would suggest:\n1. Describe the situation without blaming anyone.\n2. Offer more than one possible interpretation.\n3. Encourage a repair action, such as clarifying intention and inviting the other person's view.\n4. Link the student to real peer stories or a group-work support event.\n\nThis fits the business idea because the chatbot reduces confusion, while the community provides lived experience.",
  },
  {
    id: "friends",
    keywords: ["lonely", "loneliness", "isolated", "isolation", "friend", "friends", "belonging", "network", "connect"],
    response:
      "The main pain is not simply lacking information. It is loneliness, isolation, and low confidence in cross-cultural settings.\n\nThe chatbot can help by suggesting low-pressure ways to connect: peer circles, language exchange, food-sharing events, faculty study socials, and MQ club activities. The important value is belonging and confidence, not just an AI answer.",
  },
  {
    id: "bmc",
    keywords: ["bmc", "business model", "canvas", "revenue", "partners", "resources", "activities", "customer"],
    response:
      "Business Model Canvas summary:\n\nCustomer segments: international students, domestic students who want cross-cultural connection, and new postgraduate students.\n\nValue proposition: reduce cultural misunderstanding and isolation through AI guidance, real student stories, and community events.\n\nKey resources: chatbot, moderated user knowledge, community trust, MQ clubs, student organisations, and event partners.\n\nKey activities: manage chatbot answers, moderate content, organise events, collect feedback, and review bias or harm.\n\nRevenue streams: university support funding, sponsored intercultural events, partner workshops, and optional premium cultural training.\n\nThe chatbot is meaningful because it connects the BMC blocks, but it is not the whole business.",
  },
  {
    id: "vpc",
    keywords: ["vpc", "value proposition", "pain", "gain", "jobs", "customer profile", "value map"],
    response:
      "Value Proposition Canvas summary:\n\nCustomer jobs: make friends, understand others, adapt socially, participate in group work, and ask cultural questions safely.\n\nPains: loneliness, awkward situations, fear of offending people, language anxiety, and cultural misinterpretation.\n\nGains: belonging, confidence, practical cultural understanding, and a stronger cross-cultural network.\n\nProducts and services: Global Guide chatbot, moderated story library, peer circles, campus events, and club referrals.\n\nPain relievers: explain cultural differences, reduce uncertainty, provide non-judgemental guidance, and escalate risky cases.\n\nGain creators: real stories, inclusive events, repeated interaction, and community belonging beyond the chatbot.",
  },
  {
    id: "cynefin",
    keywords: ["cynefin", "complex", "domain", "complicated", "simple", "chaotic", "probe", "sense", "respond"],
    response:
      "The correct Cynefin domain is complex.\n\nWhy: cultural belonging has no fixed universal rule. The same behaviour can have different meanings depending on culture, relationship, language confidence, previous experiences, and campus context. Student expectations also evolve over time.\n\nSo the business should not use a rigid rulebook. It should probe, sense, and respond: test small events, collect safe feedback, review chatbot logs, learn from community stories, and improve guidance continuously.",
  },
  {
    id: "sociotechnical",
    keywords: ["socio", "technical", "sociotechnical", "people", "process", "technology", "data", "governance"],
    response:
      "Socio-technical analysis for this chatbot:\n\nPeople: diverse MQ students, peer contributors, moderators, clubs, and support staff.\n\nProcess: students ask questions, share experiences, content is moderated, chatbot guidance is improved, and users are connected to events.\n\nTechnology: AI chatbot, searchable story library, event recommendation, flagging and feedback tools.\n\nData: user questions, anonymised stories, content tags, event feedback, and flagged harmful responses.\n\nGovernance: privacy rules, moderation standards, bias review, escalation pathways, and transparency about the chatbot's limits.\n\nThis is project-specific because trust depends on how the social system and technical system work together.",
  },
  {
    id: "responsible",
    keywords: ["responsible", "ethical", "bias", "fairness", "misinformation", "privacy", "harm", "stereotype", "transparent"],
    response:
      "Responsible AI principles most relevant here:\n\nBias and fairness: avoid stereotypes and include multiple cultural perspectives.\n\nMisinformation control: label student stories as lived experience, not official cultural facts.\n\nHarm prevention: detect offensive or discriminatory content and escalate serious cases to human support.\n\nTransparency: tell users the chatbot is a support tool, not a cultural expert.\n\nPrivacy: minimise personal data, anonymise sensitive stories, and protect identity-based experiences.\n\nThese principles link directly to the business because trust is the product's competitive advantage.",
  },
  {
    id: "limitations",
    keywords: ["limitation", "limitations", "future", "conclusion", "improve", "direction", "expand"],
    response:
      "Realistic limitations:\n\nThe hub depends on student engagement, strong moderation, safe privacy practice, and the chatbot's ability to avoid overconfident answers. User-generated cultural knowledge can also contain bias or misinformation.\n\nLogical future directions:\n\nAdd stronger moderation workflows, alumni mentoring, official MQ support referrals, multilingual content, and governance dashboards for bias, harm, and privacy monitoring.",
  },
  {
    id: "intro",
    keywords: ["intro", "introduction", "what is", "global culture hub", "mq", "topic", "idea"],
    response:
      "MQ Global Culture Hub is a community-based culture support service for diverse students.\n\nThe problem is that students can experience cultural misunderstanding, loneliness, and social isolation. The solution combines Global Guide, an AI chatbot, with moderated student stories, peer interaction, and campus events.\n\nThe key message for the assignment is: AI is a support tool, while community and lived experience create the main value.",
  },
];

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}`;

  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  message.appendChild(paragraph);

  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function normalise(text) {
  return text.toLowerCase().trim();
}

function scoreTopic(question, topic) {
  const cleanedQuestion = normalise(question);
  return topic.keywords.reduce((score, keyword) => {
    return cleanedQuestion.includes(keyword) ? score + 1 : score;
  }, 0);
}

function findBestResponse(question) {
  const rankedTopics = knowledgeBase
    .map((topic) => ({ ...topic, score: scoreTopic(question, topic) }))
    .sort((a, b) => b.score - a.score);

  if (rankedTopics[0].score > 0) {
    return rankedTopics[0].response;
  }

  return (
    "I can answer this best when it links to the MQ Global Culture Hub project.\n\nTry asking about cultural misunderstanding, loneliness, making friends, BMC, VPC, Cynefin complex domain, socio-technical analysis, Responsible AI, limitations, or future directions."
  );
}

function answerQuestion(question) {
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    return;
  }

  addMessage(trimmedQuestion, "user");
  chatInput.value = "";

  window.setTimeout(() => {
    addMessage(findBestResponse(trimmedQuestion), "bot");
  }, 260);
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  answerQuestion(chatInput.value);
});

quickPromptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    answerQuestion(promptText[button.dataset.prompt]);
  });
});

window.setTimeout(() => {
  addMessage(
    "Tip: for the assignment, ask me: 'Why is this complex?', 'Explain the BMC', or 'What Responsible AI risks matter?'",
    "system"
  );
}, 500);
