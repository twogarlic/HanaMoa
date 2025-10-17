import { productRepository } from '@/lib/repositories/product.repository'
import { NotFoundError } from '@/lib/api/utils/errors'
import type { GetProductsQuery } from '@/lib/api/validators/product.schema'

export class ProductService {
  async getProducts(query: GetProductsQuery) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20)
    const take = query.limit || 20

    const [products, total] = await Promise.all([
      productRepository.findMany({
        category: query.category,
        search: query.search,
        sortBy: query.sortBy,
        skip,
        take
      }),
      productRepository.count(query.category, query.search)
    ])

    const productsWithRating = products.map(product => {
      const reviews = product.reviews
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0

      return {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: product._count.reviews
      }
    })

    return {
      products: productsWithRating,
      pagination: {
        page: query.page || 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    }
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id)

    if (!product) {
      throw new NotFoundError('상품을 찾을 수 없습니다')
    }

    const reviews = product.reviews
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

    return {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: product._count.reviews
    }
  }

  async exchangeProduct(userId: string, productId: string, quantity: number) {
    const product = await productRepository.findById(productId)

    if (!product) {
      throw new NotFoundError('상품을 찾을 수 없습니다')
    }

    if (product.stock < quantity) {
      throw new NotFoundError('재고가 부족합니다')
    }

    await productRepository.updateStock(productId, quantity)

    return {
      success: true,
      message: '교환이 완료되었습니다'
    }
  }
}

export const productService = new ProductService()

