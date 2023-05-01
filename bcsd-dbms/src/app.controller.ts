import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';

@Controller()
@ApiTags('hello')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch the only Hello message'
  })
  @ApiOkResponse({
    description: 'Fetched the only Hello message',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
