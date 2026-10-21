import * as signalR from "@microsoft/signalr";
import { api } from "./api";
import { logger } from "./logger";

export type SignalREventCallback = (data: any) => void;
export type SignalRStatus = "Connecting" | "Connected" | "Reconnecting" | "Disconnected";

class SignalRManager {
  private connection: signalR.HubConnection | null = null;
  private listeners: Map<string, Set<SignalREventCallback>> = new Map();
  private statusListeners: Set<(status: SignalRStatus) => void> = new Set();
  private connectPromise: Promise<signalR.HubConnection | null> | null = null;
  private activeCompanyId: string | null = null;
  private cachedHubUrl: string | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  public status: SignalRStatus = "Disconnected";

  constructor() {
    if (typeof window !== "undefined") {
      try {
        if ("BroadcastChannel" in window) {
          this.broadcastChannel = new BroadcastChannel("mti_realtime_bus");
          this.broadcastChannel.onmessage = (event) => {
            if (event.data && event.data.eventName) {
              this.notify(event.data.eventName, event.data.data, false);
            }
          };
        }
      } catch (e) {
        // Fallback gracefully
      }
    }
  }

  private setStatus(newStatus: SignalRStatus) {
    if (this.status === newStatus) return;
    this.status = newStatus;
    logger.signalr(`Status changed: [${newStatus}]`);
    this.statusListeners.forEach((cb) => {
      try {
        cb(newStatus);
      } catch (err) {
        logger.signalrError("Error in status callback", err);
      }
    });
  }

  onStatusChange(callback: (status: SignalRStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  async init(companyId?: string): Promise<signalR.HubConnection | null> {
    if (typeof window === "undefined") return null;

    // 1. If connection already active (Connected, Connecting, or Reconnecting), keep it!
    // Never restart or reconnect when moving between pages in Next.js!
    if (this.connection) {
      const state = this.connection.state;
      if (
        state === signalR.HubConnectionState.Connected ||
        state === signalR.HubConnectionState.Connecting ||
        state === signalR.HubConnectionState.Reconnecting
      ) {
        if (companyId && companyId !== this.activeCompanyId) {
          if (state === signalR.HubConnectionState.Connected) {
            await this.switchCompany(companyId);
          }
        }
        return this.connection;
      }
    }

    // 2. If a connection attempt is already in flight, reuse the promise
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.setStatus("Connecting");

    this.connectPromise = (async () => {
      try {
        const token = localStorage.getItem("mti_access_token");

        // Fast URL resolution: Use cached or sessionStorage if available to avoid waiting for network roundtrip
        if (!this.cachedHubUrl) {
          const stored = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("mti_signalr_hub_url") : null;
          if (stored) {
            this.cachedHubUrl = stored;
          } else {
            logger.signalr("Fetching realtime hub configuration from API...");
            try {
              const config = await api.getRealtimeConfig();
              if (config?.fullUrl) {
                this.cachedHubUrl = config.fullUrl;
                if (typeof sessionStorage !== "undefined") {
                  sessionStorage.setItem("mti_signalr_hub_url", config.fullUrl);
                }
              }
            } catch (e) {
              logger.signalrWarn("Could not fetch realtime config, falling back to default hub url");
            }
          }
        }

        let hubUrl = this.cachedHubUrl || `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://companygroup.runasp.net"}/hubs/cms`;

        if (companyId) {
          const separator = hubUrl.includes("?") ? "&" : "?";
          hubUrl += `${separator}companyId=${companyId}`;
          this.activeCompanyId = companyId;
        }

        logger.signalr(`Initiating connection to hub: ${hubUrl}`);

        // Dispose previous broken/disconnected connection if exists
        if (this.connection && this.connection.state === signalR.HubConnectionState.Disconnected) {
          try {
            await this.connection.stop();
          } catch {}
          this.connection = null;
        }

        this.connection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => token || "",
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
          })
          .withAutomaticReconnect([0, 1000, 3000, 5000, 10000, 20000])
          .configureLogging(signalR.LogLevel.Warning)
          .build();

        // Generous timeouts to prevent free-tier reverse proxy from severing connection
        this.connection.serverTimeoutInMilliseconds = 120000;
        this.connection.keepAliveIntervalInMilliseconds = 15000;

        // Lifecycle Handlers
        this.connection.onreconnecting((error) => {
          logger.signalrWarn("Connection lost. Reconnecting automatically in background...", error?.message);
          this.setStatus("Reconnecting");
        });

        this.connection.onreconnected((connectionId) => {
          logger.signalr(`Reconnected successfully! New Connection ID: ${connectionId}`);
          this.setStatus("Connected");
          if (this.activeCompanyId) {
            logger.signalr(`Re-joining company group: company:${this.activeCompanyId}`);
            this.connection?.invoke("JoinCompanyGroup", this.activeCompanyId).catch((e) => {
              logger.signalrError("Failed to re-join company group", e);
            });
          }
          this.notify("Reconnected", { connectionId });
        });

        this.connection.onclose((error) => {
          logger.signalrError("Connection closed", error?.message);
          this.setStatus("Disconnected");
        });

        // Register all real-time events
        const events = [
          "CompanyCreated",
          "CompanyUpdated",
          "CompanyDeleted",
          "ProjectCreated",
          "ProjectUpdated",
          "ProjectDeleted",
          "ServiceCreated",
          "ServiceUpdated",
          "ServiceDeleted",
          "PageCreated",
          "PageUpdated",
          "PageDeleted",
          "PageSectionUpdated",
          "NavigationUpdated",
          "SettingsUpdated",
          "NotificationCreated",
        ];

        events.forEach((eventName) => {
          this.connection?.on(eventName, (data) => {
            logger.signalrEvent(eventName, data);
            this.notify(eventName, data);
          });
        });

        await this.connection.start();
        this.setStatus("Connected");
        logger.signalr(`Connected successfully to ${hubUrl} (Connection ID: ${this.connection.connectionId})`);
        return this.connection;
      } catch (err: any) {
        this.setStatus("Disconnected");
        logger.signalrError("Connection attempt failed", err?.message || err);
        return null;
      } finally {
        this.connectPromise = null;
      }
    })();

    return this.connectPromise;
  }

  async switchCompany(newCompanyId: string) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      if (this.activeCompanyId) {
        logger.signalr(`Leaving company group: company:${this.activeCompanyId}`);
        await this.connection.invoke("LeaveCompanyGroup", this.activeCompanyId).catch(() => {});
      }
      logger.signalr(`Joining company group: company:${newCompanyId}`);
      await this.connection.invoke("JoinCompanyGroup", newCompanyId).catch(() => {});
      this.activeCompanyId = newCompanyId;
    }
  }

  subscribe(event: string, callback: SignalREventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  public notify(event: string, data: any = {}, broadcastToOtherTabs = true) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          logger.signalrError(`Error in SignalR listener for ${event}:`, e);
        }
      });
    }

    if (broadcastToOtherTabs && typeof window !== "undefined") {
      try {
        if (this.broadcastChannel) {
          this.broadcastChannel.postMessage({ eventName: event, data });
        }
        window.dispatchEvent(new CustomEvent("mti_realtime_event", { detail: { event, data } }));
      } catch (e) {
        // Ignore broadcast issues in unsupported environments
      }
    }
  }

  async stop() {
    if (this.connection) {
      logger.signalr("Stopping SignalR connection...");
      await this.connection.stop();
      this.connection = null;
      this.setStatus("Disconnected");
    }
  }
}

export const signalRClient = new SignalRManager();
export default signalRClient;
