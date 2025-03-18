import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <h1>404 - Page Not Found</h1>
      <p>Sorry, we couldnt find the page youre looking for.</p>
      <Link href="/">
        <button style={{ padding: "0.5rem 1rem", fontSize: "1rem", marginTop: "1rem" }}>
          Go to Home
        </button>
      </Link>
    </div>
  );
}