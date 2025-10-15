
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
 * Model RealTimePrice
 * 
 */
export type RealTimePrice = $Result.DefaultSelection<Prisma.$RealTimePricePayload>
/**
 * Model DailyPrice
 * 
 */
export type DailyPrice = $Result.DefaultSelection<Prisma.$DailyPricePayload>
/**
 * Model ChartPrice
 * 
 */
export type ChartPrice = $Result.DefaultSelection<Prisma.$ChartPricePayload>
/**
 * Model GoldPrediction
 * 
 */
export type GoldPrediction = $Result.DefaultSelection<Prisma.$GoldPredictionPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more RealTimePrices
 * const realTimePrices = await prisma.realTimePrice.findMany()
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
   * // Fetch zero or more RealTimePrices
   * const realTimePrices = await prisma.realTimePrice.findMany()
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
   * `prisma.realTimePrice`: Exposes CRUD operations for the **RealTimePrice** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RealTimePrices
    * const realTimePrices = await prisma.realTimePrice.findMany()
    * ```
    */
  get realTimePrice(): Prisma.RealTimePriceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dailyPrice`: Exposes CRUD operations for the **DailyPrice** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DailyPrices
    * const dailyPrices = await prisma.dailyPrice.findMany()
    * ```
    */
  get dailyPrice(): Prisma.DailyPriceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.chartPrice`: Exposes CRUD operations for the **ChartPrice** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChartPrices
    * const chartPrices = await prisma.chartPrice.findMany()
    * ```
    */
  get chartPrice(): Prisma.ChartPriceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.goldPrediction`: Exposes CRUD operations for the **GoldPrediction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GoldPredictions
    * const goldPredictions = await prisma.goldPrediction.findMany()
    * ```
    */
  get goldPrediction(): Prisma.GoldPredictionDelegate<ExtArgs, ClientOptions>;
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
    RealTimePrice: 'RealTimePrice',
    DailyPrice: 'DailyPrice',
    ChartPrice: 'ChartPrice',
    GoldPrediction: 'GoldPrediction'
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
      modelProps: "realTimePrice" | "dailyPrice" | "chartPrice" | "goldPrediction"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      RealTimePrice: {
        payload: Prisma.$RealTimePricePayload<ExtArgs>
        fields: Prisma.RealTimePriceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RealTimePriceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RealTimePricePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RealTimePriceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RealTimePricePayload>
          }
          findFirst: {
            args: Prisma.RealTimePriceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RealTimePricePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RealTimePriceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RealTimePricePayload>
          }
          findMany: {
            args: Prisma.RealTimePriceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RealTimePricePayload>[]
          }
          create: {
            args: Prisma.RealTimePriceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RealTimePricePayload>
          }
          createMany: {
            args: Prisma.RealTimePriceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.RealTimePriceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RealTimePricePayload>
          }
          update: {
            args: Prisma.RealTimePriceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RealTimePricePayload>
          }
          deleteMany: {
            args: Prisma.RealTimePriceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RealTimePriceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RealTimePriceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RealTimePricePayload>
          }
          aggregate: {
            args: Prisma.RealTimePriceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRealTimePrice>
          }
          groupBy: {
            args: Prisma.RealTimePriceGroupByArgs<ExtArgs>
            result: $Utils.Optional<RealTimePriceGroupByOutputType>[]
          }
          count: {
            args: Prisma.RealTimePriceCountArgs<ExtArgs>
            result: $Utils.Optional<RealTimePriceCountAggregateOutputType> | number
          }
        }
      }
      DailyPrice: {
        payload: Prisma.$DailyPricePayload<ExtArgs>
        fields: Prisma.DailyPriceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DailyPriceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyPricePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DailyPriceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyPricePayload>
          }
          findFirst: {
            args: Prisma.DailyPriceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyPricePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DailyPriceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyPricePayload>
          }
          findMany: {
            args: Prisma.DailyPriceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyPricePayload>[]
          }
          create: {
            args: Prisma.DailyPriceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyPricePayload>
          }
          createMany: {
            args: Prisma.DailyPriceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.DailyPriceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyPricePayload>
          }
          update: {
            args: Prisma.DailyPriceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyPricePayload>
          }
          deleteMany: {
            args: Prisma.DailyPriceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DailyPriceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DailyPriceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyPricePayload>
          }
          aggregate: {
            args: Prisma.DailyPriceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDailyPrice>
          }
          groupBy: {
            args: Prisma.DailyPriceGroupByArgs<ExtArgs>
            result: $Utils.Optional<DailyPriceGroupByOutputType>[]
          }
          count: {
            args: Prisma.DailyPriceCountArgs<ExtArgs>
            result: $Utils.Optional<DailyPriceCountAggregateOutputType> | number
          }
        }
      }
      ChartPrice: {
        payload: Prisma.$ChartPricePayload<ExtArgs>
        fields: Prisma.ChartPriceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChartPriceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPricePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChartPriceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPricePayload>
          }
          findFirst: {
            args: Prisma.ChartPriceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPricePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChartPriceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPricePayload>
          }
          findMany: {
            args: Prisma.ChartPriceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPricePayload>[]
          }
          create: {
            args: Prisma.ChartPriceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPricePayload>
          }
          createMany: {
            args: Prisma.ChartPriceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ChartPriceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPricePayload>
          }
          update: {
            args: Prisma.ChartPriceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPricePayload>
          }
          deleteMany: {
            args: Prisma.ChartPriceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChartPriceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ChartPriceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChartPricePayload>
          }
          aggregate: {
            args: Prisma.ChartPriceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChartPrice>
          }
          groupBy: {
            args: Prisma.ChartPriceGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChartPriceGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChartPriceCountArgs<ExtArgs>
            result: $Utils.Optional<ChartPriceCountAggregateOutputType> | number
          }
        }
      }
      GoldPrediction: {
        payload: Prisma.$GoldPredictionPayload<ExtArgs>
        fields: Prisma.GoldPredictionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GoldPredictionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoldPredictionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GoldPredictionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoldPredictionPayload>
          }
          findFirst: {
            args: Prisma.GoldPredictionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoldPredictionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GoldPredictionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoldPredictionPayload>
          }
          findMany: {
            args: Prisma.GoldPredictionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoldPredictionPayload>[]
          }
          create: {
            args: Prisma.GoldPredictionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoldPredictionPayload>
          }
          createMany: {
            args: Prisma.GoldPredictionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GoldPredictionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoldPredictionPayload>
          }
          update: {
            args: Prisma.GoldPredictionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoldPredictionPayload>
          }
          deleteMany: {
            args: Prisma.GoldPredictionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GoldPredictionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GoldPredictionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GoldPredictionPayload>
          }
          aggregate: {
            args: Prisma.GoldPredictionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGoldPrediction>
          }
          groupBy: {
            args: Prisma.GoldPredictionGroupByArgs<ExtArgs>
            result: $Utils.Optional<GoldPredictionGroupByOutputType>[]
          }
          count: {
            args: Prisma.GoldPredictionCountArgs<ExtArgs>
            result: $Utils.Optional<GoldPredictionCountAggregateOutputType> | number
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
    realTimePrice?: RealTimePriceOmit
    dailyPrice?: DailyPriceOmit
    chartPrice?: ChartPriceOmit
    goldPrediction?: GoldPredictionOmit
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
   * Models
   */

  /**
   * Model RealTimePrice
   */

  export type AggregateRealTimePrice = {
    _count: RealTimePriceCountAggregateOutputType | null
    _avg: RealTimePriceAvgAggregateOutputType | null
    _sum: RealTimePriceSumAggregateOutputType | null
    _min: RealTimePriceMinAggregateOutputType | null
    _max: RealTimePriceMaxAggregateOutputType | null
  }

  export type RealTimePriceAvgAggregateOutputType = {
    currentPrice: number | null
    changeValue: number | null
    changeRatio: number | null
    isUp: number | null
  }

  export type RealTimePriceSumAggregateOutputType = {
    currentPrice: number | null
    changeValue: number | null
    changeRatio: number | null
    isUp: number | null
  }

  export type RealTimePriceMinAggregateOutputType = {
    id: string | null
    asset: string | null
    currentPrice: number | null
    changeValue: number | null
    changeRatio: number | null
    isUp: number | null
    round: string | null
    time: string | null
    rawDateTime: string | null
    updatedAt: Date | null
    createdAt: Date | null
  }

  export type RealTimePriceMaxAggregateOutputType = {
    id: string | null
    asset: string | null
    currentPrice: number | null
    changeValue: number | null
    changeRatio: number | null
    isUp: number | null
    round: string | null
    time: string | null
    rawDateTime: string | null
    updatedAt: Date | null
    createdAt: Date | null
  }

  export type RealTimePriceCountAggregateOutputType = {
    id: number
    asset: number
    currentPrice: number
    changeValue: number
    changeRatio: number
    isUp: number
    round: number
    time: number
    rawDateTime: number
    updatedAt: number
    createdAt: number
    _all: number
  }


  export type RealTimePriceAvgAggregateInputType = {
    currentPrice?: true
    changeValue?: true
    changeRatio?: true
    isUp?: true
  }

  export type RealTimePriceSumAggregateInputType = {
    currentPrice?: true
    changeValue?: true
    changeRatio?: true
    isUp?: true
  }

  export type RealTimePriceMinAggregateInputType = {
    id?: true
    asset?: true
    currentPrice?: true
    changeValue?: true
    changeRatio?: true
    isUp?: true
    round?: true
    time?: true
    rawDateTime?: true
    updatedAt?: true
    createdAt?: true
  }

  export type RealTimePriceMaxAggregateInputType = {
    id?: true
    asset?: true
    currentPrice?: true
    changeValue?: true
    changeRatio?: true
    isUp?: true
    round?: true
    time?: true
    rawDateTime?: true
    updatedAt?: true
    createdAt?: true
  }

  export type RealTimePriceCountAggregateInputType = {
    id?: true
    asset?: true
    currentPrice?: true
    changeValue?: true
    changeRatio?: true
    isUp?: true
    round?: true
    time?: true
    rawDateTime?: true
    updatedAt?: true
    createdAt?: true
    _all?: true
  }

  export type RealTimePriceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RealTimePrice to aggregate.
     */
    where?: RealTimePriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RealTimePrices to fetch.
     */
    orderBy?: RealTimePriceOrderByWithRelationInput | RealTimePriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RealTimePriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RealTimePrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RealTimePrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RealTimePrices
    **/
    _count?: true | RealTimePriceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RealTimePriceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RealTimePriceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RealTimePriceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RealTimePriceMaxAggregateInputType
  }

  export type GetRealTimePriceAggregateType<T extends RealTimePriceAggregateArgs> = {
        [P in keyof T & keyof AggregateRealTimePrice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRealTimePrice[P]>
      : GetScalarType<T[P], AggregateRealTimePrice[P]>
  }




  export type RealTimePriceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RealTimePriceWhereInput
    orderBy?: RealTimePriceOrderByWithAggregationInput | RealTimePriceOrderByWithAggregationInput[]
    by: RealTimePriceScalarFieldEnum[] | RealTimePriceScalarFieldEnum
    having?: RealTimePriceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RealTimePriceCountAggregateInputType | true
    _avg?: RealTimePriceAvgAggregateInputType
    _sum?: RealTimePriceSumAggregateInputType
    _min?: RealTimePriceMinAggregateInputType
    _max?: RealTimePriceMaxAggregateInputType
  }

  export type RealTimePriceGroupByOutputType = {
    id: string
    asset: string
    currentPrice: number
    changeValue: number
    changeRatio: number
    isUp: number
    round: string
    time: string
    rawDateTime: string
    updatedAt: Date
    createdAt: Date
    _count: RealTimePriceCountAggregateOutputType | null
    _avg: RealTimePriceAvgAggregateOutputType | null
    _sum: RealTimePriceSumAggregateOutputType | null
    _min: RealTimePriceMinAggregateOutputType | null
    _max: RealTimePriceMaxAggregateOutputType | null
  }

  type GetRealTimePriceGroupByPayload<T extends RealTimePriceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RealTimePriceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RealTimePriceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RealTimePriceGroupByOutputType[P]>
            : GetScalarType<T[P], RealTimePriceGroupByOutputType[P]>
        }
      >
    >


  export type RealTimePriceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    asset?: boolean
    currentPrice?: boolean
    changeValue?: boolean
    changeRatio?: boolean
    isUp?: boolean
    round?: boolean
    time?: boolean
    rawDateTime?: boolean
    updatedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["realTimePrice"]>



  export type RealTimePriceSelectScalar = {
    id?: boolean
    asset?: boolean
    currentPrice?: boolean
    changeValue?: boolean
    changeRatio?: boolean
    isUp?: boolean
    round?: boolean
    time?: boolean
    rawDateTime?: boolean
    updatedAt?: boolean
    createdAt?: boolean
  }

  export type RealTimePriceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "asset" | "currentPrice" | "changeValue" | "changeRatio" | "isUp" | "round" | "time" | "rawDateTime" | "updatedAt" | "createdAt", ExtArgs["result"]["realTimePrice"]>

  export type $RealTimePricePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RealTimePrice"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      asset: string
      currentPrice: number
      changeValue: number
      changeRatio: number
      isUp: number
      round: string
      time: string
      rawDateTime: string
      updatedAt: Date
      createdAt: Date
    }, ExtArgs["result"]["realTimePrice"]>
    composites: {}
  }

  type RealTimePriceGetPayload<S extends boolean | null | undefined | RealTimePriceDefaultArgs> = $Result.GetResult<Prisma.$RealTimePricePayload, S>

  type RealTimePriceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RealTimePriceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RealTimePriceCountAggregateInputType | true
    }

  export interface RealTimePriceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RealTimePrice'], meta: { name: 'RealTimePrice' } }
    /**
     * Find zero or one RealTimePrice that matches the filter.
     * @param {RealTimePriceFindUniqueArgs} args - Arguments to find a RealTimePrice
     * @example
     * // Get one RealTimePrice
     * const realTimePrice = await prisma.realTimePrice.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RealTimePriceFindUniqueArgs>(args: SelectSubset<T, RealTimePriceFindUniqueArgs<ExtArgs>>): Prisma__RealTimePriceClient<$Result.GetResult<Prisma.$RealTimePricePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RealTimePrice that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RealTimePriceFindUniqueOrThrowArgs} args - Arguments to find a RealTimePrice
     * @example
     * // Get one RealTimePrice
     * const realTimePrice = await prisma.realTimePrice.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RealTimePriceFindUniqueOrThrowArgs>(args: SelectSubset<T, RealTimePriceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RealTimePriceClient<$Result.GetResult<Prisma.$RealTimePricePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RealTimePrice that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RealTimePriceFindFirstArgs} args - Arguments to find a RealTimePrice
     * @example
     * // Get one RealTimePrice
     * const realTimePrice = await prisma.realTimePrice.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RealTimePriceFindFirstArgs>(args?: SelectSubset<T, RealTimePriceFindFirstArgs<ExtArgs>>): Prisma__RealTimePriceClient<$Result.GetResult<Prisma.$RealTimePricePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RealTimePrice that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RealTimePriceFindFirstOrThrowArgs} args - Arguments to find a RealTimePrice
     * @example
     * // Get one RealTimePrice
     * const realTimePrice = await prisma.realTimePrice.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RealTimePriceFindFirstOrThrowArgs>(args?: SelectSubset<T, RealTimePriceFindFirstOrThrowArgs<ExtArgs>>): Prisma__RealTimePriceClient<$Result.GetResult<Prisma.$RealTimePricePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RealTimePrices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RealTimePriceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RealTimePrices
     * const realTimePrices = await prisma.realTimePrice.findMany()
     * 
     * // Get first 10 RealTimePrices
     * const realTimePrices = await prisma.realTimePrice.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const realTimePriceWithIdOnly = await prisma.realTimePrice.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RealTimePriceFindManyArgs>(args?: SelectSubset<T, RealTimePriceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RealTimePricePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RealTimePrice.
     * @param {RealTimePriceCreateArgs} args - Arguments to create a RealTimePrice.
     * @example
     * // Create one RealTimePrice
     * const RealTimePrice = await prisma.realTimePrice.create({
     *   data: {
     *     // ... data to create a RealTimePrice
     *   }
     * })
     * 
     */
    create<T extends RealTimePriceCreateArgs>(args: SelectSubset<T, RealTimePriceCreateArgs<ExtArgs>>): Prisma__RealTimePriceClient<$Result.GetResult<Prisma.$RealTimePricePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RealTimePrices.
     * @param {RealTimePriceCreateManyArgs} args - Arguments to create many RealTimePrices.
     * @example
     * // Create many RealTimePrices
     * const realTimePrice = await prisma.realTimePrice.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RealTimePriceCreateManyArgs>(args?: SelectSubset<T, RealTimePriceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a RealTimePrice.
     * @param {RealTimePriceDeleteArgs} args - Arguments to delete one RealTimePrice.
     * @example
     * // Delete one RealTimePrice
     * const RealTimePrice = await prisma.realTimePrice.delete({
     *   where: {
     *     // ... filter to delete one RealTimePrice
     *   }
     * })
     * 
     */
    delete<T extends RealTimePriceDeleteArgs>(args: SelectSubset<T, RealTimePriceDeleteArgs<ExtArgs>>): Prisma__RealTimePriceClient<$Result.GetResult<Prisma.$RealTimePricePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RealTimePrice.
     * @param {RealTimePriceUpdateArgs} args - Arguments to update one RealTimePrice.
     * @example
     * // Update one RealTimePrice
     * const realTimePrice = await prisma.realTimePrice.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RealTimePriceUpdateArgs>(args: SelectSubset<T, RealTimePriceUpdateArgs<ExtArgs>>): Prisma__RealTimePriceClient<$Result.GetResult<Prisma.$RealTimePricePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RealTimePrices.
     * @param {RealTimePriceDeleteManyArgs} args - Arguments to filter RealTimePrices to delete.
     * @example
     * // Delete a few RealTimePrices
     * const { count } = await prisma.realTimePrice.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RealTimePriceDeleteManyArgs>(args?: SelectSubset<T, RealTimePriceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RealTimePrices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RealTimePriceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RealTimePrices
     * const realTimePrice = await prisma.realTimePrice.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RealTimePriceUpdateManyArgs>(args: SelectSubset<T, RealTimePriceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RealTimePrice.
     * @param {RealTimePriceUpsertArgs} args - Arguments to update or create a RealTimePrice.
     * @example
     * // Update or create a RealTimePrice
     * const realTimePrice = await prisma.realTimePrice.upsert({
     *   create: {
     *     // ... data to create a RealTimePrice
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RealTimePrice we want to update
     *   }
     * })
     */
    upsert<T extends RealTimePriceUpsertArgs>(args: SelectSubset<T, RealTimePriceUpsertArgs<ExtArgs>>): Prisma__RealTimePriceClient<$Result.GetResult<Prisma.$RealTimePricePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RealTimePrices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RealTimePriceCountArgs} args - Arguments to filter RealTimePrices to count.
     * @example
     * // Count the number of RealTimePrices
     * const count = await prisma.realTimePrice.count({
     *   where: {
     *     // ... the filter for the RealTimePrices we want to count
     *   }
     * })
    **/
    count<T extends RealTimePriceCountArgs>(
      args?: Subset<T, RealTimePriceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RealTimePriceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RealTimePrice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RealTimePriceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends RealTimePriceAggregateArgs>(args: Subset<T, RealTimePriceAggregateArgs>): Prisma.PrismaPromise<GetRealTimePriceAggregateType<T>>

    /**
     * Group by RealTimePrice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RealTimePriceGroupByArgs} args - Group by arguments.
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
      T extends RealTimePriceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RealTimePriceGroupByArgs['orderBy'] }
        : { orderBy?: RealTimePriceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, RealTimePriceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRealTimePriceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RealTimePrice model
   */
  readonly fields: RealTimePriceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RealTimePrice.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RealTimePriceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the RealTimePrice model
   */
  interface RealTimePriceFieldRefs {
    readonly id: FieldRef<"RealTimePrice", 'String'>
    readonly asset: FieldRef<"RealTimePrice", 'String'>
    readonly currentPrice: FieldRef<"RealTimePrice", 'Float'>
    readonly changeValue: FieldRef<"RealTimePrice", 'Float'>
    readonly changeRatio: FieldRef<"RealTimePrice", 'Float'>
    readonly isUp: FieldRef<"RealTimePrice", 'Int'>
    readonly round: FieldRef<"RealTimePrice", 'String'>
    readonly time: FieldRef<"RealTimePrice", 'String'>
    readonly rawDateTime: FieldRef<"RealTimePrice", 'String'>
    readonly updatedAt: FieldRef<"RealTimePrice", 'DateTime'>
    readonly createdAt: FieldRef<"RealTimePrice", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RealTimePrice findUnique
   */
  export type RealTimePriceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RealTimePrice
     */
    select?: RealTimePriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RealTimePrice
     */
    omit?: RealTimePriceOmit<ExtArgs> | null
    /**
     * Filter, which RealTimePrice to fetch.
     */
    where: RealTimePriceWhereUniqueInput
  }

  /**
   * RealTimePrice findUniqueOrThrow
   */
  export type RealTimePriceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RealTimePrice
     */
    select?: RealTimePriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RealTimePrice
     */
    omit?: RealTimePriceOmit<ExtArgs> | null
    /**
     * Filter, which RealTimePrice to fetch.
     */
    where: RealTimePriceWhereUniqueInput
  }

  /**
   * RealTimePrice findFirst
   */
  export type RealTimePriceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RealTimePrice
     */
    select?: RealTimePriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RealTimePrice
     */
    omit?: RealTimePriceOmit<ExtArgs> | null
    /**
     * Filter, which RealTimePrice to fetch.
     */
    where?: RealTimePriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RealTimePrices to fetch.
     */
    orderBy?: RealTimePriceOrderByWithRelationInput | RealTimePriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RealTimePrices.
     */
    cursor?: RealTimePriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RealTimePrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RealTimePrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RealTimePrices.
     */
    distinct?: RealTimePriceScalarFieldEnum | RealTimePriceScalarFieldEnum[]
  }

  /**
   * RealTimePrice findFirstOrThrow
   */
  export type RealTimePriceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RealTimePrice
     */
    select?: RealTimePriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RealTimePrice
     */
    omit?: RealTimePriceOmit<ExtArgs> | null
    /**
     * Filter, which RealTimePrice to fetch.
     */
    where?: RealTimePriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RealTimePrices to fetch.
     */
    orderBy?: RealTimePriceOrderByWithRelationInput | RealTimePriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RealTimePrices.
     */
    cursor?: RealTimePriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RealTimePrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RealTimePrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RealTimePrices.
     */
    distinct?: RealTimePriceScalarFieldEnum | RealTimePriceScalarFieldEnum[]
  }

  /**
   * RealTimePrice findMany
   */
  export type RealTimePriceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RealTimePrice
     */
    select?: RealTimePriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RealTimePrice
     */
    omit?: RealTimePriceOmit<ExtArgs> | null
    /**
     * Filter, which RealTimePrices to fetch.
     */
    where?: RealTimePriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RealTimePrices to fetch.
     */
    orderBy?: RealTimePriceOrderByWithRelationInput | RealTimePriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RealTimePrices.
     */
    cursor?: RealTimePriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RealTimePrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RealTimePrices.
     */
    skip?: number
    distinct?: RealTimePriceScalarFieldEnum | RealTimePriceScalarFieldEnum[]
  }

  /**
   * RealTimePrice create
   */
  export type RealTimePriceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RealTimePrice
     */
    select?: RealTimePriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RealTimePrice
     */
    omit?: RealTimePriceOmit<ExtArgs> | null
    /**
     * The data needed to create a RealTimePrice.
     */
    data: XOR<RealTimePriceCreateInput, RealTimePriceUncheckedCreateInput>
  }

  /**
   * RealTimePrice createMany
   */
  export type RealTimePriceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RealTimePrices.
     */
    data: RealTimePriceCreateManyInput | RealTimePriceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RealTimePrice update
   */
  export type RealTimePriceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RealTimePrice
     */
    select?: RealTimePriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RealTimePrice
     */
    omit?: RealTimePriceOmit<ExtArgs> | null
    /**
     * The data needed to update a RealTimePrice.
     */
    data: XOR<RealTimePriceUpdateInput, RealTimePriceUncheckedUpdateInput>
    /**
     * Choose, which RealTimePrice to update.
     */
    where: RealTimePriceWhereUniqueInput
  }

  /**
   * RealTimePrice updateMany
   */
  export type RealTimePriceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RealTimePrices.
     */
    data: XOR<RealTimePriceUpdateManyMutationInput, RealTimePriceUncheckedUpdateManyInput>
    /**
     * Filter which RealTimePrices to update
     */
    where?: RealTimePriceWhereInput
    /**
     * Limit how many RealTimePrices to update.
     */
    limit?: number
  }

  /**
   * RealTimePrice upsert
   */
  export type RealTimePriceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RealTimePrice
     */
    select?: RealTimePriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RealTimePrice
     */
    omit?: RealTimePriceOmit<ExtArgs> | null
    /**
     * The filter to search for the RealTimePrice to update in case it exists.
     */
    where: RealTimePriceWhereUniqueInput
    /**
     * In case the RealTimePrice found by the `where` argument doesn't exist, create a new RealTimePrice with this data.
     */
    create: XOR<RealTimePriceCreateInput, RealTimePriceUncheckedCreateInput>
    /**
     * In case the RealTimePrice was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RealTimePriceUpdateInput, RealTimePriceUncheckedUpdateInput>
  }

  /**
   * RealTimePrice delete
   */
  export type RealTimePriceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RealTimePrice
     */
    select?: RealTimePriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RealTimePrice
     */
    omit?: RealTimePriceOmit<ExtArgs> | null
    /**
     * Filter which RealTimePrice to delete.
     */
    where: RealTimePriceWhereUniqueInput
  }

  /**
   * RealTimePrice deleteMany
   */
  export type RealTimePriceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RealTimePrices to delete
     */
    where?: RealTimePriceWhereInput
    /**
     * Limit how many RealTimePrices to delete.
     */
    limit?: number
  }

  /**
   * RealTimePrice without action
   */
  export type RealTimePriceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RealTimePrice
     */
    select?: RealTimePriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RealTimePrice
     */
    omit?: RealTimePriceOmit<ExtArgs> | null
  }


  /**
   * Model DailyPrice
   */

  export type AggregateDailyPrice = {
    _count: DailyPriceCountAggregateOutputType | null
    _avg: DailyPriceAvgAggregateOutputType | null
    _sum: DailyPriceSumAggregateOutputType | null
    _min: DailyPriceMinAggregateOutputType | null
    _max: DailyPriceMaxAggregateOutputType | null
  }

  export type DailyPriceAvgAggregateOutputType = {
    close: number | null
    diff: number | null
    ratio: number | null
  }

  export type DailyPriceSumAggregateOutputType = {
    close: number | null
    diff: number | null
    ratio: number | null
  }

  export type DailyPriceMinAggregateOutputType = {
    id: string | null
    asset: string | null
    date: string | null
    close: number | null
    diff: number | null
    ratio: number | null
    createdAt: Date | null
  }

  export type DailyPriceMaxAggregateOutputType = {
    id: string | null
    asset: string | null
    date: string | null
    close: number | null
    diff: number | null
    ratio: number | null
    createdAt: Date | null
  }

  export type DailyPriceCountAggregateOutputType = {
    id: number
    asset: number
    date: number
    close: number
    diff: number
    ratio: number
    createdAt: number
    _all: number
  }


  export type DailyPriceAvgAggregateInputType = {
    close?: true
    diff?: true
    ratio?: true
  }

  export type DailyPriceSumAggregateInputType = {
    close?: true
    diff?: true
    ratio?: true
  }

  export type DailyPriceMinAggregateInputType = {
    id?: true
    asset?: true
    date?: true
    close?: true
    diff?: true
    ratio?: true
    createdAt?: true
  }

  export type DailyPriceMaxAggregateInputType = {
    id?: true
    asset?: true
    date?: true
    close?: true
    diff?: true
    ratio?: true
    createdAt?: true
  }

  export type DailyPriceCountAggregateInputType = {
    id?: true
    asset?: true
    date?: true
    close?: true
    diff?: true
    ratio?: true
    createdAt?: true
    _all?: true
  }

  export type DailyPriceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailyPrice to aggregate.
     */
    where?: DailyPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyPrices to fetch.
     */
    orderBy?: DailyPriceOrderByWithRelationInput | DailyPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DailyPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyPrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DailyPrices
    **/
    _count?: true | DailyPriceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DailyPriceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DailyPriceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DailyPriceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DailyPriceMaxAggregateInputType
  }

  export type GetDailyPriceAggregateType<T extends DailyPriceAggregateArgs> = {
        [P in keyof T & keyof AggregateDailyPrice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDailyPrice[P]>
      : GetScalarType<T[P], AggregateDailyPrice[P]>
  }




  export type DailyPriceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailyPriceWhereInput
    orderBy?: DailyPriceOrderByWithAggregationInput | DailyPriceOrderByWithAggregationInput[]
    by: DailyPriceScalarFieldEnum[] | DailyPriceScalarFieldEnum
    having?: DailyPriceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DailyPriceCountAggregateInputType | true
    _avg?: DailyPriceAvgAggregateInputType
    _sum?: DailyPriceSumAggregateInputType
    _min?: DailyPriceMinAggregateInputType
    _max?: DailyPriceMaxAggregateInputType
  }

  export type DailyPriceGroupByOutputType = {
    id: string
    asset: string
    date: string
    close: number
    diff: number
    ratio: number
    createdAt: Date
    _count: DailyPriceCountAggregateOutputType | null
    _avg: DailyPriceAvgAggregateOutputType | null
    _sum: DailyPriceSumAggregateOutputType | null
    _min: DailyPriceMinAggregateOutputType | null
    _max: DailyPriceMaxAggregateOutputType | null
  }

  type GetDailyPriceGroupByPayload<T extends DailyPriceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DailyPriceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DailyPriceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DailyPriceGroupByOutputType[P]>
            : GetScalarType<T[P], DailyPriceGroupByOutputType[P]>
        }
      >
    >


  export type DailyPriceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    asset?: boolean
    date?: boolean
    close?: boolean
    diff?: boolean
    ratio?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["dailyPrice"]>



  export type DailyPriceSelectScalar = {
    id?: boolean
    asset?: boolean
    date?: boolean
    close?: boolean
    diff?: boolean
    ratio?: boolean
    createdAt?: boolean
  }

  export type DailyPriceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "asset" | "date" | "close" | "diff" | "ratio" | "createdAt", ExtArgs["result"]["dailyPrice"]>

  export type $DailyPricePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DailyPrice"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      asset: string
      date: string
      close: number
      diff: number
      ratio: number
      createdAt: Date
    }, ExtArgs["result"]["dailyPrice"]>
    composites: {}
  }

  type DailyPriceGetPayload<S extends boolean | null | undefined | DailyPriceDefaultArgs> = $Result.GetResult<Prisma.$DailyPricePayload, S>

  type DailyPriceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DailyPriceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DailyPriceCountAggregateInputType | true
    }

  export interface DailyPriceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DailyPrice'], meta: { name: 'DailyPrice' } }
    /**
     * Find zero or one DailyPrice that matches the filter.
     * @param {DailyPriceFindUniqueArgs} args - Arguments to find a DailyPrice
     * @example
     * // Get one DailyPrice
     * const dailyPrice = await prisma.dailyPrice.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DailyPriceFindUniqueArgs>(args: SelectSubset<T, DailyPriceFindUniqueArgs<ExtArgs>>): Prisma__DailyPriceClient<$Result.GetResult<Prisma.$DailyPricePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DailyPrice that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DailyPriceFindUniqueOrThrowArgs} args - Arguments to find a DailyPrice
     * @example
     * // Get one DailyPrice
     * const dailyPrice = await prisma.dailyPrice.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DailyPriceFindUniqueOrThrowArgs>(args: SelectSubset<T, DailyPriceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DailyPriceClient<$Result.GetResult<Prisma.$DailyPricePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailyPrice that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyPriceFindFirstArgs} args - Arguments to find a DailyPrice
     * @example
     * // Get one DailyPrice
     * const dailyPrice = await prisma.dailyPrice.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DailyPriceFindFirstArgs>(args?: SelectSubset<T, DailyPriceFindFirstArgs<ExtArgs>>): Prisma__DailyPriceClient<$Result.GetResult<Prisma.$DailyPricePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailyPrice that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyPriceFindFirstOrThrowArgs} args - Arguments to find a DailyPrice
     * @example
     * // Get one DailyPrice
     * const dailyPrice = await prisma.dailyPrice.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DailyPriceFindFirstOrThrowArgs>(args?: SelectSubset<T, DailyPriceFindFirstOrThrowArgs<ExtArgs>>): Prisma__DailyPriceClient<$Result.GetResult<Prisma.$DailyPricePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DailyPrices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyPriceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DailyPrices
     * const dailyPrices = await prisma.dailyPrice.findMany()
     * 
     * // Get first 10 DailyPrices
     * const dailyPrices = await prisma.dailyPrice.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dailyPriceWithIdOnly = await prisma.dailyPrice.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DailyPriceFindManyArgs>(args?: SelectSubset<T, DailyPriceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyPricePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DailyPrice.
     * @param {DailyPriceCreateArgs} args - Arguments to create a DailyPrice.
     * @example
     * // Create one DailyPrice
     * const DailyPrice = await prisma.dailyPrice.create({
     *   data: {
     *     // ... data to create a DailyPrice
     *   }
     * })
     * 
     */
    create<T extends DailyPriceCreateArgs>(args: SelectSubset<T, DailyPriceCreateArgs<ExtArgs>>): Prisma__DailyPriceClient<$Result.GetResult<Prisma.$DailyPricePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DailyPrices.
     * @param {DailyPriceCreateManyArgs} args - Arguments to create many DailyPrices.
     * @example
     * // Create many DailyPrices
     * const dailyPrice = await prisma.dailyPrice.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DailyPriceCreateManyArgs>(args?: SelectSubset<T, DailyPriceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a DailyPrice.
     * @param {DailyPriceDeleteArgs} args - Arguments to delete one DailyPrice.
     * @example
     * // Delete one DailyPrice
     * const DailyPrice = await prisma.dailyPrice.delete({
     *   where: {
     *     // ... filter to delete one DailyPrice
     *   }
     * })
     * 
     */
    delete<T extends DailyPriceDeleteArgs>(args: SelectSubset<T, DailyPriceDeleteArgs<ExtArgs>>): Prisma__DailyPriceClient<$Result.GetResult<Prisma.$DailyPricePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DailyPrice.
     * @param {DailyPriceUpdateArgs} args - Arguments to update one DailyPrice.
     * @example
     * // Update one DailyPrice
     * const dailyPrice = await prisma.dailyPrice.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DailyPriceUpdateArgs>(args: SelectSubset<T, DailyPriceUpdateArgs<ExtArgs>>): Prisma__DailyPriceClient<$Result.GetResult<Prisma.$DailyPricePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DailyPrices.
     * @param {DailyPriceDeleteManyArgs} args - Arguments to filter DailyPrices to delete.
     * @example
     * // Delete a few DailyPrices
     * const { count } = await prisma.dailyPrice.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DailyPriceDeleteManyArgs>(args?: SelectSubset<T, DailyPriceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailyPrices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyPriceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DailyPrices
     * const dailyPrice = await prisma.dailyPrice.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DailyPriceUpdateManyArgs>(args: SelectSubset<T, DailyPriceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DailyPrice.
     * @param {DailyPriceUpsertArgs} args - Arguments to update or create a DailyPrice.
     * @example
     * // Update or create a DailyPrice
     * const dailyPrice = await prisma.dailyPrice.upsert({
     *   create: {
     *     // ... data to create a DailyPrice
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DailyPrice we want to update
     *   }
     * })
     */
    upsert<T extends DailyPriceUpsertArgs>(args: SelectSubset<T, DailyPriceUpsertArgs<ExtArgs>>): Prisma__DailyPriceClient<$Result.GetResult<Prisma.$DailyPricePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DailyPrices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyPriceCountArgs} args - Arguments to filter DailyPrices to count.
     * @example
     * // Count the number of DailyPrices
     * const count = await prisma.dailyPrice.count({
     *   where: {
     *     // ... the filter for the DailyPrices we want to count
     *   }
     * })
    **/
    count<T extends DailyPriceCountArgs>(
      args?: Subset<T, DailyPriceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DailyPriceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DailyPrice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyPriceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DailyPriceAggregateArgs>(args: Subset<T, DailyPriceAggregateArgs>): Prisma.PrismaPromise<GetDailyPriceAggregateType<T>>

    /**
     * Group by DailyPrice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyPriceGroupByArgs} args - Group by arguments.
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
      T extends DailyPriceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DailyPriceGroupByArgs['orderBy'] }
        : { orderBy?: DailyPriceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DailyPriceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDailyPriceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DailyPrice model
   */
  readonly fields: DailyPriceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DailyPrice.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DailyPriceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the DailyPrice model
   */
  interface DailyPriceFieldRefs {
    readonly id: FieldRef<"DailyPrice", 'String'>
    readonly asset: FieldRef<"DailyPrice", 'String'>
    readonly date: FieldRef<"DailyPrice", 'String'>
    readonly close: FieldRef<"DailyPrice", 'Float'>
    readonly diff: FieldRef<"DailyPrice", 'Float'>
    readonly ratio: FieldRef<"DailyPrice", 'Float'>
    readonly createdAt: FieldRef<"DailyPrice", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DailyPrice findUnique
   */
  export type DailyPriceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyPrice
     */
    select?: DailyPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyPrice
     */
    omit?: DailyPriceOmit<ExtArgs> | null
    /**
     * Filter, which DailyPrice to fetch.
     */
    where: DailyPriceWhereUniqueInput
  }

  /**
   * DailyPrice findUniqueOrThrow
   */
  export type DailyPriceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyPrice
     */
    select?: DailyPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyPrice
     */
    omit?: DailyPriceOmit<ExtArgs> | null
    /**
     * Filter, which DailyPrice to fetch.
     */
    where: DailyPriceWhereUniqueInput
  }

  /**
   * DailyPrice findFirst
   */
  export type DailyPriceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyPrice
     */
    select?: DailyPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyPrice
     */
    omit?: DailyPriceOmit<ExtArgs> | null
    /**
     * Filter, which DailyPrice to fetch.
     */
    where?: DailyPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyPrices to fetch.
     */
    orderBy?: DailyPriceOrderByWithRelationInput | DailyPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailyPrices.
     */
    cursor?: DailyPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyPrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyPrices.
     */
    distinct?: DailyPriceScalarFieldEnum | DailyPriceScalarFieldEnum[]
  }

  /**
   * DailyPrice findFirstOrThrow
   */
  export type DailyPriceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyPrice
     */
    select?: DailyPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyPrice
     */
    omit?: DailyPriceOmit<ExtArgs> | null
    /**
     * Filter, which DailyPrice to fetch.
     */
    where?: DailyPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyPrices to fetch.
     */
    orderBy?: DailyPriceOrderByWithRelationInput | DailyPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailyPrices.
     */
    cursor?: DailyPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyPrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyPrices.
     */
    distinct?: DailyPriceScalarFieldEnum | DailyPriceScalarFieldEnum[]
  }

  /**
   * DailyPrice findMany
   */
  export type DailyPriceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyPrice
     */
    select?: DailyPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyPrice
     */
    omit?: DailyPriceOmit<ExtArgs> | null
    /**
     * Filter, which DailyPrices to fetch.
     */
    where?: DailyPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyPrices to fetch.
     */
    orderBy?: DailyPriceOrderByWithRelationInput | DailyPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DailyPrices.
     */
    cursor?: DailyPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyPrices.
     */
    skip?: number
    distinct?: DailyPriceScalarFieldEnum | DailyPriceScalarFieldEnum[]
  }

  /**
   * DailyPrice create
   */
  export type DailyPriceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyPrice
     */
    select?: DailyPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyPrice
     */
    omit?: DailyPriceOmit<ExtArgs> | null
    /**
     * The data needed to create a DailyPrice.
     */
    data: XOR<DailyPriceCreateInput, DailyPriceUncheckedCreateInput>
  }

  /**
   * DailyPrice createMany
   */
  export type DailyPriceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DailyPrices.
     */
    data: DailyPriceCreateManyInput | DailyPriceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailyPrice update
   */
  export type DailyPriceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyPrice
     */
    select?: DailyPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyPrice
     */
    omit?: DailyPriceOmit<ExtArgs> | null
    /**
     * The data needed to update a DailyPrice.
     */
    data: XOR<DailyPriceUpdateInput, DailyPriceUncheckedUpdateInput>
    /**
     * Choose, which DailyPrice to update.
     */
    where: DailyPriceWhereUniqueInput
  }

  /**
   * DailyPrice updateMany
   */
  export type DailyPriceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DailyPrices.
     */
    data: XOR<DailyPriceUpdateManyMutationInput, DailyPriceUncheckedUpdateManyInput>
    /**
     * Filter which DailyPrices to update
     */
    where?: DailyPriceWhereInput
    /**
     * Limit how many DailyPrices to update.
     */
    limit?: number
  }

  /**
   * DailyPrice upsert
   */
  export type DailyPriceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyPrice
     */
    select?: DailyPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyPrice
     */
    omit?: DailyPriceOmit<ExtArgs> | null
    /**
     * The filter to search for the DailyPrice to update in case it exists.
     */
    where: DailyPriceWhereUniqueInput
    /**
     * In case the DailyPrice found by the `where` argument doesn't exist, create a new DailyPrice with this data.
     */
    create: XOR<DailyPriceCreateInput, DailyPriceUncheckedCreateInput>
    /**
     * In case the DailyPrice was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DailyPriceUpdateInput, DailyPriceUncheckedUpdateInput>
  }

  /**
   * DailyPrice delete
   */
  export type DailyPriceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyPrice
     */
    select?: DailyPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyPrice
     */
    omit?: DailyPriceOmit<ExtArgs> | null
    /**
     * Filter which DailyPrice to delete.
     */
    where: DailyPriceWhereUniqueInput
  }

  /**
   * DailyPrice deleteMany
   */
  export type DailyPriceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailyPrices to delete
     */
    where?: DailyPriceWhereInput
    /**
     * Limit how many DailyPrices to delete.
     */
    limit?: number
  }

  /**
   * DailyPrice without action
   */
  export type DailyPriceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyPrice
     */
    select?: DailyPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyPrice
     */
    omit?: DailyPriceOmit<ExtArgs> | null
  }


  /**
   * Model ChartPrice
   */

  export type AggregateChartPrice = {
    _count: ChartPriceCountAggregateOutputType | null
    _avg: ChartPriceAvgAggregateOutputType | null
    _sum: ChartPriceSumAggregateOutputType | null
    _min: ChartPriceMinAggregateOutputType | null
    _max: ChartPriceMaxAggregateOutputType | null
  }

  export type ChartPriceAvgAggregateOutputType = {
    price: number | null
    degreeCount: number | null
  }

  export type ChartPriceSumAggregateOutputType = {
    price: number | null
    degreeCount: number | null
  }

  export type ChartPriceMinAggregateOutputType = {
    id: string | null
    asset: string | null
    price: number | null
    degreeCount: number | null
    dateTime: string | null
    createdAt: Date | null
  }

  export type ChartPriceMaxAggregateOutputType = {
    id: string | null
    asset: string | null
    price: number | null
    degreeCount: number | null
    dateTime: string | null
    createdAt: Date | null
  }

  export type ChartPriceCountAggregateOutputType = {
    id: number
    asset: number
    price: number
    degreeCount: number
    dateTime: number
    createdAt: number
    _all: number
  }


  export type ChartPriceAvgAggregateInputType = {
    price?: true
    degreeCount?: true
  }

  export type ChartPriceSumAggregateInputType = {
    price?: true
    degreeCount?: true
  }

  export type ChartPriceMinAggregateInputType = {
    id?: true
    asset?: true
    price?: true
    degreeCount?: true
    dateTime?: true
    createdAt?: true
  }

  export type ChartPriceMaxAggregateInputType = {
    id?: true
    asset?: true
    price?: true
    degreeCount?: true
    dateTime?: true
    createdAt?: true
  }

  export type ChartPriceCountAggregateInputType = {
    id?: true
    asset?: true
    price?: true
    degreeCount?: true
    dateTime?: true
    createdAt?: true
    _all?: true
  }

  export type ChartPriceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChartPrice to aggregate.
     */
    where?: ChartPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChartPrices to fetch.
     */
    orderBy?: ChartPriceOrderByWithRelationInput | ChartPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChartPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChartPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChartPrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChartPrices
    **/
    _count?: true | ChartPriceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ChartPriceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ChartPriceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChartPriceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChartPriceMaxAggregateInputType
  }

  export type GetChartPriceAggregateType<T extends ChartPriceAggregateArgs> = {
        [P in keyof T & keyof AggregateChartPrice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChartPrice[P]>
      : GetScalarType<T[P], AggregateChartPrice[P]>
  }




  export type ChartPriceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChartPriceWhereInput
    orderBy?: ChartPriceOrderByWithAggregationInput | ChartPriceOrderByWithAggregationInput[]
    by: ChartPriceScalarFieldEnum[] | ChartPriceScalarFieldEnum
    having?: ChartPriceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChartPriceCountAggregateInputType | true
    _avg?: ChartPriceAvgAggregateInputType
    _sum?: ChartPriceSumAggregateInputType
    _min?: ChartPriceMinAggregateInputType
    _max?: ChartPriceMaxAggregateInputType
  }

  export type ChartPriceGroupByOutputType = {
    id: string
    asset: string
    price: number
    degreeCount: number
    dateTime: string
    createdAt: Date
    _count: ChartPriceCountAggregateOutputType | null
    _avg: ChartPriceAvgAggregateOutputType | null
    _sum: ChartPriceSumAggregateOutputType | null
    _min: ChartPriceMinAggregateOutputType | null
    _max: ChartPriceMaxAggregateOutputType | null
  }

  type GetChartPriceGroupByPayload<T extends ChartPriceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChartPriceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChartPriceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChartPriceGroupByOutputType[P]>
            : GetScalarType<T[P], ChartPriceGroupByOutputType[P]>
        }
      >
    >


  export type ChartPriceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    asset?: boolean
    price?: boolean
    degreeCount?: boolean
    dateTime?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["chartPrice"]>



  export type ChartPriceSelectScalar = {
    id?: boolean
    asset?: boolean
    price?: boolean
    degreeCount?: boolean
    dateTime?: boolean
    createdAt?: boolean
  }

  export type ChartPriceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "asset" | "price" | "degreeCount" | "dateTime" | "createdAt", ExtArgs["result"]["chartPrice"]>

  export type $ChartPricePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChartPrice"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      asset: string
      price: number
      degreeCount: number
      dateTime: string
      createdAt: Date
    }, ExtArgs["result"]["chartPrice"]>
    composites: {}
  }

  type ChartPriceGetPayload<S extends boolean | null | undefined | ChartPriceDefaultArgs> = $Result.GetResult<Prisma.$ChartPricePayload, S>

  type ChartPriceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ChartPriceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ChartPriceCountAggregateInputType | true
    }

  export interface ChartPriceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChartPrice'], meta: { name: 'ChartPrice' } }
    /**
     * Find zero or one ChartPrice that matches the filter.
     * @param {ChartPriceFindUniqueArgs} args - Arguments to find a ChartPrice
     * @example
     * // Get one ChartPrice
     * const chartPrice = await prisma.chartPrice.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChartPriceFindUniqueArgs>(args: SelectSubset<T, ChartPriceFindUniqueArgs<ExtArgs>>): Prisma__ChartPriceClient<$Result.GetResult<Prisma.$ChartPricePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ChartPrice that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ChartPriceFindUniqueOrThrowArgs} args - Arguments to find a ChartPrice
     * @example
     * // Get one ChartPrice
     * const chartPrice = await prisma.chartPrice.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChartPriceFindUniqueOrThrowArgs>(args: SelectSubset<T, ChartPriceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChartPriceClient<$Result.GetResult<Prisma.$ChartPricePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChartPrice that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartPriceFindFirstArgs} args - Arguments to find a ChartPrice
     * @example
     * // Get one ChartPrice
     * const chartPrice = await prisma.chartPrice.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChartPriceFindFirstArgs>(args?: SelectSubset<T, ChartPriceFindFirstArgs<ExtArgs>>): Prisma__ChartPriceClient<$Result.GetResult<Prisma.$ChartPricePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChartPrice that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartPriceFindFirstOrThrowArgs} args - Arguments to find a ChartPrice
     * @example
     * // Get one ChartPrice
     * const chartPrice = await prisma.chartPrice.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChartPriceFindFirstOrThrowArgs>(args?: SelectSubset<T, ChartPriceFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChartPriceClient<$Result.GetResult<Prisma.$ChartPricePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ChartPrices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartPriceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChartPrices
     * const chartPrices = await prisma.chartPrice.findMany()
     * 
     * // Get first 10 ChartPrices
     * const chartPrices = await prisma.chartPrice.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const chartPriceWithIdOnly = await prisma.chartPrice.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChartPriceFindManyArgs>(args?: SelectSubset<T, ChartPriceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChartPricePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ChartPrice.
     * @param {ChartPriceCreateArgs} args - Arguments to create a ChartPrice.
     * @example
     * // Create one ChartPrice
     * const ChartPrice = await prisma.chartPrice.create({
     *   data: {
     *     // ... data to create a ChartPrice
     *   }
     * })
     * 
     */
    create<T extends ChartPriceCreateArgs>(args: SelectSubset<T, ChartPriceCreateArgs<ExtArgs>>): Prisma__ChartPriceClient<$Result.GetResult<Prisma.$ChartPricePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ChartPrices.
     * @param {ChartPriceCreateManyArgs} args - Arguments to create many ChartPrices.
     * @example
     * // Create many ChartPrices
     * const chartPrice = await prisma.chartPrice.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChartPriceCreateManyArgs>(args?: SelectSubset<T, ChartPriceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ChartPrice.
     * @param {ChartPriceDeleteArgs} args - Arguments to delete one ChartPrice.
     * @example
     * // Delete one ChartPrice
     * const ChartPrice = await prisma.chartPrice.delete({
     *   where: {
     *     // ... filter to delete one ChartPrice
     *   }
     * })
     * 
     */
    delete<T extends ChartPriceDeleteArgs>(args: SelectSubset<T, ChartPriceDeleteArgs<ExtArgs>>): Prisma__ChartPriceClient<$Result.GetResult<Prisma.$ChartPricePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ChartPrice.
     * @param {ChartPriceUpdateArgs} args - Arguments to update one ChartPrice.
     * @example
     * // Update one ChartPrice
     * const chartPrice = await prisma.chartPrice.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChartPriceUpdateArgs>(args: SelectSubset<T, ChartPriceUpdateArgs<ExtArgs>>): Prisma__ChartPriceClient<$Result.GetResult<Prisma.$ChartPricePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ChartPrices.
     * @param {ChartPriceDeleteManyArgs} args - Arguments to filter ChartPrices to delete.
     * @example
     * // Delete a few ChartPrices
     * const { count } = await prisma.chartPrice.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChartPriceDeleteManyArgs>(args?: SelectSubset<T, ChartPriceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChartPrices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartPriceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChartPrices
     * const chartPrice = await prisma.chartPrice.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChartPriceUpdateManyArgs>(args: SelectSubset<T, ChartPriceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ChartPrice.
     * @param {ChartPriceUpsertArgs} args - Arguments to update or create a ChartPrice.
     * @example
     * // Update or create a ChartPrice
     * const chartPrice = await prisma.chartPrice.upsert({
     *   create: {
     *     // ... data to create a ChartPrice
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChartPrice we want to update
     *   }
     * })
     */
    upsert<T extends ChartPriceUpsertArgs>(args: SelectSubset<T, ChartPriceUpsertArgs<ExtArgs>>): Prisma__ChartPriceClient<$Result.GetResult<Prisma.$ChartPricePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ChartPrices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartPriceCountArgs} args - Arguments to filter ChartPrices to count.
     * @example
     * // Count the number of ChartPrices
     * const count = await prisma.chartPrice.count({
     *   where: {
     *     // ... the filter for the ChartPrices we want to count
     *   }
     * })
    **/
    count<T extends ChartPriceCountArgs>(
      args?: Subset<T, ChartPriceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChartPriceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChartPrice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartPriceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ChartPriceAggregateArgs>(args: Subset<T, ChartPriceAggregateArgs>): Prisma.PrismaPromise<GetChartPriceAggregateType<T>>

    /**
     * Group by ChartPrice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChartPriceGroupByArgs} args - Group by arguments.
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
      T extends ChartPriceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChartPriceGroupByArgs['orderBy'] }
        : { orderBy?: ChartPriceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ChartPriceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChartPriceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChartPrice model
   */
  readonly fields: ChartPriceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChartPrice.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChartPriceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ChartPrice model
   */
  interface ChartPriceFieldRefs {
    readonly id: FieldRef<"ChartPrice", 'String'>
    readonly asset: FieldRef<"ChartPrice", 'String'>
    readonly price: FieldRef<"ChartPrice", 'Float'>
    readonly degreeCount: FieldRef<"ChartPrice", 'Int'>
    readonly dateTime: FieldRef<"ChartPrice", 'String'>
    readonly createdAt: FieldRef<"ChartPrice", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ChartPrice findUnique
   */
  export type ChartPriceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartPrice
     */
    select?: ChartPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartPrice
     */
    omit?: ChartPriceOmit<ExtArgs> | null
    /**
     * Filter, which ChartPrice to fetch.
     */
    where: ChartPriceWhereUniqueInput
  }

  /**
   * ChartPrice findUniqueOrThrow
   */
  export type ChartPriceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartPrice
     */
    select?: ChartPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartPrice
     */
    omit?: ChartPriceOmit<ExtArgs> | null
    /**
     * Filter, which ChartPrice to fetch.
     */
    where: ChartPriceWhereUniqueInput
  }

  /**
   * ChartPrice findFirst
   */
  export type ChartPriceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartPrice
     */
    select?: ChartPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartPrice
     */
    omit?: ChartPriceOmit<ExtArgs> | null
    /**
     * Filter, which ChartPrice to fetch.
     */
    where?: ChartPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChartPrices to fetch.
     */
    orderBy?: ChartPriceOrderByWithRelationInput | ChartPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChartPrices.
     */
    cursor?: ChartPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChartPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChartPrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChartPrices.
     */
    distinct?: ChartPriceScalarFieldEnum | ChartPriceScalarFieldEnum[]
  }

  /**
   * ChartPrice findFirstOrThrow
   */
  export type ChartPriceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartPrice
     */
    select?: ChartPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartPrice
     */
    omit?: ChartPriceOmit<ExtArgs> | null
    /**
     * Filter, which ChartPrice to fetch.
     */
    where?: ChartPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChartPrices to fetch.
     */
    orderBy?: ChartPriceOrderByWithRelationInput | ChartPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChartPrices.
     */
    cursor?: ChartPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChartPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChartPrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChartPrices.
     */
    distinct?: ChartPriceScalarFieldEnum | ChartPriceScalarFieldEnum[]
  }

  /**
   * ChartPrice findMany
   */
  export type ChartPriceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartPrice
     */
    select?: ChartPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartPrice
     */
    omit?: ChartPriceOmit<ExtArgs> | null
    /**
     * Filter, which ChartPrices to fetch.
     */
    where?: ChartPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChartPrices to fetch.
     */
    orderBy?: ChartPriceOrderByWithRelationInput | ChartPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChartPrices.
     */
    cursor?: ChartPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChartPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChartPrices.
     */
    skip?: number
    distinct?: ChartPriceScalarFieldEnum | ChartPriceScalarFieldEnum[]
  }

  /**
   * ChartPrice create
   */
  export type ChartPriceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartPrice
     */
    select?: ChartPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartPrice
     */
    omit?: ChartPriceOmit<ExtArgs> | null
    /**
     * The data needed to create a ChartPrice.
     */
    data: XOR<ChartPriceCreateInput, ChartPriceUncheckedCreateInput>
  }

  /**
   * ChartPrice createMany
   */
  export type ChartPriceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChartPrices.
     */
    data: ChartPriceCreateManyInput | ChartPriceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChartPrice update
   */
  export type ChartPriceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartPrice
     */
    select?: ChartPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartPrice
     */
    omit?: ChartPriceOmit<ExtArgs> | null
    /**
     * The data needed to update a ChartPrice.
     */
    data: XOR<ChartPriceUpdateInput, ChartPriceUncheckedUpdateInput>
    /**
     * Choose, which ChartPrice to update.
     */
    where: ChartPriceWhereUniqueInput
  }

  /**
   * ChartPrice updateMany
   */
  export type ChartPriceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChartPrices.
     */
    data: XOR<ChartPriceUpdateManyMutationInput, ChartPriceUncheckedUpdateManyInput>
    /**
     * Filter which ChartPrices to update
     */
    where?: ChartPriceWhereInput
    /**
     * Limit how many ChartPrices to update.
     */
    limit?: number
  }

  /**
   * ChartPrice upsert
   */
  export type ChartPriceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartPrice
     */
    select?: ChartPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartPrice
     */
    omit?: ChartPriceOmit<ExtArgs> | null
    /**
     * The filter to search for the ChartPrice to update in case it exists.
     */
    where: ChartPriceWhereUniqueInput
    /**
     * In case the ChartPrice found by the `where` argument doesn't exist, create a new ChartPrice with this data.
     */
    create: XOR<ChartPriceCreateInput, ChartPriceUncheckedCreateInput>
    /**
     * In case the ChartPrice was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChartPriceUpdateInput, ChartPriceUncheckedUpdateInput>
  }

  /**
   * ChartPrice delete
   */
  export type ChartPriceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartPrice
     */
    select?: ChartPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartPrice
     */
    omit?: ChartPriceOmit<ExtArgs> | null
    /**
     * Filter which ChartPrice to delete.
     */
    where: ChartPriceWhereUniqueInput
  }

  /**
   * ChartPrice deleteMany
   */
  export type ChartPriceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChartPrices to delete
     */
    where?: ChartPriceWhereInput
    /**
     * Limit how many ChartPrices to delete.
     */
    limit?: number
  }

  /**
   * ChartPrice without action
   */
  export type ChartPriceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChartPrice
     */
    select?: ChartPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChartPrice
     */
    omit?: ChartPriceOmit<ExtArgs> | null
  }


  /**
   * Model GoldPrediction
   */

  export type AggregateGoldPrediction = {
    _count: GoldPredictionCountAggregateOutputType | null
    _avg: GoldPredictionAvgAggregateOutputType | null
    _sum: GoldPredictionSumAggregateOutputType | null
    _min: GoldPredictionMinAggregateOutputType | null
    _max: GoldPredictionMaxAggregateOutputType | null
  }

  export type GoldPredictionAvgAggregateOutputType = {
    confidence: number | null
    probability: number | null
    nextDayPrediction: number | null
    basedOnDays: number | null
  }

  export type GoldPredictionSumAggregateOutputType = {
    confidence: number | null
    probability: number | null
    nextDayPrediction: number | null
    basedOnDays: number | null
  }

  export type GoldPredictionMinAggregateOutputType = {
    id: string | null
    asset: string | null
    predictionDate: string | null
    direction: string | null
    confidence: number | null
    probability: number | null
    nextDayPrediction: number | null
    basedOnDays: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GoldPredictionMaxAggregateOutputType = {
    id: string | null
    asset: string | null
    predictionDate: string | null
    direction: string | null
    confidence: number | null
    probability: number | null
    nextDayPrediction: number | null
    basedOnDays: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GoldPredictionCountAggregateOutputType = {
    id: number
    asset: number
    predictionDate: number
    direction: number
    confidence: number
    probability: number
    nextDayPrediction: number
    basedOnDays: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GoldPredictionAvgAggregateInputType = {
    confidence?: true
    probability?: true
    nextDayPrediction?: true
    basedOnDays?: true
  }

  export type GoldPredictionSumAggregateInputType = {
    confidence?: true
    probability?: true
    nextDayPrediction?: true
    basedOnDays?: true
  }

  export type GoldPredictionMinAggregateInputType = {
    id?: true
    asset?: true
    predictionDate?: true
    direction?: true
    confidence?: true
    probability?: true
    nextDayPrediction?: true
    basedOnDays?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GoldPredictionMaxAggregateInputType = {
    id?: true
    asset?: true
    predictionDate?: true
    direction?: true
    confidence?: true
    probability?: true
    nextDayPrediction?: true
    basedOnDays?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GoldPredictionCountAggregateInputType = {
    id?: true
    asset?: true
    predictionDate?: true
    direction?: true
    confidence?: true
    probability?: true
    nextDayPrediction?: true
    basedOnDays?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GoldPredictionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GoldPrediction to aggregate.
     */
    where?: GoldPredictionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GoldPredictions to fetch.
     */
    orderBy?: GoldPredictionOrderByWithRelationInput | GoldPredictionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GoldPredictionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GoldPredictions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GoldPredictions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GoldPredictions
    **/
    _count?: true | GoldPredictionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GoldPredictionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GoldPredictionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GoldPredictionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GoldPredictionMaxAggregateInputType
  }

  export type GetGoldPredictionAggregateType<T extends GoldPredictionAggregateArgs> = {
        [P in keyof T & keyof AggregateGoldPrediction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGoldPrediction[P]>
      : GetScalarType<T[P], AggregateGoldPrediction[P]>
  }




  export type GoldPredictionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GoldPredictionWhereInput
    orderBy?: GoldPredictionOrderByWithAggregationInput | GoldPredictionOrderByWithAggregationInput[]
    by: GoldPredictionScalarFieldEnum[] | GoldPredictionScalarFieldEnum
    having?: GoldPredictionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GoldPredictionCountAggregateInputType | true
    _avg?: GoldPredictionAvgAggregateInputType
    _sum?: GoldPredictionSumAggregateInputType
    _min?: GoldPredictionMinAggregateInputType
    _max?: GoldPredictionMaxAggregateInputType
  }

  export type GoldPredictionGroupByOutputType = {
    id: string
    asset: string
    predictionDate: string
    direction: string
    confidence: number
    probability: number
    nextDayPrediction: number
    basedOnDays: number
    createdAt: Date
    updatedAt: Date
    _count: GoldPredictionCountAggregateOutputType | null
    _avg: GoldPredictionAvgAggregateOutputType | null
    _sum: GoldPredictionSumAggregateOutputType | null
    _min: GoldPredictionMinAggregateOutputType | null
    _max: GoldPredictionMaxAggregateOutputType | null
  }

  type GetGoldPredictionGroupByPayload<T extends GoldPredictionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GoldPredictionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GoldPredictionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GoldPredictionGroupByOutputType[P]>
            : GetScalarType<T[P], GoldPredictionGroupByOutputType[P]>
        }
      >
    >


  export type GoldPredictionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    asset?: boolean
    predictionDate?: boolean
    direction?: boolean
    confidence?: boolean
    probability?: boolean
    nextDayPrediction?: boolean
    basedOnDays?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["goldPrediction"]>



  export type GoldPredictionSelectScalar = {
    id?: boolean
    asset?: boolean
    predictionDate?: boolean
    direction?: boolean
    confidence?: boolean
    probability?: boolean
    nextDayPrediction?: boolean
    basedOnDays?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GoldPredictionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "asset" | "predictionDate" | "direction" | "confidence" | "probability" | "nextDayPrediction" | "basedOnDays" | "createdAt" | "updatedAt", ExtArgs["result"]["goldPrediction"]>

  export type $GoldPredictionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GoldPrediction"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      asset: string
      predictionDate: string
      direction: string
      confidence: number
      probability: number
      nextDayPrediction: number
      basedOnDays: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["goldPrediction"]>
    composites: {}
  }

  type GoldPredictionGetPayload<S extends boolean | null | undefined | GoldPredictionDefaultArgs> = $Result.GetResult<Prisma.$GoldPredictionPayload, S>

  type GoldPredictionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GoldPredictionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GoldPredictionCountAggregateInputType | true
    }

  export interface GoldPredictionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GoldPrediction'], meta: { name: 'GoldPrediction' } }
    /**
     * Find zero or one GoldPrediction that matches the filter.
     * @param {GoldPredictionFindUniqueArgs} args - Arguments to find a GoldPrediction
     * @example
     * // Get one GoldPrediction
     * const goldPrediction = await prisma.goldPrediction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GoldPredictionFindUniqueArgs>(args: SelectSubset<T, GoldPredictionFindUniqueArgs<ExtArgs>>): Prisma__GoldPredictionClient<$Result.GetResult<Prisma.$GoldPredictionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GoldPrediction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GoldPredictionFindUniqueOrThrowArgs} args - Arguments to find a GoldPrediction
     * @example
     * // Get one GoldPrediction
     * const goldPrediction = await prisma.goldPrediction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GoldPredictionFindUniqueOrThrowArgs>(args: SelectSubset<T, GoldPredictionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GoldPredictionClient<$Result.GetResult<Prisma.$GoldPredictionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GoldPrediction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoldPredictionFindFirstArgs} args - Arguments to find a GoldPrediction
     * @example
     * // Get one GoldPrediction
     * const goldPrediction = await prisma.goldPrediction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GoldPredictionFindFirstArgs>(args?: SelectSubset<T, GoldPredictionFindFirstArgs<ExtArgs>>): Prisma__GoldPredictionClient<$Result.GetResult<Prisma.$GoldPredictionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GoldPrediction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoldPredictionFindFirstOrThrowArgs} args - Arguments to find a GoldPrediction
     * @example
     * // Get one GoldPrediction
     * const goldPrediction = await prisma.goldPrediction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GoldPredictionFindFirstOrThrowArgs>(args?: SelectSubset<T, GoldPredictionFindFirstOrThrowArgs<ExtArgs>>): Prisma__GoldPredictionClient<$Result.GetResult<Prisma.$GoldPredictionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GoldPredictions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoldPredictionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GoldPredictions
     * const goldPredictions = await prisma.goldPrediction.findMany()
     * 
     * // Get first 10 GoldPredictions
     * const goldPredictions = await prisma.goldPrediction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const goldPredictionWithIdOnly = await prisma.goldPrediction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GoldPredictionFindManyArgs>(args?: SelectSubset<T, GoldPredictionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GoldPredictionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GoldPrediction.
     * @param {GoldPredictionCreateArgs} args - Arguments to create a GoldPrediction.
     * @example
     * // Create one GoldPrediction
     * const GoldPrediction = await prisma.goldPrediction.create({
     *   data: {
     *     // ... data to create a GoldPrediction
     *   }
     * })
     * 
     */
    create<T extends GoldPredictionCreateArgs>(args: SelectSubset<T, GoldPredictionCreateArgs<ExtArgs>>): Prisma__GoldPredictionClient<$Result.GetResult<Prisma.$GoldPredictionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GoldPredictions.
     * @param {GoldPredictionCreateManyArgs} args - Arguments to create many GoldPredictions.
     * @example
     * // Create many GoldPredictions
     * const goldPrediction = await prisma.goldPrediction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GoldPredictionCreateManyArgs>(args?: SelectSubset<T, GoldPredictionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a GoldPrediction.
     * @param {GoldPredictionDeleteArgs} args - Arguments to delete one GoldPrediction.
     * @example
     * // Delete one GoldPrediction
     * const GoldPrediction = await prisma.goldPrediction.delete({
     *   where: {
     *     // ... filter to delete one GoldPrediction
     *   }
     * })
     * 
     */
    delete<T extends GoldPredictionDeleteArgs>(args: SelectSubset<T, GoldPredictionDeleteArgs<ExtArgs>>): Prisma__GoldPredictionClient<$Result.GetResult<Prisma.$GoldPredictionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GoldPrediction.
     * @param {GoldPredictionUpdateArgs} args - Arguments to update one GoldPrediction.
     * @example
     * // Update one GoldPrediction
     * const goldPrediction = await prisma.goldPrediction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GoldPredictionUpdateArgs>(args: SelectSubset<T, GoldPredictionUpdateArgs<ExtArgs>>): Prisma__GoldPredictionClient<$Result.GetResult<Prisma.$GoldPredictionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GoldPredictions.
     * @param {GoldPredictionDeleteManyArgs} args - Arguments to filter GoldPredictions to delete.
     * @example
     * // Delete a few GoldPredictions
     * const { count } = await prisma.goldPrediction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GoldPredictionDeleteManyArgs>(args?: SelectSubset<T, GoldPredictionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GoldPredictions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoldPredictionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GoldPredictions
     * const goldPrediction = await prisma.goldPrediction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GoldPredictionUpdateManyArgs>(args: SelectSubset<T, GoldPredictionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GoldPrediction.
     * @param {GoldPredictionUpsertArgs} args - Arguments to update or create a GoldPrediction.
     * @example
     * // Update or create a GoldPrediction
     * const goldPrediction = await prisma.goldPrediction.upsert({
     *   create: {
     *     // ... data to create a GoldPrediction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GoldPrediction we want to update
     *   }
     * })
     */
    upsert<T extends GoldPredictionUpsertArgs>(args: SelectSubset<T, GoldPredictionUpsertArgs<ExtArgs>>): Prisma__GoldPredictionClient<$Result.GetResult<Prisma.$GoldPredictionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GoldPredictions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoldPredictionCountArgs} args - Arguments to filter GoldPredictions to count.
     * @example
     * // Count the number of GoldPredictions
     * const count = await prisma.goldPrediction.count({
     *   where: {
     *     // ... the filter for the GoldPredictions we want to count
     *   }
     * })
    **/
    count<T extends GoldPredictionCountArgs>(
      args?: Subset<T, GoldPredictionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GoldPredictionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GoldPrediction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoldPredictionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends GoldPredictionAggregateArgs>(args: Subset<T, GoldPredictionAggregateArgs>): Prisma.PrismaPromise<GetGoldPredictionAggregateType<T>>

    /**
     * Group by GoldPrediction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GoldPredictionGroupByArgs} args - Group by arguments.
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
      T extends GoldPredictionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GoldPredictionGroupByArgs['orderBy'] }
        : { orderBy?: GoldPredictionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, GoldPredictionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGoldPredictionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GoldPrediction model
   */
  readonly fields: GoldPredictionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GoldPrediction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GoldPredictionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the GoldPrediction model
   */
  interface GoldPredictionFieldRefs {
    readonly id: FieldRef<"GoldPrediction", 'String'>
    readonly asset: FieldRef<"GoldPrediction", 'String'>
    readonly predictionDate: FieldRef<"GoldPrediction", 'String'>
    readonly direction: FieldRef<"GoldPrediction", 'String'>
    readonly confidence: FieldRef<"GoldPrediction", 'Float'>
    readonly probability: FieldRef<"GoldPrediction", 'Float'>
    readonly nextDayPrediction: FieldRef<"GoldPrediction", 'Int'>
    readonly basedOnDays: FieldRef<"GoldPrediction", 'Int'>
    readonly createdAt: FieldRef<"GoldPrediction", 'DateTime'>
    readonly updatedAt: FieldRef<"GoldPrediction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GoldPrediction findUnique
   */
  export type GoldPredictionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GoldPrediction
     */
    select?: GoldPredictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GoldPrediction
     */
    omit?: GoldPredictionOmit<ExtArgs> | null
    /**
     * Filter, which GoldPrediction to fetch.
     */
    where: GoldPredictionWhereUniqueInput
  }

  /**
   * GoldPrediction findUniqueOrThrow
   */
  export type GoldPredictionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GoldPrediction
     */
    select?: GoldPredictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GoldPrediction
     */
    omit?: GoldPredictionOmit<ExtArgs> | null
    /**
     * Filter, which GoldPrediction to fetch.
     */
    where: GoldPredictionWhereUniqueInput
  }

  /**
   * GoldPrediction findFirst
   */
  export type GoldPredictionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GoldPrediction
     */
    select?: GoldPredictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GoldPrediction
     */
    omit?: GoldPredictionOmit<ExtArgs> | null
    /**
     * Filter, which GoldPrediction to fetch.
     */
    where?: GoldPredictionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GoldPredictions to fetch.
     */
    orderBy?: GoldPredictionOrderByWithRelationInput | GoldPredictionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GoldPredictions.
     */
    cursor?: GoldPredictionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GoldPredictions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GoldPredictions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GoldPredictions.
     */
    distinct?: GoldPredictionScalarFieldEnum | GoldPredictionScalarFieldEnum[]
  }

  /**
   * GoldPrediction findFirstOrThrow
   */
  export type GoldPredictionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GoldPrediction
     */
    select?: GoldPredictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GoldPrediction
     */
    omit?: GoldPredictionOmit<ExtArgs> | null
    /**
     * Filter, which GoldPrediction to fetch.
     */
    where?: GoldPredictionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GoldPredictions to fetch.
     */
    orderBy?: GoldPredictionOrderByWithRelationInput | GoldPredictionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GoldPredictions.
     */
    cursor?: GoldPredictionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GoldPredictions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GoldPredictions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GoldPredictions.
     */
    distinct?: GoldPredictionScalarFieldEnum | GoldPredictionScalarFieldEnum[]
  }

  /**
   * GoldPrediction findMany
   */
  export type GoldPredictionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GoldPrediction
     */
    select?: GoldPredictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GoldPrediction
     */
    omit?: GoldPredictionOmit<ExtArgs> | null
    /**
     * Filter, which GoldPredictions to fetch.
     */
    where?: GoldPredictionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GoldPredictions to fetch.
     */
    orderBy?: GoldPredictionOrderByWithRelationInput | GoldPredictionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GoldPredictions.
     */
    cursor?: GoldPredictionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GoldPredictions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GoldPredictions.
     */
    skip?: number
    distinct?: GoldPredictionScalarFieldEnum | GoldPredictionScalarFieldEnum[]
  }

  /**
   * GoldPrediction create
   */
  export type GoldPredictionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GoldPrediction
     */
    select?: GoldPredictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GoldPrediction
     */
    omit?: GoldPredictionOmit<ExtArgs> | null
    /**
     * The data needed to create a GoldPrediction.
     */
    data: XOR<GoldPredictionCreateInput, GoldPredictionUncheckedCreateInput>
  }

  /**
   * GoldPrediction createMany
   */
  export type GoldPredictionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GoldPredictions.
     */
    data: GoldPredictionCreateManyInput | GoldPredictionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GoldPrediction update
   */
  export type GoldPredictionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GoldPrediction
     */
    select?: GoldPredictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GoldPrediction
     */
    omit?: GoldPredictionOmit<ExtArgs> | null
    /**
     * The data needed to update a GoldPrediction.
     */
    data: XOR<GoldPredictionUpdateInput, GoldPredictionUncheckedUpdateInput>
    /**
     * Choose, which GoldPrediction to update.
     */
    where: GoldPredictionWhereUniqueInput
  }

  /**
   * GoldPrediction updateMany
   */
  export type GoldPredictionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GoldPredictions.
     */
    data: XOR<GoldPredictionUpdateManyMutationInput, GoldPredictionUncheckedUpdateManyInput>
    /**
     * Filter which GoldPredictions to update
     */
    where?: GoldPredictionWhereInput
    /**
     * Limit how many GoldPredictions to update.
     */
    limit?: number
  }

  /**
   * GoldPrediction upsert
   */
  export type GoldPredictionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GoldPrediction
     */
    select?: GoldPredictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GoldPrediction
     */
    omit?: GoldPredictionOmit<ExtArgs> | null
    /**
     * The filter to search for the GoldPrediction to update in case it exists.
     */
    where: GoldPredictionWhereUniqueInput
    /**
     * In case the GoldPrediction found by the `where` argument doesn't exist, create a new GoldPrediction with this data.
     */
    create: XOR<GoldPredictionCreateInput, GoldPredictionUncheckedCreateInput>
    /**
     * In case the GoldPrediction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GoldPredictionUpdateInput, GoldPredictionUncheckedUpdateInput>
  }

  /**
   * GoldPrediction delete
   */
  export type GoldPredictionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GoldPrediction
     */
    select?: GoldPredictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GoldPrediction
     */
    omit?: GoldPredictionOmit<ExtArgs> | null
    /**
     * Filter which GoldPrediction to delete.
     */
    where: GoldPredictionWhereUniqueInput
  }

  /**
   * GoldPrediction deleteMany
   */
  export type GoldPredictionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GoldPredictions to delete
     */
    where?: GoldPredictionWhereInput
    /**
     * Limit how many GoldPredictions to delete.
     */
    limit?: number
  }

  /**
   * GoldPrediction without action
   */
  export type GoldPredictionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GoldPrediction
     */
    select?: GoldPredictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GoldPrediction
     */
    omit?: GoldPredictionOmit<ExtArgs> | null
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


  export const RealTimePriceScalarFieldEnum: {
    id: 'id',
    asset: 'asset',
    currentPrice: 'currentPrice',
    changeValue: 'changeValue',
    changeRatio: 'changeRatio',
    isUp: 'isUp',
    round: 'round',
    time: 'time',
    rawDateTime: 'rawDateTime',
    updatedAt: 'updatedAt',
    createdAt: 'createdAt'
  };

  export type RealTimePriceScalarFieldEnum = (typeof RealTimePriceScalarFieldEnum)[keyof typeof RealTimePriceScalarFieldEnum]


  export const DailyPriceScalarFieldEnum: {
    id: 'id',
    asset: 'asset',
    date: 'date',
    close: 'close',
    diff: 'diff',
    ratio: 'ratio',
    createdAt: 'createdAt'
  };

  export type DailyPriceScalarFieldEnum = (typeof DailyPriceScalarFieldEnum)[keyof typeof DailyPriceScalarFieldEnum]


  export const ChartPriceScalarFieldEnum: {
    id: 'id',
    asset: 'asset',
    price: 'price',
    degreeCount: 'degreeCount',
    dateTime: 'dateTime',
    createdAt: 'createdAt'
  };

  export type ChartPriceScalarFieldEnum = (typeof ChartPriceScalarFieldEnum)[keyof typeof ChartPriceScalarFieldEnum]


  export const GoldPredictionScalarFieldEnum: {
    id: 'id',
    asset: 'asset',
    predictionDate: 'predictionDate',
    direction: 'direction',
    confidence: 'confidence',
    probability: 'probability',
    nextDayPrediction: 'nextDayPrediction',
    basedOnDays: 'basedOnDays',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GoldPredictionScalarFieldEnum = (typeof GoldPredictionScalarFieldEnum)[keyof typeof GoldPredictionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const RealTimePriceOrderByRelevanceFieldEnum: {
    id: 'id',
    asset: 'asset',
    round: 'round',
    time: 'time',
    rawDateTime: 'rawDateTime'
  };

  export type RealTimePriceOrderByRelevanceFieldEnum = (typeof RealTimePriceOrderByRelevanceFieldEnum)[keyof typeof RealTimePriceOrderByRelevanceFieldEnum]


  export const DailyPriceOrderByRelevanceFieldEnum: {
    id: 'id',
    asset: 'asset',
    date: 'date'
  };

  export type DailyPriceOrderByRelevanceFieldEnum = (typeof DailyPriceOrderByRelevanceFieldEnum)[keyof typeof DailyPriceOrderByRelevanceFieldEnum]


  export const ChartPriceOrderByRelevanceFieldEnum: {
    id: 'id',
    asset: 'asset',
    dateTime: 'dateTime'
  };

  export type ChartPriceOrderByRelevanceFieldEnum = (typeof ChartPriceOrderByRelevanceFieldEnum)[keyof typeof ChartPriceOrderByRelevanceFieldEnum]


  export const GoldPredictionOrderByRelevanceFieldEnum: {
    id: 'id',
    asset: 'asset',
    predictionDate: 'predictionDate',
    direction: 'direction'
  };

  export type GoldPredictionOrderByRelevanceFieldEnum = (typeof GoldPredictionOrderByRelevanceFieldEnum)[keyof typeof GoldPredictionOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    
  /**
   * Deep Input Types
   */


  export type RealTimePriceWhereInput = {
    AND?: RealTimePriceWhereInput | RealTimePriceWhereInput[]
    OR?: RealTimePriceWhereInput[]
    NOT?: RealTimePriceWhereInput | RealTimePriceWhereInput[]
    id?: StringFilter<"RealTimePrice"> | string
    asset?: StringFilter<"RealTimePrice"> | string
    currentPrice?: FloatFilter<"RealTimePrice"> | number
    changeValue?: FloatFilter<"RealTimePrice"> | number
    changeRatio?: FloatFilter<"RealTimePrice"> | number
    isUp?: IntFilter<"RealTimePrice"> | number
    round?: StringFilter<"RealTimePrice"> | string
    time?: StringFilter<"RealTimePrice"> | string
    rawDateTime?: StringFilter<"RealTimePrice"> | string
    updatedAt?: DateTimeFilter<"RealTimePrice"> | Date | string
    createdAt?: DateTimeFilter<"RealTimePrice"> | Date | string
  }

  export type RealTimePriceOrderByWithRelationInput = {
    id?: SortOrder
    asset?: SortOrder
    currentPrice?: SortOrder
    changeValue?: SortOrder
    changeRatio?: SortOrder
    isUp?: SortOrder
    round?: SortOrder
    time?: SortOrder
    rawDateTime?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
    _relevance?: RealTimePriceOrderByRelevanceInput
  }

  export type RealTimePriceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    asset?: string
    AND?: RealTimePriceWhereInput | RealTimePriceWhereInput[]
    OR?: RealTimePriceWhereInput[]
    NOT?: RealTimePriceWhereInput | RealTimePriceWhereInput[]
    currentPrice?: FloatFilter<"RealTimePrice"> | number
    changeValue?: FloatFilter<"RealTimePrice"> | number
    changeRatio?: FloatFilter<"RealTimePrice"> | number
    isUp?: IntFilter<"RealTimePrice"> | number
    round?: StringFilter<"RealTimePrice"> | string
    time?: StringFilter<"RealTimePrice"> | string
    rawDateTime?: StringFilter<"RealTimePrice"> | string
    updatedAt?: DateTimeFilter<"RealTimePrice"> | Date | string
    createdAt?: DateTimeFilter<"RealTimePrice"> | Date | string
  }, "id" | "asset">

  export type RealTimePriceOrderByWithAggregationInput = {
    id?: SortOrder
    asset?: SortOrder
    currentPrice?: SortOrder
    changeValue?: SortOrder
    changeRatio?: SortOrder
    isUp?: SortOrder
    round?: SortOrder
    time?: SortOrder
    rawDateTime?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
    _count?: RealTimePriceCountOrderByAggregateInput
    _avg?: RealTimePriceAvgOrderByAggregateInput
    _max?: RealTimePriceMaxOrderByAggregateInput
    _min?: RealTimePriceMinOrderByAggregateInput
    _sum?: RealTimePriceSumOrderByAggregateInput
  }

  export type RealTimePriceScalarWhereWithAggregatesInput = {
    AND?: RealTimePriceScalarWhereWithAggregatesInput | RealTimePriceScalarWhereWithAggregatesInput[]
    OR?: RealTimePriceScalarWhereWithAggregatesInput[]
    NOT?: RealTimePriceScalarWhereWithAggregatesInput | RealTimePriceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RealTimePrice"> | string
    asset?: StringWithAggregatesFilter<"RealTimePrice"> | string
    currentPrice?: FloatWithAggregatesFilter<"RealTimePrice"> | number
    changeValue?: FloatWithAggregatesFilter<"RealTimePrice"> | number
    changeRatio?: FloatWithAggregatesFilter<"RealTimePrice"> | number
    isUp?: IntWithAggregatesFilter<"RealTimePrice"> | number
    round?: StringWithAggregatesFilter<"RealTimePrice"> | string
    time?: StringWithAggregatesFilter<"RealTimePrice"> | string
    rawDateTime?: StringWithAggregatesFilter<"RealTimePrice"> | string
    updatedAt?: DateTimeWithAggregatesFilter<"RealTimePrice"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"RealTimePrice"> | Date | string
  }

  export type DailyPriceWhereInput = {
    AND?: DailyPriceWhereInput | DailyPriceWhereInput[]
    OR?: DailyPriceWhereInput[]
    NOT?: DailyPriceWhereInput | DailyPriceWhereInput[]
    id?: StringFilter<"DailyPrice"> | string
    asset?: StringFilter<"DailyPrice"> | string
    date?: StringFilter<"DailyPrice"> | string
    close?: FloatFilter<"DailyPrice"> | number
    diff?: FloatFilter<"DailyPrice"> | number
    ratio?: FloatFilter<"DailyPrice"> | number
    createdAt?: DateTimeFilter<"DailyPrice"> | Date | string
  }

  export type DailyPriceOrderByWithRelationInput = {
    id?: SortOrder
    asset?: SortOrder
    date?: SortOrder
    close?: SortOrder
    diff?: SortOrder
    ratio?: SortOrder
    createdAt?: SortOrder
    _relevance?: DailyPriceOrderByRelevanceInput
  }

  export type DailyPriceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    asset_date?: DailyPriceAssetDateCompoundUniqueInput
    AND?: DailyPriceWhereInput | DailyPriceWhereInput[]
    OR?: DailyPriceWhereInput[]
    NOT?: DailyPriceWhereInput | DailyPriceWhereInput[]
    asset?: StringFilter<"DailyPrice"> | string
    date?: StringFilter<"DailyPrice"> | string
    close?: FloatFilter<"DailyPrice"> | number
    diff?: FloatFilter<"DailyPrice"> | number
    ratio?: FloatFilter<"DailyPrice"> | number
    createdAt?: DateTimeFilter<"DailyPrice"> | Date | string
  }, "id" | "asset_date">

  export type DailyPriceOrderByWithAggregationInput = {
    id?: SortOrder
    asset?: SortOrder
    date?: SortOrder
    close?: SortOrder
    diff?: SortOrder
    ratio?: SortOrder
    createdAt?: SortOrder
    _count?: DailyPriceCountOrderByAggregateInput
    _avg?: DailyPriceAvgOrderByAggregateInput
    _max?: DailyPriceMaxOrderByAggregateInput
    _min?: DailyPriceMinOrderByAggregateInput
    _sum?: DailyPriceSumOrderByAggregateInput
  }

  export type DailyPriceScalarWhereWithAggregatesInput = {
    AND?: DailyPriceScalarWhereWithAggregatesInput | DailyPriceScalarWhereWithAggregatesInput[]
    OR?: DailyPriceScalarWhereWithAggregatesInput[]
    NOT?: DailyPriceScalarWhereWithAggregatesInput | DailyPriceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DailyPrice"> | string
    asset?: StringWithAggregatesFilter<"DailyPrice"> | string
    date?: StringWithAggregatesFilter<"DailyPrice"> | string
    close?: FloatWithAggregatesFilter<"DailyPrice"> | number
    diff?: FloatWithAggregatesFilter<"DailyPrice"> | number
    ratio?: FloatWithAggregatesFilter<"DailyPrice"> | number
    createdAt?: DateTimeWithAggregatesFilter<"DailyPrice"> | Date | string
  }

  export type ChartPriceWhereInput = {
    AND?: ChartPriceWhereInput | ChartPriceWhereInput[]
    OR?: ChartPriceWhereInput[]
    NOT?: ChartPriceWhereInput | ChartPriceWhereInput[]
    id?: StringFilter<"ChartPrice"> | string
    asset?: StringFilter<"ChartPrice"> | string
    price?: FloatFilter<"ChartPrice"> | number
    degreeCount?: IntFilter<"ChartPrice"> | number
    dateTime?: StringFilter<"ChartPrice"> | string
    createdAt?: DateTimeFilter<"ChartPrice"> | Date | string
  }

  export type ChartPriceOrderByWithRelationInput = {
    id?: SortOrder
    asset?: SortOrder
    price?: SortOrder
    degreeCount?: SortOrder
    dateTime?: SortOrder
    createdAt?: SortOrder
    _relevance?: ChartPriceOrderByRelevanceInput
  }

  export type ChartPriceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    asset_dateTime_degreeCount?: ChartPriceAsset_dateTime_degreeCountCompoundUniqueInput
    AND?: ChartPriceWhereInput | ChartPriceWhereInput[]
    OR?: ChartPriceWhereInput[]
    NOT?: ChartPriceWhereInput | ChartPriceWhereInput[]
    asset?: StringFilter<"ChartPrice"> | string
    price?: FloatFilter<"ChartPrice"> | number
    degreeCount?: IntFilter<"ChartPrice"> | number
    dateTime?: StringFilter<"ChartPrice"> | string
    createdAt?: DateTimeFilter<"ChartPrice"> | Date | string
  }, "id" | "asset_dateTime_degreeCount">

  export type ChartPriceOrderByWithAggregationInput = {
    id?: SortOrder
    asset?: SortOrder
    price?: SortOrder
    degreeCount?: SortOrder
    dateTime?: SortOrder
    createdAt?: SortOrder
    _count?: ChartPriceCountOrderByAggregateInput
    _avg?: ChartPriceAvgOrderByAggregateInput
    _max?: ChartPriceMaxOrderByAggregateInput
    _min?: ChartPriceMinOrderByAggregateInput
    _sum?: ChartPriceSumOrderByAggregateInput
  }

  export type ChartPriceScalarWhereWithAggregatesInput = {
    AND?: ChartPriceScalarWhereWithAggregatesInput | ChartPriceScalarWhereWithAggregatesInput[]
    OR?: ChartPriceScalarWhereWithAggregatesInput[]
    NOT?: ChartPriceScalarWhereWithAggregatesInput | ChartPriceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ChartPrice"> | string
    asset?: StringWithAggregatesFilter<"ChartPrice"> | string
    price?: FloatWithAggregatesFilter<"ChartPrice"> | number
    degreeCount?: IntWithAggregatesFilter<"ChartPrice"> | number
    dateTime?: StringWithAggregatesFilter<"ChartPrice"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ChartPrice"> | Date | string
  }

  export type GoldPredictionWhereInput = {
    AND?: GoldPredictionWhereInput | GoldPredictionWhereInput[]
    OR?: GoldPredictionWhereInput[]
    NOT?: GoldPredictionWhereInput | GoldPredictionWhereInput[]
    id?: StringFilter<"GoldPrediction"> | string
    asset?: StringFilter<"GoldPrediction"> | string
    predictionDate?: StringFilter<"GoldPrediction"> | string
    direction?: StringFilter<"GoldPrediction"> | string
    confidence?: FloatFilter<"GoldPrediction"> | number
    probability?: FloatFilter<"GoldPrediction"> | number
    nextDayPrediction?: IntFilter<"GoldPrediction"> | number
    basedOnDays?: IntFilter<"GoldPrediction"> | number
    createdAt?: DateTimeFilter<"GoldPrediction"> | Date | string
    updatedAt?: DateTimeFilter<"GoldPrediction"> | Date | string
  }

  export type GoldPredictionOrderByWithRelationInput = {
    id?: SortOrder
    asset?: SortOrder
    predictionDate?: SortOrder
    direction?: SortOrder
    confidence?: SortOrder
    probability?: SortOrder
    nextDayPrediction?: SortOrder
    basedOnDays?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: GoldPredictionOrderByRelevanceInput
  }

  export type GoldPredictionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    asset_predictionDate?: GoldPredictionAssetPredictionDateCompoundUniqueInput
    AND?: GoldPredictionWhereInput | GoldPredictionWhereInput[]
    OR?: GoldPredictionWhereInput[]
    NOT?: GoldPredictionWhereInput | GoldPredictionWhereInput[]
    asset?: StringFilter<"GoldPrediction"> | string
    predictionDate?: StringFilter<"GoldPrediction"> | string
    direction?: StringFilter<"GoldPrediction"> | string
    confidence?: FloatFilter<"GoldPrediction"> | number
    probability?: FloatFilter<"GoldPrediction"> | number
    nextDayPrediction?: IntFilter<"GoldPrediction"> | number
    basedOnDays?: IntFilter<"GoldPrediction"> | number
    createdAt?: DateTimeFilter<"GoldPrediction"> | Date | string
    updatedAt?: DateTimeFilter<"GoldPrediction"> | Date | string
  }, "id" | "asset_predictionDate">

  export type GoldPredictionOrderByWithAggregationInput = {
    id?: SortOrder
    asset?: SortOrder
    predictionDate?: SortOrder
    direction?: SortOrder
    confidence?: SortOrder
    probability?: SortOrder
    nextDayPrediction?: SortOrder
    basedOnDays?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GoldPredictionCountOrderByAggregateInput
    _avg?: GoldPredictionAvgOrderByAggregateInput
    _max?: GoldPredictionMaxOrderByAggregateInput
    _min?: GoldPredictionMinOrderByAggregateInput
    _sum?: GoldPredictionSumOrderByAggregateInput
  }

  export type GoldPredictionScalarWhereWithAggregatesInput = {
    AND?: GoldPredictionScalarWhereWithAggregatesInput | GoldPredictionScalarWhereWithAggregatesInput[]
    OR?: GoldPredictionScalarWhereWithAggregatesInput[]
    NOT?: GoldPredictionScalarWhereWithAggregatesInput | GoldPredictionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GoldPrediction"> | string
    asset?: StringWithAggregatesFilter<"GoldPrediction"> | string
    predictionDate?: StringWithAggregatesFilter<"GoldPrediction"> | string
    direction?: StringWithAggregatesFilter<"GoldPrediction"> | string
    confidence?: FloatWithAggregatesFilter<"GoldPrediction"> | number
    probability?: FloatWithAggregatesFilter<"GoldPrediction"> | number
    nextDayPrediction?: IntWithAggregatesFilter<"GoldPrediction"> | number
    basedOnDays?: IntWithAggregatesFilter<"GoldPrediction"> | number
    createdAt?: DateTimeWithAggregatesFilter<"GoldPrediction"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GoldPrediction"> | Date | string
  }

  export type RealTimePriceCreateInput = {
    id?: string
    asset: string
    currentPrice: number
    changeValue: number
    changeRatio: number
    isUp: number
    round: string
    time: string
    rawDateTime: string
    updatedAt?: Date | string
    createdAt?: Date | string
  }

  export type RealTimePriceUncheckedCreateInput = {
    id?: string
    asset: string
    currentPrice: number
    changeValue: number
    changeRatio: number
    isUp: number
    round: string
    time: string
    rawDateTime: string
    updatedAt?: Date | string
    createdAt?: Date | string
  }

  export type RealTimePriceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    currentPrice?: FloatFieldUpdateOperationsInput | number
    changeValue?: FloatFieldUpdateOperationsInput | number
    changeRatio?: FloatFieldUpdateOperationsInput | number
    isUp?: IntFieldUpdateOperationsInput | number
    round?: StringFieldUpdateOperationsInput | string
    time?: StringFieldUpdateOperationsInput | string
    rawDateTime?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RealTimePriceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    currentPrice?: FloatFieldUpdateOperationsInput | number
    changeValue?: FloatFieldUpdateOperationsInput | number
    changeRatio?: FloatFieldUpdateOperationsInput | number
    isUp?: IntFieldUpdateOperationsInput | number
    round?: StringFieldUpdateOperationsInput | string
    time?: StringFieldUpdateOperationsInput | string
    rawDateTime?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RealTimePriceCreateManyInput = {
    id?: string
    asset: string
    currentPrice: number
    changeValue: number
    changeRatio: number
    isUp: number
    round: string
    time: string
    rawDateTime: string
    updatedAt?: Date | string
    createdAt?: Date | string
  }

  export type RealTimePriceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    currentPrice?: FloatFieldUpdateOperationsInput | number
    changeValue?: FloatFieldUpdateOperationsInput | number
    changeRatio?: FloatFieldUpdateOperationsInput | number
    isUp?: IntFieldUpdateOperationsInput | number
    round?: StringFieldUpdateOperationsInput | string
    time?: StringFieldUpdateOperationsInput | string
    rawDateTime?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RealTimePriceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    currentPrice?: FloatFieldUpdateOperationsInput | number
    changeValue?: FloatFieldUpdateOperationsInput | number
    changeRatio?: FloatFieldUpdateOperationsInput | number
    isUp?: IntFieldUpdateOperationsInput | number
    round?: StringFieldUpdateOperationsInput | string
    time?: StringFieldUpdateOperationsInput | string
    rawDateTime?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyPriceCreateInput = {
    id?: string
    asset: string
    date: string
    close: number
    diff: number
    ratio: number
    createdAt?: Date | string
  }

  export type DailyPriceUncheckedCreateInput = {
    id?: string
    asset: string
    date: string
    close: number
    diff: number
    ratio: number
    createdAt?: Date | string
  }

  export type DailyPriceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    close?: FloatFieldUpdateOperationsInput | number
    diff?: FloatFieldUpdateOperationsInput | number
    ratio?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyPriceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    close?: FloatFieldUpdateOperationsInput | number
    diff?: FloatFieldUpdateOperationsInput | number
    ratio?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyPriceCreateManyInput = {
    id?: string
    asset: string
    date: string
    close: number
    diff: number
    ratio: number
    createdAt?: Date | string
  }

  export type DailyPriceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    close?: FloatFieldUpdateOperationsInput | number
    diff?: FloatFieldUpdateOperationsInput | number
    ratio?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyPriceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    close?: FloatFieldUpdateOperationsInput | number
    diff?: FloatFieldUpdateOperationsInput | number
    ratio?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChartPriceCreateInput = {
    id?: string
    asset: string
    price: number
    degreeCount: number
    dateTime: string
    createdAt?: Date | string
  }

  export type ChartPriceUncheckedCreateInput = {
    id?: string
    asset: string
    price: number
    degreeCount: number
    dateTime: string
    createdAt?: Date | string
  }

  export type ChartPriceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    degreeCount?: IntFieldUpdateOperationsInput | number
    dateTime?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChartPriceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    degreeCount?: IntFieldUpdateOperationsInput | number
    dateTime?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChartPriceCreateManyInput = {
    id?: string
    asset: string
    price: number
    degreeCount: number
    dateTime: string
    createdAt?: Date | string
  }

  export type ChartPriceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    degreeCount?: IntFieldUpdateOperationsInput | number
    dateTime?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChartPriceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    degreeCount?: IntFieldUpdateOperationsInput | number
    dateTime?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GoldPredictionCreateInput = {
    id?: string
    asset?: string
    predictionDate: string
    direction: string
    confidence: number
    probability: number
    nextDayPrediction: number
    basedOnDays: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GoldPredictionUncheckedCreateInput = {
    id?: string
    asset?: string
    predictionDate: string
    direction: string
    confidence: number
    probability: number
    nextDayPrediction: number
    basedOnDays: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GoldPredictionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    predictionDate?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    probability?: FloatFieldUpdateOperationsInput | number
    nextDayPrediction?: IntFieldUpdateOperationsInput | number
    basedOnDays?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GoldPredictionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    predictionDate?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    probability?: FloatFieldUpdateOperationsInput | number
    nextDayPrediction?: IntFieldUpdateOperationsInput | number
    basedOnDays?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GoldPredictionCreateManyInput = {
    id?: string
    asset?: string
    predictionDate: string
    direction: string
    confidence: number
    probability: number
    nextDayPrediction: number
    basedOnDays: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GoldPredictionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    predictionDate?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    probability?: FloatFieldUpdateOperationsInput | number
    nextDayPrediction?: IntFieldUpdateOperationsInput | number
    basedOnDays?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GoldPredictionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    asset?: StringFieldUpdateOperationsInput | string
    predictionDate?: StringFieldUpdateOperationsInput | string
    direction?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    probability?: FloatFieldUpdateOperationsInput | number
    nextDayPrediction?: IntFieldUpdateOperationsInput | number
    basedOnDays?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
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

  export type RealTimePriceOrderByRelevanceInput = {
    fields: RealTimePriceOrderByRelevanceFieldEnum | RealTimePriceOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type RealTimePriceCountOrderByAggregateInput = {
    id?: SortOrder
    asset?: SortOrder
    currentPrice?: SortOrder
    changeValue?: SortOrder
    changeRatio?: SortOrder
    isUp?: SortOrder
    round?: SortOrder
    time?: SortOrder
    rawDateTime?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type RealTimePriceAvgOrderByAggregateInput = {
    currentPrice?: SortOrder
    changeValue?: SortOrder
    changeRatio?: SortOrder
    isUp?: SortOrder
  }

  export type RealTimePriceMaxOrderByAggregateInput = {
    id?: SortOrder
    asset?: SortOrder
    currentPrice?: SortOrder
    changeValue?: SortOrder
    changeRatio?: SortOrder
    isUp?: SortOrder
    round?: SortOrder
    time?: SortOrder
    rawDateTime?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type RealTimePriceMinOrderByAggregateInput = {
    id?: SortOrder
    asset?: SortOrder
    currentPrice?: SortOrder
    changeValue?: SortOrder
    changeRatio?: SortOrder
    isUp?: SortOrder
    round?: SortOrder
    time?: SortOrder
    rawDateTime?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type RealTimePriceSumOrderByAggregateInput = {
    currentPrice?: SortOrder
    changeValue?: SortOrder
    changeRatio?: SortOrder
    isUp?: SortOrder
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

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
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

  export type DailyPriceOrderByRelevanceInput = {
    fields: DailyPriceOrderByRelevanceFieldEnum | DailyPriceOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type DailyPriceAssetDateCompoundUniqueInput = {
    asset: string
    date: string
  }

  export type DailyPriceCountOrderByAggregateInput = {
    id?: SortOrder
    asset?: SortOrder
    date?: SortOrder
    close?: SortOrder
    diff?: SortOrder
    ratio?: SortOrder
    createdAt?: SortOrder
  }

  export type DailyPriceAvgOrderByAggregateInput = {
    close?: SortOrder
    diff?: SortOrder
    ratio?: SortOrder
  }

  export type DailyPriceMaxOrderByAggregateInput = {
    id?: SortOrder
    asset?: SortOrder
    date?: SortOrder
    close?: SortOrder
    diff?: SortOrder
    ratio?: SortOrder
    createdAt?: SortOrder
  }

  export type DailyPriceMinOrderByAggregateInput = {
    id?: SortOrder
    asset?: SortOrder
    date?: SortOrder
    close?: SortOrder
    diff?: SortOrder
    ratio?: SortOrder
    createdAt?: SortOrder
  }

  export type DailyPriceSumOrderByAggregateInput = {
    close?: SortOrder
    diff?: SortOrder
    ratio?: SortOrder
  }

  export type ChartPriceOrderByRelevanceInput = {
    fields: ChartPriceOrderByRelevanceFieldEnum | ChartPriceOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ChartPriceAsset_dateTime_degreeCountCompoundUniqueInput = {
    asset: string
    dateTime: string
    degreeCount: number
  }

  export type ChartPriceCountOrderByAggregateInput = {
    id?: SortOrder
    asset?: SortOrder
    price?: SortOrder
    degreeCount?: SortOrder
    dateTime?: SortOrder
    createdAt?: SortOrder
  }

  export type ChartPriceAvgOrderByAggregateInput = {
    price?: SortOrder
    degreeCount?: SortOrder
  }

  export type ChartPriceMaxOrderByAggregateInput = {
    id?: SortOrder
    asset?: SortOrder
    price?: SortOrder
    degreeCount?: SortOrder
    dateTime?: SortOrder
    createdAt?: SortOrder
  }

  export type ChartPriceMinOrderByAggregateInput = {
    id?: SortOrder
    asset?: SortOrder
    price?: SortOrder
    degreeCount?: SortOrder
    dateTime?: SortOrder
    createdAt?: SortOrder
  }

  export type ChartPriceSumOrderByAggregateInput = {
    price?: SortOrder
    degreeCount?: SortOrder
  }

  export type GoldPredictionOrderByRelevanceInput = {
    fields: GoldPredictionOrderByRelevanceFieldEnum | GoldPredictionOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type GoldPredictionAssetPredictionDateCompoundUniqueInput = {
    asset: string
    predictionDate: string
  }

  export type GoldPredictionCountOrderByAggregateInput = {
    id?: SortOrder
    asset?: SortOrder
    predictionDate?: SortOrder
    direction?: SortOrder
    confidence?: SortOrder
    probability?: SortOrder
    nextDayPrediction?: SortOrder
    basedOnDays?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GoldPredictionAvgOrderByAggregateInput = {
    confidence?: SortOrder
    probability?: SortOrder
    nextDayPrediction?: SortOrder
    basedOnDays?: SortOrder
  }

  export type GoldPredictionMaxOrderByAggregateInput = {
    id?: SortOrder
    asset?: SortOrder
    predictionDate?: SortOrder
    direction?: SortOrder
    confidence?: SortOrder
    probability?: SortOrder
    nextDayPrediction?: SortOrder
    basedOnDays?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GoldPredictionMinOrderByAggregateInput = {
    id?: SortOrder
    asset?: SortOrder
    predictionDate?: SortOrder
    direction?: SortOrder
    confidence?: SortOrder
    probability?: SortOrder
    nextDayPrediction?: SortOrder
    basedOnDays?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GoldPredictionSumOrderByAggregateInput = {
    confidence?: SortOrder
    probability?: SortOrder
    nextDayPrediction?: SortOrder
    basedOnDays?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
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

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
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