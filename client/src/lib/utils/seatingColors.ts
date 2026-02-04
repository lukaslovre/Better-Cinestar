export function getSeatColor(
  seat: any,
  seatingAreas: Array<{ id: number; name: string }>,
  useColors: boolean = true
) {
  const FREE_STATS = [4, 256, 260, 128]; // seat.stat that represent a free seat

  const REGULAR_COLOR = '#80A6FF';
  const OCCUPIED_COLOR = '#373B43';
  const INVALID_COLOR = '#A1DF9F';
  const VIP_COLOR = '#DFDF9F';
  const ROYAL_BED_COLOR = '#EA80FF';
  const LOVE_COLOR = '#FF8080';
  // When Cinestar returns a seating area name we don't know about,
  // keep it visible & distinct from Regular.
  const UNKNOWN_SEAT_TYPE_COLOR = '#9AA8C6';

  const seatStat = Number(seat?.stat);
  const seatSg = Number(seat?.sg);
  const seatSar = seat?.sar;

  // Ako je slobodno (128 je u splitu slobodno??? nez)
  if (FREE_STATS.includes(seatStat)) {
    // Ako se ne koriste boje, sve su plave
    if (useColors === false) return { color: REGULAR_COLOR, invalidskoFound: false };

    // Ako je invalidsko (magic numbers)
    // Keep this independent of seating area names.
    if ([163, 193].includes(seatSg)) {
      return { color: INVALID_COLOR, invalidskoFound: true };
    }

    // Ako se koriste boje, onda se gleda tip sjedala
    const rawName = seatingAreas.find((area) => area.id === seatSar)?.name;
    const name = typeof rawName === 'string' ? rawName.trim() : '';
    const nameLower = name.toLowerCase();

    if (!name) return { color: UNKNOWN_SEAT_TYPE_COLOR, invalidskoFound: false };

    // VIP / Boutique / Relax / Premium
    if (
      nameLower.includes('vip') ||
      nameLower.includes('boutique') ||
      nameLower.includes('relax') ||
      nameLower.includes('premium')
    ) {
      return { color: VIP_COLOR, invalidskoFound: false };
    }

    // Royal bed
    if (nameLower === 'royal bed' || nameLower.includes('bed')) {
      return { color: ROYAL_BED_COLOR, invalidskoFound: false };
    }

    // Lovebox / Love seats
    if (nameLower === 'lovebox' || nameLower.includes('love')) {
      return { color: LOVE_COLOR, invalidskoFound: false };
    }

    // Regular
    if (nameLower === 'regular') {
      return { color: REGULAR_COLOR, invalidskoFound: false };
    }

    // Unknown seating area name (but seat is free).
    return { color: UNKNOWN_SEAT_TYPE_COLOR, invalidskoFound: false };
  } else {
    // Ako je zauzeto
    return { color: OCCUPIED_COLOR, invalidskoFound: false };
  }
}
