import { Controller, Get } from '@nestjs/common';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';

@Controller('api/auth')
export class AuthController {
  // The /api/auth/* routes (login, register, etc.) are now handled automatically!
  
  @Get('me')
  async getProfile(@Session() session: UserSession) {
    // The @Session() decorator replaces your manual request.user logic
    return session;
  }
}