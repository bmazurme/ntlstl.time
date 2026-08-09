import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'project_dict' })
export class ProjectDictEntry {
  @PrimaryColumn({ type: 'varchar' })
  code!: string;

  @Column({ type: 'varchar' })
  label!: string;
}
