// recycling-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { RecyclingCenter } from './recycling-center.entity';

@Entity()
export class RecyclingLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user' })
  user: User;

  @ManyToOne(() =>RecyclingCenter )
@JoinColumn({ name: 'recycling_center' })
    recycling_center: RecyclingCenter;

  @Column({ type: 'varchar' })
  material_type: string;

  @Column({ type: 'float' })
  quantity: number; 

  @Column({type:'varchar',default:'Pending'})
  status: string;

  @Column({ type: 'int', default: 0 })  
  reward_points: number;

  @CreateDateColumn()
  timestamp: Date;

    @Column({ type: 'varchar', nullable: true })
    image: string;

    @Column({ type: 'varchar', nullable: true })
  message: string;

}
