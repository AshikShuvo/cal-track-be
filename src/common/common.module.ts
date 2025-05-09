import { Module } from '@nestjs/common';
import { RoleTestController } from './controllers/role-test.controller';

@Module({
  controllers: [RoleTestController],
  providers: [],
  exports: [],
})
export class CommonModule {} 