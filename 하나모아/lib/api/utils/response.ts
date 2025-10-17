import { NextResponse } from 'next/server'

export class ApiResponse {
  static success<T>(data: T, message?: string, status: number = 200) {
    return NextResponse.json({
      success: true,
      data,
      message
    }, { status })
  }

  static error(error: string, status: number = 400) {
    return NextResponse.json({
      success: false,
      error
    }, { status })
  }

  static serverError(message: string = '서버 오류가 발생했습니다') {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 })
  }

  static unauthorized(message: string = '인증이 필요합니다') {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 401 })
  }

  static forbidden(message: string = '권한이 없습니다') {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 403 })
  }

  static notFound(message: string = '리소스를 찾을 수 없습니다') {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 404 })
  }

  static badRequest(message: string = '잘못된 요청입니다') {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 400 })
  }

  static conflict(message: string = '이미 존재하는 리소스입니다') {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 409 })
  }
}

