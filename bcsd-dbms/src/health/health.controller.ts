import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health Check Endpoint for BCSD-DBMS' })
  @ApiResponse({
    status: 200,
    description: 'BCSD-DBMS Basic Health Check',
    type: 'Health Check',
  })
  check() {
    // What we should be listening on.
    const host = process.env.HOST ?? '127.0.0.1';
    const port = process.env.PORT ?? 80;
    return this.health.check([
      () => this.http.pingCheck('/api/positions', 'http://'+host+':'+port+'/api/positions'),
    ]);
  }
}
