import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('AdminPass123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.test' },
    update: {
      name: 'System Administrator',
      role: 'admin',
    },
    create: {
      email: 'admin@example.test',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'admin',
    },
  })

  console.log('Admin user created/updated:', admin.email)

  // Create sample devices
  const pcrThermocycler = await prisma.device.create({
    data: {
      name: 'PCR Thermocycler',
      model: 'TC-5000',
      description: 'A laboratory device used to amplify segments of DNA via polymerase chain reaction (PCR).',
    },
  })

  const mriScanner = await prisma.device.create({
    data: {
      name: 'MRI Scanner',
      model: 'MRI-7000',
      description: 'A medical imaging device that uses magnetic fields and radio waves to create detailed images of the body internal structures.',
    },
  })

  console.log('Sample devices created:', pcrThermocycler.name, mriScanner.name)

  // Create sample references
  const reference1 = await prisma.reference.create({
    data: {
      deviceId: pcrThermocycler.id,
      title: 'Principles of Polymerase Chain Reaction',
      sourceName: 'Journal of Molecular Biology',
      sourceUrl: 'https://example.com/paper1',
      sourceId: 'pubmed123',
      sourceReliabilityScore: 0.9,
      status: 'verified',
    },
  })

  const reference2 = await prisma.reference.create({
    data: {
      deviceId: mriScanner.id,
      title: 'MRI Scanner Design and Components',
      sourceName: 'Medical Physics',
      sourceUrl: 'https://example.com/paper2',
      sourceId: 'pubmed456',
      sourceReliabilityScore: 0.95,
      status: 'verified',
    },
  })

  console.log('Sample references created:', reference1.title, reference2.title)

  // Create sample sections
  const sections = [
    {
      deviceId: pcrThermocycler.id,
      referenceId: reference1.id,
      title: 'PCR Thermocycler Definition',
      content: 'A PCR thermocycler is a thermal cycler device that enables the polymerase chain reaction by precisely controlling temperature cycles required for DNA denaturation, annealing, and extension.',
      order: 1,
    },
    {
      deviceId: pcrThermocycler.id,
      referenceId: reference1.id,
      title: 'PCR Mechanism of Action',
      content: 'The thermocycler operates through a series of precisely controlled temperature cycles. Each cycle consists of three main phases: denaturation (94-98°C for 30 seconds), annealing (50-65°C for 30 seconds), and extension (72°C for 1 minute per kilobase).',
      order: 2,
    },
    {
      deviceId: mriScanner.id,
      referenceId: reference2.id,
      title: 'MRI Scanner Definition',
      content: 'Magnetic Resonance Imaging (MRI) is a non-invasive medical imaging technique that utilizes strong magnetic fields and radio waves to generate detailed images of organs and tissues within the body.',
      order: 1,
    },
    {
      deviceId: mriScanner.id,
      referenceId: reference2.id,
      title: 'MRI Mechanism of Action',
      content: 'MRI operates based on principles of nuclear magnetic resonance. The device generates a powerful static magnetic field (typically 1.5 to 7.0 Tesla) using superconducting magnets. Hydrogen nuclei in the body align with this field. Radio frequency pulses are then applied, causing nuclei to absorb energy and shift their alignment.',
      order: 2,
    },
  ]

  for (const section of sections) {
    await prisma.section.create({ data: section })
  }

  console.log('Sample sections created:', sections.length)

  console.log('Database seeding completed successfully!')
}

main().catch((error) => {
  console.error('Error seeding database:', error)
  process.exit(1)
})
