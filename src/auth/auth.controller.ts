import { Controller, Post, Body, UnauthorizedException,Req, ValidationPipe, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginDto: LoginDto) {
    console.log("Received LoginDto:", loginDto); 
  
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    } else {
      const token = await this.authService.login(user);
      return {
        message: 'Login successful',
        ...token,
      };
    }
  }
}
