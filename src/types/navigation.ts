// Navigation and route types
export type RouteType = '/' | '/workspace' | '/suspects' | '/debrief';

export interface NavigationState {
  currentRoute: RouteType;
  canNavigate: boolean;
  progress: number;
}
