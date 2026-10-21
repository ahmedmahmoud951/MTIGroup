import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "holding-settings.json");
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://companygroup.runasp.net";

function getLocalSettings(): Record<string, string> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading holding-settings.json", e);
  }
  return {};
}

function saveLocalSettings(settings: Record<string, string>) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing holding-settings.json", e);
  }
}

export async function GET(req: NextRequest) {
  const settings = getLocalSettings();
  return NextResponse.json({
    success: true,
    data: settings
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = getLocalSettings();
    const updated = { ...current, ...body };
    saveLocalSettings(updated);

    // If an authorization token was forwarded from admin, sync to remote API in the background
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      try {
        const syncPromises = Object.entries(body).map(([key, val]) => {
          let settingKey = key;
          let languageCode: string | undefined = undefined;

          if (key.endsWith("_ar")) {
            settingKey = key.slice(0, -3);
            languageCode = "ar";
          } else if (key.endsWith("_en")) {
            settingKey = key.slice(0, -3);
            languageCode = "en";
          }

          return fetch(`${API_BASE_URL}/api/v1/admin/settings/site`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": authHeader,
            },
            body: JSON.stringify({
              settingKey,
              settingValue: String(val ?? ""),
              languageCode,
            }),
          }).catch((err) => console.warn(`Failed remote sync for key ${key}:`, err));
        });

        // Await without failing if remote has an issue
        await Promise.allSettled(syncPromises);
      } catch (e) {
        console.warn("Sync to remote site settings encountered an error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Holding and homepage settings updated successfully.",
      data: updated
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
