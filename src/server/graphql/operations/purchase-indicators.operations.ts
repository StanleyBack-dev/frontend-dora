import { graphql } from "@/server/graphql/generated";

export const purchaseIndicatorsDocument = graphql(`
  query PurchaseIndicators($period: IndicatorPeriodInput!) {
    purchaseIndicators(period: $period) {
      period {
        year
        month
      }
      paidCents
      paidInstallments
      purchases
      committed {
        cents
        installments
        orders
      }
      byCategory {
        category
        cents
        purchases
      }
      byMonth {
        month
        cents
      }
      bySupplier {
        supplierId
        supplierName
        cents
        purchases
        ratingAverage
        ratingCount
      }
      process {
        orders
        savingsCents
        withThreeQuotes
        avgDaysToOrder
        avgDaysToDeliver
        lateDeliveries
      }
    }
  }
`);

export const purchaseIndicatorsPdfDocument = graphql(`
  query PurchaseIndicatorsPdf($period: IndicatorPeriodInput!) {
    purchaseIndicatorsPdf(period: $period) {
      fileName
      mimeType
      base64Content
    }
  }
`);

export const purchaseTransparencyStatusDocument = graphql(`
  query PurchaseTransparencyStatus {
    purchaseTransparencyStatus {
      enabled
      updatedAt
      updatedByName
      canManage
      canPreview
    }
  }
`);

export const purchaseTransparencyDocument = graphql(`
  query PurchaseTransparency($period: IndicatorPeriodInput!, $page: PageInput) {
    purchaseTransparency(period: $period) {
      period {
        year
        month
      }
      paidCents
      purchases
      byCategory {
        category
        cents
        purchases
      }
      byMonth {
        month
        cents
      }
    }
    transparencyPurchases(period: $period, page: $page) {
      items {
        number
        title
        categories
        categoryOther
        supplierName
        totalCents
        completedOn
        quoteCount
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const purchaseTransparencyPdfDocument = graphql(`
  query PurchaseTransparencyPdf($period: IndicatorPeriodInput!) {
    purchaseTransparencyPdf(period: $period) {
      fileName
      mimeType
      base64Content
    }
  }
`);

export const publishPurchaseTransparencyDocument = graphql(`
  mutation PublishPurchaseTransparency($enabled: Boolean!) {
    publishPurchaseTransparency(enabled: $enabled) {
      enabled
      updatedAt
      updatedByName
      canManage
      canPreview
    }
  }
`);
