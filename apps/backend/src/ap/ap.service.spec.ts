import { Test, TestingModule } from '@nestjs/testing';
import { ApService } from './ap.service';

describe('ApService', () => {
  let service: ApService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApService],
    }).compile();

    service = module.get<ApService>(ApService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
