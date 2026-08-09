import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1786180825941 implements MigrationInterface {
  name = 'InitSchema1786180825941';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "year_config" (
        "year" integer NOT NULL,
        "holidays" text[] NOT NULL DEFAULT '{}',
        "short_days" text[] NOT NULL DEFAULT '{}',
        "bad_days" text[] NOT NULL DEFAULT '{}',
        "off_days" text[] NOT NULL DEFAULT '{}',
        CONSTRAINT "PK_year_config" PRIMARY KEY ("year")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "settings" (
        "id" SERIAL NOT NULL,
        "gitlab_url" character varying NOT NULL DEFAULT '',
        "private_token" character varying NOT NULL DEFAULT '',
        "user_id" character varying NOT NULL DEFAULT '',
        "employee" character varying NOT NULL DEFAULT '',
        "company" character varying NOT NULL DEFAULT '',
        CONSTRAINT "PK_settings" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "project_dict" (
        "code" character varying NOT NULL,
        "label" character varying NOT NULL,
        CONSTRAINT "PK_project_dict" PRIMARY KEY ("code")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "project_dict"`);
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TABLE "year_config"`);
  }
}
