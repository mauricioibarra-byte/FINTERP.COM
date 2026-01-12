import { Test, TestingModule } from '@nestjs/testing';
import { ArController } from './ar.controller';

describe('ArController', () => {
  let controller: ArController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArController],
    }).compile();

    controller = module.get<ArController>(ArController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
