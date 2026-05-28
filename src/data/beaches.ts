export type Beach = {
  slug: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  // NDBC realtime2 station for air/water temp. Many LA beaches don't have
  // their own station, so we share the nearest Santa Monica Bay station.
  ndbcStation: string;
};

export const BEACHES: Beach[] = [
  {
    slug: "santa-monica",
    name: "Santa Monica Pier",
    location: "Santa Monica, CA",
    lat: 34.008,
    lon: -118.499,
    ndbcStation: "ICAC1",
  },
  {
    slug: "venice",
    name: "Venice Beach",
    location: "Venice, CA",
    lat: 33.985,
    lon: -118.473,
    ndbcStation: "ICAC1",
  },
  {
    slug: "malibu-surfrider",
    name: "Malibu Surfrider",
    location: "Malibu, CA",
    lat: 34.034,
    lon: -118.679,
    ndbcStation: "ICAC1",
  },
  {
    slug: "manhattan-beach",
    name: "Manhattan Beach",
    location: "Manhattan Beach, CA",
    lat: 33.884,
    lon: -118.411,
    ndbcStation: "ICAC1",
  },
  {
    slug: "hermosa-beach",
    name: "Hermosa Beach",
    location: "Hermosa Beach, CA",
    lat: 33.862,
    lon: -118.401,
    ndbcStation: "ICAC1",
  },
  {
    slug: "redondo-beach",
    name: "Redondo Beach",
    location: "Redondo Beach, CA",
    lat: 33.842,
    lon: -118.391,
    ndbcStation: "ICAC1",
  },
];

export function getBeachBySlug(slug: string): Beach | undefined {
  return BEACHES.find((b) => b.slug === slug);
}
