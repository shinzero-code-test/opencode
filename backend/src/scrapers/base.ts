import puppeteer from "@cloudflare/puppeteer";
import type { Env } from "../env";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
];

export interface FetchOptions {
  referer?: string;
  proxyUrl?: string;
  headers?: Record<string, string>;
  render?: boolean;
}

export abstract class ScraperBase {
  protected env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  protected async fetchHtml(url: string, options: FetchOptions = {}): Promise<string> {
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const headers: Record<string, string> = {
      "User-Agent": userAgent,
      "Accept": "text/html,application/xhtml+xml",
      ...(options.referer ? { Referer: options.referer } : {}),
      ...options.headers
    };

    await this.randomDelay();

    const targetUrl = options.proxyUrl ? `${options.proxyUrl}${encodeURIComponent(url)}` : url;
    try {
      const response = await fetch(targetUrl, { headers });
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      if (!options.render) throw error;
      return this.fetchRenderedHtml(url, headers);
    }
  }

  protected async fetchRenderedHtml(url: string, headers: Record<string, string>): Promise<string> {
    const browser = await puppeteer.launch(this.env.BROWSER);
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(headers);
    await page.goto(url, { waitUntil: "networkidle0" });
    const content = await page.content();
    await page.close();
    await browser.close();
    return content;
  }

  protected async randomDelay(minMs = 350, maxMs = 900): Promise<void> {
    const wait = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}
