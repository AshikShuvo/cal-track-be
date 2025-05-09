import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationDto } from '../dto/pagination.dto';

interface IApiResponseOptions<T> {
  type?: Type<T>;
  isArray?: boolean;
  isPaginated?: boolean;
  status?: HttpStatus;
  description?: string;
}

export function apiResponseDecorator<T>(
  options: IApiResponseOptions<T> = {},
): MethodDecorator & ClassDecorator {
  const {
    type,
    isArray = false,
    isPaginated = false,
    status = HttpStatus.OK,
    description,
  } = options;

  if (!type) {
    return applyDecorators(
      ApiResponse({
        status,
        description: description || getDefaultDescription(status),
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: getDefaultDescription(status),
            },
            statusCode: {
              type: 'number',
              example: status,
            },
          },
        },
      }),
    );
  }

  const decorators = [ApiExtraModels(type)];

  if (isPaginated) {
    decorators.push(ApiExtraModels(PaginationDto));
  }

  const responseSchema = {
    type: 'object',
    properties: {
      data: isPaginated
        ? {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(type) },
              },
              meta: {
                type: 'object',
                properties: {
                  total: {
                    type: 'number',
                    example: 100,
                  },
                  page: {
                    type: 'number',
                    example: 1,
                  },
                  limit: {
                    type: 'number',
                    example: 10,
                  },
                  hasNextPage: {
                    type: 'boolean',
                    example: true,
                  },
                  hasPreviousPage: {
                    type: 'boolean',
                    example: false,
                  },
                },
              },
            },
          }
        : isArray
        ? {
            type: 'array',
            items: { $ref: getSchemaPath(type) },
          }
        : {
            $ref: getSchemaPath(type),
          },
      message: {
        type: 'string',
        example: getDefaultDescription(status),
      },
      statusCode: {
        type: 'number',
        example: status,
      },
    },
  };

  decorators.push(
    ApiResponse({
      status,
      description: description || getDefaultDescription(status),
      schema: responseSchema,
    }),
  );

  return applyDecorators(...decorators);
}

function getDefaultDescription(status: HttpStatus): string {
  switch (status) {
    case HttpStatus.OK:
      return 'Operation successful';
    case HttpStatus.CREATED:
      return 'Resource created successfully';
    case HttpStatus.BAD_REQUEST:
      return 'Bad request';
    case HttpStatus.UNAUTHORIZED:
      return 'Unauthorized access';
    case HttpStatus.FORBIDDEN:
      return 'Access forbidden';
    case HttpStatus.NOT_FOUND:
      return 'Resource not found';
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'Internal server error';
    default:
      return 'Operation completed';
  }
}

// Common error response decorators
export function apiBadRequestResponse(description?: string): MethodDecorator & ClassDecorator {
  return apiResponseDecorator({
    status: HttpStatus.BAD_REQUEST,
    description: description || 'Bad request',
  });
}

export function apiUnauthorizedResponse(description?: string): MethodDecorator & ClassDecorator {
  return apiResponseDecorator({
    status: HttpStatus.UNAUTHORIZED,
    description: description || 'Unauthorized access',
  });
}

export function apiForbiddenResponse(description?: string): MethodDecorator & ClassDecorator {
  return apiResponseDecorator({
    status: HttpStatus.FORBIDDEN,
    description: description || 'Access forbidden',
  });
}

export function apiNotFoundResponse(description?: string): MethodDecorator & ClassDecorator {
  return apiResponseDecorator({
    status: HttpStatus.NOT_FOUND,
    description: description || 'Resource not found',
  });
}

// Usage examples:
/*
@Get()
@apiResponseDecorator({ type: UserDto })
getUser(): Promise<IApiResponse<UserDto>> {}

@Get()
@apiResponseDecorator({ type: UserDto, isArray: true })
getUsers(): Promise<IApiResponse<UserDto[]>> {}

@Get()
@apiResponseDecorator({ type: UserDto, isPaginated: true })
@apiBadRequestResponse()
@apiUnauthorizedResponse()
getUsersPaginated(): Promise<IApiResponse<PaginatedResponse<UserDto>>> {}
*/ 