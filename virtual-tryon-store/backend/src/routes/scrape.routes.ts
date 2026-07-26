import { Router } from "express";
import axios from "axios";
import sql from "../../db";

const router = Router();

interface ScrapedProduct {
  name: string;
  brand: string;
  price: number;
  images: string[];
  description: string;
  category: string;
  url: string;
}

function extractMeta(html: string, property: string): string {
  // Match both orders: property before content, or content before property
  const regex1 = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, "i");
  const regex2 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, "i");
  const regex3 = new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, "i");
  const regex4 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, "i");
  return html.match(regex1)?.[1] || html.match(regex2)?.[1] || html.match(regex3)?.[1] || html.match(regex4)?.[1] || "";
}

function extractJsonLd(html: string): any[] {
  const results: any[] = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      results.push(JSON.parse(match[1]));
    } catch {}
  }
  return results;
}

function extractImages(html: string, baseUrl: string): string[] {
  const images = new Set<string>();

  // OG image
  const ogImg = extractMeta(html, "og:image");
  if (ogImg) images.add(ogImg);

  // Twitter image
  const twImg = extractMeta(html, "twitter:image");
  if (twImg) images.add(twImg);

  // JSON-LD images
  const jsonLdItems = extractJsonLd(html);
  for (const item of jsonLdItems) {
    const img = item.image || item.thumbnailUrl;
    if (typeof img === "string") images.add(img);
    else if (Array.isArray(img)) img.forEach((i: string) => images.add(i));
  }

  // Amazon: data-old-hires attributes (high-res images)
  const oldHiresMatches = html.matchAll(/data-old-hires=["']([^"']+)["']/gi);
  for (const match of oldHiresMatches) {
    if (match[1]) images.add(match[1]);
  }

  // Amazon: data-dynamic-image attributes (JSON object of image URLs)
  const dynamicImageMatches = html.matchAll(/data-dynamic-image=["'](\{[^"']+\})["']/gi);
  for (const match of dynamicImageMatches) {
    try {
      const obj = JSON.parse(match[1]);
      Object.keys(obj).forEach((url) => images.add(url));
    } catch {}
  }

  // Generic: find high-res images from img tags
  const imgTagMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  for (const match of imgTagMatches) {
    const src = match[1];
    // Only keep m.media-amazon.com product images with _SL (size large)
    if (src && src.includes("m.media-amazon.com/images/I/") && src.includes("_SL")) {
      images.add(src);
    }
  }

  // Amazon: src in highRes images
  const highResMatches = html.matchAll(/src=["'](https?:\/\/m\.media-amazon\.com\/images\/I\/[^"']+_SL\d+[^"']*)["']/gi);
  for (const match of highResMatches) {
    images.add(match[1]);
  }

  return Array.from(images).slice(0, 8);
}

function detectCategory(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();
  if (/\b(jeans|pants|trousers|leggings|shorts|chinos)\b/.test(text)) return "Pants";
  if (/\b(t-shirt|tee|tank top|crop top)\b/.test(text)) return "T-Shirts";
  if (/\b(shirt|blouse|polo|oxford)\b/.test(text)) return "Shirts";
  if (/\b(jacket|coat|blazer|hoodie|sweater|cardigan)\b/.test(text)) return "Jackets";
  if (/\b(dress|gown|maxi|midi)\b/.test(text)) return "Dresses";
  if (/\b(sneaker|shoe|boot|sandal|slipper|loafer)\b/.test(text)) return "Accessories";
  if (/\b(bag|backpack|purse|wallet|hat|cap|scarf|belt)\b/.test(text)) return "Accessories";
  return "T-Shirts";
}

function parsePrice(text: string): number {
  // Handle ₹1,049 or ₹1049.00 or $19.99 etc
  const match = text.match(/[\$€£¥\u20B9]\s*([\d,]+(?:\.\d{1,2})?)/);
  if (match) return parseFloat(match[1].replace(/,/g, ""));
  // Fallback: any number with optional commas
  const fallback = text.match(/([\d,]+\.\d{2})/);
  if (fallback) return parseFloat(fallback[1].replace(/,/g, ""));
  return 0;
}

router.post("/scrape", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    // Extract from meta tags
    let name = extractMeta(html, "og:title") || extractMeta(html, "twitter:title");
    let description = extractMeta(html, "og:description") || extractMeta(html, "twitter:description") || extractMeta(html, "description");
    let brand = extractMeta(html, "og:site_name") || new URL(url).hostname.replace("www.", "").split(".")[0];
    const priceStr = extractMeta(html, "product:price:amount") || extractMeta(html, "og:price:amount") || "";
    const images = extractImages(html, url);

    // Fallback: extract from <title> tag
    if (!name) {
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch) {
        name = titleMatch[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\s*[-|].*$/, "").trim();
      }
    }

    // Clean up name: remove site suffixes
    if (name) {
      name = name.replace(/\s*:\s*(Amazon|Flipkart|Myntra|Ajio|Nykaa|Snapdeal).*$/i, "").trim();
    }

    // Fallback: extract description from meta description
    if (!description) {
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      if (descMatch) description = descMatch[1];
    }

    // Extract brand from name if not found
    if (brand === "amzn" && name) {
      const brandMatch = name.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+Men/i);
      if (brandMatch) brand = brandMatch[1];
    }

    // Extract price from page content if not in meta
    let finalPrice = priceStr ? parsePrice(priceStr) : 0;
    if (!finalPrice) {
      // Amazon: extract from "price":495 JSON
      const priceJsonMatch = html.match(/"price"\s*:\s*(\d+(?:\.\d+)?)/);
      if (priceJsonMatch) {
        finalPrice = parseFloat(priceJsonMatch[1]);
      }
    }
    if (!finalPrice) {
      // Amazon: extract from price-whole">351
      const priceWholeMatch = html.match(/price-whole["']>\s*(\d[\d,]*)/);
      if (priceWholeMatch) {
        finalPrice = parseFloat(priceWholeMatch[1].replace(/,/g, ""));
      }
    }
    if (!finalPrice) {
      // Look for ₹ or $ price patterns
      const pricePatterns = html.match(/(?:\u20B9|\$|€|£)\s*[\d,]+(?:\.\d{1,2})?/g);
      if (pricePatterns && pricePatterns.length > 0) {
        finalPrice = parsePrice(pricePatterns[0]);
      }
    }

    // Try JSON-LD for richer data
    const jsonLdItems = extractJsonLd(html);
    for (const item of jsonLdItems) {
      if (item["@type"] === "Product" || item["@type"] === "IndividualProduct") {
        if (item.name) name = item.name;
        if (item.description) description = item.description;
        if (item.brand?.name) brand = item.brand.name;
        if (item.offers?.price) {
          const p = parseFloat(item.offers.price);
          if (!isNaN(p)) {
            const scraped: ScrapedProduct = {
              name: name || "Untitled Product",
              brand: brand || "Unknown",
              price: p,
              images: images.length ? images : [],
              description: description || "",
              category: detectCategory(name || "", description || ""),
              url,
            };
            return res.json(scraped);
          }
        }
      }
    }

    const scraped: ScrapedProduct = {
      name: name || "Untitled Product",
      brand: brand || "Unknown",
      price: finalPrice,
      images: images.length ? images : [],
      description: description || "",
      category: detectCategory(name || "", description || ""),
      url,
    };

    res.json(scraped);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to scrape URL" });
  }
});

router.post("/import", async (req, res) => {
  try {
    const { name, brand, price, images, description, category, url } = req.body;

    const result = await sql`
      INSERT INTO products (name, brand, price, images, description, category)
      VALUES (${name}, ${brand || ""}, ${price || 0}, ${images || []}, ${description || ""}, ${category || "T-Shirts"})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
