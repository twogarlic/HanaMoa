import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, quantity } = body

    if (!userId || !productId || !quantity) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 })
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: '수량은 1개 이상이어야 합니다.' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (!product.isActive) {
      return NextResponse.json({ error: '판매 중지된 상품입니다.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        holdings: {
          where: { asset: 'gold' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    const mainAccount = user.accounts[0]
    const goldHolding = user.holdings[0]

    if (!mainAccount) {
      return NextResponse.json({ error: '계좌를 찾을 수 없습니다.' }, { status: 400 })
    }

    if (!goldHolding) {
      return NextResponse.json({ error: '금 보유량이 없습니다.' }, { status: 400 })
    }

    const requiredGold = product.price * quantity
    const processingFee = product.processingFee * quantity
    const totalCost = processingFee

    if (goldHolding.quantity < requiredGold) {
      return NextResponse.json({ 
        error: `보유 금량이 부족합니다. 필요: ${requiredGold}g, 보유: ${goldHolding.quantity}g` 
      }, { status: 400 })
    }

    if (mainAccount.balance < totalCost) {
      return NextResponse.json({ 
        error: `계좌 잔액이 부족합니다. 필요: ${totalCost.toLocaleString()}원, 보유: ${mainAccount.balance.toLocaleString()}원` 
      }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const exchange = await tx.productExchange.create({
        data: {
          userId,
          productId,
          quantity,
          goldAmount: requiredGold,
          processingFee,
          totalCost,
          status: 'PENDING'
        }
      })

      const newQuantity = Math.round((goldHolding.quantity - requiredGold) * 100) / 100
      const newTotalAmount = Math.round((newQuantity * goldHolding.averagePrice) * 100) / 100
      
      await tx.holding.update({
        where: { id: goldHolding.id },
        data: {
          quantity: newQuantity,
          totalAmount: newTotalAmount
        }
      })

      await tx.account.update({
        where: { id: mainAccount.id },
        data: {
          balance: mainAccount.balance - totalCost
        }
      })

      await tx.transaction.create({
        data: {
          userId,
          accountId: mainAccount.id,
          type: 'WITHDRAWAL',
          amount: totalCost,
          balance: mainAccount.balance - totalCost,
          description: `${product.name} ${quantity}개 교환 (가공비)`
        }
      })

      await tx.productExchange.update({
        where: { id: exchange.id },
        data: { status: 'COMPLETED' }
      })

      return exchange
    })

    return NextResponse.json({
      success: true,
      message: '상품 교환이 완료되었습니다.',
      exchange: result
    })

  } catch (error) {
    return NextResponse.json({ error: '상품 교환에 실패했습니다.' }, { status: 500 })
    }
}
