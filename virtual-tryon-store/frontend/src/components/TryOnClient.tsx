"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PhotoUploader from "@/components/PhotoUploader";
import Viewer3D from "@/components/Viewer3D";

export default function TryOnClient() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [fitting, setFitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useSearchParams();
  const garmentModelUrl = useMemo(() => params.get("garmentModelUrl"), [params]);

  async function fitGarment() {
    if (!avatarUrl || !garmentModelUrl) return;
    setFitting(true);
    setError(null);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tryon/fit-garment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl, garmentModelUrl })
    });
    const data = await res.json();
    if (!res.ok) {
      setFitting(false);
      setError(data.error ?? "Garment fitting failed");
      return;
    }
    setModelUrl(data.combinedModelUrl);
    setFitting(false);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <h1 className="text-3xl font-bold">Virtual Try-On</h1>
      {!avatarUrl && <PhotoUploader onAvatarReady={setAvatarUrl} />}

      {avatarUrl && (
        <>
          <p className="text-green-600">✓ Your 3D avatar is ready!</p>
          {garmentModelUrl ? (
            <button onClick={fitGarment} disabled={fitting} className="rounded bg-black px-4 py-2 text-white">
              {fitting ? "Fitting garment..." : "Fit Selected Garment"}
            </button>
          ) : (
            <p className="text-sm text-gray-600">Open from a product page to fit a garment model.</p>
          )}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Viewer3D modelUrl={modelUrl ?? avatarUrl} />
        </>
      )}
    </main>
  );
}

