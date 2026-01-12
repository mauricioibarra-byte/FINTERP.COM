import { Test, TestingModule } from '@nestjs/testing';
import { SiiService } from './sii.service';

describe('SiiService', () => {
  let service: SiiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiiService],
    }).compile();

    service = module.get<SiiService>(SiiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
