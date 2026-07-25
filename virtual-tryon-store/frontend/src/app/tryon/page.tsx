"use client";

import { useState } from "react";
import PhotoUploader from "@/components/PhotoUploader";
import Viewer3D from "@/components/Viewer3D";

export default function TryOnPage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  function handleAvatarReady(url: string) {
    setAvatarUrl(url);
    localStorage.setItem("avatarUrl", url);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Virtual Try-On</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {avatarUrl ? "Your Avatar" : "Upload Your Photos"}
            </h2>

            {avatarUrl ? (
              <div className="space-y-4">
                <p className="text-green-600 text-sm">Avatar created successfully!</p>
                <Viewer3D modelUrl={avatarUrl} />
                <button
                  onClick={() => setAvatarUrl(null)}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Create New Avatar
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">
                  Take 4 upper-body photos from different angles. Stand in a well-lit area with a plain background for best results.
                </p>
                <PhotoUploader onAvatarReady={handleAvatarReady} />
              </div>
            )}
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-3">Tips for best results:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Stand 3-6 feet from the camera</li>
              <li>Wear fitted clothing for accurate body shape</li>
              <li>Use natural lighting or bright indoor lighting</li>
              <li>Keep arms slightly away from your body</li>
              <li>Maintain a neutral pose in all photos</li>
            </ul>
          </div>
        </div>

        <div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Upload Photos</h3>
                  <p className="text-sm text-gray-600">Provide front, back, left, and right views of your upper body</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">AI Processing</h3>
                  <p className="text-sm text-gray-600">Our AI analyzes your photos and creates a 3D avatar (~1-2 minutes)</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Try On Clothes</h3>
                  <p className="text-sm text-gray-600">Browse products and see how they look on your avatar in 3D</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
