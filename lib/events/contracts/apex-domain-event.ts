export type ApexDomainEventValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[];

export type ApexDomainEventPayload =
  Record<
    string,
    ApexDomainEventValue
  >;

export type ApexDomainEvent<
  TType extends string = string,
  TCategory extends string = string,
  TSource extends string = string,
  TPayload extends
    ApexDomainEventPayload =
      ApexDomainEventPayload,
> = {
  userId: string;
  type: TType;
  category: TCategory;
  source: TSource;
  schemaVersion: number;
  payload: TPayload;
  occurredAt: Date;
};

export type ApexEventContract<
  TType extends string,
  TCategory extends string,
  TSource extends string,
> = {
  type: TType;
  category: TCategory;
  source: TSource;
  schemaVersion: number;
  description: string;
};
