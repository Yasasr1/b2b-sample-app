import { useEffect } from "react";

export default function AuthSuccess() {
  useEffect(() => {
    window.close();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Authentication Successful</h2>
      <p>If this tab does not close automatically, you may close it manually.</p>
    </div>
  );
}

