import { useState } from "react";
import { useAuth } from "@/lib/auth";

const Login = () => {
  const { login } = useAuth();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ role: "user", name: name || "Citizen" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Citizen Sign in</h2>
        <label className="block mb-2 text-sm font-medium">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2 border rounded mb-4"
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">Sign in as Citizen</button>
      </form>
    </div>
  );
};

export default Login;
