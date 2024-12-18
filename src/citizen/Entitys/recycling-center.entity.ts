// recycling-center.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class RecyclingCenter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar' })
  material_types_accepted: string; 

  @Column({ type: 'varchar' })
  contact_number: string;

  @CreateDateColumn()
  created_at: Date;

    @Column({ type: 'varchar', nullable: true })
    note: string;

    @Column({ type: 'varchar', nullable: true })
    image: string;

}
