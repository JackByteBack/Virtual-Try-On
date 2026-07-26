"use client";
import { useState } from "react";
import { useAuth, getAccessToken } from "@/context/AuthContext";

const VIEWS = ["front", "back", "left", "right"] as const;

interface PhotoUploaderProps {
  onAvatarReady: (url: string) => void;
}

export default function PhotoUploader({ onAvatarReady }: PhotoUploaderProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<Record<string, File>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        setError("Please login to generate your avatar");
        setLoading(false);
        return;
      }

      const token = getAccessToken();
      if (!token) {
        setError("Please login to generate your avatar");
        setLoading(false);
        return;
      }

      const form = new FormData();
      VIEWS.forEach((v) => {
        if (files[v]) form.append(v, files[v]);
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await fetch(`${apiUrl}/api/tryon/generate-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        throw new Error("Avatar generation failed");
      }

      const data = await res.json();
      onAvatarReady(data.avatarUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate avatar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {VIEWS.map((view) => (
          <label
            key={view}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors text-center"
          >
            <div className="space-y-2">
              <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="capitalize text-gray-700 font-medium">{view} view</span>
              {files[view] && (
                <p className="text-sm text-green-600">Selected</p>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFiles((f) => ({ ...f, [view]: file }));
              }}
            />
          </label>
        ))}
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <button
        disabled={Object.keys(files).length < 4 || loading}
        onClick={submit}
        className="w-full bg-black text-white py-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Building your 3D avatar... (~1-2 min)
          </span>
        ) : (
          "Generate My Avatar"
        )}
      </button>
    </div>
  );
}
