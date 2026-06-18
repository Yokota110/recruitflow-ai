import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  root() {
    return {
      status: 'ok',
      service: 'RecruitFlow API',
      docs: '/api/v1',
    };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
