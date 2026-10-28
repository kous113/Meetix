
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.jsx";
import withAuth from "../utils/withAuth.jsx";
import "./history.css";

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function History() {
  const { getHistoryOfUser } = useContext(AuthContext);

  const [userHistory, setUserHistory] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // Fetch meeting history from the backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistoryOfUser();

        console.log("History API response:", response);

        setUserHistory(
          Array.isArray(response)
            ? response
            : response?.history ?? response?.activities ?? []
        );
      } catch (error) {
        console.error(
          "Failed to fetch history:",
          error.response?.data || error.message
        );
      }
    };

    fetchHistory();
  }, []);

  const meetings = useMemo(() => {
    return userHistory.filter((meeting) => {
      const code =
        typeof meeting === "string"
          ? meeting
          : meeting.meetingCode ||
            meeting.meetingId ||
            meeting.code ||
            "";

      return code.toLowerCase().includes(search.toLowerCase());
    });
  }, [userHistory, search]);

  return (
    <div className="history-layout">
      <aside className="history-sidebar">
        <div className="history-logo">
          <div className="history-logo-icon">
            <svg
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="6" width="13" height="12" rx="3" />
              <path d="m16 10 5-3v10l-5-3" />
            </svg>
          </div>
          <span>Meetix</span>
        </div>

        <nav className="history-nav">
          <button onClick={() => navigate("/dashboard")}>
            <span className="nav-icon">⌂</span>
            Home
          </button>

          <button onClick={() => navigate("/new-meeting")}>
            <span className="nav-icon">⊞</span>
            New Meeting
          </button>

          <button className="active">
            <span className="nav-icon">◷</span>
            History
          </button>
        </nav>

        <p className="history-sidebar-footer">
          Better meetings.
          <br />
          Closer people.
        </p>
      </aside>

      <main className="history-main">
        

        <section className="history-content">
          <span className="history-eyebrow">YOUR ACTIVITY</span>

          <h1>Meeting History</h1>

          <p className="history-description">
            View and rejoin your previous meetings. You can also
            copy the meeting ID and share it with others.
          </p>

          <div className="history-search">
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="text"
              placeholder="Search by meeting code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="history-section-header">
            <h2>Previous Meetings</h2>
            <span>{meetings.length} meetings</span>
          </div>

          {meetings.length > 0 ? (
            <div className="history-meetings">
              {meetings.map((meeting, index) => {
                const code =
                  typeof meeting === "string"
                    ? meeting
                    : meeting.meetingCode ||
                      meeting.meetingId ||
                      meeting.code ||
                      "";

                const date =
                  typeof meeting === "string"
                    ? null
                    : meeting.createdAt ||
                      meeting.date ||
                      meeting.timestamp;

                return (
                  <article
                    className="history-meeting-card"
                    key={
                      typeof meeting === "object"
                        ? meeting._id || meeting.id || `${code}-${index}`
                        : `${code}-${index}`
                    }
                  >
                    <span className="history-meeting-code">
                      {code || "Unknown meeting"}
                    </span>

                    <div className="history-meeting-date">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="16"
                          rx="2"
                        />
                        <path d="M16 3v4M8 3v4M3 10h18" />
                      </svg>

                      <span>{formatDate(date)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="history-empty">
              <div className="history-empty-icon">◷</div>

              <h2>
                {search
                  ? "No meetings found"
                  : "No meeting history yet"}
              </h2>

              <p>
                {search
                  ? "Try searching with another meeting code."
                  : "Your previous meetings will appear here."}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default withAuth(History);