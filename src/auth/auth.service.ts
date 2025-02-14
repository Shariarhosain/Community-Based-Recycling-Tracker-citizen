import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/citizen/Entitys/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,  // Inject the User repository
  ) {}

  // Validate login credentials
  async validateUser(loginDto: LoginDto): Promise<User | null> {
    const { email, password } = loginDto;

    // Find user by email and password
    const user = await this.userRepository.findOne({where: {email, password}});   
    if (!user) {
      return null;  // No user found
    }

     if(user.role !== 'Citizen'){
          throw new HttpException('Only citizens can contribute', HttpStatus.FORBIDDEN);
        }
        

    return user;  // Successful login
  }

  // Generate JWT Token
  async login(user: User) {
    const payload = { email: user.email, id: user.id, role:user.role };  // Payload to be signed
    return {
      access_token: this.jwtService.sign(payload),  // Return the signed JWT token
    };
  }
}
