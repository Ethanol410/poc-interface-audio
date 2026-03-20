// Navigation and route types
export type RouteType = '/setup' | '/' | '/workspace' | '/suspects' | '/debrief';

export interface NavigationState {
  currentRoute: RouteType;
  canNavigate: boolean;
  progress: number;
}
