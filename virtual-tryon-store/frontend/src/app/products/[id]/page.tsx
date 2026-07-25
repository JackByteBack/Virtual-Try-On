"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Viewer3D from "@/components/Viewer3D";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { user, token } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [combinedModelUrl, setCombinedModelUrl] = useState<string | null>(null);
  const [fitting, setFitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
  }, [params.id]);

  async function loadProduct(id: string) {
    try {
      const data = await api.products.get(id);
      setProduct(data);
    } catch (err) {
      console.error("Failed to load product:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTryOn() {
    if (!token) {
      router.push("/login");
      return;
    }

    const avatarUrl = localStorage.getItem("avatarUrl");
    if (!avatarUrl) {
      router.push("/tryon");
      return;
    }

    if (!product?.garmentModelUrl) {
      alert("3D garment model not available for this product");
      return;
    }

    setFitting(true);
    try {
      const data = await api.tryon.fitGarment(avatarUrl, product.garmentModelUrl, token);
      setCombinedModelUrl(data.combinedModelUrl);
    } catch (err) {
      console.error("Garment fitting failed:", err);
      alert("Failed to fit garment. Please try again.");
    } finally {
      setFitting(false);
    }
  }

  function handleAddToCart() {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      qty: 1,
      image: product.images?.[0],
    });
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500 text-lg">Product not found</p>
        <Link href="/products" className="text-black underline mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {combinedModelUrl ? (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Virtual Try-On</h2>
            <button
              onClick={() => setCombinedModelUrl(null)}
              className="text-gray-600 hover:text-gray-900"
            >
              Back to product
            </button>
          </div>
          <Viewer3D modelUrl={combinedModelUrl} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-lg"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-3xl font-semibold text-gray-900 mb-6">${product.price}</p>

            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Add to Cart
              </button>

              <button
                onClick={handleTryOn}
                disabled={fitting || !product.garmentModelUrl}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {fitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Fitting garment...
                  </span>
                ) : (
                  "Try On in 3D"
                )}
              </button>
            </div>

            {!product.garmentModelUrl && (
              <p className="text-sm text-gray-500">3D try-on not available for this product</p>
            )}

            {product.category && (
              <p className="text-sm text-gray-500 mt-4">Category: {product.category}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
