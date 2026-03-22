import settingsHandler from './settings/index'
import { withAdminAuth } from '../../../lib/middleware/withAdminAuth'

export default withAdminAuth(settingsHandler as any)

