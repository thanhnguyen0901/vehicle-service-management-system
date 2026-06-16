import { PipeTransform, ArgumentMetadata, UnprocessableEntityException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validates request body against a Zod schema.
 * Usage: @UsePipes(new ZodValidationPipe(MySchema))
 * Or globally — in that case, controllers must annotate DTOs with @Body(new ZodValidationPipe(schema)).
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema?: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    if (!this.schema) return value;

    const result = this.schema.safeParse(value);
    if (!result.success) {
      const details = (result.error as ZodError).errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      throw new UnprocessableEntityException({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      });
    }
    return result.data;
  }
}
