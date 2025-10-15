import { handleChartRequest } from '../../../../lib/chartApiHelper'

export async function GET() {
  return handleChartRequest('jpy')
}