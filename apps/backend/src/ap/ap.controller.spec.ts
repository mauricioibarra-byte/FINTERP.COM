import { Test, TestingModule } from '@nestjs/testing';
import { ApController } from './ap.controller';

describe('ApController', () => {
  let controller: ApController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApController],
    }).compile();

    controller = module.get<ApController>(ApController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
