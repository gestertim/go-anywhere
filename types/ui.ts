export const workspaceViews = ["timeline", "map", "bookings", "notes"] as const;
export type WorkspaceView = (typeof workspaceViews)[number];

export type WorkspaceState = {
  tripId: string;
  activeDate: string | null;
  view: WorkspaceView;
  selectedItemId: string | null;
};
