export type Contact = {
  id: number;
  name: string;
  farm: string;
  city: string;
};

const firstNames = [
  'João',
  'Maria',
  'Carlos',
  'Ana',
  'José',
  'Fernanda',
  'Lucas',
  'Juliana',
  'Pedro',
  'Camila',
];

const lastNames = [
  'Silva',
  'Santos',
  'Oliveira',
  'Souza',
  'Costa',
  'Pereira',
  'Almeida',
  'Ferreira',
  'Rodrigues',
  'Gomes',
];

const farms = [
  'Fazenda Santa Clara',
  'Fazenda Boa Vista',
  'Sítio São José',
  'Fazenda Esperança',
  'Sítio Primavera',
  'Fazenda Horizonte',
];

const cities = [
  'Campinas',
  'Valinhos',
  'Vinhedo',
  'Indaiatuba',
  'Jundiaí',
  'Itatiba',
];

export const contacts: Contact[] = Array.from(
  { length: 5248 },
  (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName =
      lastNames[Math.floor(index / firstNames.length) % lastNames.length];

    return {
      id: index + 1,
      name: `${firstName} ${lastName}`,
      farm: farms[index % farms.length],
      city: cities[index % cities.length],
    };
  }
);