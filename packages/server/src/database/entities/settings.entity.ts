import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'settings' })
export class Settings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', default: '', name: 'gitlab_url' })
  gitlabUrl!: string;

  @Column({ type: 'varchar', default: '', name: 'private_token' })
  privateToken!: string;

  @Column({ type: 'varchar', default: '', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', default: '' })
  employee!: string;

  @Column({ type: 'varchar', default: '' })
  company!: string;
}
