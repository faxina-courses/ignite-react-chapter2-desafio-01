export abstract class StorageHelper<D> {
  constructor(protected readonly key: string) {}

  abstract save(data: D): void;

  abstract get(): string | null;

  abstract getDecoded(): D | null;

  abstract delete(): void;
}
