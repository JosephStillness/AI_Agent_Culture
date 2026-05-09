import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const quickPrompts = [
  "How can I avoid cultural misunderstanding in group work?",
  "I feel isolated at MQ. What can help me connect with people?",
  "How should the culture chatbot avoid stereotypes?",
  "What should I do if direct feedback feels awkward?",
];

const emptyKnowledgeForm = {
  title: "",
  category: "culture",
  content: "",
};

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Hi, I am Global Guide. Ask me about MQ student culture, cultural misunderstanding, belonging, group work, or responsible culture-chatbot behaviour.",
    },
  ]);
  const [messageInput, setMessageInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [knowledgeForm, setKnowledgeForm] = useState(emptyKnowledgeForm);
  const [isKnowledgeLoading, setIsKnowledgeLoading] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState("");
  const chatEndRef = useRef(null);

  const knowledgeCount = knowledgeEntries.length;
  const cultureCount = useMemo(
    () => knowledgeEntries.filter((entry) => entry.category?.toLowerCase() === "culture").length,
    [knowledgeEntries]
  );

  useEffect(() => {
    fetchKnowledge();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatLoading]);

  async function fetchKnowledge() {
    setKnowledgeError("");
    try {
      const response = await fetch(apiUrl("/api/knowledge"));
      if (!response.ok) {
        throw new Error("Could not load knowledge base.");
      }
      const data = await response.json();
      setKnowledgeEntries(data);
    } catch (error) {
      setKnowledgeError(error.message);
    }
  }

  async function sendMessage(text) {
    const trimmedText = text.trim();
    if (!trimmedText || isChatLoading) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text: trimmedText }]);
    setMessageInput("");
    setChatError("");
    setIsChatLoading(true);

    try {
      const response = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedText }),
      });

      if (!response.ok) {
        throw new Error("AI service unavailable");
      }

      const data = await response.json();
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.reply || "I don't have information about that yet.",
        },
      ]);
    } catch (error) {
      setChatError(error.message);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "AI service unavailable. Please check the backend, database, and OpenAI API key.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }

  async function addKnowledge(event) {
    event.preventDefault();
    setKnowledgeError("");

    const payload = {
      title: knowledgeForm.title.trim(),
      category: knowledgeForm.category.trim() || "culture",
      content: knowledgeForm.content.trim(),
    };

    if (!payload.title || !payload.content) {
      setKnowledgeError("Title and content are required.");
      return;
    }

    setIsKnowledgeLoading(true);
    try {
      const response = await fetch(apiUrl("/api/knowledge"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not add knowledge entry.");
      }

      const createdEntry = await response.json();
      setKnowledgeEntries((current) => [createdEntry, ...current]);
      setKnowledgeForm(emptyKnowledgeForm);
    } catch (error) {
      setKnowledgeError(error.message);
    } finally {
      setIsKnowledgeLoading(false);
    }
  }

  async function deleteKnowledge(id) {
    setKnowledgeError("");
    try {
      const response = await fetch(apiUrl(`/api/knowledge/${id}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete knowledge entry.");
      }

      setKnowledgeEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (error) {
      setKnowledgeError(error.message);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#chat" aria-label="Global Guide home">
          <span className="brandMark">GG</span>
          <span>
            <strong>Global Guide</strong>
            <small>MQ culture chatbot</small>
          </span>
        </a>
        <nav className="navLinks" aria-label="Page navigation">
          <a href="#chat">Chat</a>
          <a href="#knowledge">Knowledge</a>
        </nav>
      </header>

      <main>
        <section id="chat" className="hero">
          <aside className="contextPanel" aria-label="Chatbot context">
            <p className="eyebrow">AI Agent Culture</p>
            <h1>Chat with a culture-only MQ student support bot.</h1>
            <p className="lead">
              This frontend talks to the Spring Boot API. The bot answers only from your database knowledge base about
              culture, belonging, student life, group work, and responsible chatbot behaviour.
            </p>
            <div className="statsGrid">
              <div>
                <span>Total entries</span>
                <strong>{knowledgeCount}</strong>
              </div>
              <div>
                <span>Culture entries</span>
                <strong>{cultureCount}</strong>
              </div>
            </div>
            <div className="scopeBox">
              <h2>Culture scope</h2>
              <p>
                Ask about cultural misunderstanding, isolation, making friends, communication norms, respectful group
                work, and avoiding stereotypes.
              </p>
            </div>
          </aside>

          <section className="chatPanel" aria-label="Chat interface">
            <div className="chatHeader">
              <div>
                <span className="statusDot" aria-hidden="true"></span>
                <strong>Global Guide</strong>
              </div>
              <span>OpenAI + knowledge base</span>
            </div>

            <div className="chatWindow" aria-live="polite">
              {messages.map((message, index) => (
                <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                  <p>{message.text}</p>
                </div>
              ))}
              {isChatLoading && (
                <div className="message assistant typing">
                  <p>Thinking from the MQ culture knowledge base...</p>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            <div className="quickPrompts" aria-label="Quick prompts">
              {quickPrompts.map((prompt) => (
                <button type="button" key={prompt} onClick={() => sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>

            <form
              className="chatForm"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(messageInput);
              }}
            >
              <label className="srOnly" htmlFor="messageInput">
                Ask Global Guide
              </label>
              <input
                id="messageInput"
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                placeholder="Ask about MQ culture, belonging, group work..."
              />
              <button type="submit" disabled={isChatLoading}>
                Send
              </button>
            </form>
            {chatError && <p className="errorText">{chatError}</p>}
          </section>
        </section>

        <section id="knowledge" className="knowledgeSection">
          <div className="sectionHeading">
            <p className="eyebrow">Knowledge Base</p>
            <h2>Control what the chatbot knows.</h2>
            <p>
              Add short culture-focused entries here. The backend fetches all records, concatenates the content, and
              passes that context into OpenAI.
            </p>
          </div>

          <div className="knowledgeLayout">
            <form className="knowledgeForm" onSubmit={addKnowledge}>
              <h3>Add culture knowledge</h3>
              <label>
                Title
                <input
                  value={knowledgeForm.title}
                  onChange={(event) => setKnowledgeForm({ ...knowledgeForm, title: event.target.value })}
                  placeholder="e.g. Respectful group feedback"
                />
              </label>
              <label>
                Category
                <input
                  value={knowledgeForm.category}
                  onChange={(event) => setKnowledgeForm({ ...knowledgeForm, category: event.target.value })}
                  placeholder="culture"
                />
              </label>
              <label>
                Content
                <textarea
                  value={knowledgeForm.content}
                  onChange={(event) => setKnowledgeForm({ ...knowledgeForm, content: event.target.value })}
                  placeholder="Write a culture-only knowledge entry for the chatbot..."
                  rows="7"
                />
              </label>
              <button type="submit" disabled={isKnowledgeLoading}>
                {isKnowledgeLoading ? "Saving..." : "Add knowledge"}
              </button>
              {knowledgeError && <p className="errorText">{knowledgeError}</p>}
            </form>

            <div className="entryList" aria-label="Knowledge entries">
              {knowledgeEntries.length === 0 ? (
                <article className="emptyState">
                  <h3>No knowledge yet</h3>
                  <p>Add culture content so Global Guide has something to answer from.</p>
                </article>
              ) : (
                knowledgeEntries.map((entry) => (
                  <article className="entryCard" key={entry.id}>
                    <div>
                      <span>{entry.category}</span>
                      <h3>{entry.title}</h3>
                    </div>
                    <p>{entry.content}</p>
                    <button type="button" onClick={() => deleteKnowledge(entry.id)}>
                      Delete
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
