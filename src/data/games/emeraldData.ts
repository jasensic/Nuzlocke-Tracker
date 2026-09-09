import { buildRouteData } from '../tenantHelper';
import { RouteData } from '../../types';

export const EMERALD_ROUTES: RouteData[] = [
  buildRouteData({
    id: 'em-ruta-101',
    name: 'Ruta 101',
    englishName: 'Route 101',
    category: 'Ruta',
    encounters: [
      { pokemon: 'Zigzagoon', chance: 45, levelRange: 'Nv. 2-3', method: 'Visible' },
      { pokemon: 'Wurmple', chance: 45, levelRange: 'Nv. 2-3', method: 'Visible' },
      { pokemon: 'Poochyena', chance: 10, levelRange: 'Nv. 2-3', method: 'Visible' },
    ],
  }),
  buildRouteData({
    id: 'em-ruta-103',
    name: 'Ruta 103',
    englishName: 'Route 103',
    category: 'Ruta',
    encounters: [
      { pokemon: 'Poochyena', chance: 60, levelRange: 'Nv. 2-4', method: 'Visible' },
      { pokemon: 'Wingull', chance: 30, levelRange: 'Nv. 2-4', method: 'Visible' },
      { pokemon: 'Zigzagoon', chance: 10, levelRange: 'Nv. 2-4', method: 'Visible' },
      { pokemon: 'Tentacool', chance: 60, levelRange: 'Nv. 5-10', method: 'Surfing' },
      { pokemon: 'Magikarp', chance: 40, levelRange: 'Nv. 5-10', method: 'Fishing' },
    ],
  }),
  buildRouteData({
    id: 'em-ruta-102',
    name: 'Ruta 102',
    englishName: 'Route 102',
    category: 'Ruta',
    encounters: [
      { pokemon: 'Poochyena', chance: 30, levelRange: 'Nv. 3-4', method: 'Visible' },
      { pokemon: 'Zigzagoon', chance: 30, levelRange: 'Nv. 3-4', method: 'Visible' },
      { pokemon: 'Wurmple', chance: 20, levelRange: 'Nv. 3-4', method: 'Visible' },
      { pokemon: 'Lotad', chance: 15, levelRange: 'Nv. 3-4', method: 'Visible' },
      { pokemon: 'Ralts', chance: 5, levelRange: 'Nv. 4', method: 'Visible' },
    ],
  }),
  buildRouteData({
    id: 'em-ruta-104',
    name: 'Ruta 104',
    englishName: 'Route 104',
    category: 'Ruta',
    encounters: [
      { pokemon: 'Poochyena', chance: 30, levelRange: 'Nv. 4-5', method: 'Visible' },
      { pokemon: 'Marill', chance: 30, levelRange: 'Nv. 4-5', method: 'Visible' },
      { pokemon: 'Taillow', chance: 20, levelRange: 'Nv. 4-5', method: 'Visible' },
      { pokemon: 'Wingull', chance: 20, levelRange: 'Nv. 4-5', method: 'Visible' },
    ],
  }),
  buildRouteData({
    id: 'em-bosque-petalia',
    name: 'Bosque Petalia',
    englishName: 'Petalburg Woods',
    category: 'Área Silvestre',
    encounters: [
      { pokemon: 'Wurmple', chance: 30, levelRange: 'Nv. 5-6', method: 'Visible' },
      { pokemon: 'Silcoon', chance: 15, levelRange: 'Nv. 5-6', method: 'Visible' },
      { pokemon: 'Cascoon', chance: 15, levelRange: 'Nv. 5-6', method: 'Visible' },
      { pokemon: 'Taillow', chance: 15, levelRange: 'Nv. 5-6', method: 'Visible' },
      { pokemon: 'Shroomish', chance: 15, levelRange: 'Nv. 5-6', method: 'Visible' },
      { pokemon: 'Slakoth', chance: 10, levelRange: 'Nv. 5', method: 'Visible' },
    ],
  }),
  buildRouteData({
    id: 'em-cueva-granito',
    name: 'Cueva Granito',
    englishName: 'Granite Cave',
    category: 'Cueva/Mina',
    encounters: [
      { pokemon: 'Zubat', chance: 35, levelRange: 'Nv. 9-11', method: 'Hidden' },
      { pokemon: 'Makuhita', chance: 30, levelRange: 'Nv. 9-11', method: 'Hidden' },
      { pokemon: 'Geodude', chance: 20, levelRange: 'Nv. 9-11', method: 'Hidden' },
      { pokemon: 'Aron', chance: 10, levelRange: 'Nv. 10-12', method: 'Hidden' },
      { pokemon: 'Sableye', chance: 5, levelRange: 'Nv. 10-12', method: 'Hidden' },
    ],
  }),
  buildRouteData({
    id: 'em-ruta-110',
    name: 'Ruta 110',
    englishName: 'Route 110',
    category: 'Ruta',
    encounters: [
      { pokemon: 'Electrike', chance: 30, levelRange: 'Nv. 12-14', method: 'Visible' },
      { pokemon: 'Gulpin', chance: 25, levelRange: 'Nv. 12-14', method: 'Visible' },
      { pokemon: 'Plusle', chance: 15, levelRange: 'Nv. 12-14', method: 'Visible' },
      { pokemon: 'Minun', chance: 15, levelRange: 'Nv. 12-14', method: 'Visible' },
      { pokemon: 'Wingull', chance: 15, levelRange: 'Nv. 12-14', method: 'Visible' },
    ],
  }),
  buildRouteData({
    id: 'em-senda-ignea',
    name: 'Senda Ígnea',
    englishName: 'Fiery Path',
    category: 'Cueva/Mina',
    encounters: [
      { pokemon: 'Numel', chance: 30, levelRange: 'Nv. 15-16', method: 'Hidden' },
      { pokemon: 'Machop', chance: 25, levelRange: 'Nv. 15-16', method: 'Hidden' },
      { pokemon: 'Torkoal', chance: 15, levelRange: 'Nv. 15-16', method: 'Hidden' },
      { pokemon: 'Grimer', chance: 15, levelRange: 'Nv. 15-16', method: 'Hidden' },
      { pokemon: 'Koffing', chance: 15, levelRange: 'Nv. 15-16', method: 'Hidden' },
    ],
  }),
];
