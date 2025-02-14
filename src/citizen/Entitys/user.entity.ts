// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';


export enum UserRole {
  ADMIN = 'Admin',
  RECYCLER = 'Recycler',
  ORGANIZATION = 'Organization',
  CITIZEN = 'Citizen',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

@Column({ type: 'varchar', unique: true })
    name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;
  recyclingCenter: any;

}
