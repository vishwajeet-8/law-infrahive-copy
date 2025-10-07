import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "@/utils/api";

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/accept-invite",
        { token, password },
        { withCredentials: true }
      );
      setStatus("Success! You can now log in.");
      navigate("/login");
    } catch (err) {
      setStatus("Invite invalid or expired.");
    }
  };

  if (!token) return <p>Invalid invite link.</p>;

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
      <h2 className="text-xl mb-2">Complete Your Signup</h2>
      <input
        type="password"
        placeholder="Set a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded"
        required
        minLength={6}
      />
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Join Workspace
      </button>
      {status && <p className="mt-2">{status}</p>}
    </form>
  );
}

// import { useSearchParams, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import api from "@/utils/api";

// export default function AcceptInvite() {
//   const [params] = useSearchParams();
//   const navigate = useNavigate();

//   const token = params.get("token");
//   const [password, setPassword] = useState("");
//   const [status, setStatus] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post(
//         "/accept-invite",
//         { token, password },
//         { withCredentials: true }
//       );
//       setStatus("Success! You can now log in.");
//       navigate("/login");
//     } catch (err) {
//       setStatus("Invite invalid or expired.");
//     }
//   };

//   if (!token) return <p>Invalid invite link.</p>;

//   return (
//     <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
//       <h2 className="text-xl mb-2">Complete Your Signup</h2>
//       <input
//         type="password"
//         placeholder="Set a password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         className="w-full p-2 border rounded"
//         required
//         minLength={6}
//       />
//       <button
//         type="submit"
//         className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
//       >
//         Join Workspace
//       </button>
//       {status && <p className="mt-2">{status}</p>}
//     </form>
//   );
// }
