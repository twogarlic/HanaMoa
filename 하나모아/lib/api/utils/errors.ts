export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '유효성 검사 실패') {
    super(400, message)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = '인증이 필요합니다') {
    super(401, message)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = '권한이 없습니다') {
    super(403, message)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '리소스를 찾을 수 없습니다') {
    super(404, message)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '이미 존재하는 리소스입니다') {
    super(409, message)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = '서버 오류가 발생했습니다') {
    super(500, message)
  }
}

