import { Module } from '@nestjs/common';
import { PasswordService } from './services/password.service';
import { RegistrationService } from './services/registration.service';
import { AuthController } from './controllers/auth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [PasswordService, RegistrationService],
  exports: [PasswordService],
})
export class AuthModule {} 