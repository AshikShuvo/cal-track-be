import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IApiResponse } from './common/interfaces/api-response.interface';
import { apiResponseDecorator } from './common/decorators/api-response.decorator';

class HealthCheckResponse {
  status: string;
  timestamp: string;
}

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check API health status' })
  @apiResponseDecorator({
    type: HealthCheckResponse,
    description: 'The API is healthy',
  })
  getHealth(): IApiResponse<HealthCheckResponse> {
    return {
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
      message: 'Service is healthy',
      statusCode: 200,
    };
  }
}
