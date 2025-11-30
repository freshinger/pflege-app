import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users/user.entity';
import { Patient, Gender } from './patients/patient.entity';
import { Todo, TodoCategory, TodoPriority } from './todos/todo.entity';
import { config } from 'dotenv';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'pflege_app',
  entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: false,
});

// German first and last names for realistic data
const firstNames = {
  male: ['Hans', 'Peter', 'Klaus', 'Wolfgang', 'Michael', 'Thomas', 'Andreas', 'Stefan', 'Martin', 'Jürgen'],
  female: ['Maria', 'Anna', 'Petra', 'Sabine', 'Monika', 'Susanne', 'Andrea', 'Birgit', 'Christina', 'Nicole'],
};

const lastNames = [
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
  'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann',
];

// Medical diagnoses
const diagnoses = [
  'Diabetes mellitus Typ 2',
  'Hypertonie',
  'Chronische Herzinsuffizienz',
  'COPD',
  'Demenzerkrankung',
  'Schlaganfall',
  'Parkinson-Krankheit',
  'Osteoporose',
  'Rheumatoide Arthritis',
  'Chronische Niereninsuffizienz',
  'Herzrhythmusstörungen',
  'Asthma bronchiale',
  'Depression',
  'Osteoarthritis',
  'Periphere arterielle Verschlusskrankheit',
];

// Allergies
const allergies = [
  'Penicillin',
  'Latex',
  'Iod',
  'Nüsse',
  'Milch',
  'Eier',
  'Soja',
  'Fisch',
  'Schalentiere',
  'Aspirin',
  'Codein',
  'Morphin',
];

// Todo titles by category
const todoTitles = {
  Beatmung: [
    'Beatmungsgerät überprüfen',
    'Sauerstoffsättigung messen',
    'Tracheostoma pflegen',
    'Beatmungsparameter anpassen',
    'Sekret absaugen',
  ],
  Ernährung: [
    'Sondenernährung verabreichen',
    'Trinkprotokoll führen',
    'Gewicht kontrollieren',
    'Nahrungsaufnahme dokumentieren',
    'Flüssigkeitsbilanz prüfen',
  ],
  Bewegung: [
    'Mobilisation durchführen',
    'Lagerung wechseln',
    'Physiotherapie begleiten',
    'Bewegungsübungen anleiten',
    'Dekubitusprophylaxe',
  ],
  Ausscheidung: [
    'Blasenkatheter wechseln',
    'Stuhlgang dokumentieren',
    'Harnkatheter pflegen',
    'Inkontinenzversorgung',
    'Darmspülung durchführen',
  ],
};

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Database connected');

    const userRepository = dataSource.getRepository(User);
    const patientRepository = dataSource.getRepository(Patient);
    const todoRepository = dataSource.getRepository(Todo);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    // Delete in correct order due to foreign key constraints
    // First delete todos (they reference patients and users)
    const todoCount = await todoRepository.count();
    if (todoCount > 0) {
      await todoRepository
        .createQueryBuilder()
        .delete()
        .execute();
    }
    // Then delete patients (they might be referenced by todos, but we already deleted todos)
    const patientCount = await patientRepository.count();
    if (patientCount > 0) {
      await patientRepository
        .createQueryBuilder()
        .delete()
        .execute();
    }
    // Finally delete users
    const userCount = await userRepository.count();
    if (userCount > 0) {
      await userRepository
        .createQueryBuilder()
        .delete()
        .execute();
    }
    console.log('Existing data cleared');

    // Create users (nurses)
    console.log('Creating users...');
    const users: User[] = [];
    const userData = [
      { firstName: 'Anna', lastName: 'Schmidt', email: 'anna.schmidt@pflege.de' },
      { firstName: 'Michael', lastName: 'Müller', email: 'michael.mueller@pflege.de' },
      { firstName: 'Petra', lastName: 'Weber', email: 'petra.weber@pflege.de' },
      { firstName: 'Thomas', lastName: 'Fischer', email: 'thomas.fischer@pflege.de' },
      { firstName: 'Sabine', lastName: 'Koch', email: 'sabine.koch@pflege.de' },
    ];

    for (const userInfo of userData) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = userRepository.create({
        ...userInfo,
        password: hashedPassword,
        role: 'nurse',
      });
      const savedUser = await userRepository.save(user);
      users.push(savedUser);
      console.log(`Created user: ${userInfo.firstName} ${userInfo.lastName}`);
    }

    // Create patients
    console.log('Creating patients...');
    const patients: Patient[] = [];
    const roomNumbers = ['101', '102', '103', '104', '105', '201', '202', '203', '204', '205', '301', '302', '303', '304', '305'];

    for (let i = 0; i < 20; i++) {
      const gender = i % 3 === 0 ? Gender.MALE : i % 3 === 1 ? Gender.FEMALE : Gender.OTHER;
      const genderKey = gender === Gender.MALE ? 'male' : gender === Gender.FEMALE ? 'female' : 'male';
      const firstName = firstNames[genderKey][Math.floor(Math.random() * firstNames[genderKey].length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      // Random date of birth between 50 and 95 years ago
      const birthYear = new Date().getFullYear() - 50 - Math.floor(Math.random() * 45);
      const birthMonth = Math.floor(Math.random() * 12);
      const birthDay = Math.floor(Math.random() * 28) + 1;
      const dateOfBirth = new Date(birthYear, birthMonth, birthDay);

      // Random weight between 50 and 120 kg
      const weight = Math.round((50 + Math.random() * 70) * 100) / 100;

      // Random diagnoses (1-3 diagnoses, one main)
      const numDiagnoses = Math.floor(Math.random() * 3) + 1;
      const selectedDiagnoses = [...diagnoses].sort(() => 0.5 - Math.random()).slice(0, numDiagnoses);
      const patientDiagnoses = selectedDiagnoses.map((diag, index) => ({
        text: diag,
        isMain: index === 0,
      }));

      // Random allergies (0-3 allergies)
      const numAllergies = Math.floor(Math.random() * 4);
      const patientAllergies = [...allergies].sort(() => 0.5 - Math.random()).slice(0, numAllergies);

      // Random room number
      const roomNumber = roomNumbers[Math.floor(Math.random() * roomNumbers.length)];

      // Random notes (sometimes)
      const notes = Math.random() > 0.7 ? `Patient benötigt besondere Aufmerksamkeit. Letzte Kontrolle: ${new Date().toLocaleDateString('de-DE')}` : null;

      const patient = patientRepository.create({
        firstName,
        lastName,
        dateOfBirth,
        weight,
        gender,
        diagnoses: patientDiagnoses,
        allergies: patientAllergies,
        roomNumber,
        notes,
      });

      const savedPatient = await patientRepository.save(patient);
      patients.push(savedPatient);
      console.log(`Created patient: ${firstName} ${lastName} (Room ${roomNumber})`);
    }

    // Create todos
    console.log('Creating todos...');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let i = 0; i < 50; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const user = users[Math.floor(Math.random() * users.length)];

      // Random category
      const categories = Object.values(TodoCategory);
      const category = categories[Math.floor(Math.random() * categories.length)];

      // Random title from category-specific titles
      const categoryTitles = todoTitles[category];
      const title = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];

      // Random description (sometimes)
      const description = Math.random() > 0.5 ? `Wichtige Hinweise für ${title.toLowerCase()}. Bitte sorgfältig durchführen.` : null;

      // Random priority
      const priorities = Object.values(TodoPriority);
      const priority = priorities[Math.floor(Math.random() * priorities.length)];

      // Random due date: some today, some overdue, some upcoming
      let dueDate: Date;
      const dateType = Math.random();
      if (dateType < 0.3) {
        // Overdue (1-5 days ago)
        const daysAgo = Math.floor(Math.random() * 5) + 1;
        dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() - daysAgo);
        dueDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
      } else if (dateType < 0.6) {
        // Today (various times)
        dueDate = new Date(today);
        dueDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
        // Some might be overdue if time has passed
        if (dueDate < now) {
          // Make it slightly overdue
          dueDate.setHours(now.getHours() - 1, now.getMinutes(), 0, 0);
        }
      } else {
        // Upcoming (1-7 days from now)
        const daysAhead = Math.floor(Math.random() * 7) + 1;
        dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + daysAhead);
        dueDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
      }

      // Some todos are completed
      const completed = Math.random() > 0.7;
      const completedAt = completed ? new Date(dueDate.getTime() + Math.random() * 3600000) : null;

      const todo = todoRepository.create({
        title,
        description,
        category,
        priority,
        dueDate,
        completed,
        completedAt,
        patientId: patient.id,
        assignedToId: user.id,
        notificationSent: false,
      });

      await todoRepository.save(todo);
      console.log(`Created todo: ${title} for ${patient.firstName} ${patient.lastName}`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${patients.length} patients`);
    console.log(`Created 50 todos`);

    await dataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

