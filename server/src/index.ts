import { app } from './server'
import { env } from './shared/env'

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${env.PORT}`)
})

