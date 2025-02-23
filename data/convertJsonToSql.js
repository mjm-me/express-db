import { readFileSync, createWriteStream } from 'fs';

// Lee el archivo JSON
const rawData = readFileSync('input.json', 'utf8');
let data;

try {
  data = JSON.parse(rawData);
  if (!Array.isArray(data)) {
    throw new Error('El contenido del archivo JSON no es un array.');
  }
} catch (err) {
  console.error('Error al leer o parsear el archivo JSON:', err);
  process.exit(1);
}

// Abre el archivo SQL para escribir
const output = createWriteStream('output.sql');

// Escribe el encabezado del archivo SQL
output.write('CREATE TABLE IF NOT EXISTS animals (\n');
output.write('id VARCHAR(255) PRIMARY KEY,\n');
output.write('name VARCHAR(255),\n');
output.write('englishName VARCHAR(255),\n');
output.write('sciName VARCHAR(255),\n');
output.write('diet VARCHAR(255),\n');
output.write('lifestyle VARCHAR(255),\n');
output.write('location VARCHAR(255),\n');
output.write('slogan VARCHAR(255),\n');
output.write('`group` VARCHAR(255),\n');
output.write('image VARCHAR(255)\n');
output.write(');\n\n');

// Escribe las instrucciones INSERT para cada registro en el archivo JSON
data.forEach((item) => {
  output.write(
    `INSERT INTO animals (id, name, englishName, sciName, diet, lifestyle, location, slogan, \`group\`, image) VALUES ('${item.id}', '${item.name}', '${item.englishName}', '${item.sciName}', '${item.diet}', '${item.lifestyle}', '${item.location}', '${item.slogan}', '${item.group}', '${item.image}');\n`,
  );
});

output.end();
console.log('Conversion completed.');
