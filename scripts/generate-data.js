import { faker } from '@faker-js/faker';
import fs from 'fs';

const generateUsers = (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = {
      id: i + 1,
      name: faker.person.fullName(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      address: {
        street: faker.location.streetAddress(),
        suite: faker.location.secondaryAddress(),
        city: faker.location.city(),
        zipcode: faker.location.zipCode(),
        geo: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude(),
        },
      },
      phone: faker.phone.number(),
      website: faker.internet.domainName(),
      company: {
        name: faker.company.name(),
        catchPhrase: faker.company.catchPhrase(),
        bs: faker.company.buzzPhrase(),
      },
    };
    users.push(user);
  }
  return users;
};

const users = generateUsers(10000);

fs.writeFileSync('db.json', JSON.stringify({ users }, null, 2));

console.log('Successfully generated 10000 users and saved to db.json');
