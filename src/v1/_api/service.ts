export const METHODS = ["http", "ping", "dns"] as const;
export type Method = typeof METHODS[number];

export const KINDS = ["informational", "partial", "critical"] as const;
export type Kind = typeof KINDS[number];

export class Event {
  id: number;

  ts: Date;

  type: Kind;

  description: string;
}

/**
 * One day of uptime.
 */
export class Uptime {
  events: Event[];
}

class Service {
  id: number;

  // TODO @Length
  name: string;

  description: string | null;

  /**
   * 30-items array of {@link API.Service.Uptime} items, one for
   * every past 30 days, the first item being the most recent.
   */
  uptime: Uptime[];
}

export class Public extends Service {}

export type Any = Public;
