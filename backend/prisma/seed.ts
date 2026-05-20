import { PrismaClient, CompensationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create professor user
  const profPassword = await bcrypt.hash('password123', 12);
  const profUser = await prisma.user.upsert({
    where: { email: 'prof.smith@university.edu' },
    update: {},
    create: {
      email: 'prof.smith@university.edu',
      password: profPassword,
      role: 'PROFESSOR',
      emailVerified: true,
      professorProfile: {
        create: {
          firstName: 'Dr. Sarah',
          lastName: 'Smith',
          title: 'Associate Professor',
          department: 'Computer Science',
          university: 'MIT',
          researchAreas: ['Machine Learning', 'Natural Language Processing', 'Computer Vision'],
          labName: 'Intelligent Systems Lab',
          labWebsite: 'https://isl.mit.edu',
          bio: 'Dr. Smith leads the Intelligent Systems Lab at MIT, focusing on developing AI systems that can understand and generate human language. Her work has been published in top venues including NeurIPS, ICML, and ACL.',
          acceptingStudents: true,
        },
      },
    },
  });

  // Create projects for professor
  const prof = await prisma.professorProfile.findUnique({ where: { userId: profUser.id } });
  if (prof) {
    await prisma.researchProject.upsert({
      where: { id: 'seed-project-1' },
      update: {},
      create: {
        id: 'seed-project-1',
        professorId: prof.id,
        title: 'Large Language Model Evaluation Framework',
        description: 'We are developing a comprehensive evaluation framework for large language models. This project involves designing benchmark tasks, implementing automated evaluation pipelines, and analyzing model behaviors across different domains.',
        requiredSkills: ['Python', 'PyTorch', 'NLP', 'Data Analysis'],
        preferredMajors: ['Computer Science', 'Data Science'],
        preferredYear: 'junior',
        hoursPerWeek: 15,
        duration: 'One academic year',
        compensationType: CompensationType.STIPEND,
        applicationDeadline: new Date('2025-09-01'),
        isActive: true,
      },
    });

    await prisma.researchProject.upsert({
      where: { id: 'seed-project-2' },
      update: {},
      create: {
        id: 'seed-project-2',
        professorId: prof.id,
        title: 'Multimodal Learning for Medical Imaging',
        description: 'This project explores combining visual and textual information for improved medical image understanding. Students will work on building and training neural networks that process both radiology images and associated clinical notes.',
        requiredSkills: ['Python', 'TensorFlow', 'Medical Imaging', 'Deep Learning'],
        preferredMajors: ['Computer Science', 'Biomedical Engineering'],
        preferredYear: 'senior',
        hoursPerWeek: 20,
        duration: 'Summer + Fall semester',
        compensationType: CompensationType.PAID,
        isActive: true,
      },
    });
  }

  // Create second professor
  const profUser2 = await prisma.user.upsert({
    where: { email: 'prof.johnson@university.edu' },
    update: {},
    create: {
      email: 'prof.johnson@university.edu',
      password: profPassword,
      role: 'PROFESSOR',
      emailVerified: true,
      professorProfile: {
        create: {
          firstName: 'Dr. Marcus',
          lastName: 'Johnson',
          title: 'Assistant Professor',
          department: 'Biology',
          university: 'Stanford University',
          researchAreas: ['Molecular Biology', 'CRISPR', 'Gene Therapy', 'Synthetic Biology'],
          labName: 'Johnson Genome Engineering Lab',
          bio: 'The Johnson Lab focuses on precision genome editing technologies, particularly CRISPR-based approaches for treating genetic diseases. We combine molecular biology with computational approaches to design safer and more effective gene therapies.',
          acceptingStudents: true,
        },
      },
    },
  });

  const prof2 = await prisma.professorProfile.findUnique({ where: { userId: profUser2.id } });
  if (prof2) {
    await prisma.researchProject.upsert({
      where: { id: 'seed-project-3' },
      update: {},
      create: {
        id: 'seed-project-3',
        professorId: prof2.id,
        title: 'CRISPR Screen for Drug Resistance Mechanisms',
        description: 'We are conducting genome-wide CRISPR screens to identify genes involved in cancer drug resistance. This project involves cell culture, CRISPR editing, next-generation sequencing, and bioinformatics analysis.',
        requiredSkills: ['Cell Culture', 'PCR', 'CRISPR', 'Basic Bioinformatics'],
        preferredMajors: ['Biology', 'Biochemistry', 'Biomedical Engineering'],
        preferredYear: 'any',
        hoursPerWeek: 12,
        duration: 'Ongoing',
        compensationType: CompensationType.CREDIT,
        isActive: true,
      },
    });
  }

  // Create student user
  const studentPassword = await bcrypt.hash('password123', 12);
  await prisma.user.upsert({
    where: { email: 'student@university.edu' },
    update: {},
    create: {
      email: 'student@university.edu',
      password: studentPassword,
      role: 'STUDENT',
      emailVerified: true,
      studentProfile: {
        create: {
          firstName: 'Alex',
          lastName: 'Chen',
          university: 'MIT',
          major: 'Computer Science',
          graduationYear: 2026,
          gpa: 3.8,
          bio: 'Passionate about machine learning and its applications in healthcare. Looking for research opportunities to gain hands-on experience in AI research.',
          skills: ['Python', 'PyTorch', 'JavaScript', 'React', 'Data Analysis', 'Statistics'],
          researchInterests: ['Machine Learning', 'AI in Healthcare', 'Natural Language Processing'],
        },
      },
    },
  });

  console.log('Seeding complete!');
  console.log('Test accounts:');
  console.log('  Professor: prof.smith@university.edu / password123');
  console.log('  Professor: prof.johnson@university.edu / password123');
  console.log('  Student:   student@university.edu / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
