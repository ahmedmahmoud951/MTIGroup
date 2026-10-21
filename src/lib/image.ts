/**
 * Resolves any image URL (local static asset, backend upload, base64, blob, or absolute external URL)
 * into a fully accessible and renderable image URL.
 */
export function getImageUrl(url?: string | null): string {
  if (!url || !url.trim()) {
    return "/images/companies/default-logo.svg";
  }

  const trimmed = url.trim();

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
