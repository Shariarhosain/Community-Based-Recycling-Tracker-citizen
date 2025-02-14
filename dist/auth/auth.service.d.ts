import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from 'src/citizen/Entitys/user.entity';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private jwtService;
    private userRepository;
    constructor(jwtService: JwtService, userRepository: Repository<User>);
    validateUser(loginDto: LoginDto): Promise<User | null>;
    login(user: User): Promise<{
        access_token: string;
    }>;
}
