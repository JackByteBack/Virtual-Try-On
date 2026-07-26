"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";

interface ScrapedProduct {
  name: string;
  brand: string;
  price: number;
  images: string[];
  description: string;
  category: string;
  url: string;
}

const CATEGORIES = ["T-Shirts", "Shirts", "Jackets", "Pants", "Dresses", "Accessories"];

export default function ImportProductPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scraped, setScraped] = useState<ScrapedProduct | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("T-Shirts");
  const [images, setImages] = useState<string[]>([]);

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setScraping(true);
    setError(null);
    setScraped(null);
    setSuccess(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await fetch(`${apiUrl}/api/scrape/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to scrape URL");
      }

      const data: ScrapedProduct = await res.json();
      setScraped(data);
      setName(data.name);
      setBrand(data.brand);
      setPrice(data.price.toString());
      setDescription(data.description);
      setCategory(data.category);
      setImages(data.images);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScraping(false);
    }
  }

  async function handleImport() {
    setImporting(true);
    setError(null);

    try {
      const { data, error } = await insforge.database
        .from("products")
        .insert([{
          name,
          brand,
          price: parseFloat(price) || 0,
          images,
          description,
          category,
        }])
        .select()
        .single();

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push("/products"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to import products</p>
          <Link href="/login" className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Import Product from URL</h1>

      {/* Step 1: Enter URL */}
      <form onSubmit={handleScrape} className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste any e-commerce product link
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="https://www.example.com/product/..."
          />
          <button
            type="submit"
            disabled={scraping}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            {scraping ? "Fetching..." : "Fetch Details"}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Works with Amazon, Nike, Zara, ASOS, H&M, and most e-commerce sites
        </p>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Step 2: Edit & Import */}
      {scraped && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
          <p className="text-sm text-gray-500 mb-4">Edit the details below, then import</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Product ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleImport}
              disabled={importing || success}
              className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              {success ? "Imported!" : importing ? "Importing..." : "Import to Store"}
            </button>
            <button
              onClick={() => { setScraped(null); setUrl(""); setError(null); }}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
