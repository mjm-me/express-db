import createDebug from 'debug';
const debug = createDebug('demo:model:animal');
debug('Loaded module');

import { z } from 'zod';

export const Animal = z.object({
  id: z.string(),
  name: z.string().nonempty(),
  englishName: z.string().nonempty(),
  sciName: z.string().nonempty(),
  group: z.string().nonempty(),
  image: z.string().url(),
  diet: z.string(),
  lifestyle: z.enum(['Diurno', 'Nocturno']),
  location: z.string(),
  slogan: z.string(),
});

// extract the inferred type
export type Animal = z.infer<typeof Animal>;
// {
//     id: string;
//     name: string;
//     englishName: string;
//     sciName: string;
//     diet: string;
//     lifestyle: string;
//     location: string;
//     slogan: string;
//     group: string;
//     image: string;
// }

export type AnimalCreateDTO = Omit<Animal, 'id'>;

export type AnimalUpdateDTO = Partial<Omit<Animal, 'id'>>;
