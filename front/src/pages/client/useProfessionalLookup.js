import { useEffect, useMemo, useState } from 'react';
import { catalogService } from '../../services/clientApi';

export default function useProfessionalLookup() {
  const [map, setMap] = useState({});

  useEffect(() => {
    let active = true;
    catalogService.listProfessionals().then((items) => {
      if (active) setMap(Object.fromEntries(items.map((professional) => [professional.id, professional])));
    });
    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => map, [map]);
}
