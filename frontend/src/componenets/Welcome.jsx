import "./Welcome.css";

export default function Welcome() {
  const username = localStorage.getItem("username");
  return (
    <div className="banner">
      <p className="welcome">
        Welcome to Meetix, <br />
        <span>{username}!</span>
      </p>
    </div>
  );
}
