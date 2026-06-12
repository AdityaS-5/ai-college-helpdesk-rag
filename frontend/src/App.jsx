import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loginRole, setLoginRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const [vectorDocuments, setVectorDocuments] = useState([]);
  const [vectorDocsLoading, setVectorDocsLoading] = useState(false);

  const [resetLoading, setResetLoading] = useState(false);
  const [reindexLoading, setReindexLoading] = useState(false);

  const handleLogin = () => {
    if (loginRole === "student") {
      if (username === "student" && password === "student123") {
        setUserRole("student");
        setUsername("");
        setPassword("");
        return;
      }
    }

    if (loginRole === "admin") {
      if (username === "admin" && password === "admin123") {
        setUserRole("admin");
        setUsername("");
        setPassword("");
        fetchDocuments();
        fetchVectorDocuments();
        return;
      }
    }

    alert("Invalid username or password");
  };

  const logout = () => {
    setUserRole(null);
    setQuestion("");
    setAnswer("");
    setSources([]);
    setUploadMessage("");
    setSelectedFile(null);
  };

  const askQuestion = async () => {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    try {
      setChatLoading(true);
      setAnswer("");
      setSources([]);

      const response = await axios.post(`${API_BASE_URL}/chat`, {
        question: question,
      });

      setAnswer(response.data.answer);
      setSources(response.data.sources || []);
    } catch (error) {
      console.error(error);
      alert("Error while asking question. Check backend server.");
    } finally {
      setChatLoading(false);
    }
  };

  const uploadPdf = async () => {
    if (!selectedFile) {
      alert("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploadLoading(true);
      setUploadMessage("");

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadMessage(
        `${response.data.message} | Pages: ${response.data.total_pages} | Chunks: ${response.data.total_chunks}`
      );

      setSelectedFile(null);
      fetchDocuments();
      fetchVectorDocuments();
    } catch (error) {
      console.error(error);
      alert("Error while uploading PDF. Check backend server.");
    } finally {
      setUploadLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setDocsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error(error);
      alert("Error while fetching uploaded documents.");
    } finally {
      setDocsLoading(false);
    }
  };

  const fetchVectorDocuments = async () => {
    try {
      setVectorDocsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/vector-documents`);
      setVectorDocuments(response.data.indexed_documents || []);
    } catch (error) {
      console.error(error);
      alert("Error while fetching vector database documents.");
    } finally {
      setVectorDocsLoading(false);
    }
  };

  const deleteDocument = async (fileName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${fileName}?`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/documents/${encodeURIComponent(fileName)}`
      );
      fetchDocuments();
    } catch (error) {
      console.error(error);

      if (error.response && error.response.status === 404) {
        alert("File was not found. Refreshing document list.");
        fetchDocuments();
      } else {
        alert("Error while deleting document.");
      }
    }
  };

  const resetVectorDb = async () => {
    const confirmReset = window.confirm(
      "This will clear only the vector database. Uploaded PDFs will remain. Continue?"
    );

    if (!confirmReset) return;

    try {
      setResetLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/reset-vector-db`);

      alert(
        response.data.message +
          "\n\nNote: Uploaded PDF files are still listed. Reset only clears ChromaDB."
      );

      fetchDocuments();
      fetchVectorDocuments();
    } catch (error) {
      console.error(error);
      alert("Error while resetting vector database.");
    } finally {
      setResetLoading(false);
    }
  };

  const reindexAllDocuments = async () => {
    const confirmReindex = window.confirm(
      "This will index all uploaded PDFs into ChromaDB. Continue?"
    );

    if (!confirmReindex) return;

    try {
      setReindexLoading(true);

      const response = await axios.post(`${API_BASE_URL}/reindex-all`);

      alert(
        `${response.data.message}\n\nIndexed documents: ${response.data.indexed_documents.length}`
      );

      fetchVectorDocuments();
    } catch (error) {
      console.error(error);
      alert("Error while re-indexing uploaded PDFs.");
    } finally {
      setReindexLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "admin") {
      fetchDocuments();
      fetchVectorDocuments();
    }
  }, [userRole]);

  if (!userRole) {
    return (
      <div className="login-page">
        <div className="login-bg-glow glow-one"></div>
        <div className="login-bg-glow glow-two"></div>

        <div className="login-shell">
          <div className="hero-panel">
            <div className="logo-circle">AI</div>
            <p className="eyebrow">College Helpdesk RAG System</p>
            <h1>Ask college questions from official PDF documents.</h1>
            <p className="hero-text">
              A modern AI helpdesk that retrieves answers from uploaded
              academic regulations, conduct rules, and college documents with
              source page references.
            </p>

            <div className="hero-stats">
              <div>
                <strong>RAG</strong>
                <span>Retrieval-based answers</span>
              </div>
              <div>
                <strong>PDF</strong>
                <span>Document ingestion</span>
              </div>
              <div>
                <strong>Admin</strong>
                <span>Index management</span>
              </div>
            </div>
          </div>

          <div className="login-card">
            <h2>Welcome Back</h2>
            <p>Select your role and continue to the dashboard.</p>

            <div className="role-switch">
              <button
                className={loginRole === "student" ? "role active" : "role"}
                onClick={() => setLoginRole("student")}
              >
                Student
              </button>
              <button
                className={loginRole === "admin" ? "role active" : "role"}
                onClick={() => setLoginRole("admin")}
              >
                Admin
              </button>
            </div>

            <label>Username</label>
            <input
              className="login-input"
              type="text"
              placeholder={
                loginRole === "student" ? "student" : "admin"
              }
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label>Password</label>
            <input
              className="login-input"
              type="password"
              placeholder={
                loginRole === "student" ? "student123" : "admin123"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />

            <button className="login-btn" onClick={handleLogin}>
              Login as {loginRole === "student" ? "Student" : "Admin"}
            </button>

            <div className="demo-box">
              <strong>Demo Credentials</strong>
              <p>Student: student / student123</p>
              <p>Admin: admin / admin123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === "student") {
    return (
      <div className="dashboard student-dashboard">
        <aside className="sidebar">
          <div>
            <div className="brand">
              <div className="brand-icon">AI</div>
              <div>
                <h3>College Bot</h3>
                <p>Student Portal</p>
              </div>
            </div>

            <div className="side-menu">
              <button className="side-link active">Ask Helpdesk</button>
            </div>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <div>
              <p className="eyebrow dark">Student Dashboard</p>
              <h1>AI College Helpdesk</h1>
            </div>
            <div className="status-pill">Online</div>
          </header>

          <section className="student-grid">
            <div className="chat-card glass-card">
              <div className="card-heading">
                <div>
                  <h2>Ask a Question</h2>
                  <p>
                    Ask about attendance, honours, ITT, exam rules, conduct
                    rules, or faculty advisor.
                  </p>
                </div>
              </div>

              <textarea
                className="question-box premium"
                placeholder="Example: What is the eligibility for honours?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />

              <div className="quick-questions">
                {[
                  "What is Integrated Technical Training?",
                  "What is the eligibility for honours?",
                  "What is the attendance requirement?",
                  "What are the student conduct rules?",
                ].map((item) => (
                  <button key={item} onClick={() => setQuestion(item)}>
                    {item}
                  </button>
                ))}
              </div>

              <button className="primary-btn wide" onClick={askQuestion}>
                {chatLoading ? "Generating Answer..." : "Ask AI Helpdesk"}
              </button>
            </div>

            <div className="answer-card glass-card">
              <h2>Answer</h2>

              {!answer && (
                <div className="empty-state">
                  <div className="empty-icon">?</div>
                  <p>Your answer will appear here with source references.</p>
                </div>
              )}

              {answer && (
                <>
                  <p className="answer-text">{answer}</p>

                  {sources.length > 0 && (
                    <div className="source-section">
                      <h3>Sources</h3>
                      {sources.map((source, index) => (
                        <div className="source-chip" key={index}>
                          <span>{source.document_name}</span>
                          <span>Page {source.page_number}</span>
                          {source.distance !== undefined && (
                            <span>Distance {source.distance}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard admin-dashboard">
      <aside className="sidebar admin-side">
        <div>
          <div className="brand">
            <div className="brand-icon admin">AD</div>
            <div>
              <h3>Admin Panel</h3>
              <p>Document Control</p>
            </div>
          </div>

          <div className="side-menu">
            <button className="side-link active">Dashboard</button>
            <button className="side-link">PDF Upload</button>
            <button className="side-link">Vector DB</button>
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow dark">Admin Dashboard</p>
            <h1>Manage College Knowledge Base</h1>
          </div>

          <div className="admin-actions">
            <button className="secondary-btn" onClick={reindexAllDocuments}>
              {reindexLoading ? "Re-indexing..." : "Re-index All PDFs"}
            </button>

            <button className="danger-btn" onClick={resetVectorDb}>
              {resetLoading ? "Resetting..." : "Reset Vector DB"}
            </button>
          </div>
        </header>

        <section className="metrics-grid">
          <div className="metric-card">
            <span>Uploaded PDFs</span>
            <strong>{documents.length}</strong>
          </div>
          <div className="metric-card">
            <span>Indexed Docs</span>
            <strong>{vectorDocuments.length}</strong>
          </div>
          <div className="metric-card">
            <span>Total Chunks</span>
            <strong>
              {vectorDocuments.reduce(
                (total, doc) => total + (doc.total_chunks || 0),
                0
              )}
            </strong>
          </div>
        </section>

        <section className="admin-grid">
          <div className="glass-card upload-panel">
            <h2>Upload PDF</h2>
            <p>
              Upload academic regulations, code of conduct, placement documents,
              or other college PDFs.
            </p>

            <label className="upload-drop">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <div className="upload-icon">↑</div>
              <strong>
                {selectedFile ? selectedFile.name : "Choose PDF file"}
              </strong>
              <span>PDF files only</span>
            </label>

            <button className="primary-btn wide" onClick={uploadPdf}>
              {uploadLoading ? "Uploading and Indexing..." : "Upload and Index"}
            </button>

            {uploadMessage && (
              <div className="success-box">
                <p>{uploadMessage}</p>
              </div>
            )}
          </div>

          <div className="glass-card">
            <h2>Uploaded PDF Files</h2>
            <p className="muted">
              Physical files stored in the backend uploads folder.
            </p>

            {docsLoading ? (
              <p>Loading uploaded files...</p>
            ) : documents.length === 0 ? (
              <div className="empty-mini">No PDFs uploaded.</div>
            ) : (
              <div className="modern-list">
                {documents.map((doc, index) => (
                  <div className="modern-list-item" key={index}>
                    <div>
                      <strong>{doc.file_name}</strong>
                      <span>{doc.size_kb} KB</span>
                    </div>
                    <button
                      className="mini-danger"
                      onClick={() => deleteDocument(doc.file_name)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card wide-card">
            <h2>Indexed in ChromaDB</h2>
            <p className="muted">
              These documents are searchable by the chatbot.
            </p>

            {vectorDocsLoading ? (
              <p>Loading indexed documents...</p>
            ) : vectorDocuments.length === 0 ? (
              <div className="empty-mini">
                No documents indexed. Click Re-index All PDFs.
              </div>
            ) : (
              <div className="index-table">
                <div className="table-row table-head">
                  <span>Document</span>
                  <span>Chunks</span>
                  <span>Pages Indexed</span>
                </div>

                {vectorDocuments.map((doc, index) => (
                  <div className="table-row" key={index}>
                    <span>{doc.document_name}</span>
                    <span>{doc.total_chunks}</span>
                    <span>{doc.total_pages_indexed}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;