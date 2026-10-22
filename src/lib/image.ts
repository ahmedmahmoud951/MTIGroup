/**
 * Resolves any image URL (local static asset, backend upload, base64, blob, or absolute external URL)
 * into a fully accessible and renderable image URL.
 */
export function getImageUrl(url?: string | null): string {
  if (!url || !url.trim()) {
    return "/images/companies/default-logo.svg";
  }

  const trimmed = url.trim();

  // Instant local WebP resolution for high-res corporate logos
  if (trimmed.includes("9ffc1447745b422185a27b7b7cbd6534") || trimmed.includes("ecee")) {
    return "/images/companies/ecee.webp";
  }
  if (
    trimmed.includes("82592440bc5245d3aa87c033bac6c324") ||
    trimmed.includes("ca99c8db560047d5b103864d0637df9b") ||
    trimmed.includes("redline") ||
    trimmed.includes("red-line")
  ) {
    return "/images/companies/redline.webp";
  }
  if (trimmed.includes("mti-holding") || trimmed.includes("holding")) {
    return "/images/companies/mti-holding.webp";
  }
  if (trimmed.includes("mti-eng") || trimmed.includes("contracting")) {
    return "/images/companies/mti-eng.webp";
  }
  if (trimmed.includes("royal")) {
    return "/images/companies/royal.webp";
  }

  // 1. Data URLs, Blob URLs, or full HTTP/HTTPS URLs
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // 2. Uploaded media stored on ASP.NET backend (/uploads/... or uploads/...)
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://companygroup.runasp.net").replace(/\/$/, "");
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${apiBase}${cleanPath}`;
  }

  // 3. Local Next.js public assets - ensure leading slash
  if (!trimmed.startsWith("/")) {
    return `/${trimmed}`;
  }

  return trimmed;
}
