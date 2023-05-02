import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PositionsService } from './positions.service';

describe('PositionsService', () => {
  let service: PositionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, PositionsService],
    }).compile();

    service = module.get<PositionsService>(PositionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
