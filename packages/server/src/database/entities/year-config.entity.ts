import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'year_config' })
export class YearConfig {
  @PrimaryColumn({ type: 'int' })
  year!: number;

  @Column('text', { array: true, default: [] })
  holidays!: string[];

  @Column('text', { array: true, default: [], name: 'short_days' })
  shortDays!: string[];

  @Column('text', { array: true, default: [], name: 'bad_days' })
  badDays!: string[];

  @Column('text', { array: true, default: [], name: 'off_days' })
  offDays!: string[];
}
