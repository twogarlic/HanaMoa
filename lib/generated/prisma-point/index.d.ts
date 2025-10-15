
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model HanaPoint
 * 
 */
export type HanaPoint = $Result.DefaultSelection<Prisma.$HanaPointPayload>
/**
 * Model HanaPointHistory
 * 
 */
export type HanaPointHistory = $Result.DefaultSelection<Prisma.$HanaPointHistoryPayload>
/**
 * Model Attendance
 * 
 */
export type Attendance = $Result.DefaultSelection<Prisma.$AttendancePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const PointType: {
  EARN: 'EARN',
  USE: 'USE',
  EXPIRE: 'EXPIRE',
  REFUND: 'REFUND'
};

export type PointType = (typeof PointType)[keyof typeof PointType]

}

export type PointType = $Enums.PointType

export const PointType: typeof $Enums.PointType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more HanaPoints
 * const hanaPoints = await prisma.hanaPoint.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more HanaPoints
   * const hanaPoints = await prisma.hanaPoint.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.hanaPoint`: Exposes CRUD operations for the **HanaPoint** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more HanaPoints
    * const hanaPoints = await prisma.hanaPoint.findMany()
    * ```
    */
  get hanaPoint(): Prisma.HanaPointDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.hanaPointHistory`: Exposes CRUD operations for the **HanaPointHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more HanaPointHistories
    * const hanaPointHistories = await prisma.hanaPointHistory.findMany()
    * ```
    */
  get hanaPointHistory(): Prisma.HanaPointHistoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.attendance`: Exposes CRUD operations for the **Attendance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Attendances
    * const attendances = await prisma.attendance.findMany()
    * ```
    */
  get attendance(): Prisma.AttendanceDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.17.1
   * Query Engine version: 272a37d34178c2894197e17273bf937f25acdeac
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    HanaPoint: 'HanaPoint',
    HanaPointHistory: 'HanaPointHistory',
    Attendance: 'Attendance'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "hanaPoint" | "hanaPointHistory" | "attendance"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      HanaPoint: {
        payload: Prisma.$HanaPointPayload<ExtArgs>
        fields: Prisma.HanaPointFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HanaPointFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HanaPointFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointPayload>
          }
          findFirst: {
            args: Prisma.HanaPointFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HanaPointFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointPayload>
          }
          findMany: {
            args: Prisma.HanaPointFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointPayload>[]
          }
          create: {
            args: Prisma.HanaPointCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointPayload>
          }
          createMany: {
            args: Prisma.HanaPointCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.HanaPointDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointPayload>
          }
          update: {
            args: Prisma.HanaPointUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointPayload>
          }
          deleteMany: {
            args: Prisma.HanaPointDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HanaPointUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.HanaPointUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointPayload>
          }
          aggregate: {
            args: Prisma.HanaPointAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHanaPoint>
          }
          groupBy: {
            args: Prisma.HanaPointGroupByArgs<ExtArgs>
            result: $Utils.Optional<HanaPointGroupByOutputType>[]
          }
          count: {
            args: Prisma.HanaPointCountArgs<ExtArgs>
            result: $Utils.Optional<HanaPointCountAggregateOutputType> | number
          }
        }
      }
      HanaPointHistory: {
        payload: Prisma.$HanaPointHistoryPayload<ExtArgs>
        fields: Prisma.HanaPointHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HanaPointHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HanaPointHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointHistoryPayload>
          }
          findFirst: {
            args: Prisma.HanaPointHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HanaPointHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointHistoryPayload>
          }
          findMany: {
            args: Prisma.HanaPointHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointHistoryPayload>[]
          }
          create: {
            args: Prisma.HanaPointHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointHistoryPayload>
          }
          createMany: {
            args: Prisma.HanaPointHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.HanaPointHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointHistoryPayload>
          }
          update: {
            args: Prisma.HanaPointHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointHistoryPayload>
          }
          deleteMany: {
            args: Prisma.HanaPointHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HanaPointHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.HanaPointHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HanaPointHistoryPayload>
          }
          aggregate: {
            args: Prisma.HanaPointHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHanaPointHistory>
          }
          groupBy: {
            args: Prisma.HanaPointHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<HanaPointHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.HanaPointHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<HanaPointHistoryCountAggregateOutputType> | number
          }
        }
      }
      Attendance: {
        payload: Prisma.$AttendancePayload<ExtArgs>
        fields: Prisma.AttendanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AttendanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AttendanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          findFirst: {
            args: Prisma.AttendanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AttendanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          findMany: {
            args: Prisma.AttendanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>[]
          }
          create: {
            args: Prisma.AttendanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          createMany: {
            args: Prisma.AttendanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AttendanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          update: {
            args: Prisma.AttendanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          deleteMany: {
            args: Prisma.AttendanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AttendanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AttendanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          aggregate: {
            args: Prisma.AttendanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAttendance>
          }
          groupBy: {
            args: Prisma.AttendanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<AttendanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.AttendanceCountArgs<ExtArgs>
            result: $Utils.Optional<AttendanceCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    hanaPoint?: HanaPointOmit
    hanaPointHistory?: HanaPointHistoryOmit
    attendance?: AttendanceOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type HanaPointCountOutputType
   */

  export type HanaPointCountOutputType = {
    histories: number
  }

  export type HanaPointCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    histories?: boolean | HanaPointCountOutputTypeCountHistoriesArgs
  }

  // Custom InputTypes
  /**
   * HanaPointCountOutputType without action
   */
  export type HanaPointCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPointCountOutputType
     */
    select?: HanaPointCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * HanaPointCountOutputType without action
   */
  export type HanaPointCountOutputTypeCountHistoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HanaPointHistoryWhereInput
  }


  /**
   * Models
   */

  /**
   * Model HanaPoint
   */

  export type AggregateHanaPoint = {
    _count: HanaPointCountAggregateOutputType | null
    _avg: HanaPointAvgAggregateOutputType | null
    _sum: HanaPointSumAggregateOutputType | null
    _min: HanaPointMinAggregateOutputType | null
    _max: HanaPointMaxAggregateOutputType | null
  }

  export type HanaPointAvgAggregateOutputType = {
    balance: number | null
    totalEarned: number | null
    totalUsed: number | null
  }

  export type HanaPointSumAggregateOutputType = {
    balance: number | null
    totalEarned: number | null
    totalUsed: number | null
  }

  export type HanaPointMinAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    ssn: string | null
    phone: string | null
    balance: number | null
    totalEarned: number | null
    totalUsed: number | null
    isLinked: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type HanaPointMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    ssn: string | null
    phone: string | null
    balance: number | null
    totalEarned: number | null
    totalUsed: number | null
    isLinked: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type HanaPointCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    ssn: number
    phone: number
    balance: number
    totalEarned: number
    totalUsed: number
    isLinked: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type HanaPointAvgAggregateInputType = {
    balance?: true
    totalEarned?: true
    totalUsed?: true
  }

  export type HanaPointSumAggregateInputType = {
    balance?: true
    totalEarned?: true
    totalUsed?: true
  }

  export type HanaPointMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    ssn?: true
    phone?: true
    balance?: true
    totalEarned?: true
    totalUsed?: true
    isLinked?: true
    createdAt?: true
    updatedAt?: true
  }

  export type HanaPointMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    ssn?: true
    phone?: true
    balance?: true
    totalEarned?: true
    totalUsed?: true
    isLinked?: true
    createdAt?: true
    updatedAt?: true
  }

  export type HanaPointCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    ssn?: true
    phone?: true
    balance?: true
    totalEarned?: true
    totalUsed?: true
    isLinked?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type HanaPointAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HanaPoint to aggregate.
     */
    where?: HanaPointWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HanaPoints to fetch.
     */
    orderBy?: HanaPointOrderByWithRelationInput | HanaPointOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HanaPointWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HanaPoints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HanaPoints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned HanaPoints
    **/
    _count?: true | HanaPointCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: HanaPointAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: HanaPointSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HanaPointMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HanaPointMaxAggregateInputType
  }

  export type GetHanaPointAggregateType<T extends HanaPointAggregateArgs> = {
        [P in keyof T & keyof AggregateHanaPoint]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHanaPoint[P]>
      : GetScalarType<T[P], AggregateHanaPoint[P]>
  }




  export type HanaPointGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HanaPointWhereInput
    orderBy?: HanaPointOrderByWithAggregationInput | HanaPointOrderByWithAggregationInput[]
    by: HanaPointScalarFieldEnum[] | HanaPointScalarFieldEnum
    having?: HanaPointScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HanaPointCountAggregateInputType | true
    _avg?: HanaPointAvgAggregateInputType
    _sum?: HanaPointSumAggregateInputType
    _min?: HanaPointMinAggregateInputType
    _max?: HanaPointMaxAggregateInputType
  }

  export type HanaPointGroupByOutputType = {
    id: string
    userId: string | null
    name: string
    ssn: string
    phone: string
    balance: number
    totalEarned: number
    totalUsed: number
    isLinked: boolean
    createdAt: Date
    updatedAt: Date
    _count: HanaPointCountAggregateOutputType | null
    _avg: HanaPointAvgAggregateOutputType | null
    _sum: HanaPointSumAggregateOutputType | null
    _min: HanaPointMinAggregateOutputType | null
    _max: HanaPointMaxAggregateOutputType | null
  }

  type GetHanaPointGroupByPayload<T extends HanaPointGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HanaPointGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HanaPointGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HanaPointGroupByOutputType[P]>
            : GetScalarType<T[P], HanaPointGroupByOutputType[P]>
        }
      >
    >


  export type HanaPointSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    ssn?: boolean
    phone?: boolean
    balance?: boolean
    totalEarned?: boolean
    totalUsed?: boolean
    isLinked?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    histories?: boolean | HanaPoint$historiesArgs<ExtArgs>
    _count?: boolean | HanaPointCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["hanaPoint"]>



  export type HanaPointSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    ssn?: boolean
    phone?: boolean
    balance?: boolean
    totalEarned?: boolean
    totalUsed?: boolean
    isLinked?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type HanaPointOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "name" | "ssn" | "phone" | "balance" | "totalEarned" | "totalUsed" | "isLinked" | "createdAt" | "updatedAt", ExtArgs["result"]["hanaPoint"]>
  export type HanaPointInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    histories?: boolean | HanaPoint$historiesArgs<ExtArgs>
    _count?: boolean | HanaPointCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $HanaPointPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "HanaPoint"
    objects: {
      histories: Prisma.$HanaPointHistoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string | null
      name: string
      ssn: string
      phone: string
      balance: number
      totalEarned: number
      totalUsed: number
      isLinked: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["hanaPoint"]>
    composites: {}
  }

  type HanaPointGetPayload<S extends boolean | null | undefined | HanaPointDefaultArgs> = $Result.GetResult<Prisma.$HanaPointPayload, S>

  type HanaPointCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<HanaPointFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: HanaPointCountAggregateInputType | true
    }

  export interface HanaPointDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['HanaPoint'], meta: { name: 'HanaPoint' } }
    /**
     * Find zero or one HanaPoint that matches the filter.
     * @param {HanaPointFindUniqueArgs} args - Arguments to find a HanaPoint
     * @example
     * // Get one HanaPoint
     * const hanaPoint = await prisma.hanaPoint.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HanaPointFindUniqueArgs>(args: SelectSubset<T, HanaPointFindUniqueArgs<ExtArgs>>): Prisma__HanaPointClient<$Result.GetResult<Prisma.$HanaPointPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one HanaPoint that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {HanaPointFindUniqueOrThrowArgs} args - Arguments to find a HanaPoint
     * @example
     * // Get one HanaPoint
     * const hanaPoint = await prisma.hanaPoint.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HanaPointFindUniqueOrThrowArgs>(args: SelectSubset<T, HanaPointFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HanaPointClient<$Result.GetResult<Prisma.$HanaPointPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HanaPoint that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointFindFirstArgs} args - Arguments to find a HanaPoint
     * @example
     * // Get one HanaPoint
     * const hanaPoint = await prisma.hanaPoint.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HanaPointFindFirstArgs>(args?: SelectSubset<T, HanaPointFindFirstArgs<ExtArgs>>): Prisma__HanaPointClient<$Result.GetResult<Prisma.$HanaPointPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HanaPoint that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointFindFirstOrThrowArgs} args - Arguments to find a HanaPoint
     * @example
     * // Get one HanaPoint
     * const hanaPoint = await prisma.hanaPoint.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HanaPointFindFirstOrThrowArgs>(args?: SelectSubset<T, HanaPointFindFirstOrThrowArgs<ExtArgs>>): Prisma__HanaPointClient<$Result.GetResult<Prisma.$HanaPointPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more HanaPoints that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all HanaPoints
     * const hanaPoints = await prisma.hanaPoint.findMany()
     * 
     * // Get first 10 HanaPoints
     * const hanaPoints = await prisma.hanaPoint.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const hanaPointWithIdOnly = await prisma.hanaPoint.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HanaPointFindManyArgs>(args?: SelectSubset<T, HanaPointFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HanaPointPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a HanaPoint.
     * @param {HanaPointCreateArgs} args - Arguments to create a HanaPoint.
     * @example
     * // Create one HanaPoint
     * const HanaPoint = await prisma.hanaPoint.create({
     *   data: {
     *     // ... data to create a HanaPoint
     *   }
     * })
     * 
     */
    create<T extends HanaPointCreateArgs>(args: SelectSubset<T, HanaPointCreateArgs<ExtArgs>>): Prisma__HanaPointClient<$Result.GetResult<Prisma.$HanaPointPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many HanaPoints.
     * @param {HanaPointCreateManyArgs} args - Arguments to create many HanaPoints.
     * @example
     * // Create many HanaPoints
     * const hanaPoint = await prisma.hanaPoint.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HanaPointCreateManyArgs>(args?: SelectSubset<T, HanaPointCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a HanaPoint.
     * @param {HanaPointDeleteArgs} args - Arguments to delete one HanaPoint.
     * @example
     * // Delete one HanaPoint
     * const HanaPoint = await prisma.hanaPoint.delete({
     *   where: {
     *     // ... filter to delete one HanaPoint
     *   }
     * })
     * 
     */
    delete<T extends HanaPointDeleteArgs>(args: SelectSubset<T, HanaPointDeleteArgs<ExtArgs>>): Prisma__HanaPointClient<$Result.GetResult<Prisma.$HanaPointPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one HanaPoint.
     * @param {HanaPointUpdateArgs} args - Arguments to update one HanaPoint.
     * @example
     * // Update one HanaPoint
     * const hanaPoint = await prisma.hanaPoint.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HanaPointUpdateArgs>(args: SelectSubset<T, HanaPointUpdateArgs<ExtArgs>>): Prisma__HanaPointClient<$Result.GetResult<Prisma.$HanaPointPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more HanaPoints.
     * @param {HanaPointDeleteManyArgs} args - Arguments to filter HanaPoints to delete.
     * @example
     * // Delete a few HanaPoints
     * const { count } = await prisma.hanaPoint.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HanaPointDeleteManyArgs>(args?: SelectSubset<T, HanaPointDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HanaPoints.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many HanaPoints
     * const hanaPoint = await prisma.hanaPoint.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HanaPointUpdateManyArgs>(args: SelectSubset<T, HanaPointUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one HanaPoint.
     * @param {HanaPointUpsertArgs} args - Arguments to update or create a HanaPoint.
     * @example
     * // Update or create a HanaPoint
     * const hanaPoint = await prisma.hanaPoint.upsert({
     *   create: {
     *     // ... data to create a HanaPoint
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the HanaPoint we want to update
     *   }
     * })
     */
    upsert<T extends HanaPointUpsertArgs>(args: SelectSubset<T, HanaPointUpsertArgs<ExtArgs>>): Prisma__HanaPointClient<$Result.GetResult<Prisma.$HanaPointPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of HanaPoints.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointCountArgs} args - Arguments to filter HanaPoints to count.
     * @example
     * // Count the number of HanaPoints
     * const count = await prisma.hanaPoint.count({
     *   where: {
     *     // ... the filter for the HanaPoints we want to count
     *   }
     * })
    **/
    count<T extends HanaPointCountArgs>(
      args?: Subset<T, HanaPointCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HanaPointCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a HanaPoint.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HanaPointAggregateArgs>(args: Subset<T, HanaPointAggregateArgs>): Prisma.PrismaPromise<GetHanaPointAggregateType<T>>

    /**
     * Group by HanaPoint.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HanaPointGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HanaPointGroupByArgs['orderBy'] }
        : { orderBy?: HanaPointGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HanaPointGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHanaPointGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the HanaPoint model
   */
  readonly fields: HanaPointFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for HanaPoint.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HanaPointClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    histories<T extends HanaPoint$historiesArgs<ExtArgs> = {}>(args?: Subset<T, HanaPoint$historiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HanaPointHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the HanaPoint model
   */
  interface HanaPointFieldRefs {
    readonly id: FieldRef<"HanaPoint", 'String'>
    readonly userId: FieldRef<"HanaPoint", 'String'>
    readonly name: FieldRef<"HanaPoint", 'String'>
    readonly ssn: FieldRef<"HanaPoint", 'String'>
    readonly phone: FieldRef<"HanaPoint", 'String'>
    readonly balance: FieldRef<"HanaPoint", 'Int'>
    readonly totalEarned: FieldRef<"HanaPoint", 'Int'>
    readonly totalUsed: FieldRef<"HanaPoint", 'Int'>
    readonly isLinked: FieldRef<"HanaPoint", 'Boolean'>
    readonly createdAt: FieldRef<"HanaPoint", 'DateTime'>
    readonly updatedAt: FieldRef<"HanaPoint", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * HanaPoint findUnique
   */
  export type HanaPointFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPoint
     */
    select?: HanaPointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPoint
     */
    omit?: HanaPointOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointInclude<ExtArgs> | null
    /**
     * Filter, which HanaPoint to fetch.
     */
    where: HanaPointWhereUniqueInput
  }

  /**
   * HanaPoint findUniqueOrThrow
   */
  export type HanaPointFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPoint
     */
    select?: HanaPointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPoint
     */
    omit?: HanaPointOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointInclude<ExtArgs> | null
    /**
     * Filter, which HanaPoint to fetch.
     */
    where: HanaPointWhereUniqueInput
  }

  /**
   * HanaPoint findFirst
   */
  export type HanaPointFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPoint
     */
    select?: HanaPointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPoint
     */
    omit?: HanaPointOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointInclude<ExtArgs> | null
    /**
     * Filter, which HanaPoint to fetch.
     */
    where?: HanaPointWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HanaPoints to fetch.
     */
    orderBy?: HanaPointOrderByWithRelationInput | HanaPointOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HanaPoints.
     */
    cursor?: HanaPointWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HanaPoints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HanaPoints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HanaPoints.
     */
    distinct?: HanaPointScalarFieldEnum | HanaPointScalarFieldEnum[]
  }

  /**
   * HanaPoint findFirstOrThrow
   */
  export type HanaPointFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPoint
     */
    select?: HanaPointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPoint
     */
    omit?: HanaPointOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointInclude<ExtArgs> | null
    /**
     * Filter, which HanaPoint to fetch.
     */
    where?: HanaPointWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HanaPoints to fetch.
     */
    orderBy?: HanaPointOrderByWithRelationInput | HanaPointOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HanaPoints.
     */
    cursor?: HanaPointWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HanaPoints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HanaPoints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HanaPoints.
     */
    distinct?: HanaPointScalarFieldEnum | HanaPointScalarFieldEnum[]
  }

  /**
   * HanaPoint findMany
   */
  export type HanaPointFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPoint
     */
    select?: HanaPointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPoint
     */
    omit?: HanaPointOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointInclude<ExtArgs> | null
    /**
     * Filter, which HanaPoints to fetch.
     */
    where?: HanaPointWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HanaPoints to fetch.
     */
    orderBy?: HanaPointOrderByWithRelationInput | HanaPointOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing HanaPoints.
     */
    cursor?: HanaPointWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HanaPoints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HanaPoints.
     */
    skip?: number
    distinct?: HanaPointScalarFieldEnum | HanaPointScalarFieldEnum[]
  }

  /**
   * HanaPoint create
   */
  export type HanaPointCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPoint
     */
    select?: HanaPointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPoint
     */
    omit?: HanaPointOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointInclude<ExtArgs> | null
    /**
     * The data needed to create a HanaPoint.
     */
    data: XOR<HanaPointCreateInput, HanaPointUncheckedCreateInput>
  }

  /**
   * HanaPoint createMany
   */
  export type HanaPointCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many HanaPoints.
     */
    data: HanaPointCreateManyInput | HanaPointCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * HanaPoint update
   */
  export type HanaPointUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPoint
     */
    select?: HanaPointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPoint
     */
    omit?: HanaPointOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointInclude<ExtArgs> | null
    /**
     * The data needed to update a HanaPoint.
     */
    data: XOR<HanaPointUpdateInput, HanaPointUncheckedUpdateInput>
    /**
     * Choose, which HanaPoint to update.
     */
    where: HanaPointWhereUniqueInput
  }

  /**
   * HanaPoint updateMany
   */
  export type HanaPointUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update HanaPoints.
     */
    data: XOR<HanaPointUpdateManyMutationInput, HanaPointUncheckedUpdateManyInput>
    /**
     * Filter which HanaPoints to update
     */
    where?: HanaPointWhereInput
    /**
     * Limit how many HanaPoints to update.
     */
    limit?: number
  }

  /**
   * HanaPoint upsert
   */
  export type HanaPointUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPoint
     */
    select?: HanaPointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPoint
     */
    omit?: HanaPointOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointInclude<ExtArgs> | null
    /**
     * The filter to search for the HanaPoint to update in case it exists.
     */
    where: HanaPointWhereUniqueInput
    /**
     * In case the HanaPoint found by the `where` argument doesn't exist, create a new HanaPoint with this data.
     */
    create: XOR<HanaPointCreateInput, HanaPointUncheckedCreateInput>
    /**
     * In case the HanaPoint was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HanaPointUpdateInput, HanaPointUncheckedUpdateInput>
  }

  /**
   * HanaPoint delete
   */
  export type HanaPointDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPoint
     */
    select?: HanaPointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPoint
     */
    omit?: HanaPointOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointInclude<ExtArgs> | null
    /**
     * Filter which HanaPoint to delete.
     */
    where: HanaPointWhereUniqueInput
  }

  /**
   * HanaPoint deleteMany
   */
  export type HanaPointDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HanaPoints to delete
     */
    where?: HanaPointWhereInput
    /**
     * Limit how many HanaPoints to delete.
     */
    limit?: number
  }

  /**
   * HanaPoint.histories
   */
  export type HanaPoint$historiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPointHistory
     */
    select?: HanaPointHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPointHistory
     */
    omit?: HanaPointHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointHistoryInclude<ExtArgs> | null
    where?: HanaPointHistoryWhereInput
    orderBy?: HanaPointHistoryOrderByWithRelationInput | HanaPointHistoryOrderByWithRelationInput[]
    cursor?: HanaPointHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HanaPointHistoryScalarFieldEnum | HanaPointHistoryScalarFieldEnum[]
  }

  /**
   * HanaPoint without action
   */
  export type HanaPointDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPoint
     */
    select?: HanaPointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPoint
     */
    omit?: HanaPointOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointInclude<ExtArgs> | null
  }


  /**
   * Model HanaPointHistory
   */

  export type AggregateHanaPointHistory = {
    _count: HanaPointHistoryCountAggregateOutputType | null
    _avg: HanaPointHistoryAvgAggregateOutputType | null
    _sum: HanaPointHistorySumAggregateOutputType | null
    _min: HanaPointHistoryMinAggregateOutputType | null
    _max: HanaPointHistoryMaxAggregateOutputType | null
  }

  export type HanaPointHistoryAvgAggregateOutputType = {
    amount: number | null
    balance: number | null
  }

  export type HanaPointHistorySumAggregateOutputType = {
    amount: number | null
    balance: number | null
  }

  export type HanaPointHistoryMinAggregateOutputType = {
    id: string | null
    pointId: string | null
    type: $Enums.PointType | null
    amount: number | null
    balance: number | null
    description: string | null
    sourceSystem: string | null
    sourceId: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type HanaPointHistoryMaxAggregateOutputType = {
    id: string | null
    pointId: string | null
    type: $Enums.PointType | null
    amount: number | null
    balance: number | null
    description: string | null
    sourceSystem: string | null
    sourceId: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type HanaPointHistoryCountAggregateOutputType = {
    id: number
    pointId: number
    type: number
    amount: number
    balance: number
    description: number
    sourceSystem: number
    sourceId: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type HanaPointHistoryAvgAggregateInputType = {
    amount?: true
    balance?: true
  }

  export type HanaPointHistorySumAggregateInputType = {
    amount?: true
    balance?: true
  }

  export type HanaPointHistoryMinAggregateInputType = {
    id?: true
    pointId?: true
    type?: true
    amount?: true
    balance?: true
    description?: true
    sourceSystem?: true
    sourceId?: true
    expiresAt?: true
    createdAt?: true
  }

  export type HanaPointHistoryMaxAggregateInputType = {
    id?: true
    pointId?: true
    type?: true
    amount?: true
    balance?: true
    description?: true
    sourceSystem?: true
    sourceId?: true
    expiresAt?: true
    createdAt?: true
  }

  export type HanaPointHistoryCountAggregateInputType = {
    id?: true
    pointId?: true
    type?: true
    amount?: true
    balance?: true
    description?: true
    sourceSystem?: true
    sourceId?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type HanaPointHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HanaPointHistory to aggregate.
     */
    where?: HanaPointHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HanaPointHistories to fetch.
     */
    orderBy?: HanaPointHistoryOrderByWithRelationInput | HanaPointHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HanaPointHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HanaPointHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HanaPointHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned HanaPointHistories
    **/
    _count?: true | HanaPointHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: HanaPointHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: HanaPointHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HanaPointHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HanaPointHistoryMaxAggregateInputType
  }

  export type GetHanaPointHistoryAggregateType<T extends HanaPointHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateHanaPointHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHanaPointHistory[P]>
      : GetScalarType<T[P], AggregateHanaPointHistory[P]>
  }




  export type HanaPointHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HanaPointHistoryWhereInput
    orderBy?: HanaPointHistoryOrderByWithAggregationInput | HanaPointHistoryOrderByWithAggregationInput[]
    by: HanaPointHistoryScalarFieldEnum[] | HanaPointHistoryScalarFieldEnum
    having?: HanaPointHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HanaPointHistoryCountAggregateInputType | true
    _avg?: HanaPointHistoryAvgAggregateInputType
    _sum?: HanaPointHistorySumAggregateInputType
    _min?: HanaPointHistoryMinAggregateInputType
    _max?: HanaPointHistoryMaxAggregateInputType
  }

  export type HanaPointHistoryGroupByOutputType = {
    id: string
    pointId: string
    type: $Enums.PointType
    amount: number
    balance: number
    description: string
    sourceSystem: string
    sourceId: string | null
    expiresAt: Date | null
    createdAt: Date
    _count: HanaPointHistoryCountAggregateOutputType | null
    _avg: HanaPointHistoryAvgAggregateOutputType | null
    _sum: HanaPointHistorySumAggregateOutputType | null
    _min: HanaPointHistoryMinAggregateOutputType | null
    _max: HanaPointHistoryMaxAggregateOutputType | null
  }

  type GetHanaPointHistoryGroupByPayload<T extends HanaPointHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HanaPointHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HanaPointHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HanaPointHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], HanaPointHistoryGroupByOutputType[P]>
        }
      >
    >


  export type HanaPointHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pointId?: boolean
    type?: boolean
    amount?: boolean
    balance?: boolean
    description?: boolean
    sourceSystem?: boolean
    sourceId?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    point?: boolean | HanaPointDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["hanaPointHistory"]>



  export type HanaPointHistorySelectScalar = {
    id?: boolean
    pointId?: boolean
    type?: boolean
    amount?: boolean
    balance?: boolean
    description?: boolean
    sourceSystem?: boolean
    sourceId?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }

  export type HanaPointHistoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "pointId" | "type" | "amount" | "balance" | "description" | "sourceSystem" | "sourceId" | "expiresAt" | "createdAt", ExtArgs["result"]["hanaPointHistory"]>
  export type HanaPointHistoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    point?: boolean | HanaPointDefaultArgs<ExtArgs>
  }

  export type $HanaPointHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "HanaPointHistory"
    objects: {
      point: Prisma.$HanaPointPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      pointId: string
      type: $Enums.PointType
      amount: number
      balance: number
      description: string
      sourceSystem: string
      sourceId: string | null
      expiresAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["hanaPointHistory"]>
    composites: {}
  }

  type HanaPointHistoryGetPayload<S extends boolean | null | undefined | HanaPointHistoryDefaultArgs> = $Result.GetResult<Prisma.$HanaPointHistoryPayload, S>

  type HanaPointHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<HanaPointHistoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: HanaPointHistoryCountAggregateInputType | true
    }

  export interface HanaPointHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['HanaPointHistory'], meta: { name: 'HanaPointHistory' } }
    /**
     * Find zero or one HanaPointHistory that matches the filter.
     * @param {HanaPointHistoryFindUniqueArgs} args - Arguments to find a HanaPointHistory
     * @example
     * // Get one HanaPointHistory
     * const hanaPointHistory = await prisma.hanaPointHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HanaPointHistoryFindUniqueArgs>(args: SelectSubset<T, HanaPointHistoryFindUniqueArgs<ExtArgs>>): Prisma__HanaPointHistoryClient<$Result.GetResult<Prisma.$HanaPointHistoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one HanaPointHistory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {HanaPointHistoryFindUniqueOrThrowArgs} args - Arguments to find a HanaPointHistory
     * @example
     * // Get one HanaPointHistory
     * const hanaPointHistory = await prisma.hanaPointHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HanaPointHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, HanaPointHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HanaPointHistoryClient<$Result.GetResult<Prisma.$HanaPointHistoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HanaPointHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointHistoryFindFirstArgs} args - Arguments to find a HanaPointHistory
     * @example
     * // Get one HanaPointHistory
     * const hanaPointHistory = await prisma.hanaPointHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HanaPointHistoryFindFirstArgs>(args?: SelectSubset<T, HanaPointHistoryFindFirstArgs<ExtArgs>>): Prisma__HanaPointHistoryClient<$Result.GetResult<Prisma.$HanaPointHistoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HanaPointHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointHistoryFindFirstOrThrowArgs} args - Arguments to find a HanaPointHistory
     * @example
     * // Get one HanaPointHistory
     * const hanaPointHistory = await prisma.hanaPointHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HanaPointHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, HanaPointHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__HanaPointHistoryClient<$Result.GetResult<Prisma.$HanaPointHistoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more HanaPointHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all HanaPointHistories
     * const hanaPointHistories = await prisma.hanaPointHistory.findMany()
     * 
     * // Get first 10 HanaPointHistories
     * const hanaPointHistories = await prisma.hanaPointHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const hanaPointHistoryWithIdOnly = await prisma.hanaPointHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HanaPointHistoryFindManyArgs>(args?: SelectSubset<T, HanaPointHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HanaPointHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a HanaPointHistory.
     * @param {HanaPointHistoryCreateArgs} args - Arguments to create a HanaPointHistory.
     * @example
     * // Create one HanaPointHistory
     * const HanaPointHistory = await prisma.hanaPointHistory.create({
     *   data: {
     *     // ... data to create a HanaPointHistory
     *   }
     * })
     * 
     */
    create<T extends HanaPointHistoryCreateArgs>(args: SelectSubset<T, HanaPointHistoryCreateArgs<ExtArgs>>): Prisma__HanaPointHistoryClient<$Result.GetResult<Prisma.$HanaPointHistoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many HanaPointHistories.
     * @param {HanaPointHistoryCreateManyArgs} args - Arguments to create many HanaPointHistories.
     * @example
     * // Create many HanaPointHistories
     * const hanaPointHistory = await prisma.hanaPointHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HanaPointHistoryCreateManyArgs>(args?: SelectSubset<T, HanaPointHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a HanaPointHistory.
     * @param {HanaPointHistoryDeleteArgs} args - Arguments to delete one HanaPointHistory.
     * @example
     * // Delete one HanaPointHistory
     * const HanaPointHistory = await prisma.hanaPointHistory.delete({
     *   where: {
     *     // ... filter to delete one HanaPointHistory
     *   }
     * })
     * 
     */
    delete<T extends HanaPointHistoryDeleteArgs>(args: SelectSubset<T, HanaPointHistoryDeleteArgs<ExtArgs>>): Prisma__HanaPointHistoryClient<$Result.GetResult<Prisma.$HanaPointHistoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one HanaPointHistory.
     * @param {HanaPointHistoryUpdateArgs} args - Arguments to update one HanaPointHistory.
     * @example
     * // Update one HanaPointHistory
     * const hanaPointHistory = await prisma.hanaPointHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HanaPointHistoryUpdateArgs>(args: SelectSubset<T, HanaPointHistoryUpdateArgs<ExtArgs>>): Prisma__HanaPointHistoryClient<$Result.GetResult<Prisma.$HanaPointHistoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more HanaPointHistories.
     * @param {HanaPointHistoryDeleteManyArgs} args - Arguments to filter HanaPointHistories to delete.
     * @example
     * // Delete a few HanaPointHistories
     * const { count } = await prisma.hanaPointHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HanaPointHistoryDeleteManyArgs>(args?: SelectSubset<T, HanaPointHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HanaPointHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many HanaPointHistories
     * const hanaPointHistory = await prisma.hanaPointHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HanaPointHistoryUpdateManyArgs>(args: SelectSubset<T, HanaPointHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one HanaPointHistory.
     * @param {HanaPointHistoryUpsertArgs} args - Arguments to update or create a HanaPointHistory.
     * @example
     * // Update or create a HanaPointHistory
     * const hanaPointHistory = await prisma.hanaPointHistory.upsert({
     *   create: {
     *     // ... data to create a HanaPointHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the HanaPointHistory we want to update
     *   }
     * })
     */
    upsert<T extends HanaPointHistoryUpsertArgs>(args: SelectSubset<T, HanaPointHistoryUpsertArgs<ExtArgs>>): Prisma__HanaPointHistoryClient<$Result.GetResult<Prisma.$HanaPointHistoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of HanaPointHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointHistoryCountArgs} args - Arguments to filter HanaPointHistories to count.
     * @example
     * // Count the number of HanaPointHistories
     * const count = await prisma.hanaPointHistory.count({
     *   where: {
     *     // ... the filter for the HanaPointHistories we want to count
     *   }
     * })
    **/
    count<T extends HanaPointHistoryCountArgs>(
      args?: Subset<T, HanaPointHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HanaPointHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a HanaPointHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HanaPointHistoryAggregateArgs>(args: Subset<T, HanaPointHistoryAggregateArgs>): Prisma.PrismaPromise<GetHanaPointHistoryAggregateType<T>>

    /**
     * Group by HanaPointHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HanaPointHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HanaPointHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HanaPointHistoryGroupByArgs['orderBy'] }
        : { orderBy?: HanaPointHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HanaPointHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHanaPointHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the HanaPointHistory model
   */
  readonly fields: HanaPointHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for HanaPointHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HanaPointHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    point<T extends HanaPointDefaultArgs<ExtArgs> = {}>(args?: Subset<T, HanaPointDefaultArgs<ExtArgs>>): Prisma__HanaPointClient<$Result.GetResult<Prisma.$HanaPointPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the HanaPointHistory model
   */
  interface HanaPointHistoryFieldRefs {
    readonly id: FieldRef<"HanaPointHistory", 'String'>
    readonly pointId: FieldRef<"HanaPointHistory", 'String'>
    readonly type: FieldRef<"HanaPointHistory", 'PointType'>
    readonly amount: FieldRef<"HanaPointHistory", 'Int'>
    readonly balance: FieldRef<"HanaPointHistory", 'Int'>
    readonly description: FieldRef<"HanaPointHistory", 'String'>
    readonly sourceSystem: FieldRef<"HanaPointHistory", 'String'>
    readonly sourceId: FieldRef<"HanaPointHistory", 'String'>
    readonly expiresAt: FieldRef<"HanaPointHistory", 'DateTime'>
    readonly createdAt: FieldRef<"HanaPointHistory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * HanaPointHistory findUnique
   */
  export type HanaPointHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPointHistory
     */
    select?: HanaPointHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPointHistory
     */
    omit?: HanaPointHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointHistoryInclude<ExtArgs> | null
    /**
     * Filter, which HanaPointHistory to fetch.
     */
    where: HanaPointHistoryWhereUniqueInput
  }

  /**
   * HanaPointHistory findUniqueOrThrow
   */
  export type HanaPointHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPointHistory
     */
    select?: HanaPointHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPointHistory
     */
    omit?: HanaPointHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointHistoryInclude<ExtArgs> | null
    /**
     * Filter, which HanaPointHistory to fetch.
     */
    where: HanaPointHistoryWhereUniqueInput
  }

  /**
   * HanaPointHistory findFirst
   */
  export type HanaPointHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPointHistory
     */
    select?: HanaPointHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPointHistory
     */
    omit?: HanaPointHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointHistoryInclude<ExtArgs> | null
    /**
     * Filter, which HanaPointHistory to fetch.
     */
    where?: HanaPointHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HanaPointHistories to fetch.
     */
    orderBy?: HanaPointHistoryOrderByWithRelationInput | HanaPointHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HanaPointHistories.
     */
    cursor?: HanaPointHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HanaPointHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HanaPointHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HanaPointHistories.
     */
    distinct?: HanaPointHistoryScalarFieldEnum | HanaPointHistoryScalarFieldEnum[]
  }

  /**
   * HanaPointHistory findFirstOrThrow
   */
  export type HanaPointHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPointHistory
     */
    select?: HanaPointHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPointHistory
     */
    omit?: HanaPointHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointHistoryInclude<ExtArgs> | null
    /**
     * Filter, which HanaPointHistory to fetch.
     */
    where?: HanaPointHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HanaPointHistories to fetch.
     */
    orderBy?: HanaPointHistoryOrderByWithRelationInput | HanaPointHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HanaPointHistories.
     */
    cursor?: HanaPointHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HanaPointHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HanaPointHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HanaPointHistories.
     */
    distinct?: HanaPointHistoryScalarFieldEnum | HanaPointHistoryScalarFieldEnum[]
  }

  /**
   * HanaPointHistory findMany
   */
  export type HanaPointHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPointHistory
     */
    select?: HanaPointHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPointHistory
     */
    omit?: HanaPointHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointHistoryInclude<ExtArgs> | null
    /**
     * Filter, which HanaPointHistories to fetch.
     */
    where?: HanaPointHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HanaPointHistories to fetch.
     */
    orderBy?: HanaPointHistoryOrderByWithRelationInput | HanaPointHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing HanaPointHistories.
     */
    cursor?: HanaPointHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HanaPointHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HanaPointHistories.
     */
    skip?: number
    distinct?: HanaPointHistoryScalarFieldEnum | HanaPointHistoryScalarFieldEnum[]
  }

  /**
   * HanaPointHistory create
   */
  export type HanaPointHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPointHistory
     */
    select?: HanaPointHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPointHistory
     */
    omit?: HanaPointHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointHistoryInclude<ExtArgs> | null
    /**
     * The data needed to create a HanaPointHistory.
     */
    data: XOR<HanaPointHistoryCreateInput, HanaPointHistoryUncheckedCreateInput>
  }

  /**
   * HanaPointHistory createMany
   */
  export type HanaPointHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many HanaPointHistories.
     */
    data: HanaPointHistoryCreateManyInput | HanaPointHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * HanaPointHistory update
   */
  export type HanaPointHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPointHistory
     */
    select?: HanaPointHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPointHistory
     */
    omit?: HanaPointHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointHistoryInclude<ExtArgs> | null
    /**
     * The data needed to update a HanaPointHistory.
     */
    data: XOR<HanaPointHistoryUpdateInput, HanaPointHistoryUncheckedUpdateInput>
    /**
     * Choose, which HanaPointHistory to update.
     */
    where: HanaPointHistoryWhereUniqueInput
  }

  /**
   * HanaPointHistory updateMany
   */
  export type HanaPointHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update HanaPointHistories.
     */
    data: XOR<HanaPointHistoryUpdateManyMutationInput, HanaPointHistoryUncheckedUpdateManyInput>
    /**
     * Filter which HanaPointHistories to update
     */
    where?: HanaPointHistoryWhereInput
    /**
     * Limit how many HanaPointHistories to update.
     */
    limit?: number
  }

  /**
   * HanaPointHistory upsert
   */
  export type HanaPointHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPointHistory
     */
    select?: HanaPointHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPointHistory
     */
    omit?: HanaPointHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointHistoryInclude<ExtArgs> | null
    /**
     * The filter to search for the HanaPointHistory to update in case it exists.
     */
    where: HanaPointHistoryWhereUniqueInput
    /**
     * In case the HanaPointHistory found by the `where` argument doesn't exist, create a new HanaPointHistory with this data.
     */
    create: XOR<HanaPointHistoryCreateInput, HanaPointHistoryUncheckedCreateInput>
    /**
     * In case the HanaPointHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HanaPointHistoryUpdateInput, HanaPointHistoryUncheckedUpdateInput>
  }

  /**
   * HanaPointHistory delete
   */
  export type HanaPointHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPointHistory
     */
    select?: HanaPointHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPointHistory
     */
    omit?: HanaPointHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointHistoryInclude<ExtArgs> | null
    /**
     * Filter which HanaPointHistory to delete.
     */
    where: HanaPointHistoryWhereUniqueInput
  }

  /**
   * HanaPointHistory deleteMany
   */
  export type HanaPointHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HanaPointHistories to delete
     */
    where?: HanaPointHistoryWhereInput
    /**
     * Limit how many HanaPointHistories to delete.
     */
    limit?: number
  }

  /**
   * HanaPointHistory without action
   */
  export type HanaPointHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HanaPointHistory
     */
    select?: HanaPointHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the HanaPointHistory
     */
    omit?: HanaPointHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HanaPointHistoryInclude<ExtArgs> | null
  }


  /**
   * Model Attendance
   */

  export type AggregateAttendance = {
    _count: AttendanceCountAggregateOutputType | null
    _avg: AttendanceAvgAggregateOutputType | null
    _sum: AttendanceSumAggregateOutputType | null
    _min: AttendanceMinAggregateOutputType | null
    _max: AttendanceMaxAggregateOutputType | null
  }

  export type AttendanceAvgAggregateOutputType = {
    points: number | null
  }

  export type AttendanceSumAggregateOutputType = {
    points: number | null
  }

  export type AttendanceMinAggregateOutputType = {
    id: string | null
    userId: string | null
    date: string | null
    points: number | null
    createdAt: Date | null
  }

  export type AttendanceMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    date: string | null
    points: number | null
    createdAt: Date | null
  }

  export type AttendanceCountAggregateOutputType = {
    id: number
    userId: number
    date: number
    points: number
    createdAt: number
    _all: number
  }


  export type AttendanceAvgAggregateInputType = {
    points?: true
  }

  export type AttendanceSumAggregateInputType = {
    points?: true
  }

  export type AttendanceMinAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    points?: true
    createdAt?: true
  }

  export type AttendanceMaxAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    points?: true
    createdAt?: true
  }

  export type AttendanceCountAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    points?: true
    createdAt?: true
    _all?: true
  }

  export type AttendanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attendance to aggregate.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Attendances
    **/
    _count?: true | AttendanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AttendanceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AttendanceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AttendanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AttendanceMaxAggregateInputType
  }

  export type GetAttendanceAggregateType<T extends AttendanceAggregateArgs> = {
        [P in keyof T & keyof AggregateAttendance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAttendance[P]>
      : GetScalarType<T[P], AggregateAttendance[P]>
  }




  export type AttendanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttendanceWhereInput
    orderBy?: AttendanceOrderByWithAggregationInput | AttendanceOrderByWithAggregationInput[]
    by: AttendanceScalarFieldEnum[] | AttendanceScalarFieldEnum
    having?: AttendanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AttendanceCountAggregateInputType | true
    _avg?: AttendanceAvgAggregateInputType
    _sum?: AttendanceSumAggregateInputType
    _min?: AttendanceMinAggregateInputType
    _max?: AttendanceMaxAggregateInputType
  }

  export type AttendanceGroupByOutputType = {
    id: string
    userId: string
    date: string
    points: number
    createdAt: Date
    _count: AttendanceCountAggregateOutputType | null
    _avg: AttendanceAvgAggregateOutputType | null
    _sum: AttendanceSumAggregateOutputType | null
    _min: AttendanceMinAggregateOutputType | null
    _max: AttendanceMaxAggregateOutputType | null
  }

  type GetAttendanceGroupByPayload<T extends AttendanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AttendanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AttendanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AttendanceGroupByOutputType[P]>
            : GetScalarType<T[P], AttendanceGroupByOutputType[P]>
        }
      >
    >


  export type AttendanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    date?: boolean
    points?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["attendance"]>



  export type AttendanceSelectScalar = {
    id?: boolean
    userId?: boolean
    date?: boolean
    points?: boolean
    createdAt?: boolean
  }

  export type AttendanceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "date" | "points" | "createdAt", ExtArgs["result"]["attendance"]>

  export type $AttendancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Attendance"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      date: string
      points: number
      createdAt: Date
    }, ExtArgs["result"]["attendance"]>
    composites: {}
  }

  type AttendanceGetPayload<S extends boolean | null | undefined | AttendanceDefaultArgs> = $Result.GetResult<Prisma.$AttendancePayload, S>

  type AttendanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AttendanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AttendanceCountAggregateInputType | true
    }

  export interface AttendanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Attendance'], meta: { name: 'Attendance' } }
    /**
     * Find zero or one Attendance that matches the filter.
     * @param {AttendanceFindUniqueArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AttendanceFindUniqueArgs>(args: SelectSubset<T, AttendanceFindUniqueArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Attendance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AttendanceFindUniqueOrThrowArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AttendanceFindUniqueOrThrowArgs>(args: SelectSubset<T, AttendanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attendance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindFirstArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AttendanceFindFirstArgs>(args?: SelectSubset<T, AttendanceFindFirstArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attendance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindFirstOrThrowArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AttendanceFindFirstOrThrowArgs>(args?: SelectSubset<T, AttendanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Attendances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Attendances
     * const attendances = await prisma.attendance.findMany()
     * 
     * // Get first 10 Attendances
     * const attendances = await prisma.attendance.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const attendanceWithIdOnly = await prisma.attendance.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AttendanceFindManyArgs>(args?: SelectSubset<T, AttendanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Attendance.
     * @param {AttendanceCreateArgs} args - Arguments to create a Attendance.
     * @example
     * // Create one Attendance
     * const Attendance = await prisma.attendance.create({
     *   data: {
     *     // ... data to create a Attendance
     *   }
     * })
     * 
     */
    create<T extends AttendanceCreateArgs>(args: SelectSubset<T, AttendanceCreateArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Attendances.
     * @param {AttendanceCreateManyArgs} args - Arguments to create many Attendances.
     * @example
     * // Create many Attendances
     * const attendance = await prisma.attendance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AttendanceCreateManyArgs>(args?: SelectSubset<T, AttendanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Attendance.
     * @param {AttendanceDeleteArgs} args - Arguments to delete one Attendance.
     * @example
     * // Delete one Attendance
     * const Attendance = await prisma.attendance.delete({
     *   where: {
     *     // ... filter to delete one Attendance
     *   }
     * })
     * 
     */
    delete<T extends AttendanceDeleteArgs>(args: SelectSubset<T, AttendanceDeleteArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Attendance.
     * @param {AttendanceUpdateArgs} args - Arguments to update one Attendance.
     * @example
     * // Update one Attendance
     * const attendance = await prisma.attendance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AttendanceUpdateArgs>(args: SelectSubset<T, AttendanceUpdateArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Attendances.
     * @param {AttendanceDeleteManyArgs} args - Arguments to filter Attendances to delete.
     * @example
     * // Delete a few Attendances
     * const { count } = await prisma.attendance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AttendanceDeleteManyArgs>(args?: SelectSubset<T, AttendanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attendances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Attendances
     * const attendance = await prisma.attendance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AttendanceUpdateManyArgs>(args: SelectSubset<T, AttendanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Attendance.
     * @param {AttendanceUpsertArgs} args - Arguments to update or create a Attendance.
     * @example
     * // Update or create a Attendance
     * const attendance = await prisma.attendance.upsert({
     *   create: {
     *     // ... data to create a Attendance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Attendance we want to update
     *   }
     * })
     */
    upsert<T extends AttendanceUpsertArgs>(args: SelectSubset<T, AttendanceUpsertArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Attendances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceCountArgs} args - Arguments to filter Attendances to count.
     * @example
     * // Count the number of Attendances
     * const count = await prisma.attendance.count({
     *   where: {
     *     // ... the filter for the Attendances we want to count
     *   }
     * })
    **/
    count<T extends AttendanceCountArgs>(
      args?: Subset<T, AttendanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AttendanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Attendance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AttendanceAggregateArgs>(args: Subset<T, AttendanceAggregateArgs>): Prisma.PrismaPromise<GetAttendanceAggregateType<T>>

    /**
     * Group by Attendance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AttendanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AttendanceGroupByArgs['orderBy'] }
        : { orderBy?: AttendanceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AttendanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttendanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Attendance model
   */
  readonly fields: AttendanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Attendance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AttendanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Attendance model
   */
  interface AttendanceFieldRefs {
    readonly id: FieldRef<"Attendance", 'String'>
    readonly userId: FieldRef<"Attendance", 'String'>
    readonly date: FieldRef<"Attendance", 'String'>
    readonly points: FieldRef<"Attendance", 'Int'>
    readonly createdAt: FieldRef<"Attendance", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Attendance findUnique
   */
  export type AttendanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance findUniqueOrThrow
   */
  export type AttendanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance findFirst
   */
  export type AttendanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attendances.
     */
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance findFirstOrThrow
   */
  export type AttendanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attendances.
     */
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance findMany
   */
  export type AttendanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Filter, which Attendances to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance create
   */
  export type AttendanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * The data needed to create a Attendance.
     */
    data: XOR<AttendanceCreateInput, AttendanceUncheckedCreateInput>
  }

  /**
   * Attendance createMany
   */
  export type AttendanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Attendances.
     */
    data: AttendanceCreateManyInput | AttendanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Attendance update
   */
  export type AttendanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * The data needed to update a Attendance.
     */
    data: XOR<AttendanceUpdateInput, AttendanceUncheckedUpdateInput>
    /**
     * Choose, which Attendance to update.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance updateMany
   */
  export type AttendanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Attendances.
     */
    data: XOR<AttendanceUpdateManyMutationInput, AttendanceUncheckedUpdateManyInput>
    /**
     * Filter which Attendances to update
     */
    where?: AttendanceWhereInput
    /**
     * Limit how many Attendances to update.
     */
    limit?: number
  }

  /**
   * Attendance upsert
   */
  export type AttendanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * The filter to search for the Attendance to update in case it exists.
     */
    where: AttendanceWhereUniqueInput
    /**
     * In case the Attendance found by the `where` argument doesn't exist, create a new Attendance with this data.
     */
    create: XOR<AttendanceCreateInput, AttendanceUncheckedCreateInput>
    /**
     * In case the Attendance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AttendanceUpdateInput, AttendanceUncheckedUpdateInput>
  }

  /**
   * Attendance delete
   */
  export type AttendanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Filter which Attendance to delete.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance deleteMany
   */
  export type AttendanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attendances to delete
     */
    where?: AttendanceWhereInput
    /**
     * Limit how many Attendances to delete.
     */
    limit?: number
  }

  /**
   * Attendance without action
   */
  export type AttendanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const HanaPointScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    ssn: 'ssn',
    phone: 'phone',
    balance: 'balance',
    totalEarned: 'totalEarned',
    totalUsed: 'totalUsed',
    isLinked: 'isLinked',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type HanaPointScalarFieldEnum = (typeof HanaPointScalarFieldEnum)[keyof typeof HanaPointScalarFieldEnum]


  export const HanaPointHistoryScalarFieldEnum: {
    id: 'id',
    pointId: 'pointId',
    type: 'type',
    amount: 'amount',
    balance: 'balance',
    description: 'description',
    sourceSystem: 'sourceSystem',
    sourceId: 'sourceId',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type HanaPointHistoryScalarFieldEnum = (typeof HanaPointHistoryScalarFieldEnum)[keyof typeof HanaPointHistoryScalarFieldEnum]


  export const AttendanceScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    date: 'date',
    points: 'points',
    createdAt: 'createdAt'
  };

  export type AttendanceScalarFieldEnum = (typeof AttendanceScalarFieldEnum)[keyof typeof AttendanceScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const HanaPointOrderByRelevanceFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    ssn: 'ssn',
    phone: 'phone'
  };

  export type HanaPointOrderByRelevanceFieldEnum = (typeof HanaPointOrderByRelevanceFieldEnum)[keyof typeof HanaPointOrderByRelevanceFieldEnum]


  export const HanaPointHistoryOrderByRelevanceFieldEnum: {
    id: 'id',
    pointId: 'pointId',
    description: 'description',
    sourceSystem: 'sourceSystem',
    sourceId: 'sourceId'
  };

  export type HanaPointHistoryOrderByRelevanceFieldEnum = (typeof HanaPointHistoryOrderByRelevanceFieldEnum)[keyof typeof HanaPointHistoryOrderByRelevanceFieldEnum]


  export const AttendanceOrderByRelevanceFieldEnum: {
    id: 'id',
    userId: 'userId',
    date: 'date'
  };

  export type AttendanceOrderByRelevanceFieldEnum = (typeof AttendanceOrderByRelevanceFieldEnum)[keyof typeof AttendanceOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'PointType'
   */
  export type EnumPointTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PointType'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type HanaPointWhereInput = {
    AND?: HanaPointWhereInput | HanaPointWhereInput[]
    OR?: HanaPointWhereInput[]
    NOT?: HanaPointWhereInput | HanaPointWhereInput[]
    id?: StringFilter<"HanaPoint"> | string
    userId?: StringNullableFilter<"HanaPoint"> | string | null
    name?: StringFilter<"HanaPoint"> | string
    ssn?: StringFilter<"HanaPoint"> | string
    phone?: StringFilter<"HanaPoint"> | string
    balance?: IntFilter<"HanaPoint"> | number
    totalEarned?: IntFilter<"HanaPoint"> | number
    totalUsed?: IntFilter<"HanaPoint"> | number
    isLinked?: BoolFilter<"HanaPoint"> | boolean
    createdAt?: DateTimeFilter<"HanaPoint"> | Date | string
    updatedAt?: DateTimeFilter<"HanaPoint"> | Date | string
    histories?: HanaPointHistoryListRelationFilter
  }

  export type HanaPointOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    name?: SortOrder
    ssn?: SortOrder
    phone?: SortOrder
    balance?: SortOrder
    totalEarned?: SortOrder
    totalUsed?: SortOrder
    isLinked?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    histories?: HanaPointHistoryOrderByRelationAggregateInput
    _relevance?: HanaPointOrderByRelevanceInput
  }

  export type HanaPointWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    ssn?: string
    AND?: HanaPointWhereInput | HanaPointWhereInput[]
    OR?: HanaPointWhereInput[]
    NOT?: HanaPointWhereInput | HanaPointWhereInput[]
    name?: StringFilter<"HanaPoint"> | string
    phone?: StringFilter<"HanaPoint"> | string
    balance?: IntFilter<"HanaPoint"> | number
    totalEarned?: IntFilter<"HanaPoint"> | number
    totalUsed?: IntFilter<"HanaPoint"> | number
    isLinked?: BoolFilter<"HanaPoint"> | boolean
    createdAt?: DateTimeFilter<"HanaPoint"> | Date | string
    updatedAt?: DateTimeFilter<"HanaPoint"> | Date | string
    histories?: HanaPointHistoryListRelationFilter
  }, "id" | "userId" | "ssn">

  export type HanaPointOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    name?: SortOrder
    ssn?: SortOrder
    phone?: SortOrder
    balance?: SortOrder
    totalEarned?: SortOrder
    totalUsed?: SortOrder
    isLinked?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: HanaPointCountOrderByAggregateInput
    _avg?: HanaPointAvgOrderByAggregateInput
    _max?: HanaPointMaxOrderByAggregateInput
    _min?: HanaPointMinOrderByAggregateInput
    _sum?: HanaPointSumOrderByAggregateInput
  }

  export type HanaPointScalarWhereWithAggregatesInput = {
    AND?: HanaPointScalarWhereWithAggregatesInput | HanaPointScalarWhereWithAggregatesInput[]
    OR?: HanaPointScalarWhereWithAggregatesInput[]
    NOT?: HanaPointScalarWhereWithAggregatesInput | HanaPointScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"HanaPoint"> | string
    userId?: StringNullableWithAggregatesFilter<"HanaPoint"> | string | null
    name?: StringWithAggregatesFilter<"HanaPoint"> | string
    ssn?: StringWithAggregatesFilter<"HanaPoint"> | string
    phone?: StringWithAggregatesFilter<"HanaPoint"> | string
    balance?: IntWithAggregatesFilter<"HanaPoint"> | number
    totalEarned?: IntWithAggregatesFilter<"HanaPoint"> | number
    totalUsed?: IntWithAggregatesFilter<"HanaPoint"> | number
    isLinked?: BoolWithAggregatesFilter<"HanaPoint"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"HanaPoint"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"HanaPoint"> | Date | string
  }

  export type HanaPointHistoryWhereInput = {
    AND?: HanaPointHistoryWhereInput | HanaPointHistoryWhereInput[]
    OR?: HanaPointHistoryWhereInput[]
    NOT?: HanaPointHistoryWhereInput | HanaPointHistoryWhereInput[]
    id?: StringFilter<"HanaPointHistory"> | string
    pointId?: StringFilter<"HanaPointHistory"> | string
    type?: EnumPointTypeFilter<"HanaPointHistory"> | $Enums.PointType
    amount?: IntFilter<"HanaPointHistory"> | number
    balance?: IntFilter<"HanaPointHistory"> | number
    description?: StringFilter<"HanaPointHistory"> | string
    sourceSystem?: StringFilter<"HanaPointHistory"> | string
    sourceId?: StringNullableFilter<"HanaPointHistory"> | string | null
    expiresAt?: DateTimeNullableFilter<"HanaPointHistory"> | Date | string | null
    createdAt?: DateTimeFilter<"HanaPointHistory"> | Date | string
    point?: XOR<HanaPointScalarRelationFilter, HanaPointWhereInput>
  }

  export type HanaPointHistoryOrderByWithRelationInput = {
    id?: SortOrder
    pointId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    balance?: SortOrder
    description?: SortOrder
    sourceSystem?: SortOrder
    sourceId?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    point?: HanaPointOrderByWithRelationInput
    _relevance?: HanaPointHistoryOrderByRelevanceInput
  }

  export type HanaPointHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: HanaPointHistoryWhereInput | HanaPointHistoryWhereInput[]
    OR?: HanaPointHistoryWhereInput[]
    NOT?: HanaPointHistoryWhereInput | HanaPointHistoryWhereInput[]
    pointId?: StringFilter<"HanaPointHistory"> | string
    type?: EnumPointTypeFilter<"HanaPointHistory"> | $Enums.PointType
    amount?: IntFilter<"HanaPointHistory"> | number
    balance?: IntFilter<"HanaPointHistory"> | number
    description?: StringFilter<"HanaPointHistory"> | string
    sourceSystem?: StringFilter<"HanaPointHistory"> | string
    sourceId?: StringNullableFilter<"HanaPointHistory"> | string | null
    expiresAt?: DateTimeNullableFilter<"HanaPointHistory"> | Date | string | null
    createdAt?: DateTimeFilter<"HanaPointHistory"> | Date | string
    point?: XOR<HanaPointScalarRelationFilter, HanaPointWhereInput>
  }, "id">

  export type HanaPointHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    pointId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    balance?: SortOrder
    description?: SortOrder
    sourceSystem?: SortOrder
    sourceId?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: HanaPointHistoryCountOrderByAggregateInput
    _avg?: HanaPointHistoryAvgOrderByAggregateInput
    _max?: HanaPointHistoryMaxOrderByAggregateInput
    _min?: HanaPointHistoryMinOrderByAggregateInput
    _sum?: HanaPointHistorySumOrderByAggregateInput
  }

  export type HanaPointHistoryScalarWhereWithAggregatesInput = {
    AND?: HanaPointHistoryScalarWhereWithAggregatesInput | HanaPointHistoryScalarWhereWithAggregatesInput[]
    OR?: HanaPointHistoryScalarWhereWithAggregatesInput[]
    NOT?: HanaPointHistoryScalarWhereWithAggregatesInput | HanaPointHistoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"HanaPointHistory"> | string
    pointId?: StringWithAggregatesFilter<"HanaPointHistory"> | string
    type?: EnumPointTypeWithAggregatesFilter<"HanaPointHistory"> | $Enums.PointType
    amount?: IntWithAggregatesFilter<"HanaPointHistory"> | number
    balance?: IntWithAggregatesFilter<"HanaPointHistory"> | number
    description?: StringWithAggregatesFilter<"HanaPointHistory"> | string
    sourceSystem?: StringWithAggregatesFilter<"HanaPointHistory"> | string
    sourceId?: StringNullableWithAggregatesFilter<"HanaPointHistory"> | string | null
    expiresAt?: DateTimeNullableWithAggregatesFilter<"HanaPointHistory"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"HanaPointHistory"> | Date | string
  }

  export type AttendanceWhereInput = {
    AND?: AttendanceWhereInput | AttendanceWhereInput[]
    OR?: AttendanceWhereInput[]
    NOT?: AttendanceWhereInput | AttendanceWhereInput[]
    id?: StringFilter<"Attendance"> | string
    userId?: StringFilter<"Attendance"> | string
    date?: StringFilter<"Attendance"> | string
    points?: IntFilter<"Attendance"> | number
    createdAt?: DateTimeFilter<"Attendance"> | Date | string
  }

  export type AttendanceOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    points?: SortOrder
    createdAt?: SortOrder
    _relevance?: AttendanceOrderByRelevanceInput
  }

  export type AttendanceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_date?: AttendanceUserIdDateCompoundUniqueInput
    AND?: AttendanceWhereInput | AttendanceWhereInput[]
    OR?: AttendanceWhereInput[]
    NOT?: AttendanceWhereInput | AttendanceWhereInput[]
    userId?: StringFilter<"Attendance"> | string
    date?: StringFilter<"Attendance"> | string
    points?: IntFilter<"Attendance"> | number
    createdAt?: DateTimeFilter<"Attendance"> | Date | string
  }, "id" | "userId_date">

  export type AttendanceOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    points?: SortOrder
    createdAt?: SortOrder
    _count?: AttendanceCountOrderByAggregateInput
    _avg?: AttendanceAvgOrderByAggregateInput
    _max?: AttendanceMaxOrderByAggregateInput
    _min?: AttendanceMinOrderByAggregateInput
    _sum?: AttendanceSumOrderByAggregateInput
  }

  export type AttendanceScalarWhereWithAggregatesInput = {
    AND?: AttendanceScalarWhereWithAggregatesInput | AttendanceScalarWhereWithAggregatesInput[]
    OR?: AttendanceScalarWhereWithAggregatesInput[]
    NOT?: AttendanceScalarWhereWithAggregatesInput | AttendanceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Attendance"> | string
    userId?: StringWithAggregatesFilter<"Attendance"> | string
    date?: StringWithAggregatesFilter<"Attendance"> | string
    points?: IntWithAggregatesFilter<"Attendance"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Attendance"> | Date | string
  }

  export type HanaPointCreateInput = {
    id?: string
    userId?: string | null
    name: string
    ssn: string
    phone: string
    balance?: number
    totalEarned?: number
    totalUsed?: number
    isLinked?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    histories?: HanaPointHistoryCreateNestedManyWithoutPointInput
  }

  export type HanaPointUncheckedCreateInput = {
    id?: string
    userId?: string | null
    name: string
    ssn: string
    phone: string
    balance?: number
    totalEarned?: number
    totalUsed?: number
    isLinked?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    histories?: HanaPointHistoryUncheckedCreateNestedManyWithoutPointInput
  }

  export type HanaPointUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    ssn?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    balance?: IntFieldUpdateOperationsInput | number
    totalEarned?: IntFieldUpdateOperationsInput | number
    totalUsed?: IntFieldUpdateOperationsInput | number
    isLinked?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    histories?: HanaPointHistoryUpdateManyWithoutPointNestedInput
  }

  export type HanaPointUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    ssn?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    balance?: IntFieldUpdateOperationsInput | number
    totalEarned?: IntFieldUpdateOperationsInput | number
    totalUsed?: IntFieldUpdateOperationsInput | number
    isLinked?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    histories?: HanaPointHistoryUncheckedUpdateManyWithoutPointNestedInput
  }

  export type HanaPointCreateManyInput = {
    id?: string
    userId?: string | null
    name: string
    ssn: string
    phone: string
    balance?: number
    totalEarned?: number
    totalUsed?: number
    isLinked?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type HanaPointUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    ssn?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    balance?: IntFieldUpdateOperationsInput | number
    totalEarned?: IntFieldUpdateOperationsInput | number
    totalUsed?: IntFieldUpdateOperationsInput | number
    isLinked?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HanaPointUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    ssn?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    balance?: IntFieldUpdateOperationsInput | number
    totalEarned?: IntFieldUpdateOperationsInput | number
    totalUsed?: IntFieldUpdateOperationsInput | number
    isLinked?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HanaPointHistoryCreateInput = {
    id?: string
    type: $Enums.PointType
    amount: number
    balance: number
    description: string
    sourceSystem?: string
    sourceId?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    point: HanaPointCreateNestedOneWithoutHistoriesInput
  }

  export type HanaPointHistoryUncheckedCreateInput = {
    id?: string
    pointId: string
    type: $Enums.PointType
    amount: number
    balance: number
    description: string
    sourceSystem?: string
    sourceId?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
  }

  export type HanaPointHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPointTypeFieldUpdateOperationsInput | $Enums.PointType
    amount?: IntFieldUpdateOperationsInput | number
    balance?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    sourceSystem?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    point?: HanaPointUpdateOneRequiredWithoutHistoriesNestedInput
  }

  export type HanaPointHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    pointId?: StringFieldUpdateOperationsInput | string
    type?: EnumPointTypeFieldUpdateOperationsInput | $Enums.PointType
    amount?: IntFieldUpdateOperationsInput | number
    balance?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    sourceSystem?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HanaPointHistoryCreateManyInput = {
    id?: string
    pointId: string
    type: $Enums.PointType
    amount: number
    balance: number
    description: string
    sourceSystem?: string
    sourceId?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
  }

  export type HanaPointHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPointTypeFieldUpdateOperationsInput | $Enums.PointType
    amount?: IntFieldUpdateOperationsInput | number
    balance?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    sourceSystem?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HanaPointHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    pointId?: StringFieldUpdateOperationsInput | string
    type?: EnumPointTypeFieldUpdateOperationsInput | $Enums.PointType
    amount?: IntFieldUpdateOperationsInput | number
    balance?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    sourceSystem?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceCreateInput = {
    id?: string
    userId: string
    date: string
    points: number
    createdAt?: Date | string
  }

  export type AttendanceUncheckedCreateInput = {
    id?: string
    userId: string
    date: string
    points: number
    createdAt?: Date | string
  }

  export type AttendanceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceCreateManyInput = {
    id?: string
    userId: string
    date: string
    points: number
    createdAt?: Date | string
  }

  export type AttendanceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type HanaPointHistoryListRelationFilter = {
    every?: HanaPointHistoryWhereInput
    some?: HanaPointHistoryWhereInput
    none?: HanaPointHistoryWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type HanaPointHistoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type HanaPointOrderByRelevanceInput = {
    fields: HanaPointOrderByRelevanceFieldEnum | HanaPointOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type HanaPointCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    ssn?: SortOrder
    phone?: SortOrder
    balance?: SortOrder
    totalEarned?: SortOrder
    totalUsed?: SortOrder
    isLinked?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type HanaPointAvgOrderByAggregateInput = {
    balance?: SortOrder
    totalEarned?: SortOrder
    totalUsed?: SortOrder
  }

  export type HanaPointMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    ssn?: SortOrder
    phone?: SortOrder
    balance?: SortOrder
    totalEarned?: SortOrder
    totalUsed?: SortOrder
    isLinked?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type HanaPointMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    ssn?: SortOrder
    phone?: SortOrder
    balance?: SortOrder
    totalEarned?: SortOrder
    totalUsed?: SortOrder
    isLinked?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type HanaPointSumOrderByAggregateInput = {
    balance?: SortOrder
    totalEarned?: SortOrder
    totalUsed?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumPointTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PointType | EnumPointTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PointType[]
    notIn?: $Enums.PointType[]
    not?: NestedEnumPointTypeFilter<$PrismaModel> | $Enums.PointType
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type HanaPointScalarRelationFilter = {
    is?: HanaPointWhereInput
    isNot?: HanaPointWhereInput
  }

  export type HanaPointHistoryOrderByRelevanceInput = {
    fields: HanaPointHistoryOrderByRelevanceFieldEnum | HanaPointHistoryOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type HanaPointHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    pointId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    balance?: SortOrder
    description?: SortOrder
    sourceSystem?: SortOrder
    sourceId?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type HanaPointHistoryAvgOrderByAggregateInput = {
    amount?: SortOrder
    balance?: SortOrder
  }

  export type HanaPointHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    pointId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    balance?: SortOrder
    description?: SortOrder
    sourceSystem?: SortOrder
    sourceId?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type HanaPointHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    pointId?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    balance?: SortOrder
    description?: SortOrder
    sourceSystem?: SortOrder
    sourceId?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type HanaPointHistorySumOrderByAggregateInput = {
    amount?: SortOrder
    balance?: SortOrder
  }

  export type EnumPointTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PointType | EnumPointTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PointType[]
    notIn?: $Enums.PointType[]
    not?: NestedEnumPointTypeWithAggregatesFilter<$PrismaModel> | $Enums.PointType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPointTypeFilter<$PrismaModel>
    _max?: NestedEnumPointTypeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type AttendanceOrderByRelevanceInput = {
    fields: AttendanceOrderByRelevanceFieldEnum | AttendanceOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type AttendanceUserIdDateCompoundUniqueInput = {
    userId: string
    date: string
  }

  export type AttendanceCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    points?: SortOrder
    createdAt?: SortOrder
  }

  export type AttendanceAvgOrderByAggregateInput = {
    points?: SortOrder
  }

  export type AttendanceMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    points?: SortOrder
    createdAt?: SortOrder
  }

  export type AttendanceMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    points?: SortOrder
    createdAt?: SortOrder
  }

  export type AttendanceSumOrderByAggregateInput = {
    points?: SortOrder
  }

  export type HanaPointHistoryCreateNestedManyWithoutPointInput = {
    create?: XOR<HanaPointHistoryCreateWithoutPointInput, HanaPointHistoryUncheckedCreateWithoutPointInput> | HanaPointHistoryCreateWithoutPointInput[] | HanaPointHistoryUncheckedCreateWithoutPointInput[]
    connectOrCreate?: HanaPointHistoryCreateOrConnectWithoutPointInput | HanaPointHistoryCreateOrConnectWithoutPointInput[]
    createMany?: HanaPointHistoryCreateManyPointInputEnvelope
    connect?: HanaPointHistoryWhereUniqueInput | HanaPointHistoryWhereUniqueInput[]
  }

  export type HanaPointHistoryUncheckedCreateNestedManyWithoutPointInput = {
    create?: XOR<HanaPointHistoryCreateWithoutPointInput, HanaPointHistoryUncheckedCreateWithoutPointInput> | HanaPointHistoryCreateWithoutPointInput[] | HanaPointHistoryUncheckedCreateWithoutPointInput[]
    connectOrCreate?: HanaPointHistoryCreateOrConnectWithoutPointInput | HanaPointHistoryCreateOrConnectWithoutPointInput[]
    createMany?: HanaPointHistoryCreateManyPointInputEnvelope
    connect?: HanaPointHistoryWhereUniqueInput | HanaPointHistoryWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type HanaPointHistoryUpdateManyWithoutPointNestedInput = {
    create?: XOR<HanaPointHistoryCreateWithoutPointInput, HanaPointHistoryUncheckedCreateWithoutPointInput> | HanaPointHistoryCreateWithoutPointInput[] | HanaPointHistoryUncheckedCreateWithoutPointInput[]
    connectOrCreate?: HanaPointHistoryCreateOrConnectWithoutPointInput | HanaPointHistoryCreateOrConnectWithoutPointInput[]
    upsert?: HanaPointHistoryUpsertWithWhereUniqueWithoutPointInput | HanaPointHistoryUpsertWithWhereUniqueWithoutPointInput[]
    createMany?: HanaPointHistoryCreateManyPointInputEnvelope
    set?: HanaPointHistoryWhereUniqueInput | HanaPointHistoryWhereUniqueInput[]
    disconnect?: HanaPointHistoryWhereUniqueInput | HanaPointHistoryWhereUniqueInput[]
    delete?: HanaPointHistoryWhereUniqueInput | HanaPointHistoryWhereUniqueInput[]
    connect?: HanaPointHistoryWhereUniqueInput | HanaPointHistoryWhereUniqueInput[]
    update?: HanaPointHistoryUpdateWithWhereUniqueWithoutPointInput | HanaPointHistoryUpdateWithWhereUniqueWithoutPointInput[]
    updateMany?: HanaPointHistoryUpdateManyWithWhereWithoutPointInput | HanaPointHistoryUpdateManyWithWhereWithoutPointInput[]
    deleteMany?: HanaPointHistoryScalarWhereInput | HanaPointHistoryScalarWhereInput[]
  }

  export type HanaPointHistoryUncheckedUpdateManyWithoutPointNestedInput = {
    create?: XOR<HanaPointHistoryCreateWithoutPointInput, HanaPointHistoryUncheckedCreateWithoutPointInput> | HanaPointHistoryCreateWithoutPointInput[] | HanaPointHistoryUncheckedCreateWithoutPointInput[]
    connectOrCreate?: HanaPointHistoryCreateOrConnectWithoutPointInput | HanaPointHistoryCreateOrConnectWithoutPointInput[]
    upsert?: HanaPointHistoryUpsertWithWhereUniqueWithoutPointInput | HanaPointHistoryUpsertWithWhereUniqueWithoutPointInput[]
    createMany?: HanaPointHistoryCreateManyPointInputEnvelope
    set?: HanaPointHistoryWhereUniqueInput | HanaPointHistoryWhereUniqueInput[]
    disconnect?: HanaPointHistoryWhereUniqueInput | HanaPointHistoryWhereUniqueInput[]
    delete?: HanaPointHistoryWhereUniqueInput | HanaPointHistoryWhereUniqueInput[]
    connect?: HanaPointHistoryWhereUniqueInput | HanaPointHistoryWhereUniqueInput[]
    update?: HanaPointHistoryUpdateWithWhereUniqueWithoutPointInput | HanaPointHistoryUpdateWithWhereUniqueWithoutPointInput[]
    updateMany?: HanaPointHistoryUpdateManyWithWhereWithoutPointInput | HanaPointHistoryUpdateManyWithWhereWithoutPointInput[]
    deleteMany?: HanaPointHistoryScalarWhereInput | HanaPointHistoryScalarWhereInput[]
  }

  export type HanaPointCreateNestedOneWithoutHistoriesInput = {
    create?: XOR<HanaPointCreateWithoutHistoriesInput, HanaPointUncheckedCreateWithoutHistoriesInput>
    connectOrCreate?: HanaPointCreateOrConnectWithoutHistoriesInput
    connect?: HanaPointWhereUniqueInput
  }

  export type EnumPointTypeFieldUpdateOperationsInput = {
    set?: $Enums.PointType
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type HanaPointUpdateOneRequiredWithoutHistoriesNestedInput = {
    create?: XOR<HanaPointCreateWithoutHistoriesInput, HanaPointUncheckedCreateWithoutHistoriesInput>
    connectOrCreate?: HanaPointCreateOrConnectWithoutHistoriesInput
    upsert?: HanaPointUpsertWithoutHistoriesInput
    connect?: HanaPointWhereUniqueInput
    update?: XOR<XOR<HanaPointUpdateToOneWithWhereWithoutHistoriesInput, HanaPointUpdateWithoutHistoriesInput>, HanaPointUncheckedUpdateWithoutHistoriesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumPointTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PointType | EnumPointTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PointType[]
    notIn?: $Enums.PointType[]
    not?: NestedEnumPointTypeFilter<$PrismaModel> | $Enums.PointType
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumPointTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PointType | EnumPointTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PointType[]
    notIn?: $Enums.PointType[]
    not?: NestedEnumPointTypeWithAggregatesFilter<$PrismaModel> | $Enums.PointType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPointTypeFilter<$PrismaModel>
    _max?: NestedEnumPointTypeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type HanaPointHistoryCreateWithoutPointInput = {
    id?: string
    type: $Enums.PointType
    amount: number
    balance: number
    description: string
    sourceSystem?: string
    sourceId?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
  }

  export type HanaPointHistoryUncheckedCreateWithoutPointInput = {
    id?: string
    type: $Enums.PointType
    amount: number
    balance: number
    description: string
    sourceSystem?: string
    sourceId?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
  }

  export type HanaPointHistoryCreateOrConnectWithoutPointInput = {
    where: HanaPointHistoryWhereUniqueInput
    create: XOR<HanaPointHistoryCreateWithoutPointInput, HanaPointHistoryUncheckedCreateWithoutPointInput>
  }

  export type HanaPointHistoryCreateManyPointInputEnvelope = {
    data: HanaPointHistoryCreateManyPointInput | HanaPointHistoryCreateManyPointInput[]
    skipDuplicates?: boolean
  }

  export type HanaPointHistoryUpsertWithWhereUniqueWithoutPointInput = {
    where: HanaPointHistoryWhereUniqueInput
    update: XOR<HanaPointHistoryUpdateWithoutPointInput, HanaPointHistoryUncheckedUpdateWithoutPointInput>
    create: XOR<HanaPointHistoryCreateWithoutPointInput, HanaPointHistoryUncheckedCreateWithoutPointInput>
  }

  export type HanaPointHistoryUpdateWithWhereUniqueWithoutPointInput = {
    where: HanaPointHistoryWhereUniqueInput
    data: XOR<HanaPointHistoryUpdateWithoutPointInput, HanaPointHistoryUncheckedUpdateWithoutPointInput>
  }

  export type HanaPointHistoryUpdateManyWithWhereWithoutPointInput = {
    where: HanaPointHistoryScalarWhereInput
    data: XOR<HanaPointHistoryUpdateManyMutationInput, HanaPointHistoryUncheckedUpdateManyWithoutPointInput>
  }

  export type HanaPointHistoryScalarWhereInput = {
    AND?: HanaPointHistoryScalarWhereInput | HanaPointHistoryScalarWhereInput[]
    OR?: HanaPointHistoryScalarWhereInput[]
    NOT?: HanaPointHistoryScalarWhereInput | HanaPointHistoryScalarWhereInput[]
    id?: StringFilter<"HanaPointHistory"> | string
    pointId?: StringFilter<"HanaPointHistory"> | string
    type?: EnumPointTypeFilter<"HanaPointHistory"> | $Enums.PointType
    amount?: IntFilter<"HanaPointHistory"> | number
    balance?: IntFilter<"HanaPointHistory"> | number
    description?: StringFilter<"HanaPointHistory"> | string
    sourceSystem?: StringFilter<"HanaPointHistory"> | string
    sourceId?: StringNullableFilter<"HanaPointHistory"> | string | null
    expiresAt?: DateTimeNullableFilter<"HanaPointHistory"> | Date | string | null
    createdAt?: DateTimeFilter<"HanaPointHistory"> | Date | string
  }

  export type HanaPointCreateWithoutHistoriesInput = {
    id?: string
    userId?: string | null
    name: string
    ssn: string
    phone: string
    balance?: number
    totalEarned?: number
    totalUsed?: number
    isLinked?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type HanaPointUncheckedCreateWithoutHistoriesInput = {
    id?: string
    userId?: string | null
    name: string
    ssn: string
    phone: string
    balance?: number
    totalEarned?: number
    totalUsed?: number
    isLinked?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type HanaPointCreateOrConnectWithoutHistoriesInput = {
    where: HanaPointWhereUniqueInput
    create: XOR<HanaPointCreateWithoutHistoriesInput, HanaPointUncheckedCreateWithoutHistoriesInput>
  }

  export type HanaPointUpsertWithoutHistoriesInput = {
    update: XOR<HanaPointUpdateWithoutHistoriesInput, HanaPointUncheckedUpdateWithoutHistoriesInput>
    create: XOR<HanaPointCreateWithoutHistoriesInput, HanaPointUncheckedCreateWithoutHistoriesInput>
    where?: HanaPointWhereInput
  }

  export type HanaPointUpdateToOneWithWhereWithoutHistoriesInput = {
    where?: HanaPointWhereInput
    data: XOR<HanaPointUpdateWithoutHistoriesInput, HanaPointUncheckedUpdateWithoutHistoriesInput>
  }

  export type HanaPointUpdateWithoutHistoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    ssn?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    balance?: IntFieldUpdateOperationsInput | number
    totalEarned?: IntFieldUpdateOperationsInput | number
    totalUsed?: IntFieldUpdateOperationsInput | number
    isLinked?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HanaPointUncheckedUpdateWithoutHistoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    ssn?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    balance?: IntFieldUpdateOperationsInput | number
    totalEarned?: IntFieldUpdateOperationsInput | number
    totalUsed?: IntFieldUpdateOperationsInput | number
    isLinked?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HanaPointHistoryCreateManyPointInput = {
    id?: string
    type: $Enums.PointType
    amount: number
    balance: number
    description: string
    sourceSystem?: string
    sourceId?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
  }

  export type HanaPointHistoryUpdateWithoutPointInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPointTypeFieldUpdateOperationsInput | $Enums.PointType
    amount?: IntFieldUpdateOperationsInput | number
    balance?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    sourceSystem?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HanaPointHistoryUncheckedUpdateWithoutPointInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPointTypeFieldUpdateOperationsInput | $Enums.PointType
    amount?: IntFieldUpdateOperationsInput | number
    balance?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    sourceSystem?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HanaPointHistoryUncheckedUpdateManyWithoutPointInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPointTypeFieldUpdateOperationsInput | $Enums.PointType
    amount?: IntFieldUpdateOperationsInput | number
    balance?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    sourceSystem?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}