import { OPENSEARCH_PRICING } from './pricingData';

interface OpenSearchCostParams {
  storageGB: number;
  nodes?: number;
  serverless?: boolean;
}

interface OpenSearchCostResult {
  compute: number;
  storage: number;
  total: number;
  breakdown: {
    compute: string;
    storage: string;
  };
}

export function calculateOpenSearchCost({ storageGB, nodes = 3, serverless = false }: OpenSearchCostParams): OpenSearchCostResult {
  if (serverless) {
    const compute = OPENSEARCH_PRICING.serverlessMinOcu * OPENSEARCH_PRICING.serverlessOcuHourly * OPENSEARCH_PRICING.hoursPerMonth;
    const storage = storageGB * OPENSEARCH_PRICING.serverlessStorageGbMonth;
    return {
      compute,
      storage,
      total: compute + storage,
      breakdown: {
        compute: `${OPENSEARCH_PRICING.serverlessMinOcu} OCUs × $${OPENSEARCH_PRICING.serverlessOcuHourly}/hr × ${OPENSEARCH_PRICING.hoursPerMonth} hrs`,
        storage: `${storageGB} GB × $${OPENSEARCH_PRICING.serverlessStorageGbMonth}/GB/month`
      }
    };
  } else {
    const compute = nodes * OPENSEARCH_PRICING.onDemandHourly * OPENSEARCH_PRICING.hoursPerMonth;
    const storage = storageGB * OPENSEARCH_PRICING.ebsGbMonth;
    return {
      compute,
      storage,
      total: compute + storage,
      breakdown: {
        compute: `${nodes} × or1.large.search × $${OPENSEARCH_PRICING.onDemandHourly}/hr × ${OPENSEARCH_PRICING.hoursPerMonth} hrs`,
        storage: `${storageGB} GB × $${OPENSEARCH_PRICING.ebsGbMonth}/GB/month`
      }
    };
  }
}
