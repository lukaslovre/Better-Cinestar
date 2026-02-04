export function getSeatColor(
  seat: any,
  seatingAreas: Array<{ id: number; name: string }>,
  useColors?: boolean
) {
  // Ako je slobodno (128 je u splitu slobodno??? nez)
  if ([4, 256, 260, 128].includes(seat.stat)) {
    // Ako se ne koriste boje, sve su plave
    if (useColors === false || useColors === undefined)
      return { color: '#80A6FF', invalidskoFound: false };

    // Ako se koriste boje, onda se gleda tip sjedala
    const name = seatingAreas.find((area) => area.id === seat.sar)?.name;
    if (!name) return { color: '#80A6FF', invalidskoFound: false };

    if (['Boutique', 'VIP Relax', 'VIP', 'VIP Premium'].includes(name))
      return { color: '#DFDF9F', invalidskoFound: false };
    else if (name === 'Royal bed') return { color: '#EA80FF', invalidskoFound: false };
    else if (name === 'Lovebox') return { color: '#FF8080', invalidskoFound: false };
    else if (name === 'Regular') {
      // Ako je invalidsko
      if ([163, 193].includes(seat.sg)) {
        return { color: '#A1DF9F', invalidskoFound: true };
      } else return { color: '#80A6FF', invalidskoFound: false };
    }
  } else {
    // Ako je zauzeto
    return { color: '#373B43', invalidskoFound: false };
  }

  // Fallback
  return { color: '#80A6FF', invalidskoFound: false };
}
