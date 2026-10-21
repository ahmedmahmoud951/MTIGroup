import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { level = "info", tag = "WEB", message = "", data, timestamp } = body;

    const time = timestamp || new Date().toISOString().substring(11, 23);

    // ANSI Colors for PowerShell / Windows Terminal
    const reset = "\x1b[0m";
    const bold = "\x1b[1m";
    const dim = "\x1b[90m";
    const cyan = "\x1b[36m";
    const green = "\x1b[32m";
    const yellow = "\x1b[33m";
    const red = "\x1b[31m";
    const magenta = "\x1b[35m";
    const burgundyBg = "\x1b[48;2;112;9;34m\x1b[37m"; // Burgundy background with white text

    let tagColor = cyan;
    let badge = `[${tag}]`;

    if (tag.toUpperCase() === "AUTH") {
      tagColor = magenta;
    } else if (tag.toUpperCase() === "SIGNALR") {
      tagColor = cyan;
    } else if (tag.toUpperCase() === "API") {
      tagColor = "\x1b[34m"; // Blue
    }

    let levelIndicator = "";
    switch (level) {
      case "success":
        levelIndicator = `${green}✓ SUCCESS${reset}`;
        break;
      case "warn":
        levelIndicator = `${yellow}⚠ WARN${reset}`;
        break;
      case "error":
        levelIndicator = `${red}${bold}✗ ERROR${reset}`;
        break;
      case "debug":
        levelIndicator = `${dim}⚙ DEBUG${reset}`;
        break;
      default:
        levelIndicator = `${cyan}ℹ INFO${reset}`;
    }

    const header = `${dim}${time}${reset} ${burgundyBg}[MTI-WEB]${reset} ${tagColor}${bold}${badge}${reset} ${levelIndicator} ${message}`;
    console.log(header);

    if (data !== undefined && data !== null) {
      const formatted = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
      console.log(`${dim}  └─ Detail: ${formatted}${reset}`);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
