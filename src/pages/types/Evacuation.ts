export interface EvacuationSite {
  id: number;
  localGovernmentCode: string;
  facilityName: string;
  address: string;
  latitude: number;
  longitude: number;
  flood: boolean | null;
  landslide: boolean | null;
  stormSurge: boolean | null;
  earthquake: boolean | null;
  tsunami: boolean | null;
  largeFire: boolean | null;
  inlandFlooding: boolean | null;
  volcanicPhenomenon: boolean | null;
  elevatorOrGroundFloor: boolean | null;
  slope: boolean | null;
  tactilePaving: boolean | null;
  accessibleToilet: boolean | null;
}
