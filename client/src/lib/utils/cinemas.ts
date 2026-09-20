import cinemaData from '../../../../shared/cinemas.json';

export interface CinemaLocation {
  cinemaOid: string;
  cinemaName: string;
  cinemaCity: string;
}

export const cinemas: CinemaLocation[] = cinemaData;

interface CinemaCity {
  city: string;
  cinemas: CinemaLocation[];
}

function groupCinemasByCity(cinemas: CinemaLocation[]): CinemaCity[] {
  const cityGroups: CinemaCity[] = [];

  for (const cinema of cinemas) {
    let cityGroup = cityGroups.find((group) => group.city === cinema.cinemaCity);

    // The first cinema in a city creates that city's dropdown group.
    if (!cityGroup) {
      cityGroup = { city: cinema.cinemaCity, cinemas: [] };
      cityGroups.push(cityGroup);
    }

    cityGroup.cinemas.push(cinema);
  }

  return cityGroups;
}

const cityGroups = groupCinemasByCity(cinemas);
const citiesWithMultipleCinemas = cityGroups.filter((group) => group.cinemas.length > 1);
const citiesWithOneCinema = cityGroups.filter((group) => group.cinemas.length === 1);

// Put cities with a cinema submenu first. Keep the original order within each list.
export const cinemaCities: CinemaCity[] = [
  ...citiesWithMultipleCinemas,
  ...citiesWithOneCinema
];
