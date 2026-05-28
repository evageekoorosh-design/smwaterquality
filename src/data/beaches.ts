export type Beach = {
  slug: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  // Primary NDBC realtime2 station for air/water temp.
  ndbcStation: string;
  // Stations to try in order if the primary returns no usable readings.
  fallbackStations?: string[];
};

export const BEACHES: Beach[] = [
  {
    slug: "santa-monica",
    name: "Santa Monica Pier",
    location: "Santa Monica, CA",
    lat: 34.008,
    lon: -118.499,
    ndbcStation: "ICAC1",
    fallbackStations: ["SMOC1"],
  },
  {
    slug: "venice",
    name: "Venice Beach",
    location: "Venice, CA",
    lat: 33.985,
    lon: -118.473,
    ndbcStation: "ICAC1",
    fallbackStations: ["SMOC1"],
  },
  {
    slug: "malibu-surfrider",
    name: "Malibu Surfrider",
    location: "Malibu, CA",
    lat: 34.034,
    lon: -118.679,
    ndbcStation: "SMOC1",
    fallbackStations: ["ICAC1"],
  },
  {
    slug: "manhattan-beach",
    name: "El Porto, Manhattan Beach",
    location: "Manhattan Beach, CA",
    lat: 33.884,
    lon: -118.411,
    ndbcStation: "46221",
    fallbackStations: ["ICAC1"],
  },
  {
    slug: "hermosa-beach",
    name: "Hermosa Beach",
    location: "Hermosa Beach, CA",
    lat: 33.862,
    lon: -118.401,
    ndbcStation: "46221",
    fallbackStations: ["ICAC1"],
  },
  {
    slug: "redondo-beach",
    name: "Redondo Beach",
    location: "Redondo Beach, CA",
    lat: 33.842,
    lon: -118.391,
    ndbcStation: "RDNC1",
    fallbackStations: ["46221", "ICAC1"],
  },
];

export function getBeachBySlug(slug: string): Beach | undefined {
  return BEACHES.find((b) => b.slug === slug);
}
