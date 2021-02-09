import { getTestClient } from '../../../../utils/getTestClient'

describe('connection-limit-mysql', () => {
  expect.assertions(1)
  const clients: any[] = []

  afterAll(async () => {
    await Promise.all(clients.map((c) => c.$disconnect()))
  })

  test('error', async () => {
    const PrismaClient = await getTestClient()
    const connectionString =
      process.env.TEST_MYSQL_ISOLATED_URI ||
      'mysql://root:root@mysql_isolated:3306/tests'

    for (let i = 0; i <= 11; i++) {
      const client = new PrismaClient({
        datasources: {
          db: { url: connectionString },
        },
      })
      clients.push(client)
    }
    let count = 0
    try {
      for (const client of clients) {
        await client.$connect()
        count++
      }
    } catch (e) {
      expect(e.message).toMatchInlineSnapshot(
        `Error querying the database: Server error: \`ERROR HY000 (1040): Too many connections'`,
      )
    }
  }, 20_000)
})