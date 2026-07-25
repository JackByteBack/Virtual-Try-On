"use client";
import Viewer3D from "./Viewer3D";

export default function AvatarLoader({ url }: { url: string }) {
  return <Viewer3D modelUrl={url} />;
}

